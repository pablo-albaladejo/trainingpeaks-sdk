# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## <small>1.4.3 (2025-07-14)</small>

* refactor: separate application vs domain services ([ee46a87](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/ee46a87))

## <small>1.4.2 (2025-07-14)</small>

* refactor: move domain services ([ff1dd2a](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/ff1dd2a))
* feat!: function first refactor ([33d4085](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/33d4085))

## <small>1.4.1 (2025-07-13)</small>

* chore: update dependencies to use playwright-core and remove playwright ([255ccbd](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/255ccbd))

## 1.4.0 (2025-07-13)

* feat: add tags and activity type to workout metadata in tests ([158557a](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/158557a))
* fix: add playwright to package.json ([87f4de4](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/87f4de4))

## 1.3.0 (2025-07-13)

* fix: streamline import statements ([856ea1d](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/856ea1d))
* feat: enhance ts configuration and import paths ([852f808](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/852f808))
* feat: update package configuration and enhance build scripts ([c615b9b](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/c615b9b))

## 1.2.0 (2025-07-13)

* feat: enhance package configuration and build process ([62e8094](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/62e8094))
* feat: update node.js setup for npm authentication ([c99e94e](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/c99e94e))
* chore(release): enable npm publishing in configuration ([0a1975e](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/0a1975e))

## 1.1.0 (2025-07-13)

* feat: add hexagonal architecture rules and coding conventions ([a0ab8e5](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/a0ab8e5))
* chore: remove local and simple semantic release configurations ([5a3f32c](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/5a3f32c))
* chore(release): 1.0.2 [skip ci] ([e0eb4a1](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/e0eb4a1))
* docs: add comprehensive cursor rules with architecture decisions ([d5de3c1](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/d5de3c1))
* fix: resolve github assets name collision in semantic-release ([0b4a246](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/0b4a246))

## <small>1.0.2 (2025-07-13)</small>

* docs: add comprehensive cursor rules with architecture decisions ([d5de3c1](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/d5de3c1))
* chore: remove local and simple semantic release configurations ([5a3f32c](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/5a3f32c))
* fix: resolve github assets name collision in semantic-release ([0b4a246](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/0b4a246))

## <small>1.0.1 (2025-07-13)</small>

* Merge pull request #1 from pablo-albaladejo/dependabot/github_actions/codecov/codecov-action-5 ([98ab5ed](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/98ab5ed)), closes [#1](https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues/1)
* ci: bump codecov/codecov-action from 3 to 5 ([498d257](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/498d257))

## 1.0.0 (2025-07-13)

* fix: add coverage dependency and fix delete workout test ([badc56f](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/badc56f))
* fix: disable npm publishing temporarily to test semantic-release ([87470a1](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/87470a1))
* fix: remove deprecated husky shebang lines ([0d828ee](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/0d828ee))
* fix: rename files to lowercase for case-sensitive filesystems ([2fe1aed](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/2fe1aed))
* fix: resolve case sensitivity issues for github actions ([1bb8d07](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/1bb8d07))
* feat: add husky with commitlint and lint-staged ([180bbdb](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/180bbdb))
* feat: add prettier code formatting support ([42ffd90](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/42ffd90))
* feat: add web authentication and integration testing support ([117b7cb](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/117b7cb))
* feat: implement semantic-release for automated versioning and publishing ([1548c25](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/1548c25))
* ci: add github actions for ci/cd pipeline ([3e71ce8](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/3e71ce8))
* ci: update nodejs version ([f1f114e](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/f1f114e))
* refactor: convert all files to kebab-case and remove redundancy ([dce8d2d](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/dce8d2d))
* refactor: implement  hexagonal architecture ([fa544e3](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/fa544e3))
* refactor(workout): implement hexagonal architecture ([d2fddf0](https://github.com/pablo-albaladejo/trainingpeaks-sdk/commit/d2fddf0))

## [Unreleased]

### ✨ Features

- Initial TrainingPeaks SDK implementation
- Web-based authentication with browser simulation
- Workout upload functionality (GPX, TCX, FIT)
- TypeScript support with full type definitions
- Comprehensive test coverage
- Hexagonal architecture implementation
- Centralized configuration system

### 🐛 Bug Fixes

- Fixed case sensitivity issues for Linux environments
- Resolved delete workout test to use proper workflow
- Fixed ESLint configuration for TypeScript

### 📚 Documentation

- Complete README with usage examples
- API documentation
- Development setup guide

### 🏗️ Build System

- GitHub Actions CI/CD pipeline
- Automated testing and quality checks
- Code formatting with Prettier
- ESLint configuration
- Commit message validation

### 🔧 Chores

- Semantic release configuration
- Automated changelog generation
- NPM publishing automation
