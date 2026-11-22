import { HttpErrorResponse } from '@angular/common/http';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { provideErrorMessages } from './error-messages';

const problem = (status: number, code: string) =>
  new HttpErrorResponse({
    status,
    url: '/api/collections/123',
    error: { type: 'about:blank', title: '', status, code, params: {} },
  });

/** Snackbars render in an overlay outside any component; the harness needs a fixture to find it. */
@Component({ template: '' })
class Page {}

async function shownMessage() {
  const snackBars = TestbedHarnessEnvironment.documentRootLoader(TestBed.createComponent(Page));
  const snackBar = await vi.waitFor(() => snackBars.getHarness(MatSnackBarHarness));
  return snackBar.getMessage();
}

describe('provideErrorMessages', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18n(), provideErrorMessages()] });
  });

  it('tells the person what an unhandled problem means', async () => {
    TestBed.inject(ErrorHandler).handleError(problem(403, 'common.forbidden'));

    expect(await shownMessage()).toBe('Nie masz uprawnień, żeby to zrobić.');
  });

  it('shows the generic message for any other error, and still logs it', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const bug = new TypeError('x is undefined');

    TestBed.inject(ErrorHandler).handleError(bug);

    expect(await shownMessage()).toBe('Coś poszło nie tak. Spróbuj ponownie za chwilę.');
    expect(log).toHaveBeenCalledWith(expect.anything(), bug);
  });
});
