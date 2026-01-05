import os
import re

root_dir = r"c:\NEXT\Pawpath-Form"
extensions = {".js", ".jsx", ".ts", ".tsx"}

# Define replacements using regex for flexibility
replacements = [
    # --- Neutrals (Gray/Slate -> brand-text-02) ---
    (r"text-(gray|slate)-600", r"text-brand-text-02"),
    (r"text-(gray|slate)-500", r"text-brand-text-02/80"),
    (r"text-(gray|slate)-400", r"text-brand-text-02/60"),
    (r"bg-(gray|slate)-50", r"bg-brand-text-02/5"),
    (r"bg-(gray|slate)-100", r"bg-brand-text-02/10"),
    (r"bg-(gray|slate)-200", r"bg-brand-text-02/20"),
    (r"border-(gray|slate)-(200|300)", r"border-brand-text-02/20"),

    # --- Highlights (Purple -> brand-text-03) ---
    (r"text-purple-(600|700)", r"text-brand-text-03"),
    (r"bg-purple-(50|100)", r"bg-brand-text-03/10"),
    (r"bg-purple-(500|600)", r"bg-brand-text-03"),
    (r"border-purple-(200|300)", r"border-brand-text-03/30"),
    (r"shadow-purple-500", r"shadow-brand-text-03/40"),

    # --- Success (Green -> Status Success) ---
    (r"text-green-(600|700)", r"text-success"),
    (r"bg-green-(50|100)", r"bg-success/15"),
    (r"bg-green-(500|600)", r"bg-success"),
    (r"border-green-(200|300)", r"border-success/30"),

    # --- Error (Red -> Status Error) ---
    (r"text-red-(600|700)", r"text-error"),
    (r"bg-red-(50|100)", r"bg-error/10"),
    (r"bg-red-(500|600)", r"bg-error"),
    (r"border-red-(200|300)", r"border-error/30"),

    # --- Info (Blue/Sky -> Status Info) ---
    (r"text-(blue|sky)-(600|700)", r"text-info"),
    (r"bg-(blue|sky)-(50|100)", r"bg-info/10"),
    (r"bg-(blue|sky)-(500|600)", r"bg-info"),
    (r"border-(blue|sky)-(200|300)", r"border-info/30"),
    
    # --- Warning (Amber/Yellow -> Status Warning) ---
    (r"text-(amber|yellow)-(600|700)", r"text-warning"),
    (r"bg-(amber|yellow)-(50|100)", r"bg-warning/10"),
    (r"bg-(amber|yellow)-(500|600)", r"bg-warning"),
    (r"border-(amber|yellow)-(200|300)", r"border-warning/30"),
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
            
            # Apply general replacements
            for pattern, repl in replacements:
                new_content = re.sub(pattern, repl, new_content)
            
            if new_content != content:
                print(f"Updating {filepath}")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
