#!/bin/bash
echo "Cleaning project..."

rm -rf node_modules
rm -rf .next
rm -f package-lock.json

echo "Installing dependencies..."
pnpm install

echo "Done."
