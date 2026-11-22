import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { TestApp, startTestApp, testConfig } from '../../testing/test-app';

const APP_ORIGIN = 'https://app.shelvio.test';
const FOREIGN_ORIGIN = 'https://evil.example';

/** Test-only routes for each HTTP method. */
@Controller('test/methods')
class MethodsController {
  @Get()
  get(): unknown {
    return { done: 'GET' };
  }

  @Post()
  post(): unknown {
    return { done: 'POST' };
  }

  @Put()
  put(): unknown {
    return { done: 'PUT' };
  }

  @Patch()
  patch(): unknown {
    return { done: 'PATCH' };
  }

  @Delete()
  delete(): unknown {
    return { done: 'DELETE' };
  }
}

describe('Origin check and CORS', () => {
  let api: TestApp;
  let url: string;

  beforeAll(async () => {
    api = await startTestApp(testConfig({ APP_ORIGIN }), { controllers: [MethodsController] });
    url = `${api.baseUrl}/api/test/methods`;
  });

  afterAll(async () => {
    await api?.app.close();
  });

  describe('state-changing requests', () => {
    const METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    it.each(METHODS)('accepts %s from APP_ORIGIN', async (method) => {
      const response = await fetch(url, { method, headers: { origin: APP_ORIGIN } });

      expect(response.ok).toBe(true);
      expect(await response.json()).toEqual({ done: method });
    });

    it.each(METHODS)(
      'refuses %s from another origin with 403 request.foreignOrigin',
      async (method) => {
        const response = await fetch(url, { method, headers: { origin: FOREIGN_ORIGIN } });

        expect(response.status).toBe(403);
        expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
        expect(await response.json()).toEqual({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          code: 'request.foreignOrigin',
          params: {},
        });
      },
    );

    it.each(METHODS)('refuses %s without an Origin header', async (method) => {
      const response = await fetch(url, { method });

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({ code: 'request.foreignOrigin' });
    });

    it('refuses an origin that only resembles APP_ORIGIN', async () => {
      const lookalikes = [`${APP_ORIGIN}.evil.example`, 'http://app.shelvio.test', 'null'];

      const statuses = await Promise.all(
        lookalikes.map(
          async (origin) => (await fetch(url, { method: 'POST', headers: { origin } })).status,
        ),
      );

      expect(statuses).toEqual([403, 403, 403]);
    });
  });

  describe('reads', () => {
    it('serves GET with any or no Origin', async () => {
      const without = await fetch(url);
      const foreign = await fetch(url, { headers: { origin: FOREIGN_ORIGIN } });

      expect([without.status, foreign.status]).toEqual([200, 200]);
    });
  });

  describe('CORS', () => {
    it('lets APP_ORIGIN read responses with credentials', async () => {
      const response = await fetch(url, { headers: { origin: APP_ORIGIN } });

      expect(response.headers.get('access-control-allow-origin')).toBe(APP_ORIGIN);
      expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    });

    it('allows a preflight from APP_ORIGIN for state-changing requests with a JSON body', async () => {
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          origin: APP_ORIGIN,
          'access-control-request-method': 'PATCH',
          'access-control-request-headers': 'content-type',
        },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-origin')).toBe(APP_ORIGIN);
      expect(response.headers.get('access-control-allow-credentials')).toBe('true');
      expect(response.headers.get('access-control-allow-methods')).toContain('PATCH');
      expect(response.headers.get('access-control-allow-headers')).toContain('content-type');
    });

    it('grants other origins nothing', async () => {
      const read = await fetch(url, { headers: { origin: FOREIGN_ORIGIN } });
      const preflight = await fetch(url, {
        method: 'OPTIONS',
        headers: { origin: FOREIGN_ORIGIN, 'access-control-request-method': 'POST' },
      });

      for (const response of [read, preflight]) {
        expect(response.headers.get('access-control-allow-origin')).toBeNull();
        expect(response.headers.get('access-control-allow-credentials')).toBeNull();
      }
    });
  });
});
