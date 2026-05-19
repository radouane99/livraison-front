@echo off
title QuickEat - Push automatique vers GitHub
color 0A
echo ==========================================================
echo   🚀 QuickEat - PUSH AUTOMATIQUE SUR GITHUB (Phase 2)
echo ==========================================================
echo.

echo [+] Etape 1 : Ajout des modifications au suivi Git...
git add .
if %errorlevel% neq 0 (
    color 0C
    echo [x] Erreur lors de l'ajout des fichiers.
    pause
    exit /b %errorlevel%
)

echo.
echo [+] Etape 2 : Creation du commit de restructuration...
git commit -m "Refactor: architecture modulaire React et integration Phase 2 (GPS tracker, COD, notations, stats resto, templates)"
if %errorlevel% neq 0 (
    echo [!] Aucun changement a commiter ou commit deja cree.
)

echo.
echo [+] Etape 3 : Configuration de la branche principale 'main'...
git branch -M main

echo.
echo [+] Etape 4 : Nettoyage de l'ancienne origine si presente...
git remote remove origin >nul 2>&1

echo.
echo [+] Etape 5 : Liaison avec votre depot distant...
echo URL : https://github.com/radouane99/livraison-front.git
git remote add origin https://github.com/radouane99/livraison-front.git
if %errorlevel% neq 0 (
    color 0C
    echo [x] Erreur lors de la liaison au depot distant.
    pause
    exit /b %errorlevel%
)

echo.
echo [+] Etape 6 : Push du code vers GitHub (main)...
echo ----------------------------------------------------------
git push -u origin main
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [x] Erreur lors du push. Assurez-vous d'avoir cree le depot en ligne
    echo     sur https://github.com/radouane99/livraison-front
    echo     et que vous etes authentifie avec vos identifiants Git.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================================
echo   🎉 FELICITATIONS ! VOTRE CODE QUICKEAT EST SUR GITHUB !
echo ==========================================================
echo.
pause
