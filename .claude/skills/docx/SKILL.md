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
