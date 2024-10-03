#!/bin/zsh

# Define the project directory
PROJECT_DIR="/Users/user/Downloads/react-app-wssi/my-app"

# Find all files created by the user, excluding common installed module directories
files=$(find "$PROJECT_DIR" -type f \
    ! -path "$PROJECT_DIR/node_modules/*" \
    ! -path "$PROJECT_DIR/venv/*" \
    ! -path "$PROJECT_DIR/__pycache__/*" \
    ! -path "$PROJECT_DIR/.git/*")

# Close each file in Visual Studio Code
for file in $files; do
    code -r -g "$file"
done

# Close all open editors in Visual Studio Code
code -r -g
