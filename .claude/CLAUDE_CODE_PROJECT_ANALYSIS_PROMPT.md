# 🔍 ULTIMATE PROJECT ANALYSIS & AUDIT PROMPT FOR CLAUDE CODE

---

## EXECUTIVE BRIEFING

You are tasked with performing a **comprehensive technical audit** of an inherited codebase. Your goal is to:

1. **Discover & Document** the complete tech stack
2. **Identify & Categorize** all technical issues and debt
3. **Produce a Detailed Report** with actionable remediation steps
4. **Provide a Phased Debugging Plan** for systematic correction

This is a **code archaeology + strategic planning** assignment. Think like a senior architect, not just a linter.

---

## PHASE 1: DISCOVERY & MAPPING

### 1.1 Tech Stack Analysis

**Scan and document:**

- **Core Framework/Runtime**: Node.js, Python, Go, Rust, Ruby, PHP, etc. (versions)
- **Package Manager**: npm, yarn, pnpm, pip, cargo, composer, etc.
- **Frontend Stack** (if applicable): React, Vue, Svelte, Angular, vanilla JS, etc.
- **Backend Stack** (if applicable): Express, Django, Flask, FastAPI, NestJS, Laravel, etc.
- **Database**: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Firestore, etc.
- **Authentication**: OAuth, JWT, Auth0, Cognito, Passport.js, etc.
- **Build & Tooling**: Webpack, Vite, Babel, Esbuild, Parcel, Gulp, Grunt, etc.
- **Testing**: Jest, Mocha, Chai, pytest, unittest, RSpec, etc.
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI, etc.
- **Deployment**: Vercel, Netlify, Heroku, AWS, GCP, Docker, Kubernetes, etc.
- **Cloud Services**: AWS Lambda, Firebase, Supabase, Anthropic API, third-party APIs, etc.
- **Monitoring & Logging**: DataDog, New Relic, CloudWatch, ELK Stack, Sentry, etc.
- **State Management** (Frontend): Redux, Zustand, Recoil, Context API, Jotai, etc.
- **API/Data Fetching**: REST, GraphQL, tRPC, Axios, Fetch, Apollo, etc.
- **Styling**: CSS, Sass, Tailwind CSS, Styled Components, CSS Modules, etc.
- **ORM/Database Abstraction**: Sequelize, TypeORM, Prisma, SQLAlchemy, etc.

**Deliverable**: A structured tech stack inventory (table format preferred)

---

### 1.2 Project Structure & Architecture

**Map the codebase layout:**

- Root directory structure and purpose of major folders
- Entry points (main.js, server.js, index.py, etc.)
- Separation of concerns (controllers, services, models, views, utils)
- API endpoints or route structure
- Database schema or data models
- Configuration files (.env, config.js, .env.example, secrets management)
- Dependency count and breakdown (by purpose if possible)

**Deliverable**: Visual folder tree + architectural diagram (ASCII or pseudo-code)

---

### 1.3 Code Quality Baseline

**Quick assessment:**

- Type Safety: TypeScript? PropTypes? None?
- Linting: ESLint, Prettier, Black, Flake8, etc.? Config present?
- Test Coverage: unit, integration, e2e tests present? Coverage %?
- Documentation: README quality, inline comments, API docs, type hints?
- Package.json / requirements.txt / Cargo.toml health: version locks, outdated deps?
- Git history: commit patterns, branch naming, meaningful messages?

**Deliverable**: Code quality scorecard (scale 1–10)

---

## PHASE 2: ISSUE IDENTIFICATION & CATEGORIZATION

### 2.1 Critical Issues (Blocking/Security)

**Search for:**

- **Security Vulnerabilities**: Hardcoded credentials, SQL injection risks, unvalidated inputs, exposed API keys, weak auth, CORS misconfigs
- **Runtime Errors**: Unhandled exceptions, null/undefined references, missing error boundaries, async/await issues
- **Broken Dependencies**: Version conflicts, circular imports, missing packages, incompatible versions
- **Database Issues**: Connection pooling problems, N+1 queries, missing indexes, migration conflicts
- **Memory/Performance Leaks**: Event listener cleanup, infinite loops, large memory allocations, unoptimized queries

**Deliverable**: Numbered list with file paths and line numbers

---

### 2.2 High-Priority Issues (Code Debt)

**Look for:**

- **Type Safety Gaps**: Any type errors (TypeScript) or missing type hints
- **Code Duplication**: Repeated logic that should be extracted
- **Dead Code**: Unused imports, functions, variables, commented-out blocks
- **Anti-patterns**: Tight coupling, God objects, callback hell, inconsistent error handling
- **Missing Tests**: Critical functions without test coverage
- **Configuration Issues**: Environment variable handling, secrets leakage
- **API Design**: Inconsistent naming, missing validation, poor error responses

**Deliverable**: Categorized list with severity levels

---

### 2.3 Medium-Priority Issues (Style & Best Practices)

**Audit:**

- **Naming Conventions**: Variables, functions, classes follow standard patterns?
- **Code Formatting**: Consistent indentation, spacing, line length?
- **Error Messages**: Helpful, localized, logged properly?
- **Logging**: Appropriate log levels, not too verbose or sparse?
- **Comments**: Over-commented, under-commented, or just right?
- **Accessibility**: (If frontend) ARIA labels, color contrast, semantic HTML?
- **Performance**: Unnecessary re-renders, blocking operations, unoptimized assets?

**Deliverable**: Detailed observations with examples

---

### 2.4 Low-Priority Issues (Future Improvements)

**Consider:**

- **Documentation**: Missing README sections, unclear API docs, no contributing guide
- **Build Optimization**: Bundle size, lazy loading, code splitting opportunities
- **Dependency Updates**: Minor version upgrades, deprecation warnings
- **Testing Infrastructure**: Could unit tests be faster? E2E coverage gaps?
- **DevX Improvements**: Local setup clarity, hot reload, debugging tools

**Deliverable**: Backlog-style list (prioritize by impact)

---

## PHASE 3: COMPREHENSIVE REPORT STRUCTURE

### 3.1 Executive Summary (1 page max)

- **Project Overview**: What is this project? Main purpose?
- **Current State Grade**: Overall code quality on A–F scale
- **Top 3 Risks**: The biggest issues blocking progress or stability
- **Quick Wins**: 2–3 fixes that deliver high value with low effort
- **Estimated Effort**: Rough breakdown (critical: X hours, high: Y hours, medium: Z hours)

---

### 3.2 Tech Stack Report

**Table format:**

| Category | Technology | Version | Purpose | Health | Notes |
|----------|-----------|---------|---------|--------|-------|
| Runtime | Node.js | 18.x | JavaScript execution | ✅ | LTS version |
| Framework | Express | 4.18.2 | HTTP server | ⚠️ | Minor version behind |
| DB | PostgreSQL | 14 | Primary data store | ✅ | Well-maintained |
| ... | ... | ... | ... | ... | ... |

**Key Observations**:
- Dependency count and health
- Security patch status
- Long-term viability of stack choices
- Compatibility issues

---

### 3.3 Issues Register (Detailed)

**Organized by severity:**

#### CRITICAL (Fix Immediately)

**Issue #1: [Title]**
- **Location**: `src/routes/auth.js:45`
- **Severity**: 🔴 CRITICAL
- **Type**: Security / Performance / Runtime Error
- **Description**: [Clear explanation of what's wrong]
- **Impact**: [What breaks? Who's affected?]
- **Root Cause**: [Why did this happen?]
- **Fix Strategy**: [Exact steps to resolve]
- **Estimated Effort**: [1 hour / 4 hours / 1 day]
- **Testing Steps**: [How to verify the fix works]

---

#### HIGH (Address in Sprint 1)

**Issue #2: [Title]**
- **Location**: `src/services/user.service.ts:123`
- **Severity**: 🟠 HIGH
- **Type**: Type Safety / Code Debt / Missing Tests
- **Description**: [...]
- **Impact**: [...]
- **Root Cause**: [...]
- **Fix Strategy**: [...]
- **Estimated Effort**: [...]
- **Testing Steps**: [...]

---

#### MEDIUM (Address in Sprint 2)

**Issue #3: [Title]**
- **Location**: `src/utils/helpers.js`
- **Severity**: 🟡 MEDIUM
- [...]

---

#### LOW (Backlog)

**Issue #4: [Title]**
- **Location**: `docs/README.md`
- **Severity**: 🔵 LOW
- [...]

---

### 3.4 Code Quality Metrics

**Detailed scorecard:**

| Metric | Score | Status | Comments |
|--------|-------|--------|----------|
| Type Safety | 6/10 | ⚠️ | Missing TypeScript in 3 modules |
| Test Coverage | 45% | 🔴 | Critical functions untested |
| Linting | 8/10 | ✅ | ESLint configured, minor inconsistencies |
| Security | 5/10 | 🔴 | Hardcoded API key in .env.example |
| Documentation | 4/10 | 🔴 | README outdated, no API docs |
| Performance | 7/10 | ⚠️ | Some optimization opportunities |
| Maintainability | 6/10 | ⚠️ | Moderate code duplication |
| DevX | 7/10 | ✅ | Good setup guide, clear structure |
| **Overall** | **6.1/10** | **⚠️** | **Functioning but needs refactoring** |

---

## PHASE 4: DEBUGGING & CORRECTION PLAN

### 4.1 Phased Approach (Recommended Timeline)

#### **Phase 0: Immediate Stabilization (Days 1–3)**

**Goal**: Fix critical issues blocking development/production

**Tasks**:
1. [ ] Fix Security Vulnerability #1 (hardcoded secrets)
   - Action: Move to environment variables
   - PR: `fix/secure-env-variables`
   - Effort: 1 hour
   
2. [ ] Fix Runtime Error #2 (null reference crash)
   - Action: Add null checks, set defaults
   - PR: `fix/null-reference-handling`
   - Effort: 2 hours

3. [ ] Set up Sentry / error monitoring
   - Action: Install, configure, test alerts
   - PR: `feat/error-monitoring`
   - Effort: 3 hours

**Verification**:
- [ ] All critical issues resolved
- [ ] Application runs without crashes
- [ ] Error monitoring active

---

#### **Phase 1: Code Quality Foundation (Week 1)**

**Goal**: Establish maintainability baselines

**Tasks**:
1. [ ] Migrate remaining JS to TypeScript
   - Action: Add tsconfig, convert high-impact files first
   - PR: `refactor/typescript-migration`
   - Effort: 16 hours

2. [ ] Implement comprehensive linting (ESLint + Prettier)
   - Action: Create shared config, auto-fix existing code
   - PR: `config/linting-setup`
   - Effort: 4 hours

3. [ ] Extract code duplication (#3, #4, #7)
   - Action: Create shared utilities, reduce 200 LOC
   - PR: `refactor/dedup-utilities`
   - Effort: 8 hours

4. [ ] Add unit tests for critical paths
   - Action: Jest setup, write 20+ tests
   - PR: `test/critical-path-coverage`
   - Effort: 12 hours

**Verification**:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with 0 violations
- [ ] Test coverage ≥ 60% for critical modules
- [ ] All PRs pass CI/CD

---

#### **Phase 2: Architecture Improvements (Weeks 2–3)**

**Goal**: Improve scalability and maintainability

**Tasks**:
1. [ ] Refactor monolithic service layer
   - Action: Split into domain-based services
   - PR: `refactor/service-layer-separation`
   - Effort: 24 hours

2. [ ] Optimize database queries (N+1, missing indexes)
   - Action: Add indexes, implement query caching
   - PR: `perf/database-optimization`
   - Effort: 16 hours

3. [ ] Implement comprehensive API validation
   - Action: Add Zod / Joi schemas to all endpoints
   - PR: `feat/api-validation`
   - Effort: 12 hours

4. [ ] Set up structured logging
   - Action: Replace console.log with winston/pino
   - PR: `feat/structured-logging`
   - Effort: 8 hours

**Verification**:
- [ ] Database query performance ≥ 20% improvement
- [ ] All API endpoints validated
- [ ] Logs searchable and queryable
- [ ] Architecture supports horizontal scaling

---

#### **Phase 3: Documentation & DevX (Week 4)**

**Goal**: Reduce onboarding friction and tribal knowledge

**Tasks**:
1. [ ] Complete comprehensive README
   - Action: Cover setup, architecture, deployment
   - PR: `docs/comprehensive-readme`
   - Effort: 8 hours

2. [ ] Generate API documentation (Swagger/OpenAPI)
   - Action: Auto-generate from code, host on /api/docs
   - PR: `docs/api-documentation`
   - Effort: 6 hours

3. [ ] Create architecture decision records (ADRs)
   - Action: Document key decisions and rationale
   - PR: `docs/architecture-decisions`
   - Effort: 6 hours

4. [ ] Set up local development environment automation
   - Action: Docker Compose, make commands, setup script
   - PR: `devx/local-setup-automation`
   - Effort: 6 hours

**Verification**:
- [ ] New developer can run locally in <15 minutes
- [ ] All APIs documented with examples
- [ ] Architecture questions answered in ADRs

---

### 4.2 Parallel Quick Wins (Can be done immediately)

Tasks that don't block other work and deliver immediate value:

- [ ] Update dependencies to latest patch versions
- [ ] Add `.env.example` with all required variables
- [ ] Create `.gitignore` best practices file
- [ ] Add pre-commit hooks (husky) for linting
- [ ] Document known issues and workarounds
- [ ] Set up GitHub issue templates
- [ ] Add contributor guidelines (CONTRIBUTING.md)

**Estimated Effort**: 8 hours total

---

### 4.3 Testing Strategy

#### Pre-Refactoring

1. **Establish Baseline**:
   - Run existing tests, document coverage
   - Set up error monitoring to catch regressions
   - Create smoke test checklist for manual QA

#### During Refactoring

1. **Unit Test Each Fix**:
   - Write test that fails with current code
   - Implement fix
   - Verify test passes
   - TDD pattern for all critical changes

2. **Integration Tests**:
   - Test modified modules in context
   - Verify API endpoints still work
   - Check database interactions

#### Post-Refactoring

1. **Regression Testing**:
   - Run full test suite
   - Manual smoke tests (critical user flows)
   - Performance benchmarks
   - Load testing (if applicable)

2. **Monitoring**:
   - Track error rates in production
   - Monitor performance metrics
   - Watch for new issues in logs

---

### 4.4 Rollout Strategy

**Option A: Feature Branch → PR → Main** (Recommended for small teams)
- Each fix is a separate PR
- Code review required for all changes
- CI/CD validates before merge
- Rollback is simple (revert commit)

**Option B: Long-running Refactor Branch** (For large changes)
- Create `refactor/major-overhaul` branch
- Daily merges from main
- Periodic PRs to main with milestone progress
- Reduces merge conflict risk

**Option C: Gradual Rollout** (For production changes)
- Deploy to staging, full regression test
- Deploy to production with feature flags
- Monitor 24 hours before removing flags
- Automated rollback on error spikes

---

### 4.5 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Breaking change introduced | High | High | Comprehensive test suite before deploy |
| Performance regression | Medium | High | Benchmark critical paths, load test |
| Data loss from migrations | Low | Critical | Backup before schema changes, test on prod copy |
| Team resistance to refactoring | High | Medium | Clear communication, gradual rollout, quick wins first |
| Unforeseen technical debt | Medium | Medium | Pair programming, design review sessions |

---

## PHASE 5: MAINTENANCE & MONITORING

### 5.1 Post-Refactoring Checklist

- [ ] All tests passing locally and in CI/CD
- [ ] No performance regressions vs. baseline
- [ ] Error rate in production ≤ pre-refactor rate
- [ ] Documentation updated
- [ ] Team trained on new patterns
- [ ] Monitoring alerts configured

### 5.2 Ongoing Best Practices

1. **Weekly Code Review**:
   - Enforce linting standards
   - Catch new issues early
   - Share knowledge across team

2. **Monthly Dependency Updates**:
   - Review security advisories
   - Update patch versions
   - Test before merging

3. **Quarterly Architecture Review**:
   - Assess new technical debt
   - Plan next refactoring cycle
   - Evaluate new tooling

4. **Keep Living Documentation**:
   - Update README as code changes
   - Maintain decision log
   - Document known limitations

---

## REPORT SUBMISSION CHECKLIST

When you complete this analysis, provide:

- [ ] **Executive Summary** (1 page)
- [ ] **Tech Stack Inventory** (table, 1 page)
- [ ] **Project Architecture Diagram** (ASCII or visual, 1 page)
- [ ] **Detailed Issues Register** (numbered, categorized by severity)
- [ ] **Code Quality Scorecard** (10-point scale across 8 dimensions)
- [ ] **Phased Debugging Plan** (4 phases with timelines)
- [ ] **Risk Assessment** (probability vs. impact matrix)
- [ ] **Quick Reference Guide** (key file paths, critical functions, gotchas)
- [ ] **Appendix**: Full file listing, dependency tree, environment variables checklist

---

## DELIVERABLE FORMAT

**Recommended**: Generate a comprehensive HTML report with:
- Table of contents (clickable)
- Color-coded severity levels
- Collapsible sections for easy navigation
- Code snippets with syntax highlighting
- Embedded diagrams

**OR** a **Markdown document** with:
- Clear hierarchy (H1–H4)
- Numbered issues for easy reference
- Code blocks with language specification
- Tables for metrics and comparison

---

## SUCCESS CRITERIA

You will know the analysis is complete when:

1. ✅ Every file in the codebase has been scanned
2. ✅ All critical issues identified and explained
3. ✅ Tech stack fully documented with versions
4. ✅ Phased plan has specific, actionable tasks
5. ✅ Each task has effort estimate and success criteria
6. ✅ Risks identified and mitigations proposed
7. ✅ Report is clear enough for a new developer to understand
8. ✅ Implementation can begin immediately from Phase 0

---

## TONE & APPROACH

- **Professional but honest**: Point out problems without sugarcoating
- **Solutions-focused**: Every issue should have a clear path to resolution
- **Pragmatic**: Acknowledge that perfect code doesn't exist; prioritize by impact
- **Actionable**: Every recommendation should be implementable
- **Collaborative**: Assume the previous developer did their best with available info

---

## FINAL NOTES

- If you encounter unclear code, call it out—don't guess
- If you need to run commands to understand the project (npm install, npm test), do so
- Ask clarifying questions if project structure is ambiguous
- Prioritize security issues above all else
- Remember: the goal is to make this codebase maintainable and scalable long-term

Good luck! Let's make this codebase shine. 🚀

---

**Report Generated By**: Claude Code AI Agent  
**Analysis Date**: [SYSTEM WILL FILL]  
**Analyst Version**: Opus/Sonnet (as available)  
**Confidence Level**: [Based on code clarity and completeness]
