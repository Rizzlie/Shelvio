import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { provideErrorMessages } from './error-messages';

const problem = (status: number, code: string) =>
  new HttpErrorResponse({
    status,
    url: '/api/collections/123',
    error: { type: 'about:blank', title: '', status, code, params: {} },
  });

async function expectMessage(text: string) {
  await vi.waitFor(() => expect(document.body.textContent).toContain(text));
}

describe('provideErrorMessages', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18n(), provideErrorMessages()] });
  });

  it('tells the person what an unhandled problem means', async () => {
    TestBed.inject(ErrorHandler).handleError(problem(403, 'common.forbidden'));

    await expectMessage('Nie masz uprawnień, żeby to zrobić.');
  });

  it('shows the generic message for any other error, and still logs it', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const bug = new TypeError('x is undefined');

    TestBed.inject(ErrorHandler).handleError(bug);

    await expectMessage('Coś poszło nie tak. Spróbuj ponownie za chwilę.');
    expect(log).toHaveBeenCalledWith('ERROR', bug);
  });
});
