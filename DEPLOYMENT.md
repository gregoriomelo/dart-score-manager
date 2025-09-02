# Deployment Guide

## GitHub Pages Deployment

This app is configured to work both locally and on GitHub Pages with the path `/dart-score-manager/`.

### Automated Deployment (Recommended)

The app is automatically deployed to GitHub Pages via GitHub Actions CI/CD:

1. **Push to main branch** - Triggers automatic build and deployment
2. **CI workflow runs** - Builds both local and GitHub Pages versions
3. **Automatic deployment** - Deploys to GitHub Pages automatically
4. **Live at**: https://gregoriomelo.github.io/dart-score-manager/

### Manual Build (For Testing)

If you want to test builds locally:

1. **Build for local deployment:**
   ```bash
   npm run build
   ```

2. **Build for GitHub Pages:**
   ```bash
   npm run build:gh-pages
   ```

3. **Test locally:**
   ```bash
   npx serve build
   ```
