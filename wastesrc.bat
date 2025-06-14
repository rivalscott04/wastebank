@echo off
echo Membuat struktur project...

REM Membuat folder utama
mkdir src 2>nul
mkdir src\components 2>nul
mkdir src\hooks 2>nul
mkdir src\lib 2>nul
mkdir src\pages 2>nul
mkdir src\pages\admin 2>nul
mkdir src\pages\nasabah 2>nul

REM Membuat file di folder hooks
echo. > src\hooks\use-mobile.tsx
echo. > src\hooks\use-toast.ts

REM Membuat file di folder lib
echo. > src\lib\utils.ts

REM Membuat file di folder pages/admin
echo. > src\pages\admin\Dashboard.tsx
echo. > src\pages\admin\Kategori.tsx
echo. > src\pages\admin\Nasabah.tsx

REM Membuat file di folder pages/nasabah
echo. > src\pages\nasabah\Dashboard.tsx

REM Membuat file di folder pages
echo. > src\pages\Index.tsx
echo. > src\pages\Login.tsx
echo. > src\pages\NotFound.tsx
echo. > src\pages\Register.tsx

REM Membuat file di root
echo. > App.css
echo. > App.tsx
echo. > index.css
echo. > main.tsx

echo.
echo Struktur project berhasil dibuat!
echo.
pause