/**
 * GitHub Configuration Generator
 * Generates GitHub configuration files with dynamic values
 */

import type { ProjectConfig } from '../../../config/project.config.js';

/**
 * Generate CODEOWNERS file content
 */
export function generateCodeowners(config: ProjectConfig): string {
  const owners = config.github.codeowners.map(owner => `@${owner}`).join(' ');
  
  return `# Global owners - all files assigned to multiple owners to reduce bus factor risk
# Specific entries can be added here in the future if exceptions are needed
* ${owners}

# Critical areas with specific ownership
/.github/ ${owners}
/docs/ ${owners}
/src/domain/ @${config.github.codeowners[0]}
/src/adapters/ @${config.github.codeowners[0]}
/.cursor/rules/ @${config.github.codeowners[0]}
`;
}

/**
 * Generate dependabot.yml file content
 */
export function generateDependabotYml(config: ProjectConfig): string {
  const reviewers = config.github.dependabot.reviewers
    .map(reviewer => `      - "${reviewer}"`)
    .join('\n');
    
  const assignees = config.github.dependabot.assignees
    .map(assignee => `      - "${assignee}"`)
    .join('\n');
    
  return `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
${reviewers}
    assignees:
${assignees}
    commit-message:
      prefix: "chore"
      prefix-development: "chore"
      include: "scope"
`;
}

/**
 * Generate GitHub labels configuration
 */
export function generateLabelsYml(config: ProjectConfig): string {
  const labels = [
    // Priority Labels
    {
      name: 'priority: critical',
      color: config.colors.critical,
      description: 'Critical issue that blocks development or production'
    },
    {
      name: 'priority: high',
      color: config.colors.high,
      description: 'High priority issue that should be addressed soon'
    },
    {
      name: 'priority: medium',
      color: config.colors.medium,
      description: 'Medium priority issue'
    },
    {
      name: 'priority: low',
      color: config.colors.low,
      description: 'Low priority issue'
    },
    
    // Type Labels
    {
      name: 'type: bug',
      color: config.colors.bug,
      description: 'Something isn\'t working'
    },
    {
      name: 'type: enhancement',
      color: config.colors.enhancement,
      description: 'New feature or request'
    },
    {
      name: 'type: refactor',
      color: config.colors.refactor,
      description: 'Code change that neither fixes a bug nor adds a feature'
    },
    {
      name: 'type: documentation',
      color: config.colors.documentation,
      description: 'Documentation only changes'
    },
    {
      name: 'type: testing',
      color: config.colors.testing,
      description: 'Adding or updating tests'
    },
    {
      name: 'type: performance',
      color: config.colors.performance,
      description: 'Performance improvements'
    },
    {
      name: 'type: security',
      color: config.colors.security,
      description: 'Security improvements or fixes'
    },
    
    // Status Labels
    {
      name: 'status: needs-triage',
      color: config.colors.needsTriage,
      description: 'Issue needs to be reviewed and categorized'
    },
    {
      name: 'status: ready',
      color: config.colors.ready,
      description: 'Issue is ready to be worked on'
    },
    {
      name: 'status: in-progress',
      color: config.colors.inProgress,
      description: 'Issue is currently being worked on'
    },
    {
      name: 'status: blocked',
      color: config.colors.blocked,
      description: 'Issue is blocked by another issue or dependency'
    },
    {
      name: 'status: needs-review',
      color: config.colors.needsReview,
      description: 'Issue needs code review'
    },
    {
      name: 'status: needs-testing',
      color: config.colors.needsTesting,
      description: 'Issue needs testing before completion'
    },
    
    // Architecture Labels
    {
      name: 'architecture: domain',
      color: config.colors.domain,
      description: 'Changes to domain layer'
    },
    {
      name: 'architecture: application',
      color: config.colors.application,
      description: 'Changes to application layer'
    },
    {
      name: 'architecture: adapters',
      color: config.colors.adapters,
      description: 'Changes to adapters layer'
    },
    {
      name: 'architecture: shared',
      color: config.colors.shared,
      description: 'Changes to shared utilities'
    },
    
    // Component Labels (dynamic based on project)
    {
      name: 'component: authentication',
      color: config.colors.component,
      description: 'Authentication and authorization'
    },
    {
      name: 'component: workouts',
      color: config.colors.component,
      description: 'Workout management'
    },
    {
      name: 'component: users',
      color: config.colors.component,
      description: 'User management'
    },
    {
      name: 'component: http-client',
      color: config.colors.component,
      description: 'HTTP client and API communication'
    },
    {
      name: 'component: storage',
      color: config.colors.component,
      description: 'Data storage and persistence'
    },
    {
      name: 'component: validation',
      color: config.colors.component,
      description: 'Data validation and schemas'
    },
    {
      name: 'component: logging',
      color: config.colors.component,
      description: 'Logging and monitoring'
    },
    {
      name: 'component: testing',
      color: config.colors.component,
      description: 'Testing framework and utilities'
    },
    
    // Effort Labels
    {
      name: 'effort: small',
      color: config.colors.small,
      description: 'Small change, less than 1 day'
    },
    {
      name: 'effort: medium',
      color: config.colors.effort_medium,
      description: 'Medium change, 1-3 days'
    },
    {
      name: 'effort: large',
      color: config.colors.large,
      description: 'Large change, 3-7 days'
    },
    {
      name: 'effort: epic',
      color: config.colors.epic,
      description: 'Epic change, more than 1 week'
    },
    
    // Breaking Change Labels
    {
      name: 'breaking-change',
      color: config.colors.breakingChange,
      description: 'Breaking change that requires migration'
    },
    {
      name: 'migration-required',
      color: config.colors.migration,
      description: 'Migration guide needed for users'
    },
    
    // Quality Labels
    {
      name: 'quality: technical-debt',
      color: config.colors.technicalDebt,
      description: 'Technical debt that should be addressed'
    },
    {
      name: 'quality: code-review',
      color: config.colors.codeReview,
      description: 'Code review required'
    },
    {
      name: 'quality: testing',
      color: config.colors.testing,
      description: 'Testing improvements needed'
    },
    
    // Release Labels
    {
      name: 'release: next',
      color: config.colors.release,
      description: 'Targeted for next release'
    },
    {
      name: 'release: future',
      color: config.colors.future,
      description: 'Targeted for future release'
    },
    {
      name: 'release: patch',
      color: config.colors.patch,
      description: 'Patch version change'
    },
    {
      name: 'release: minor',
      color: config.colors.minor,
      description: 'Minor version change'
    },
    {
      name: 'release: major',
      color: config.colors.major,
      description: 'Major version change'
    },
  ];
  
  const labelsYml = labels.map(label => 
    `  - name: "${label.name}"
    color: "${label.color}"
    description: "${label.description}"`
  ).join('\n');
  
  return `labels:\n${labelsYml}\n`;
}