import { STATUS_CODES } from 'node:http';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  Conflict,
  DomainError,
  Forbidden,
  NotFound,
  Unauthenticated,
  ValidationFailed,
} from '@shelvio/api/errors';
import { ErrorCode, ErrorParams, PROBLEM_CONTENT_TYPE, Problem } from '@shelvio/shared/contracts';
import type { Response } from 'express';

const DOMAIN_ERROR_STATUS: [new (...args: never[]) => DomainError, HttpStatus][] = [
  [NotFound, HttpStatus.NOT_FOUND],
  [Forbidden, HttpStatus.FORBIDDEN],
  [Conflict, HttpStatus.CONFLICT],
  [ValidationFailed, HttpStatus.BAD_REQUEST],
  [Unauthenticated, HttpStatus.UNAUTHORIZED],
];

interface Failure {
  status: HttpStatus;
  code: ErrorCode;
  params: ErrorParams;
}

/** Codes for HTTP-level refusals raised before or outside domain code, by status. */
const HTTP_STATUS_CODE: Partial<Record<HttpStatus, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'request.invalid',
  [HttpStatus.UNAUTHORIZED]: 'auth.unauthenticated',
  [HttpStatus.FORBIDDEN]: 'common.forbidden',
  [HttpStatus.NOT_FOUND]: 'common.notFound',
  [HttpStatus.CONFLICT]: 'common.conflict',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'request.tooLarge',
};

/**
 * The client-error status of an exception raised by Nest (an unknown route) or by Express
 * middleware such as the body parser (`http-errors` objects marked `expose`), if any.
 */
function clientErrorStatus(exception: unknown): HttpStatus | undefined {
  let status: unknown;
  if (exception instanceof HttpException) status = exception.getStatus();
  else if (exception instanceof Error && 'expose' in exception && exception.expose === true) {
    status = 'status' in exception ? exception.status : undefined;
  }
  return typeof status === 'number' && status >= 400 && status < 500 ? status : undefined;
}

function toFailure(exception: unknown): Failure {
  if (exception instanceof DomainError) {
    const [, status] = DOMAIN_ERROR_STATUS.find(([type]) => exception instanceof type) ?? [];
    if (status) return { status, code: exception.code, params: exception.params };
  }
  const status = clientErrorStatus(exception);
  if (status) return { status, code: HTTP_STATUS_CODE[status] ?? 'request.rejected', params: {} };
  return { status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'common.unexpected', params: {} };
}

/** Renders every error leaving a route as `application/problem+json` with a stable code and params. */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, code, params } = toFailure(exception);
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // The client gets only the code; the details are for the operator.
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }
    const problem: Problem = {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      code,
      params: { ...params },
    };
    response.status(status).type(PROBLEM_CONTENT_TYPE).json(problem);
  }
}
