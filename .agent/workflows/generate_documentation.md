---
description: Generate a comprehensive documentation package for the project including architecture, user guides, and technical specs.
---

1. **Analysis Phase**
   - Review codebase structure and package.json.
   - Identify core components, server actions, and library utilities.
   - Extract design tokens (colors, typography) from tailwind.config.ts and CSS globals.
   - Document administrative features and mission-critical workflows.

2. **Core Documentation Generation**
   - Create `docs/architecture.md`: Document tech stack, component hierarchy, database schema, and data flow patterns.
   - Create `docs/readme.md`: Provide project overview, installation steps, and feature summaries.
   - Create `docs/colors.md`: Define the design system, specific hex codes, and UI token usage.

3. **Process & Operational Documentation**
   - Create `docs/changelog.md`: Record version history, major features, and fixes.
   - Create `docs/roadmap.md`: Outline future technical and product-level improvements.
   - Create `docs/admin-guide.md`: Provide step-by-step instructions for non-technical users to manage the application.

4. **Technical & Domain Specs**
   - Create `docs/deployment.md`: Detail environment variables, cloud configurations, and database setup (e.g., Supabase SQL).
   - Create `docs/tournament-rules.md`: Document domain-specific logic, scoring algorithms, and tie-breaker rules.

5. **Review**
   - Ensure consistent markdown formatting.
   - Verify all paths and commands are accurate to the current project state.
