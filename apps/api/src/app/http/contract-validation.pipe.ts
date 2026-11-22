import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ValidationFailed } from '@shelvio/api/errors';
import type { ValidationIssue } from '@shelvio/shared/contracts';
import { ZodValidationException, createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

/**
 * Strict: a body, params or query not typed with a `createZodDto` class fails the request
 * with a 500, so no input reaches a controller unchecked.
 */
const ZodValidationPipe = createZodValidationPipe({ strictSchemaDeclaration: true });

/** Keeps the issue fields a client can use: plain values only, never Zod's English message or the input. */
function issueDetails(issue: Record<string, unknown>): Record<string, unknown> {
  const isPlain = (value: unknown) => value === null || typeof value !== 'object';
  return Object.fromEntries(
    Object.entries(issue).filter(
      ([key, value]) =>
        !['code', 'path', 'message', 'input'].includes(key) &&
        (isPlain(value) || (Array.isArray(value) && value.every(isPlain))),
    ),
  );
}

/** How issue paths name the request part, after the decorator that reads it. */
const REQUEST_PART: Record<string, string> = { body: 'body', param: 'params', query: 'query' };

function toIssues(error: ZodError, part: string): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: [part, ...issue.path.map((key) => (typeof key === 'symbol' ? String(key) : key))],
    code: issue.code,
    details: issueDetails(issue as unknown as Record<string, unknown>),
  }));
}

/**
 * Validates `@Body()`, `@Param()` and `@Query()` against the route's contract (a
 * `createZodDto` class over a schema from `@shelvio/shared/contracts`) and hands the
 * controller the parsed value. A mismatch becomes `ValidationFailed('request.invalid')`
 * whose `issues` point into the request part, such as `['body', 'title']`.
 */
@Injectable()
export class ContractValidationPipe implements PipeTransform {
  private readonly zod = new ZodValidationPipe();

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    // Custom decorators (such as the acting user) carry server-side values, not input.
    if (metadata.type === 'custom') return value;
    try {
      return this.zod.transform(value, metadata);
    } catch (error) {
      if (!(error instanceof ZodValidationException)) throw error;
      const zodError = error.getZodError();
      if (!(zodError instanceof ZodError)) throw error;
      throw new ValidationFailed('request.invalid', {
        issues: toIssues(zodError, REQUEST_PART[metadata.type] ?? metadata.type),
      });
    }
  }
}
