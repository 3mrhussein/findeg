#!/usr/bin/env python3
"""
Update component imports in dashboard package to use @findeg/ui
"""

import os
import re
from pathlib import Path

# Base directory for dashboard package
DASHBOARD_SRC = Path(__file__).parent.parent / "packages" / "dashboard" / "src"

# UI components (35 total)
UI_COMPONENTS = [
    "accordion", "alert-dialog", "avatar", "badge", "button", "card", "carousel",
    "checkbox", "collapsible", "dialog", "dropdown-menu", "form", "IconTooltip",
    "input-otp", "input", "label", "popover", "progress", "radio-group",
    "rich-text-editor", "scroll-area", "select", "separator", "sheet", "sidebar",
    "skeleton", "slider", "submit-button", "switch", "table", "tabs", "textarea",
    "toast", "toaster", "tooltip"
]

# Shared components now in UI package (8 total)
SHARED_COMPONENTS = [
    "Container", "EmptyState", "Grid", "Icon", "Logo", "Pagination", "Price", "ToggleTheme"
]


def update_file_imports(file_path: Path) -> bool:
    """Update imports in a single file. Returns True if file was modified."""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    modified = False
    
    # Update UI component imports
    # Pattern: from "@/components/ui/{component}"
    for component in UI_COMPONENTS:
        # Handle various import styles
        patterns = [
            (rf'from ["\']@/components/ui/{component}["\']', f'from "@findeg/ui"'),
            (rf'import.*from ["\']@/components/ui/{component}["\']', 
             lambda m: m.group(0).replace(f'@/components/ui/{component}', '@findeg/ui'))
        ]
        
        for pattern, replacement in patterns:
            if callable(replacement):
                content = re.sub(pattern, replacement, content)
            else:
                content = re.sub(pattern, replacement, content)
    
    # Update shared component imports
    for component in SHARED_COMPONENTS:
        patterns = [
            (rf'from ["\']@/components/shared/{component}["\']', f'from "@findeg/ui"'),
            (rf'import.*from ["\']@/components/shared/{component}["\']',
             lambda m: m.group(0).replace(f'@/components/shared/{component}', '@findeg/ui'))
        ]
        
        for pattern, replacement in patterns:
            if callable(replacement):
                content = re.sub(pattern, replacement, content)
            else:
                content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False


def main():
    """Main function to process all TypeScript/TSX files."""
    
    if not DASHBOARD_SRC.exists():
        print(f"Error: Dashboard src directory not found: {DASHBOARD_SRC}")
        return 1
    
    files_modified = 0
    total_files = 0
    
    # Process all .ts and .tsx files
    for file_path in DASHBOARD_SRC.rglob("*.ts*"):
        if file_path.suffix not in ['.ts', '.tsx']:
            continue
        
        # Skip type definition files
        if file_path.suffix == '.d.ts':
            continue
        
        total_files += 1
        
        if update_file_imports(file_path):
            files_modified += 1
            print(f"Updated: {file_path.relative_to(DASHBOARD_SRC.parent)}")
    
    print(f"\n✓ Updated {files_modified} of {total_files} files")
    return 0


if __name__ == "__main__":
    exit(main())
