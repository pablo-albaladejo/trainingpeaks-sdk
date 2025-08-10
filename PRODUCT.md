# TrainingPeaks SDK - Product Overview

## Product Vision

The TrainingPeaks SDK is a comprehensive, enterprise-grade TypeScript SDK that provides developers with seamless integration to the TrainingPeaks platform. Built on Clean Architecture principles, it enables applications to interact with TrainingPeaks' fitness and training data ecosystem through a type-safe, well-tested, and maintainable interface.

## Support Policy

### Runtime Requirements

- **Node.js**: ≥ 20.0.0 (supports current LTS versions: 20.x, 22.x, 24.x with support windows through October 2026, October 2027, and October 2029 respectively)
- **TypeScript**: ≥ 4.8.0 (strict mode supported)
- **Browser Support**: Modern browsers with ES2020 support (Chrome ≥ 80, Firefox ≥ 72, Safari ≥ 13.1, Edge ≥ 80)  
  - *Note: Browser support assumes usage of browser-targeted HTTP adapter without Node-specific modules*
  - *May require polyfills for older browsers depending on target environment*

### Package Manager Compatibility

- **npm**: ≥ 8.0.0
- **yarn**: ≥ 1.22.0 (Classic), ≥ 3.0.0 (Berry)
  - *Yarn Berry (v3/v4) supported with `nodeLinker: "node-modules"` - Plug'n'Play (PnP) not currently supported*
- **pnpm**: ≥ 7.0.0

## Target Market

### Primary Users

- **Application Developers**: Building fitness, health, and training applications that need to integrate with TrainingPeaks
- **Sports Technology Companies**: Developing platforms for coaches, athletes, and fitness enthusiasts
- **Enterprise Software Teams**: Creating custom solutions for sports organizations, gyms, and training facilities
- **Third-Party Integrators**: Building middleware or connector services for existing platforms

### Use Cases

- **Training Management Applications**: Apps that help coaches manage athlete workouts and progress
- **Fitness Tracking Integration**: Platforms that aggregate data from multiple fitness sources
- **Coaching Platforms**: Software for professional coaches to monitor and guide athletes
- **Sports Analytics Tools**: Applications that analyze training data and performance metrics
- **Workout File Processing**: Systems that handle TCX, GPX, and FIT file uploads and management

## Core Value Propositions

### 1. **Developer Experience Excellence**

- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Modern Standards**: Built with latest JavaScript/TypeScript best practices
- **Clear Documentation**: Extensive documentation with code examples and architecture guides
- **IDE Support**: Rich intellisense and autocomplete support

### 2. **Enterprise-Grade Architecture**

- **Clean Architecture**: Follows hexagonal architecture (ports & adapters) for maximum maintainability
- **Separation of Concerns**: Clear boundaries between business logic, data access, and external integrations
- **Testability**: Comprehensive unit, integration, and E2E test coverage
- **Scalability**: Designed to handle enterprise-scale applications

### 3. **Comprehensive API Coverage**

- **Authentication Management**: Secure session handling with automatic token refresh
- **User Operations**: Complete user profile and settings management
- **Workout Management**: Full CRUD operations for workout data
- **File Format Support**: Native support for TCX, GPX, and FIT file formats
- **Flexible Querying**: Rich filtering and query capabilities

### 4. **Production-Ready Features**

- **Dual Package Support**: Works with both ESM and CommonJS module systems
- **Error Handling**: Structured error responses with detailed error codes ([`src/adapters/errors/`](./src/adapters/errors/))
- **Retry Logic**: Intelligent retry mechanisms for network resilience ([`src/adapters/http/retry-handler.ts`](./src/adapters/http/retry-handler.ts))
- **Cookie Management**: Automatic session persistence and management ([`src/adapters/http/axios-http-client.ts`](./src/adapters/http/axios-http-client.ts))
- **Configurable Logging**: PII-safe logging for debugging and monitoring with automatic redaction of sensitive data ([`src/adapters/logging/`](./src/adapters/logging/))

## Product Features

### Authentication & Security

#### Authentication Flow
- Username/password authentication with secure credential handling ([`src/adapters/public-api/auth-repository.ts`](./src/adapters/public-api/auth-repository.ts))
- Multi-step authentication process with request verification token extraction
- Automatic session persistence and restoration

#### Cookie Security
- **Secure Cookies**: All authentication cookies use `Secure`, `HttpOnly`, and `SameSite=Lax` flags
- **Automatic Cookie Management**: Session cookies handled transparently via axios-cookiejar-support ([`src/adapters/http/axios-http-client.ts`](./src/adapters/http/axios-http-client.ts))
- **Cross-Site Protection**: SameSite attributes prevent CSRF attacks

#### Token Management
- **Secure Token Refresh**: Automatic token refresh with exponential backoff and clock-skew tolerance ([`src/adapters/http/token-refresh-handler.ts`](./src/adapters/http/token-refresh-handler.ts))
- **Token Expiration Handling**: Proactive refresh before expiration with configurable buffer times
- **Refresh Failure Recovery**: Graceful fallback to re-authentication when refresh fails

#### Security Best Practices
- **PII-Safe Logging**: Automatic redaction of tokens, cookies, and sensitive data in logs ([`src/adapters/logging/`](./src/adapters/logging/))
- **CSRF Protection**: Request verification tokens and SameSite cookie attributes
- **Session Validation**: Comprehensive session state validation and integrity checks ([`src/shared/utils/session-utils.ts`](./src/shared/utils/session-utils.ts))
- **Timeout & Retry Policies**: Configurable timeouts and intelligent retry with backoff ([`src/adapters/http/retry-handler.ts`](./src/adapters/http/retry-handler.ts))

#### Finding Security-Related Code
```bash
# Search for security-related implementations
grep -r "Secure\|HttpOnly\|SameSite" src/
grep -r "csrf\|token.*refresh\|cookie.*flag" src/
grep -r "redact\|mask\|sanitize" src/
```

### User Management

- User profile retrieval and management
- User preferences and settings management
- User ID extraction and validation
- Avatar and profile data handling

### Workout Operations

- **Create**: Upload workout files (TCX, GPX, FIT formats)
- **Read**: Retrieve individual workouts and workout lists with flexible filtering
- **Update**: Modify workout metadata and properties
- **Delete**: Remove workouts from the platform
- **Query**: Filter workouts by date range, activity type, and other criteria

### Data Processing

- Workout structure building and validation
- File format detection and processing
- Data serialization and transformation
- Schema validation with Zod

### Development Tools

- Comprehensive test fixtures and factories
- Mock data generation with Faker.js
- Development server with watch mode
- Pre-commit hooks and code quality checks

## Technical Architecture

### Clean Architecture Implementation

- **Domain Layer**: Pure business logic with entities, value objects, and business rules
- **Application Layer**: Use cases and service contracts that orchestrate business operations
- **Adapters Layer**: External integrations including HTTP clients, storage, and serialization

### Quality Assurance

- **Zero Warnings Policy**: ESLint configuration with strict code quality rules
- **Test Coverage**: Automated coverage reporting with threshold enforcement
- **Multiple Test Types**: Unit tests, integration tests, and end-to-end tests
- **Continuous Integration**: Automated testing and release pipeline

### Build System

- **TypeScript Compilation**: Strict type checking with path alias resolution
- **Dual Module Output**: Both ESM and CommonJS builds for maximum compatibility
- **Bundle Optimization**: Separate builds optimized for different consumption patterns
- **Semantic Versioning**: Automated release management with semantic-release

## Versioning and Deprecation Policy

### Semantic Versioning

The SDK follows [Semantic Versioning 2.0.0](https://semver.org/) with automated releases managed by semantic-release:

- **MAJOR** (x.0.0): Breaking changes that require code updates
- **MINOR** (0.x.0): New features that are backward compatible
- **PATCH** (0.0.x): Bug fixes and internal improvements

#### Pre-1.0 Version Semantics
- **0.x.x versions**: May include breaking changes in MINOR versions as the API is stabilizing
- **1.0.0 commitment**: Full SemVer semantics enforced starting with version 1.0.0
- **Beta/RC releases**: Pre-releases tagged with `-beta` or `-rc` for early testing

### Communication Channels

**Breaking Changes & Deprecations announced via:**
- **Primary**: [`CHANGELOG.md`](./CHANGELOG.md) with detailed migration guides
- **GitHub Releases**: Release notes with highlighted breaking changes
- **GitHub Discussions**: Community announcements and Q&A
- **Package Updates**: Console warnings and TypeScript deprecation comments

### Breaking Changes Policy

- **Advance Notice**: Breaking changes announced at least 2 minor versions before implementation
- **Migration Guides**: Comprehensive upgrade documentation provided for major versions
- **Deprecation Warnings**: Features marked for removal include console warnings and TypeScript deprecation comments

### Deprecation Timeline

1. **Announcement**: Feature marked as deprecated with `@deprecated` JSDoc tags
2. **Warning Period**: Minimum 6 months before removal in next major version
3. **Removal**: Deprecated features removed only in major version releases

### Long-Term Support (LTS)

- **LTS Policy**: Major versions supported for 18 months from release date
- **Security Updates**: Critical security fixes backported to supported versions
- **LTS Designation**: Every other major version designated as LTS (2.x, 4.x, etc.)

### Upgrade Guidance

- **Major Version Upgrades**: Review [`CHANGELOG.md`](./CHANGELOG.md) for breaking changes and migration steps
- **Automated Migration**: Where possible, codemods will be provided for large breaking changes
- **Support window**: Previous major versions supported for security fixes for 12 months after new major release

## Competitive Advantages

### 1. **Architecture Excellence**

Unlike simple API wrapper libraries, the TrainingPeaks SDK is built on proven architectural patterns that ensure long-term maintainability and extensibility.

### 2. **Developer-Centric Design**

The SDK prioritizes developer experience with comprehensive TypeScript support, clear error messages, and extensive documentation.

### 3. **Production Readiness**

Built with enterprise requirements in mind, including proper error handling, retry logic, session management, and comprehensive testing.

### 4. **Flexibility**

The modular architecture allows developers to use individual components or the complete SDK based on their needs.

## Non-goals

The TrainingPeaks SDK intentionally does not aim to address the following areas:

- **Real-time Data Streaming**: No WebSocket or real-time workout tracking capabilities
- **Mobile App Development**: No React Native, Flutter, or mobile-specific components
- **Advanced Analytics**: No built-in workout analysis, performance metrics, or data visualization
- **Social Features**: No workout sharing, social networking, or community features
- **Third-party Integrations**: No built-in integrations with other fitness platforms or services (extensible via custom adapters)
- **Offline Functionality**: No offline workout storage or synchronization capabilities

## Roadmap

> **Note**: This roadmap is non-binding and subject to change based on user feedback, technical constraints, and business priorities. For live status updates and current milestone tracking, see our [GitHub Projects](https://github.com/your-org/trainingpeaks-sdk/projects) page.

The following features and improvements are planned for future releases:

- **Enhanced Workout Filtering**: Advanced search capabilities with complex query builders
- **Batch Operations**: Bulk workout upload, update, and deletion operations
- **Rate Limiting**: Built-in rate limiting and throttling mechanisms
- **Performance Monitoring**: SDK performance metrics and optimization tools
- **Additional File Formats**: Support for more workout file formats and data sources

## Open Source Strategy

The TrainingPeaks SDK is designed as an open source project that benefits from community contributions while maintaining high standards of code quality and architectural consistency. The project welcomes contributions in the form of:

- Bug reports and fixes
- Feature requests and implementations
- Documentation improvements
- Test coverage enhancements
- Performance optimizations

The open source approach ensures transparency, community trust, and collaborative improvement while establishing TrainingPeaks as a developer-friendly platform in the fitness technology ecosystem.
