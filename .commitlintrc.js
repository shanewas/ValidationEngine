module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',    // New feature (triggers minor version)
          'fix',     // Bug fix (triggers patch version)
          'docs',    // Documentation only changes
          'style',   // Changes that do not affect the meaning of the code
          'refactor',// Code change that neither fixes a bug nor adds a feature
          'perf',    // Code change that improves performance
          'test',    // Adding missing tests
          'chore',   // Changes to the build process or auxiliary tools
          'revert',  // Revert to a previous commit
          'ci',      // Changes to CI configuration files and scripts
        ],
      ],
      'type-case': [2, 'always', 'lower-case'],
      'type-empty': [2, 'never'],
      'scope-case': [2, 'always', 'lower-case'],
      'subject-empty': [2, 'never'],
      'subject-full-stop': [2, 'never', '.'],
      'header-max-length': [2, 'always', 72],
    },
  };