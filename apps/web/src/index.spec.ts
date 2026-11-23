import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { themeModeAttribute, themeModeStorageKey } from '@shelvio/web/shared/theme';

/**
 * `index.html` applies the stored mode before the first paint, so no screen flashes the other
 * mode while Angular loads. It runs the inline script exactly as the browser would.
 */
const indexHtml = new DOMParser().parseFromString(
  readFileSync(join(import.meta.dirname, 'index.html'), 'utf8'),
  'text/html',
);

function loadPage() {
  const inlineScripts = [...indexHtml.head.querySelectorAll('script:not([src])')];
  inlineScripts.forEach((script) => new Function(script.textContent ?? '')());
  return document.documentElement.getAttribute(themeModeAttribute);
}

describe('index.html', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute(themeModeAttribute);
  });

  it.each(['light', 'dark', 'system'])('applies the stored %s mode', (mode) => {
    localStorage.setItem(themeModeStorageKey, mode);

    expect(loadPage()).toBe(mode);
  });

  it('leaves the system mode in charge when nothing is stored', () => {
    expect(loadPage()).toBeNull();
  });

  it('ignores a stored value it does not know', () => {
    localStorage.setItem(themeModeStorageKey, 'body{display:none}');

    expect(loadPage()).toBeNull();
  });

  it('still loads the page when storage is blocked', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(loadPage()).toBeNull();
  });
});
