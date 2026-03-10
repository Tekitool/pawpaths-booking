# 🛠️ Claude Code Skills Setup Guide

> **Complete guide to setting up skills for Claude Code CLI**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Setup (Recommended)](#quick-setup-recommended)
3. [Manual Setup](#manual-setup)
4. [Directory Structure](#directory-structure)
5. [How Claude Code Finds Skills](#how-claude-code-finds-skills)
6. [Customizing Skills](#customizing-skills)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What Are Skills?

Skills are instruction files (`.md`) that tell Claude Code how to perform specific tasks with high quality. They contain:

- Best practices and guidelines
- Templates and patterns
- Do's and Don'ts
- Code examples

### Why Do You Need Them?

The skills referenced in `CLAUDE.md` (like `/mnt/skills/public/frontend-design/SKILL.md`) exist only in Anthropic's **cloud environment** (Claude.ai web interface). For **Claude Code CLI** on your local machine, you need to create these files locally.

---

## Quick Setup (Recommended)

### Option 1: Run the Setup Script

```bash
# 1. Download the setup script to your project
curl -o setup-claude-skills.sh https://your-url/setup-claude-skills.sh

# 2. Make it executable
chmod +x setup-claude-skills.sh

# 3. Run it in your project directory
./setup-claude-skills.sh /path/to/your-project

# Or run in current directory
./setup-claude-skills.sh
```

### Option 2: One-Liner Setup

```bash
# Create all directories and a basic frontend skill in one command
mkdir -p .claude/skills/{frontend-design,docx,pdf,pptx,xlsx} && \
echo "# Frontend Design Skill\n\nAvoid generic AI aesthetics. Create distinctive, production-grade interfaces." > .claude/skills/frontend-design/SKILL.md
```

---

## Manual Setup

### Step 1: Create Directory Structure

```bash
# Navigate to your project root
cd /path/to/your-project

# Create the skills directories
mkdir -p .claude/skills/frontend-design
mkdir -p .claude/skills/docx
mkdir -p .claude/skills/pdf
mkdir -p .claude/skills/pptx
mkdir -p .claude/skills/xlsx
```

### Step 2: Create the Frontend Design Skill

Create the file `.claude/skills/frontend-design/SKILL.md`:

```bash
touch .claude/skills/frontend-design/SKILL.md
```

Copy the contents from the provided `frontend-design/SKILL.md` file into it.

### Step 3: Place Your CLAUDE.md

Copy your `CLAUDE.md` instruction file to one of these locations:

```bash
# Option A: In .claude directory (recommended)
cp CLAUDE.md .claude/CLAUDE.md

# Option B: In project root
cp CLAUDE.md ./CLAUDE.md
```

---

## Directory Structure

After setup, your project should look like this:

```
your-project/
├── .claude/                           ← Claude Code config directory
│   ├── CLAUDE.md                      ← Main instruction file
│   └── skills/                        ← Skills directory
│       ├── frontend-design/
│       │   └── SKILL.md               ← Frontend design guidelines
│       ├── docx/
│       │   └── SKILL.md               ← Word document guidelines
│       ├── pdf/
│       │   └── SKILL.md               ← PDF handling guidelines
│       ├── pptx/
│       │   └── SKILL.md               ← Presentation guidelines
│       └── xlsx/
│           └── SKILL.md               ← Spreadsheet guidelines
│
├── src/                               ← Your source code
├── package.json
├── tsconfig.json
└── ...
```

---

## How Claude Code Finds Skills

### Lookup Order

Claude Code searches for `CLAUDE.md` in this order:

1. **Project Root:** `./CLAUDE.md`
2. **Claude Directory:** `./.claude/CLAUDE.md`
3. **Global Config:** `~/.claude/CLAUDE.md`

### Skills References

When your `CLAUDE.md` references a skill:

```markdown
Before frontend work, read: .claude/skills/frontend-design/SKILL.md
```

Claude Code will look for that file relative to your project root.

### Global vs Project Skills

| Location | Scope | Use Case |
|----------|-------|----------|
| `~/.claude/skills/` | All projects | Universal coding standards |
| `./.claude/skills/` | This project only | Project-specific guidelines |

---

## Customizing Skills

### Enhancing the Frontend Design Skill

Edit `.claude/skills/frontend-design/SKILL.md` to add:

- Your brand colors and typography
- Preferred component libraries
- Animation standards
- Accessibility requirements

Example addition:

```markdown
## Project-Specific Design Tokens

### Brand Colors
- Primary: #0066FF
- Secondary: #10B981
- Background: #FAFAFA

### Typography
- Headings: "Cabinet Grotesk", sans-serif
- Body: "Inter", sans-serif
- Mono: "JetBrains Mono", monospace
```

### Creating Custom Skills

Create new skills for your specific needs:

```bash
# Example: Create an API design skill
mkdir -p .claude/skills/api-design
touch .claude/skills/api-design/SKILL.md
```

Then add your guidelines to the new skill file.

---

## Troubleshooting

### Problem: Claude Code Doesn't Read Skills

**Check 1:** Verify file location
```bash
ls -la .claude/skills/frontend-design/SKILL.md
```

**Check 2:** Verify CLAUDE.md references the correct path
```bash
grep -r "skills" .claude/CLAUDE.md
```

**Check 3:** Ensure paths are relative (not absolute)
```markdown
# ✅ Correct
.claude/skills/frontend-design/SKILL.md

# ❌ Incorrect
/mnt/skills/public/frontend-design/SKILL.md
```

### Problem: Skills Not Being Applied

**Solution:** Explicitly ask Claude to read the skill:

```
> Before refactoring this component, please read .claude/skills/frontend-design/SKILL.md
```

### Problem: Claude Code Not Finding CLAUDE.md

**Check:** Verify you're in the correct directory:
```bash
pwd
ls -la CLAUDE.md .claude/CLAUDE.md
```

---

## Files Included in This Package

| File | Purpose |
|------|---------|
| `CLAUDE-AUDIT.md` | Main instruction file (rename to CLAUDE.md) |
| `skills/frontend-design/SKILL.md` | Frontend design guidelines |
| `setup-claude-skills.sh` | Automated setup script |
| `README-SKILLS-SETUP.md` | This documentation |

---

## Quick Reference Commands

```bash
# Setup skills in current project
./setup-claude-skills.sh

# Setup skills in specific project
./setup-claude-skills.sh /path/to/project

# Verify structure
tree .claude/

# Check if Claude Code can find files
claude "List all files in .claude/"
```

---

## Support

If Claude Code still doesn't recognize your skills:

1. Restart Claude Code
2. Ensure you're running Claude Code from the project root
3. Check file permissions (`chmod 644 .claude/skills/*/*.md`)

---

**Happy Coding! 🚀**
