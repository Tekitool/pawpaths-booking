import os
import re

# Define the root directory
ROOT_DIR = r"c:\NEXT\Pawpath-Form"

# Define the replacements (Regex -> Replacement)
REPLACEMENTS = [
    # Text Colors
    (r"text-(gray|slate|zinc|neutral|stone)-900", "text-gray-900"), # Keep darkest as base black
    (r"text-(gray|slate|zinc|neutral|stone)-[78]00", "text-brand-text-02"), # Primary Body
    (r"text-(gray|slate|zinc|neutral|stone)-[56]00", "text-brand-text-02/80"), # Secondary Muted
    (r"text-(gray|slate|zinc|neutral|stone)-[34]00", "text-brand-text-02/60"), # Disabled/Placeholder

    # Border Colors
    (r"border-(gray|slate|zinc|neutral|stone)-[12]00", "border-brand-text-02/20"), # Subtle Borders
    (r"border-(gray|slate|zinc|neutral|stone)-300", "border-brand-text-02/30"), # Input Borders

    # Background Colors (Neutrals)
    (r"bg-(gray|slate|zinc|neutral|stone)-50", "bg-brand-text-02/5"), # Very light backgrounds
    (r"bg-(gray|slate|zinc|neutral|stone)-100", "bg-brand-text-02/10"), # Light backgrounds
]

# Exclude these directories
EXCLUDES = ["node_modules", ".next", "public", ".git"]

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    for root, dirs, files in os.walk(ROOT_DIR):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDES]
        
        for file in files:
            if file.endswith(('.js', '.jsx', '.tsx', '.ts')):
                # Skip config files
                if "tailwind.config" in file or "theme-config" in file:
                    continue
                    
                file_path = os.path.join(root, file)
                process_file(file_path)

if __name__ == "__main__":
    main()
