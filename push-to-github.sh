#!/bin/bash

# Script to push Student Management System to GitHub
# Run this script in your terminal: bash push-to-github.sh

echo "🚀 Pushing Student Management System to GitHub..."

# Remove any lock files
echo "📝 Cleaning up lock files..."
rm -f .git/config.lock .git/index.lock 2>/dev/null || true

# Check if remote exists, if not add it
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/Blessed-jacobs/student-management-system.git
else
    echo "✅ Remote origin already exists"
fi

# Stage all files
echo "📁 Staging files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Complete Student Management System with authentication, role-based access, and comprehensive documentation"

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "🌐 Your repository: https://github.com/Blessed-jacobs/student-management-system"