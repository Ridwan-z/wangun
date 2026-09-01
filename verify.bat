@echo off
setlocal enabledelayedexpansion

echo ======================================
echo Rumah3D - Project Verification Script
echo ======================================
echo.

set PASS=0
set FAIL=0

echo 1. Checking directory structure...
if exist "src\components\house" (
    echo [OK] src\components\house\
    set /a PASS+=1
) else (
    echo [FAIL] src\components\house\ MISSING
    set /a FAIL+=1
)

if exist "src\components\furniture" (
    echo [OK] src\components\furniture\
    set /a PASS+=1
) else (
    echo [FAIL] src\components\furniture\ MISSING
    set /a FAIL+=1
)

if exist "src\components\ui" (
    echo [OK] src\components\ui\
    set /a PASS+=1
) else (
    echo [FAIL] src\components\ui\ MISSING
    set /a FAIL+=1
)

if exist "src\pages" (
    echo [OK] src\pages\
    set /a PASS+=1
) else (
    echo [FAIL] src\pages\ MISSING
    set /a FAIL+=1
)

if exist "src\store" (
    echo [OK] src\store\
    set /a PASS+=1
) else (
    echo [FAIL] src\store\ MISSING
    set /a FAIL+=1
)

if exist "src\data" (
    echo [OK] src\data\
    set /a PASS+=1
) else (
    echo [FAIL] src\data\ MISSING
    set /a FAIL+=1
)

echo.
echo 2. Checking component files...
for %%F in (
    "src\App.jsx"
    "src\main.jsx"
    "src\components\house\HouseShell.jsx"
    "src\components\house\SceneLighting.jsx"
    "src\components\house\CameraRig.jsx"
    "src\components\furniture\FurnitureItem.jsx"
    "src\components\ui\FurniturePicker.jsx"
    "src\components\ui\LoadingFallback.jsx"
    "src\pages\HouseView.jsx"
    "src\pages\EditorView.jsx"
) do (
    if exist %%F (
        echo [OK] %%F
        set /a PASS+=1
    ) else (
        echo [FAIL] %%F MISSING
        set /a FAIL+=1
    )
)

echo.
echo 3. Checking store and data...
if exist "src\store\useHouseStore.js" (
    echo [OK] src\store\useHouseStore.js
    set /a PASS+=1
) else (
    echo [FAIL] src\store\useHouseStore.js MISSING
    set /a FAIL+=1
)

if exist "src\data\furnitureCatalog.js" (
    echo [OK] src\data\furnitureCatalog.js
    set /a PASS+=1
) else (
    echo [FAIL] src\data\furnitureCatalog.js MISSING
    set /a FAIL+=1
)

echo.
echo 4. Checking documentation...
if exist "README.md" (
    echo [OK] README.md
    set /a PASS+=1
) else (
    echo [FAIL] README.md MISSING
    set /a FAIL+=1
)

if exist "TESTING.md" (
    echo [OK] TESTING.md
    set /a PASS+=1
) else (
    echo [FAIL] TESTING.md MISSING
    set /a FAIL+=1
)

if exist "PROJECT_SUMMARY.md" (
    echo [OK] PROJECT_SUMMARY.md
    set /a PASS+=1
) else (
    echo [FAIL] PROJECT_SUMMARY.md MISSING
    set /a FAIL+=1
)

echo.
echo 5. Checking configuration...
if exist "index.html" (
    echo [OK] index.html
    set /a PASS+=1
) else (
    echo [FAIL] index.html MISSING
    set /a FAIL+=1
)

if exist "package.json" (
    echo [OK] package.json
    set /a PASS+=1
) else (
    echo [FAIL] package.json MISSING
    set /a FAIL+=1
)

echo.
echo ======================================
echo Summary
echo ======================================
echo Passed: !PASS!
echo Failed: !FAIL!
echo ======================================

if !FAIL! equ 0 (
    echo.
    echo All checks PASSED!
    echo.
    echo Next steps:
    echo 1. npm run dev     - Start dev server at http://localhost:5173
    echo 2. Test sesuai TESTING.md checklist
    echo 3. npm run build   - Build untuk production
    exit /b 0
) else (
    echo.
    echo Some checks FAILED
    exit /b 1
)

endlocal
