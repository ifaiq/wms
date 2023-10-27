module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.js'],
  plugins: [
    '@typescript-eslint',
    'jest',
    '@typescript-eslint/eslint-plugin'
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'react/prop-types': 0,
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': 1,
    'react-hooks/exhaustive-deps': 0,
    'keyword-spacing': [2, { before: true, after: true }],
    'no-nested-ternary': 1,
    'react/no-multi-comp': 0,
    'react/no-render-return-value': 0,
    '@typescript-eslint/no-var-requires': 2,
    '@typescript-eslint/ban-ts-comment': 0,
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': 2,
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'multiline-const', next: '*' },
      { blankLine: 'always', prev: '*', next: 'multiline-const' },
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'block', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
    ],
    'prefer-destructuring': ['error', {
      array: true,
      object: true,
    }, {
      enforceForRenamedProperties: false,
    }],
  },
};
