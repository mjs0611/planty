#!/bin/bash

REPO="/Users/junseungmo/Documents/03_Resources/repos/planty"

# Clear Next.js cache so stale artifacts don't pollute the static export
rm -rf "$REPO/.next"

# Run static export build
BUILD_TARGET=ait npx next build
