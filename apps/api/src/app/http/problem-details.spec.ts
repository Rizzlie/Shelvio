import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  Conflict,
  Forbidden,
  NotFound,
  Unauthenticated,
  ValidationFailed,
} from '@shelvio/api/errors';
import { LogCapture, TestApp, startTestApp, testConfig } from '../../testing/test-app';

/** Test-only routes that fail the way domain operations and controllers will. */
@Controller('test/errors')
class FailingController {
  @Get('not-found')
  notFound(): never {
    throw new NotFound('common.notFound', { bookId: 'b-1' });
  }

  @Get('forbidden')
  forbidden(): never {
    throw new Forbidden('common.forbidden');
  }

  @Get('conflict')
  conflict(): never {
    throw new Conflict('common.conflict', { isbn: '9788324631766' });
  }

  @Get('validation-failed')
  validationFailed(): never {
    throw new ValidationFailed('common.invalid', { field: 'price', max: 100 });
  }

  @Get('unauthenticated')
  unauthenticated(): never {
    throw new Unauthenticated('auth.unauthenticated');
  }

  @Post('echo')
  echo(@Body() body: unknown): unknown {
    return body;
  }

  @Get('unexpected')
  unexpected(): never {
    throw new TypeError('Cannot read properties of undefined (reading internalDetail)');
  }
}

describe('API errors as problem+json', () => {
  let api: TestApp;
  let logs: LogCapture;

  beforeAll(async () => {
    logs = new LogCapture();
    api = await startTestApp(testConfig({ LOG_LEVEL: 'error' }), {
      controllers: [FailingController],
      logStream: logs,
    });
  });

  afterAll(async () => {
    await api?.app.close();
  });

  it('renders NotFound as 404 with its code and params', async () => {
    const response = await fetch(`${api.baseUrl}/api/test/errors/not-found`);

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
    expect(await response.json()).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      code: 'common.notFound',
      params: { bookId: 'b-1' },
    });
  });

  it.each([
    ['forbidden', 403, 'Forbidden', 'common.forbidden', {}],
    ['conflict', 409, 'Conflict', 'common.conflict', { isbn: '9788324631766' }],
    ['validation-failed', 400, 'Bad Request', 'common.invalid', { field: 'price', max: 100 }],
    ['unauthenticated', 401, 'Unauthorized', 'auth.unauthenticated', {}],
  ])('renders the %s domain error as %i', async (route, status, title, code, params) => {
    const response = await fetch(`${api.baseUrl}/api/test/errors/${route}`);

    expect(response.status).toBe(status);
    expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
    expect(await response.json()).toEqual({ type: 'about:blank', title, status, code, params });
  });

  it('renders an unexpected error as 500 without its details, and logs it for the operator', async () => {
    const response = await fetch(`${api.baseUrl}/api/test/errors/unexpected`);
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
    expect(JSON.parse(body)).toEqual({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      code: 'common.unexpected',
      params: {},
    });
    expect(body).not.toContain('internalDetail');
    expect(logs.text).toContain('internalDetail');
  });

  it('renders an unknown route as 404 common.notFound', async () => {
    const response = await fetch(`${api.baseUrl}/api/no-such-route`);

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
    expect(await response.json()).toMatchObject({
      status: 404,
      code: 'common.notFound',
      params: {},
    });
  });

  it('renders a body that is not valid JSON as 400 request.invalid', async () => {
    const response = await fetch(`${api.baseUrl}/api/test/errors/echo`, {
      method: 'POST',
      headers: { origin: 'http://localhost:4200', 'content-type': 'application/json' },
      body: '{"title": ',
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
    expect(await response.json()).toMatchObject({
      status: 400,
      code: 'request.invalid',
      params: {},
    });
  });

  it('renders a body over the size limit as 413 request.tooLarge', async () => {
    const response = await fetch(`${api.baseUrl}/api/test/errors/echo`, {
      method: 'POST',
      headers: { origin: 'http://localhost:4200', 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'x'.repeat(200_000) }),
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ status: 413, code: 'request.tooLarge' });
  });
});
