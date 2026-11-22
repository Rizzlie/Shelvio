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

/**
 * Type rules apply per scope, because `type:feature` etc. mean different things on each side.
 * `type:app` is not in the spec's table: apps are the composition roots (the web app bootstraps
 * the shell, the api app wires implementations such as Identity's account hooks), so each may
 * reach every library type on its own side.
 */
const typeRules = (scope, rules) =>
  Object.entries(rules).map(([type, allowed]) => ({
    allSourceTags: [`scope:${scope}`, `type:${type}`],
    onlyDependOnLibsWithTags: allowed.map((t) => `type:${t}`),
  }));

/**
 * `type:testing` libraries (fakes such as the fake OIDC provider) are test-only: no production
 * rule lists them, so only test files, which get `testing` added to every type's allowed list
 * below, may import them. This keeps them out of every production bundle.
 */
const allowTesting = (rules) =>
  Object.fromEntries(
    Object.entries(rules).map(([type, allowed]) => [type, [...allowed, 'testing']]),
  );

const webTypeRules = {
  app: ['shell', 'feature', 'data-access', 'ui', 'util'],
  shell: ['feature', 'data-access', 'ui', 'util'],
  feature: ['data-access', 'ui', 'util'],
  'data-access': ['util'],
  ui: ['ui', 'util'],
  util: ['util'],
};

const apiTypeRules = {
  app: ['feature', 'domain', 'data-access', 'util'],
  feature: ['domain', 'util'],
  domain: ['domain', 'data-access', 'util'],
  'data-access': ['util'],
  util: ['util'],
  testing: ['util', 'testing'],
};

const sharedTypeRules = {
  util: ['util'],
};

const boundaries = (transform = (rules) => rules) => [
  'error',
  {
    enforceBuildableLibDependency: true,
    allow: [String.raw`^.*/eslint(\.base)?\.config\.[cm]?[jt]s$`],
    depConstraints: [
      ...scopeConstraints,
      ...typeRules('web', transform(webTypeRules)),
      ...typeRules('api', transform(apiTypeRules)),
      ...typeRules('shared', transform(sharedTypeRules)),
    ],
  },
];

const testFiles = ['**/*.{spec,test}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'];

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
      '@nx/enforce-module-boundaries': boundaries(),
    },
  },
  {
    files: testFiles,
    rules: {
      '@nx/enforce-module-boundaries': boundaries(allowTesting),
    },
  },
];
