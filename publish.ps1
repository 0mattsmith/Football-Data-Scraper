<#
.SYNOPSIS
    Automated Release and GitHub Publisher script for Football-Data-Scraper.

.DESCRIPTION
    Bumps the package.json version, builds the project, commits and pushes changes to GitHub,
    and automatically publishes a formal GitHub Release marked as 'Latest' (not pre-release).

.PARAMETER Message
    Optional commit message and release title (default: "Automated data and scraper update").

.PARAMETER Bump
    Optional version bump type: 'patch', 'minor', or 'major' (default: 'patch').

.EXAMPLE
    .\publish.ps1 -Bump "patch" -Message "Added Music and Movies scrapers"
    .\publish.ps1 -Bump "minor" -Message "New wonderkids dataset added"
    .\publish.ps1 -Message "Quick bugfix"
#>

param(
    [string]$Message = "Automated data and scraper update",
    [ValidateSet("patch", "minor", "major")]
    [string]$Bump = "patch"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Football-Data-Scraper Publisher and Release Automator    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Bump version in package.json
Write-Host "`n[1/5] Bumping version ($Bump)..." -ForegroundColor Yellow
$oldVersion = (Get-Content package.json | ConvertFrom-Json).version
npm version $Bump --no-git-tag-version | Out-Null
$newVersion = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "      Version bumped from v$oldVersion to v$newVersion" -ForegroundColor Green

# 2. Build TypeScript project
Write-Host "`n[2/5] Compiling TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript compilation failed. Aborting release."
    exit 1
}
Write-Host "      Build successful." -ForegroundColor Green

# 3. Stage and Commit changes
Write-Host "`n[3/5] Staging and committing changes..." -ForegroundColor Yellow
git add .
$commitMsg = "$Message (v$newVersion)"
git commit -m $commitMsg

# 4. Push to GitHub repository
Write-Host "`n[4/5] Pushing to origin..." -ForegroundColor Yellow
git push origin HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git push failed. Ensure origin remote is configured."
    exit 1
}
Write-Host "      Pushed successfully to GitHub." -ForegroundColor Green

# 5. Create Latest GitHub Release using gh CLI
Write-Host "`n[5/5] Creating Latest Release v$newVersion on GitHub..." -ForegroundColor Yellow
$releaseNotes = "### $Message`n`n- Released version **v$newVersion**`n- Database and Scraper CLI updated"
gh release create "v$newVersion" --title "v$newVersion - $Message" --notes $releaseNotes --latest
if ($LASTEXITCODE -ne 0) {
    Write-Warning "GitHub release creation encountered an issue. Ensure GitHub CLI (gh) is logged in."
} else {
    Write-Host "      SUCCESS: Released v$newVersion as LATEST!" -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: All done! Run via CLI from any machine:" -ForegroundColor Cyan
Write-Host '      npx --allow-git=all github:0mattsmith/Football-Data-Scraper info Beckham ' -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
