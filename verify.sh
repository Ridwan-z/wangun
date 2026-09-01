#!/bin/bash

echo "======================================"
echo "Rumah3D - Project Verification Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0

# Helper function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 MISSING"
        ((FAIL++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/ exists"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1/ MISSING"
        ((FAIL++))
    fi
}

echo "1. Checking directory structure..."
check_dir "src/components/house"
check_dir "src/components/furniture"
check_dir "src/components/ui"
check_dir "src/pages"
check_dir "src/store"
check_dir "src/data"
echo ""

echo "2. Checking component files..."
check_file "src/App.jsx"
check_file "src/main.jsx"
check_file "src/components/house/HouseShell.jsx"
check_file "src/components/house/SceneLighting.jsx"
check_file "src/components/house/CameraRig.jsx"
check_file "src/components/furniture/FurnitureItem.jsx"
check_file "src/components/ui/FurniturePicker.jsx"
check_file "src/components/ui/LoadingFallback.jsx"
check_file "src/pages/HouseView.jsx"
check_file "src/pages/EditorView.jsx"
echo ""

echo "3. Checking store and data..."
check_file "src/store/useHouseStore.js"
check_file "src/data/furnitureCatalog.js"
echo ""

echo "4. Checking documentation..."
check_file "README.md"
check_file "TESTING.md"
check_file "PROJECT_SUMMARY.md"
echo ""

echo "5. Checking configuration..."
check_file "index.html"
check_file "package.json"
check_file "tsconfig.json"
echo ""

echo "6. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules/ installed"
    ((PASS++))
    
    # Check key dependencies
    if [ -d "node_modules/react" ]; then
        echo -e "${GREEN}  ✓${NC} react"
        ((PASS++))
    else
        echo -e "${RED}  ✗${NC} react MISSING"
        ((FAIL++))
    fi
    
    if [ -d "node_modules/three" ]; then
        echo -e "${GREEN}  ✓${NC} three"
        ((PASS++))
    else
        echo -e "${RED}  ✗${NC} three MISSING"
        ((FAIL++))
    fi
    
    if [ -d "node_modules/@react-three/fiber" ]; then
        echo -e "${GREEN}  ✓${NC} @react-three/fiber"
        ((PASS++))
    else
        echo -e "${RED}  ✗${NC} @react-three/fiber MISSING"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗${NC} node_modules/ NOT INSTALLED"
    ((FAIL++))
fi
echo ""

echo "7. Summary"
echo "======================================"
echo -e "Passed: ${GREEN}${PASS}${NC}"
echo -e "Failed: ${RED}${FAIL}${NC}"
echo "======================================"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. npm run dev     - Start dev server"
    echo "2. Open http://localhost:5173"
    echo "3. Test alur sesuai TESTING.md"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    exit 1
fi
