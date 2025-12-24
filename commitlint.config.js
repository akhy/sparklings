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
      ],
    ],
    'scope-empty': [2, 'never'],
  },
}
