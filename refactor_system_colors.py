import os
import re

root_dir = r"c:\NEXT\Pawpath-Form"
extensions = {".js", ".jsx", ".ts", ".tsx"}

# Define replacements using regex for flexibility
replacements = [
    # --- Red -> system-color-01 ---
    (r"text-red-(\d+)", r"text-system-color-01"),
    (r"bg-red-(\d+)", r"bg-system-color-01"),
    (r"border-red-(\d+)", r"border-system-color-01"),
    (r"shadow-red-(\d+)", r"shadow-system-color-01"),
    
    # --- Green -> system-color-02 ---
    (r"text-green-(\d+)", r"text-system-color-02"),
    (r"bg-green-(\d+)", r"bg-system-color-02"),
    (r"border-green-(\d+)", r"border-system-color-02"),
    (r"shadow-green-(\d+)", r"shadow-system-color-02"),

    # --- Blue -> system-color-03 ---
    (r"text-blue-(\d+)", r"text-system-color-03"),
    (r"bg-blue-(\d+)", r"bg-system-color-03"),
    (r"border-blue-(\d+)", r"border-system-color-03"),
    (r"shadow-blue-(\d+)", r"shadow-system-color-03"),
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
