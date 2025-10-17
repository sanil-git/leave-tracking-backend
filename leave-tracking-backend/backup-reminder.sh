#!/bin/bash

# Backup reminder script for leave tracking app
# Run this daily to create backups

echo "Creating backup for leave tracking app..."
cd "$(dirname "$0")"

# Create backup
node backup.js

# Keep only last 7 backups
ls -t backup-*.json | tail -n +8 | xargs -r rm

echo "Backup completed!"
echo "Recent backups:"
ls -la backup-*.json | head -5 