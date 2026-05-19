@echo off
setlocal
title QuickEat - Push Frontend React vers GitHub
color 0A
mode con: cols=90 lines=30

:: Check if Git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ==============================================================================
    echo   [x] ERREUR : Git n'est pas installe ou n'est pas dans votre variable PATH.
    echo ==============================================================================
    echo.
    echo Veuillez installer Git depuis : https://git-scm.com/downloads
    echo Relancez ensuite ce script apres l'installation.
    echo.
    pause
    exit /b 1
)

echo ==============================================================================
echo    🚀  QUICKEAT - ARCHITECTURE FRONTEND (REACT MODULAIRE) SUR GITHUB
echo ==============================================================================
echo.
echo    Ce script va preparer, commiter et pousser votre application React sur GitHub.
echo.
echo ------------------------------------------------------------------------------

:: Etape 1 : Initialisation de Git si necessaire
echo [+] Etape 1 : Verification du depot Git local...
if not exist .git (
    echo [~] Depot Git non detecte. Initialisation en cours...
    git init
    if %errorlevel% neq 0 (
        color 0C
        echo [x] Erreur lors de l'initialisation du depot Git.
        pause
        exit /b %errorlevel%
    )
    echo [ok] Depot Git local initialise avec succes !
) else (
    echo [ok] Depot Git existant detecte.
)
echo.

:: Etape 2 : Ajout des modifications au suivi Git
echo [+] Etape 2 : Indexation des modifications (git add)...
git add .
if %errorlevel% neq 0 (
    color 0C
    echo [x] Erreur lors de l'ajout des fichiers.
    pause
    exit /b %errorlevel%
)
echo [ok] Indexation terminee.
echo.

:: Etape 3 : Creation du commit de restructuration
echo [+] Etape 3 : Creation du commit local...
git commit -m "Refactor: architecture modulaire React et integration Phase 2 (GPS tracker, COD, notations, stats resto, templates)"
if %errorlevel% neq 0 (
    echo [!] Aucun changement detecte ou commit deja a jour.
) else (
    echo [ok] Commit cree avec succes.
)
echo.

:: Etape 4 : Configuration de la branche principale 'main'
echo [+] Etape 4 : Configuration de la branche principale 'main'...
git branch -M main
echo [ok] Branche principale configuree sur 'main'.
echo.

:: Etape 5 : Nettoyage et configuration du depot distant
echo [+] Etape 5 : Configuration du depot distant (GitHub)...
git remote remove origin >nul 2>&1

echo.
echo    --- CONFIGURATION DU DEPOT DISTANT ---
echo    1. Allez sur https://github.com/new
echo    2. Creez un depot vide nomme : livraison-front
echo    3. NE COCHEZ PAS "Add a README", ".gitignore" ou "License"
echo.

set "DEFAULT_URL=https://github.com/radouane99/livraison-front.git"
echo Entrez l'URL de votre depot GitHub Frontend.
echo.
echo Presser [ENTREE] pour utiliser l'adresse par defaut :
echo    %DEFAULT_URL%
echo.
set /p REPO_URL="URL du depot (ou presser Entree) : "

if "%REPO_URL%"=="" (
    set "REPO_URL=%DEFAULT_URL%"
)

echo.
echo [+] Liaison au depot distant : %REPO_URL%
git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    color 0C
    echo [x] Erreur lors de la configuration du depot distant.
    pause
    exit /b %errorlevel%
)
echo [ok] Liaison etablie.
echo.

:: Etape 6 : Push sur GitHub
echo [+] Etape 6 : Publication de votre code sur GitHub (git push)...
echo ------------------------------------------------------------------------------
echo Envoi en cours... Veuillez patienter...
git push -u origin main
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ==============================================================================
    echo   [x] ERREUR LORS DU PUSH !
    echo ==============================================================================
    echo   1. Assurez-vous d'avoir cree le depot en ligne sur votre compte GitHub.
    echo   2. Verifiez votre connexion Internet et vos autorisations.
    echo   3. Si necessaire, connectez-vous a Git en tapant vos identifiants GitHub.
    echo ==============================================================================
    echo.
    pause
    exit /b %errorlevel%
)

color 0A
echo.
echo ==============================================================================
echo   🎉  FELICITATIONS ! VOTRE CLIENT FRONTEND REACT EST SUR GITHUB !
echo ==============================================================================
echo.
echo URL de votre projet : %REPO_URL%
echo.
pause
