import os
import re

root_dir = r"c:\NEXT\Pawpath-Form"
extensions = {".js", ".jsx", ".ts", ".tsx"}

# Define replacements using regex for flexibility
replacements = [
    # Solid Colors (500-600) -> accent
    (r"(bg|text|border|ring|shadow)-orange-(500|600)", r"\1-accent"),
    
    # Light Tints (50-100) -> accent/15
    (r"(bg|text|border)-orange-(50|100)", r"\1-accent/15"),
    
    # Mid Tints (200-400) -> accent/50
    (r"(bg|text|border)-orange-(200|300|400)", r"\1-accent/50"),
    
    # Shadows with specific opacity handling if not covered above
    # Note: The first rule handles shadow-orange-500 -> shadow-accent. 
    # If we want shadow-accent/40 specifically for glow effects, we might need manual review or a more specific regex.
    # For now, let's map shadow-orange-500/xx to shadow-accent/xx if it exists, or just shadow-accent.
    # The user requested shadow-orange-500 -> shadow-accent/40.
    # Let's override the first rule for shadows specifically if possible, or apply a second pass.
]

# Specific shadow replacement (overrides the general one if applied first or we can just be specific)
shadow_replacement = (r"shadow-orange-500", "shadow-accent/40")

for subdir, dirs, files in os.walk(root_dir):
    if "node_modules" in subdir or ".git" in subdir or ".next" in subdir:
        continue
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            filepath = os.path.join(subdir, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            
            # Apply shadow replacement first to catch specific glow effects
            new_content = re.sub(r"shadow-orange-500/([0-9]+)", r"shadow-accent/\1", new_content) # Preserve existing opacity
            new_content = re.sub(r"shadow-orange-500", "shadow-accent/40", new_content) # Default replacement
            
            # Apply general replacements
            for pattern, repl in replacements:
                new_content = re.sub(pattern, repl, new_content)
            
            # Hardcoded Hex Replacements (Simple string replace)
            new_content = new_content.replace("#FF7518", "brand-color-03") # Context dependent, might need manual check
            new_content = new_content.replace("#f97316", "brand-color-03")
            new_content = new_content.replace("#fff7ed", "brand-color-03-light") # This might be tricky, better to rely on classes
            
            # Fix specific hexes in classNames to bg-accent/text-accent
            new_content = new_content.replace("bg-[#FF7518]", "bg-accent")
            new_content = new_content.replace("text-[#FF7518]", "text-accent")
            new_content = new_content.replace("border-[#FF7518]", "border-accent")
            
            if new_content != content:
                print(f"Updating {filepath}")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
