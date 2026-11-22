import { EnvironmentProviders, isDevMode, makeEnvironmentProviders, Service } from '@angular/core';
import { provideTransloco, Translation, TranslocoLoader } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

/**
 * Polish is the only and active language (spec "Translation and formatting"): no picker, no
 * browser detection, no locale in URLs. Adding a language means a `<lang>.json` per scope, an
 * entry in each loader map and a picker.
 */
const language = 'pl';
const locale = 'pl-PL';

/** The shared scope's translations, one lazy chunk per language. */
const sharedTranslations: Readonly<Record<string, () => Promise<{ default: Translation }>>> = {
  pl: () => import('../i18n/pl.json'),
};

@Service()
class SharedTranslationLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return sharedTranslations[lang]().then((module) => module.default);
  }
}

/** Transloco with the shared scope, ICU plurals and `pl-PL` number and date formats. */
export function provideI18n(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs: [language],
        defaultLang: language,
        reRenderOnLangChange: false,
        prodMode: !isDevMode(),
      },
      loader: SharedTranslationLoader,
    }),
    provideTranslocoMessageformat({ locales: language }),
    provideTranslocoLocale({ langToLocaleMapping: { [language]: locale } }),
  ]);
}
