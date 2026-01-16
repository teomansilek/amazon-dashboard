@echo off
chcp 65001 >nul
echo ==========================================
echo   AMAZON DASHBOARD GUNCELLEME SERVISI
echo ==========================================
echo.

(
    echo BASLANGIC ZAMANI: %DATE% %TIME%
    cd /d "c:\Users\NEKO\.gemini\antigravity\scratch\amazon_dashboard"
    echo Calisma Dizini: %CD%

    echo.
    echo Adim 1: Yeni dosyalar isleniyor...
    echo Kaynak: C:\Users\NEKO\Desktop\Amazon Siparişler\
    echo.
    call node scripts/generate-data.js
    
    echo.
    echo Adim 2: GitHub Veritabani Guncelleniyor...
    echo.
    git add .
    git commit -m "Gunluk veri guncellemesi: %date% %time%"
    
    echo.
    echo Adim 3: Sunucuya Gonderiliyor...
    git push origin main
) > debug_log.txt 2>&1

type debug_log.txt

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo BIR HATA OLUSTU!
    echo Lutfen 'debug_log.txt' dosyasini kontrol edin.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    pause
    exit /b
)

echo.
echo ==========================================
echo   ISLEM BASARILI!
echo   Detaylar debug_log.txt dosyasina kaydedildi.
echo   Dashboard 2-3 dakika icinde guncellenecektir.
echo ==========================================
echo.
pause
