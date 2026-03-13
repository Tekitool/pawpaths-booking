# Antigravity Agent Rules

## Core Behavior & Token Optimization
- **No Boilerplate:** Never output conversational filler. Do not explain the code unless explicitly asked.
- **Precision:** Only output the exact lines of code that need to change. Do not output entire files for a single-line fix.
- **Artifact-First Workflow:** For any non-trivial feature request, always generate a plan artifact before modifying files. Wait for my approval on the plan.

## Tech Stack Standards
- **Framework:** Use Next.js App Router conventions strictly. 
- **Styling:** Use Tailwind CSS utility classes. Avoid creating custom CSS files unless absolutely necessary. Do not use inline styles.
- **Database:** Follow best practices for Supabase client initialization and data fetching. 

## Terminal Constraints
- Never execute destructive commands (e.g., `rm -rf`).
- Always run `npm run lint` and verify there are no errors before finalizing a task.

## Verification & Testing Strict Constraints
- **NO AUTOMATIC TESTING:** Never run `npm run dev`, `npm run test`, or execute any background scripts automatically.
- **NO BROWSER ACTUATION:** Do not actuate the Chrome browser, do not take screenshots, and do not generate walkthrough recordings under any circumstances.
- Only perform verification or browser testing if my prompt explicitly contains the exact phrase: "verify in browser" or "run tests".