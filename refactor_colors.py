import os
import re

root_dir = r"c:\NEXT\Pawpath-Form"
extensions = {".js", ".jsx", ".ts", ".tsx"}
replacements = [
    (r"bg-pawpaths-brown", "bg-brand-color-01"),
    (r"bg-primary", "bg-brand-color-01"),
    (r"text-pawpaths-brown", "text-brand-color-01"),
    (r"text-primary", "text-brand-color-01"),
    (r"border-pawpaths-brown", "border-brand-color-01"),
    (r"border-primary", "border-brand-color-01"),
    (r"ring-primary", "ring-brand-color-01"),
    (r"outline-primary", "outline-brand-color-01"),
    (r"fill-primary", "fill-brand-color-01"),
    (r"stroke-primary", "stroke-brand-color-01"),
    # Also handle hover/focus variants
    (r"hover:bg-primary", "hover:bg-brand-color-01"),
    (r"hover:text-primary", "hover:text-brand-color-01"),
    (r"hover:border-primary", "hover:border-brand-color-01"),
    (r"focus:bg-primary", "focus:bg-brand-color-01"),
    (r"focus:text-primary", "focus:text-brand-color-01"),
    (r"focus:border-primary", "focus:border-brand-color-01"),
    (r"focus:ring-primary", "focus:ring-brand-color-01"),
    # Handle opacity modifiers
    (r"bg-primary/", "bg-brand-color-01/"),
    (r"text-primary/", "text-brand-color-01/"),
    (r"border-primary/", "border-brand-color-01/"),
]

for subdir, dirs, files in os.walk(root_dir):
    if "node_modules" in subdir or ".git" in subdir or ".next" in subdir:
        continue
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            filepath = os.path.join(subdir, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements:
                new_content = new_content.replace(old, new)
            
            if new_content != content:
                print(f"Updating {filepath}")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
