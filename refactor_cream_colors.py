import os

root_dir = r"c:\NEXT\Pawpath-Form"
extensions = {".js", ".jsx", ".ts", ".tsx"}
replacements = [
    # Fix broken class
    (r"brand-color-01-container", "brand-color-02"),
    # Standardize usage
    (r"bg-primary-container", "bg-brand-color-02"),
    (r"text-primary-container", "text-brand-color-02"),
    (r"border-primary-container", "border-brand-color-02"),
    (r"bg-pawpaths-cream", "bg-brand-color-02"),
    (r"text-pawpaths-cream", "text-brand-color-02"),
    (r"border-pawpaths-cream", "border-brand-color-02"),
    # Handle variants
    (r"hover:bg-primary-container", "hover:bg-brand-color-02"),
    (r"hover:text-primary-container", "hover:text-brand-color-02"),
    (r"focus:bg-primary-container", "focus:bg-brand-color-02"),
    (r"focus:text-primary-container", "focus:text-brand-color-02"),
    # Handle opacity modifiers
    (r"bg-primary-container/", "bg-brand-color-02/"),
    (r"text-primary-container/", "text-brand-color-02/"),
    (r"from-primary-container", "from-brand-color-02"),
    (r"to-primary-container", "to-brand-color-02"),
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
