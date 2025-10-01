# Deployment Guide

This app supports multiple deployment targets with automated CI/CD pipelines.

## 🚀 Deployment Options

### 1. GitHub Pages (FREE)
- **Cost**: $0/month
- **URL**: https://gregoriomelo.github.io/dart-score-manager/
- **Features**: Automatic deployment, custom domain support

### 2. Cloudflare Pages (FREE)
- **Cost**: $0/month  
- **URL**: https://dart-score-manager.pages.dev (after setup)
- **Features**: Global CDN, unlimited bandwidth, serverless functions

## 🔧 Setup Instructions

### GitHub Pages Setup

1. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. **Automatic deployment** - Push to main branch triggers deployment

### Cloudflare Pages Setup

1. **Create Cloudflare Account**:
   - Sign up at [cloudflare.com](https://cloudflare.com) (free)

2. **Get API Credentials**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with "Cloudflare Pages:Edit" permissions
   - Copy Account ID from dashboard

3. **Add GitHub Secrets**:
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN`: Your API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your Account ID

4. **Create Cloudflare Pages Project**:
   - In Cloudflare dashboard → Pages → Create a project
   - Connect to your GitHub repository
   - Project name: `dart-score-manager`
   - Build command: `npm run build:cloudflare`
   - Build output directory: `build`

## 🏗️ Build Commands

### Local Development
```bash
npm run build          # Standard build
npm run build:gh-pages # GitHub Pages build (with /dart-score-manager/ base path)
npm run build:cloudflare # Cloudflare Pages build (root path)
```

### Testing Builds Locally
```bash
# Test GitHub Pages build
npm run build:gh-pages
npx serve build

# Test Cloudflare Pages build  
npm run build:cloudflare
npx serve build
```

## 🔄 CI/CD Pipeline

The automated pipeline includes:

1. **Testing**: Linting, unit tests, E2E tests, visual regression tests
2. **Multi-target builds**: GitHub Pages and Cloudflare Pages
3. **Build verification**: Ensures correct base paths for each platform
4. **Automatic deployment**: Deploys to both platforms on main branch push

## 📊 Deployment Comparison

| Feature | GitHub Pages | Cloudflare Pages |
|---------|-------------|------------------|
| **Cost** | Free | Free |
| **Bandwidth** | 100GB/month | Unlimited |
| **Global CDN** | Basic | Advanced |
| **Custom Domain** | ✅ | ✅ |
| **Serverless Functions** | ❌ | ✅ |
| **Build Minutes** | 2,000/month | 500 builds/month |
