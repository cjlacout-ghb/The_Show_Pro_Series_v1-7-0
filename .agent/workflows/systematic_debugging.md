---
description: A systematic approach to identifying and resolving issues in the application.
---

# Systematic Debugging Workflow

1. **Analyze the Symptoms**
   - Review user reports or error messages.
   - Check the terminal output for stack traces or warnings.
   - Check the browser console for JavaScript errors or network failures.

2. **Reproduce the Issue**
   - Identify the steps to consistently reproduce the bug.
   - // turbo
   - Verify the issue exists in the current environment.

3. **Isolate the Cause**
   - Narrow down the scope (frontend vs. backend, specific component vs. global).
   - Use `grep_search` to find relevant code sections.
   - Use `view_file` to inspect logic.

4. **Implement a Fix**
   - Create a plan to resolve the issue.
   - Apply changes using `replace_file_content` or `multi_replace_file_content`.

5. **Verify the Fix**
   - Run the application and repeat the reproduction steps.
   - Ensure no regressions were introduced.
   - Remove any temporary logging or debug code.
