#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  CLAUDE CODE SKILLS SETUP SCRIPT                                             ║
# ║  Creates the required directory structure and skill files                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  🚀 Claude Code Skills Setup                                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Get project directory (default to current directory)
PROJECT_DIR="${1:-.}"

echo "📁 Setting up skills in: $PROJECT_DIR"
echo ""

# Create directory structure
echo "📂 Creating directory structure..."
mkdir -p "$PROJECT_DIR/.claude/skills/frontend-design"
mkdir -p "$PROJECT_DIR/.claude/skills/docx"
mkdir -p "$PROJECT_DIR/.claude/skills/pdf"
mkdir -p "$PROJECT_DIR/.claude/skills/pptx"
mkdir -p "$PROJECT_DIR/.claude/skills/xlsx"

echo "✅ Directories created"
echo ""

# Create Frontend Design Skill
echo "🎨 Creating frontend-design skill..."
cat > "$PROJECT_DIR/.claude/skills/frontend-design/SKILL.md" << 'SKILL_EOF'
# Frontend Design Skill

> **Purpose:** Create distinctive, production-grade frontend interfaces with high design quality that avoid generic "AI slop" aesthetics.

---

## Design Thinking (Before Coding)

Before writing any code, understand the context and commit to a **BOLD aesthetic direction**:

### Questions to Answer

1. **Purpose:** What problem does this interface solve? Who uses it?
2. **Tone:** Pick an extreme aesthetic direction:
   - Brutally minimal
   - Maximalist chaos
   - Retro-futuristic
   - Organic/natural
   - Luxury/refined
   - Playful/toy-like
   - Editorial/magazine
   - Brutalist/raw
   - Art deco/geometric
   - Soft/pastel
   - Industrial/utilitarian
3. **Constraints:** Technical requirements (framework, performance, accessibility)
4. **Differentiation:** What makes this UNFORGETTABLE?

**CRITICAL:** Choose a clear conceptual direction and execute it with precision.

---

## Frontend Aesthetics Guidelines

### Typography
- Choose fonts that are **beautiful, unique, and interesting**
- **AVOID** generic fonts: Arial, Inter, Roboto, system fonts
- Consider: Space Grotesk, Instrument Sans, Satoshi, Cabinet Grotesk, Clash Display

### Color & Theme
- Commit to a **cohesive aesthetic**
- Use CSS variables for consistency
- Dominant colors with sharp accents outperform timid palettes

### Motion & Animation
- Use animations for effects and micro-interactions
- Focus on high-impact moments: page load, scroll-trigger, hover states
- Use `animation-delay` for staggered effects

### Spatial Composition
- Unexpected layouts, asymmetry, overlap
- Grid-breaking elements
- Generous negative space OR controlled density

### Backgrounds & Visual Details
- Gradient meshes, noise textures, geometric patterns
- Layered transparencies, dramatic shadows
- Grain overlays, custom cursors

---

## What to NEVER Do

```
❌ FORBIDDEN - Generic AI Aesthetics:
- Overused font families (Inter, Roboto, Arial)
- Clichéd color schemes (purple gradients on white)
- Predictable layouts and component patterns
- Cookie-cutter design lacking character
```

---

## Design Preservation Rules (For Refactoring)

When refactoring existing frontend code, **PRESERVE**:
- Typography choices (fonts, sizes, weights)
- Color palette and theme
- Spacing and layout rhythm
- Animation timings and effects
- Component visual structure
- Hover/focus/active states
- Responsive breakpoint behavior

Only modify visual elements if explicitly approved by the user.

---

## Final Reminder

> **"Claude is capable of extraordinary creative work. Don't hold back."**

Every interface should feel **inevitable** — as if no other design could exist.
SKILL_EOF

echo "✅ frontend-design/SKILL.md created"

# Create placeholder for other skills
echo "📄 Creating placeholder skills..."

# DOCX Skill
cat > "$PROJECT_DIR/.claude/skills/docx/SKILL.md" << 'SKILL_EOF'
# Word Document (DOCX) Skill

## Overview
Use this skill when creating, reading, editing, or manipulating Word documents (.docx files).

## Key Guidelines
- Use `docx` npm package for creating new documents
- Validate documents after creation
- Use proper heading styles for structure
- Never use unicode bullets manually - use numbering config

## Quick Reference
| Task | Approach |
|------|----------|
| Create new document | Use `docx-js` |
| Read/analyze content | Use `pandoc` |
| Edit existing | Unpack → edit XML → repack |
SKILL_EOF

# PDF Skill
cat > "$PROJECT_DIR/.claude/skills/pdf/SKILL.md" << 'SKILL_EOF'
# PDF Skill

## Overview
Use this skill for any PDF file operations.

## Capabilities
- Reading/extracting text from PDFs
- Combining/merging PDFs
- Splitting PDFs
- Adding watermarks
- Creating new PDFs
- Filling PDF forms
- OCR on scanned PDFs
SKILL_EOF

# PPTX Skill
cat > "$PROJECT_DIR/.claude/skills/pptx/SKILL.md" << 'SKILL_EOF'
# Presentation (PPTX) Skill

## Overview
Use this skill for PowerPoint/presentation file operations.

## Capabilities
- Creating slide decks
- Reading/parsing presentations
- Editing existing presentations
- Working with templates and layouts
- Managing speaker notes
SKILL_EOF

# XLSX Skill
cat > "$PROJECT_DIR/.claude/skills/xlsx/SKILL.md" << 'SKILL_EOF'
# Spreadsheet (XLSX) Skill

## Overview
Use this skill for Excel/spreadsheet file operations.

## Capabilities
- Creating new spreadsheets
- Reading/editing existing files
- Adding formulas and charts
- Data cleaning and restructuring
- Format conversion (CSV, TSV, XLSX)
SKILL_EOF

echo "✅ Placeholder skills created"
echo ""

# Check if CLAUDE.md exists, if not remind user
if [ ! -f "$PROJECT_DIR/.claude/CLAUDE.md" ] && [ ! -f "$PROJECT_DIR/CLAUDE.md" ]; then
    echo "⚠️  Note: No CLAUDE.md found. Please copy your CLAUDE.md to:"
    echo "   $PROJECT_DIR/.claude/CLAUDE.md"
    echo "   OR"
    echo "   $PROJECT_DIR/CLAUDE.md"
    echo ""
fi

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Directory structure created:"
echo ""
echo "   $PROJECT_DIR/"
echo "   └── .claude/"
echo "       ├── CLAUDE.md              ← Place your instruction file here"
echo "       └── skills/"
echo "           ├── frontend-design/"
echo "           │   └── SKILL.md       ✅ Created"
echo "           ├── docx/"
echo "           │   └── SKILL.md       ✅ Created"
echo "           ├── pdf/"
echo "           │   └── SKILL.md       ✅ Created"
echo "           ├── pptx/"
echo "           │   └── SKILL.md       ✅ Created"
echo "           └── xlsx/"
echo "               └── SKILL.md       ✅ Created"
echo ""
echo "🚀 Next steps:"
echo "   1. Copy your CLAUDE.md to $PROJECT_DIR/.claude/CLAUDE.md"
echo "   2. Run 'claude' in your project directory"
echo "   3. Claude Code will automatically read the skills!"
echo ""
