import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { themeModeAttribute, themeModeStorageKey } from './theme-mode';
import { THEME_MODE_STORAGE, ThemeModeStore } from './theme-mode-store';

/** A `localStorage` stand-in that survives across test beds, like the real one across reloads. */
function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => items.delete(key),
    setItem: (key, value) => items.set(key, value),
  };
}

/** Storage the browser refuses to touch (privacy mode, disabled site data). */
function blockedStorage(): Storage {
  const refuse = () => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  };
  return {
    length: 0,
    clear: refuse,
    getItem: refuse,
    key: refuse,
    removeItem: refuse,
    setItem: refuse,
  };
}

/** A fresh app start (page load) on top of the given storage. */
function startApp(storage: Storage | null) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: THEME_MODE_STORAGE, useValue: storage }],
  });
  const store = TestBed.inject(ThemeModeStore);
  TestBed.tick();
  return { store, root: TestBed.inject(DOCUMENT).documentElement };
}

describe('ThemeModeStore', () => {
  afterEach(() => TestBed.inject(DOCUMENT).documentElement.removeAttribute(themeModeAttribute));

  it('follows the system mode when nothing is stored', () => {
    const { store, root } = startApp(memoryStorage());

    expect(store.mode()).toBe('system');
    expect(root.getAttribute(themeModeAttribute)).toBe('system');
  });

  it('applies a chosen mode to the page at once', () => {
    const { store, root } = startApp(memoryStorage());

    store.select('dark');
    TestBed.tick();

    expect(store.mode()).toBe('dark');
    expect(root.getAttribute(themeModeAttribute)).toBe('dark');
  });

  it('keeps the chosen mode on the next visit', () => {
    const storage = memoryStorage();
    startApp(storage).store.select('light');
    TestBed.tick();

    const { store, root } = startApp(storage);

    expect(store.mode()).toBe('light');
    expect(root.getAttribute(themeModeAttribute)).toBe('light');
  });

  it('goes back to following the system after choosing Systemowy', () => {
    const storage = memoryStorage();
    const first = startApp(storage).store;
    first.select('dark');
    TestBed.tick();
    first.select('system');
    TestBed.tick();

    expect(startApp(storage).store.mode()).toBe('system');
  });

  it('ignores a stored value it does not know', () => {
    const storage = memoryStorage();
    storage.setItem(themeModeStorageKey, 'sepia');

    expect(startApp(storage).store.mode()).toBe('system');
  });

  it.each([
    ['blocked', blockedStorage()],
    ['missing', null],
  ])('follows the system and still switches when storage is %s', (_, storage) => {
    const { store, root } = startApp(storage);
    expect(store.mode()).toBe('system');

    store.select('dark');
    TestBed.tick();

    expect(root.getAttribute(themeModeAttribute)).toBe('dark');
  });
});
