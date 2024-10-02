#!/bin/bash

# Navigate to the root of the repository
cd "$(git rev-parse --show-toplevel)"

# Add all changes
git add .

# Commit the changes with a predefined message
git commit -m "Auto-commit: Added changes via pre-commit hook"
