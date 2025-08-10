# Setup Project Views - Manual Instructions

## 🚫 API Limitation
GitHub Projects V2 API does not support creating views programmatically. Views must be created manually via the web interface.

## 📋 Required Views to Create

### 1. Development Board View
1. Go to https://github.com/users/{GITHUB_USER}/projects/{PROJECT_ID}
2. Click "New view" button
3. Configure:
   - **Name**: `📋 Development Board`
   - **Layout**: Board layout
   - **Group by**: Status field (creates columns automatically based on Status options)
   - **Show**: All items

### 2. Product Roadmap View
1. Click "New view" button again
2. Configure:
   - **Name**: `🚀 Product Roadmap`  
   - **Layout**: Table layout
   - **Sort by**: Priority (Critical → High → Medium → Low)
   - **Show**: All items
   - **Visible fields**: Title, Status, Priority, Type, Effort, Component

### 3. Architecture Focus View (Optional)
1. Click "New view" button
2. Configure:
   - **Name**: `🏗️ Architecture & Quality`
   - **Layout**: Board layout
   - **Group by**: Component field (creates columns automatically based on Component options)
   - **Filter**: component:domain, component:application, component:infrastructure, etc.

### 4. Testing Dashboard View (Optional)  
1. Click "New view" button
2. Configure:
   - **Name**: `🧪 Testing Dashboard`
   - **Layout**: Table layout
   - **Filter**: type: testing
   - **Sort by**: Priority

## ✅ Verification
After creating the views, you can query them via GraphQL to confirm:

```bash
# User project verification query
gh api graphql -f query='
query {
  user(login: "{GITHUB_USER}") {
    projectV2(number: {PROJECT_ID}) {
      title
      views(first: 10) {
        nodes {
          id
          name
          layout
          filter
          sortBy {
            field {
              ... on ProjectV2Field {
                name
                dataType
              }
            }
            direction
          }
          groupBy {
            field {
              ... on ProjectV2Field {
                name
                dataType
              }
            }
          }
          visibleFields(first: 20) {
            nodes {
              ... on ProjectV2Field {
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                name
                dataType
                options {
                  id
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  }
}'

# Organization project verification query
gh api graphql -f query='
query {
  organization(login: "{ORG_NAME}") {
    projectV2(number: {PROJECT_ID}) {
      title
      views(first: 10) {
        nodes {
          id
          name
          layout
          filter
          sortBy {
            field {
              ... on ProjectV2Field {
                name
                dataType
              }
            }
            direction
          }
          groupBy {
            field {
              ... on ProjectV2Field {
                name
                dataType
              }
            }
          }
          visibleFields(first: 20) {
            nodes {
              ... on ProjectV2Field {
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                name
                dataType
                options {
                  id
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  }
}'
```

## 🔄 Future Updates
Monitor GitHub's roadmap for potential API support for view creation:
- [GitHub Public Roadmap](https://github.com/github/roadmap)
- [GitHub Changelog](https://github.blog/changelog/)