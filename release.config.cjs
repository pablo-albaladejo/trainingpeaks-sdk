/**
 * Semantic Release Configuration
 * Automates versioning and package publishing
 */

module.exports = {
  branches: [
    'main',
    {
      name: 'develop',
      prerelease: 'beta',
    },
    {
      name: 'alpha',
      prerelease: true,
    },
  ],
  plugins: [
    // Analyze commits to determine release type
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'docs', release: 'patch' },
          { type: 'style', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'test', release: 'patch' },
          { type: 'build', release: 'patch' },
          { type: 'ci', release: 'patch' },
          { type: 'chore', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { breaking: true, release: 'major' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],

    // Generate release notes
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '✨ Features' },
            { type: 'fix', section: '🐛 Bug Fixes' },
            { type: 'docs', section: '📚 Documentation' },
            { type: 'style', section: '🎨 Styles' },
            { type: 'refactor', section: '♻️ Code Refactoring' },
            { type: 'test', section: '🧪 Tests' },
            { type: 'build', section: '🏗️ Build System' },
            { type: 'ci', section: '👷 CI/CD' },
            { type: 'chore', section: '🔧 Chores' },
            { type: 'revert', section: '⏪ Reverts' },
            { type: 'perf', section: '⚡ Performance' },
          ],
        },
      },
    ],

    // Update CHANGELOG.md
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle:
          '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n',
      },
    ],

    [
      '@semantic-release/npm',
      {
        npmPublish: true,
      },
    ],

    // Create GitHub release
    [
      '@semantic-release/github',
      {
        assets: [
          // Main bundle with version in name
          {
            path: 'dist/index.js',
            name: 'trainingpeaks-sdk-${nextRelease.version}.js',
            label: 'Main Bundle (v${nextRelease.version})',
          },
          // TypeScript declarations with version
          {
            path: 'dist/index.d.ts',
            name: 'trainingpeaks-sdk-${nextRelease.version}.d.ts',
            label: 'TypeScript Declarations (v${nextRelease.version})',
          },
          // Source map with version (optional)
          {
            path: 'dist/index.js.map',
            name: 'trainingpeaks-sdk-${nextRelease.version}.js.map',
            label: 'Source Map (v${nextRelease.version})',
          },
        ],
        successComment: false,
        failComment: false,
      },
    ],

    // Commit changes back to repo
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
