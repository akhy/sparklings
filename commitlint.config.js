export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // Apps
        'dencode',
        'jago',
        // Shared packages
        'ui',
        'utils',
        'config',
        // Repository
        'root',
        'repo',
        // Others
        'deps',
        'deps-dev',
      ],
    ],
    'scope-empty': [2, 'never'],
  },
}
