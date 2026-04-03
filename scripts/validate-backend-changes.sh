#!/bin/bash

# Backend Package Validation Script
# 
# This script validates that backend package changes don't break frontend packages.
# Run before committing changes to packages/backend/.
#
# Usage: ./scripts/validate-backend-changes.sh

set -e

echo "🔍 Validating backend package changes..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build backend package
echo "📦 Building backend package..."
pnpm --filter @findeg/backend build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend builds successfully${NC}"
else
  echo -e "${RED}❌ Backend build failed${NC}"
  exit 1
fi
echo ""

# Step 2: Run backend tests
echo "🧪 Running backend tests..."
pnpm --filter @findeg/backend test --run

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend tests pass${NC}"
else
  echo -e "${RED}❌ Backend tests failed${NC}"
  exit 1
fi
echo ""

# Step 3: Type check backend
echo "🔎 Type checking backend..."
pnpm --filter @findeg/backend type-check

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend type check passes${NC}"
else
  echo -e "${RED}❌ Backend type check failed${NC}"
  exit 1
fi
echo ""

# Step 4: Validate dashboard can import backend
echo "🎯 Validating dashboard imports..."
pnpm --filter @findeg/dashboard type-check

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Dashboard successfully imports from backend${NC}"
else
  echo -e "${YELLOW}⚠️  Dashboard has type errors - may be breaking changes${NC}"
  echo "   Review carefully before committing."
fi
echo ""

# Step 5: Validate storefront can import backend
echo "🛒 Validating storefront imports..."
pnpm --filter @findeg/storefront type-check

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Storefront successfully imports from backend${NC}"
else
  echo -e "${YELLOW}⚠️  Storefront has type errors - may be breaking changes${NC}"
  echo "   Review carefully before committing."
fi
echo ""

# Step 6: Check exports verification
echo "📤 Verifying package exports..."
pnpm --filter @findeg/backend test --run src/__tests__/exports.test.ts

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All exports verified${NC}"
else
  echo -e "${RED}❌ Export verification failed${NC}"
  exit 1
fi
echo ""

# Step 7: Check if version should be bumped
echo "📋 Checking backend package version..."
CURRENT_VERSION=$(node -p "require('./packages/backend/package.json').version")
echo "   Current version: $CURRENT_VERSION"
echo ""
echo -e "${YELLOW}💡 Reminder:${NC} If you made breaking changes to backend exports:"
echo "   - Patch (0.1.0 → 0.1.1): Bug fixes, no breaking changes"
echo "   - Minor (0.1.0 → 0.2.0): New features, backward compatible"
echo "   - Major (0.1.0 → 1.0.0): Breaking changes to public API"
echo ""

echo -e "${GREEN}✅ All validation checks passed!${NC}"
echo ""
echo "Backend package changes are safe to commit."
