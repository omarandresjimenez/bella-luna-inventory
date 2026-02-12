#!/bin/bash
set -e

echo "🧹 Running cleanup script..."
npx ts-node cleanup-duplicates.ts

echo "✅ Cleanup completed!"
