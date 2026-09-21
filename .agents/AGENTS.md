# Rules

- **Deployment Constraint**: Only deploy updates to Vercel when the user explicitly instructs to do so. Otherwise, only run and verify changes on the local development server (`localhost`).
- **Testing Constraint**: Do NOT automatically run browser tests (`browser_subagent`) or automated testing after changes. Only perform tests when the user explicitly requests to do so.
