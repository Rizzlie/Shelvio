import nx from '@nx/eslint-plugin';

/**
 * Module boundaries (spec "Workspace and module boundaries").
 * Every project carries one `scope:*` tag and one `type:*` tag; the rules below
 * check both, and a dependency must satisfy every rule whose source tags match.
 */
const scopeConstraints = [
  {
    sourceTag: 'scope:web',
    onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'],
    bannedExternalImports: ['@nestjs/*'],
  },
  {
    sourceTag: 'scope:api',
    onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'],
    bannedExternalImports: ['@angular/*'],
  },
  {
    sourceTag: 'scope:shared',
    onlyDependOnLibsWithTags: ['scope:shared'],
    bannedExternalImports: ['@angular/*', '@nestjs/*'],
  },
];

/** Type rules apply per scope, because `type:feature` etc. mean different things on each side. */
const typeRules = (scope, rules) =>
  Object.entries(rules).map(([type, allowed]) => ({
    allSourceTags: [`scope:${scope}`, `type:${type}`],
    onlyDependOnLibsWithTags: allowed.map((t) => `type:${t}`),
  }));

const webTypeConstraints = typeRules('web', {
  app: ['shell', 'feature', 'data-access', 'ui', 'util'],
  shell: ['feature', 'data-access', 'ui', 'util'],
  feature: ['data-access', 'ui', 'util'],
  'data-access': ['util'],
  ui: ['ui', 'util'],
  util: ['util'],
});

const apiTypeConstraints = typeRules('api', {
  app: ['feature', 'domain', 'data-access', 'util'],
  feature: ['domain', 'util'],
  domain: ['domain', 'data-access', 'util'],
  'data-access': ['util'],
  util: ['util'],
});

const sharedTypeConstraints = typeRules('shared', {
  util: ['util'],
});

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\.base)?\.config\.[cm]?[jt]s$'],
          depConstraints: [
            ...scopeConstraints,
            ...webTypeConstraints,
            ...apiTypeConstraints,
            ...sharedTypeConstraints,
          ],
        },
      ],
    },
  },
];
