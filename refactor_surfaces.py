import os

root_dir = r"c:\NEXT\Pawpath-Form"
extensions = {".js", ".jsx", ".ts", ".tsx"}
replacements = [
    # Replace legacy surface colors with new semantic names
    (r"bg-creamy-white", "bg-surface-warm"),
    (r"text-creamy-white", "text-surface-warm"),
    (r"border-creamy-white", "border-surface-warm"),
    
    (r"bg-alice-blue", "bg-surface-cool"),
    (r"text-alice-blue", "text-surface-cool"),
    (r"border-alice-blue", "border-surface-cool"),
    
    (r"bg-mint-mist", "bg-surface-fresh"),
    (r"text-mint-mist", "text-surface-fresh"),
    (r"border-mint-mist", "border-surface-fresh"),
    
    # Handle variants
    (r"hover:bg-creamy-white", "hover:bg-surface-warm"),
    (r"hover:bg-alice-blue", "hover:bg-surface-cool"),
    (r"hover:bg-mint-mist", "hover:bg-surface-fresh"),
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
