#!/bin/bash

# Define the project directory
PROJECT_DIR="./src"

# Find all .js and .jsx files in the project directory
FILES=$(find "$PROJECT_DIR" -type f \( -name "*.js" -o -name "*.jsx"  -o -name "*.tsx" \))

# Open each file in Visual Studio Code
for FILE in $FILES; do
    code "$FILE"
done
