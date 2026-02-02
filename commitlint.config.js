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
        'noktp',
        'structdiff',
        // Libs
        'reksadata',
        // Shared packages
        'ui',
        'utils',
        'config',
        'i18n',
        'jago-parser',
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
