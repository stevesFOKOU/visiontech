@echo off
chcp 65001 >nul
echo ========================================================
echo   Installation du raccourci Vision Tech sur le Bureau
echo ========================================================
echo.
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $desk = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut($desk + '\Vision Tech.lnk'); $s.TargetPath = 'http://localhost:8000/'; $s.Description = 'Vision Tech - Électricité, Climatisation, Solaire & Vidéosurveillance'; $s.Save(); Write-Host '✓ Raccourci Vision Tech créé sur votre Bureau Windows avec succès !' -ForegroundColor Green"
echo.
echo Vous pouvez maintenant ouvrir Vision Tech directement depuis votre Bureau !
echo.
pause
