// @ts-check
const { globSync } = require('node:fs');
const path = require('node:path');

/** `not-found` → `notFound` */
const camelCase = (name) => name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());

/**
 * Where each Transloco scope's translations live, for `transloco-keys-manager`
 * (`nx run web:check-translations`). Each web feature library owns one scope, named after its
 * directory in camel case (`libs/web/not-found/feature` → `notFound`), with its files in
 * `src/i18n/`.
 */
const scopePathMap = Object.fromEntries(
  globSync('libs/web/*/feature/src/i18n')
    .map((dir) => dir.split(path.sep))
    .map((segments) => {
      const [, , library] = segments;
      return [camelCase(library), segments.join('/')];
    }),
);

/** @type {import('@jsverse/transloco-utils').TranslocoGlobalConfig} */
module.exports = {
  rootTranslationsPath: 'libs/web/shared/i18n/src/i18n',
  langs: ['pl'],
  scopePathMap,
  keysManager: {
    input: ['apps/web/src', 'libs/web'],
    emitErrorOnExtraKeys: true,
  },
};
