import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TestApp, startTestApp, testConfig } from '../../testing/test-app';

// A contract written the way `@shelvio/shared/contracts` defines real ones.
const CreateBookRequest = z.object({
  title: z.string().trim().min(1),
  pages: z.number().int().positive().optional(),
});
const BookParams = z.object({ bookId: z.uuid() });
const BookSearch = z.object({ limit: z.coerce.number().int().max(50).default(20) });

class CreateBookDto extends createZodDto(CreateBookRequest) {}
class BookParamsDto extends createZodDto(BookParams) {}
class BookSearchDto extends createZodDto(BookSearch) {}

/** Test-only routes that take input through contracts. */
@Controller('test/books')
class BooksController {
  @Post()
  create(@Body() body: CreateBookDto): unknown {
    return { received: body };
  }

  @Get()
  search(@Query() query: BookSearchDto): unknown {
    return { received: query };
  }

  @Get(':bookId')
  get(@Param() params: BookParamsDto): unknown {
    return { received: params };
  }

  @Get('unchecked/:id')
  unchecked(@Param('id') id: string): unknown {
    return { received: id };
  }
}

const BOOK_ID = '0196a3c2-7b7e-7cc1-9d4e-2a6f3b1c8d90';

describe('request validation by contracts', () => {
  let api: TestApp;

  beforeAll(async () => {
    api = await startTestApp(testConfig(), { controllers: [BooksController] });
  });

  afterAll(async () => {
    await api?.app.close();
  });

  function postBook(body: unknown): Promise<Response> {
    return fetch(`${api.baseUrl}/api/test/books`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('hands the controller the parsed body', async () => {
    const response = await postBook({ title: '  Lalka  ', pages: 683 });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ received: { title: 'Lalka', pages: 683 } });
  });

  it('rejects a body that breaks the contract with 400 request.invalid and the issues', async () => {
    const response = await postBook({ title: '   ', pages: 1.5 });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
    expect(await response.json()).toEqual({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      code: 'request.invalid',
      params: {
        issues: [
          {
            path: ['body', 'title'],
            code: 'too_small',
            details: { origin: 'string', minimum: 1, inclusive: true },
          },
          {
            path: ['body', 'pages'],
            code: 'invalid_type',
            details: { expected: 'int', format: 'safeint' },
          },
        ],
      },
    });
  });

  it('rejects a missing body with 400 request.invalid', async () => {
    const response = await fetch(`${api.baseUrl}/api/test/books`, { method: 'POST' });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'request.invalid' });
  });

  it('validates route params', async () => {
    const ok = await fetch(`${api.baseUrl}/api/test/books/${BOOK_ID}`);
    const bad = await fetch(`${api.baseUrl}/api/test/books/not-a-uuid`);

    expect(await ok.json()).toEqual({ received: { bookId: BOOK_ID } });
    expect(bad.status).toBe(400);
    expect(await bad.json()).toMatchObject({
      code: 'request.invalid',
      params: {
        issues: [expect.objectContaining({ path: ['params', 'bookId'], code: 'invalid_format' })],
      },
    });
  });

  it('validates and coerces the query', async () => {
    const defaults = await fetch(`${api.baseUrl}/api/test/books`);
    const tooMany = await fetch(`${api.baseUrl}/api/test/books?limit=500`);

    expect(await defaults.json()).toEqual({ received: { limit: 20 } });
    expect(tooMany.status).toBe(400);
    expect(await tooMany.json()).toMatchObject({
      params: { issues: [expect.objectContaining({ path: ['query', 'limit'], code: 'too_big' })] },
    });
  });

  it('refuses input that no contract describes, so nothing reaches a controller unchecked', async () => {
    const response = await fetch(`${api.baseUrl}/api/test/books/unchecked/anything`);

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ code: 'common.unexpected' });
  });
});
