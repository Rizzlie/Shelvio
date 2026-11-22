import { HttpErrorResponse } from '@angular/common/http';
import { problemMessage } from './problem-message';

const problemResponse = (status: number, body: unknown) =>
  new HttpErrorResponse({ status, error: body, url: '/api/collections' });

describe('problemMessage', () => {
  it('translates a problem by its code and passes its params on', () => {
    const error = problemResponse(409, {
      type: 'about:blank',
      title: 'Conflict',
      status: 409,
      code: 'common.conflict',
      params: { name: 'Winyle' },
    });

    expect(problemMessage(error)).toEqual({
      key: 'shared.errors.common.conflict',
      params: { name: 'Winyle' },
    });
  });

  it.each([
    [
      'a code this app does not know',
      problemResponse(400, {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        code: 'shelf.full',
        params: {},
      }),
    ],
    ['a response that is not a problem', problemResponse(502, '<html>Bad Gateway</html>')],
    ['a network failure', new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') })],
    ['an error that is not from HTTP', new TypeError('x is undefined')],
  ])('falls back to the generic message for %s', (_, error) => {
    expect(problemMessage(error)).toEqual({ key: 'shared.errors.unknown', params: {} });
  });
});
