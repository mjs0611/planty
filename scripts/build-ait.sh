#!/bin/bash

REPO="$(cd "$(dirname "$0")/.." && pwd)"  # 스크립트 위치 기준 (복사본에서도 동작)

# Clear Next.js cache so stale artifacts don't pollute the static export
rm -rf "$REPO/.next"

# Run static export build
BUILD_TARGET=ait npx next build --webpack
