module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'chore', // Changes to the build process or auxiliary tools
        'ci', // Changes to CI configuration files and scripts
        'build', // Changes that affect the build system or external dependencies
        'revert', // Reverts a previous commit
        'security', // Security improvements
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    // 'subject-case': [2, 'always', 'lower-case'], // Disabled to allow readable commit messages
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'scope-enum': [
      2,
      'always',
      [
        'auth', // Authentication related
        'workouts', // Workout management
        'users', // User management
        'http', // HTTP client
        'storage', // Data storage
        'validation', // Data validation
        'logging', // Logging system
        'testing', // Testing framework
        'build', // Build system
        'ci', // CI/CD
        'docs', // Documentation
        'deps', // Dependencies
        'release', // Release process
        'security', // Security improvements
        'performance', // Performance improvements
        'architecture', // Architecture changes
        'refactor', // Refactoring
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [2, 'never'],
  },
  parserPreset: {
    name: 'conventional-changelog-conventionalcommits',
    parserOpts: {
      issuePrefixes: ['#'],
    },
  },
  overrides: [
    {
      types: ['revert'],
      rules: {
        'scope-empty': [0], // Allow revert commits without scopes
      },
    },
  ],
  ignores: [
    // Allow semantic-release commits without scopes
    (commit) => commit.includes('chore(release):'),
  ],
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};
