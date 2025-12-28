# GitHub Pages Setup Guide

This document explains how to enable GitHub Pages for the IoT Playground Web Flasher.

## Enable GitHub Pages

To enable GitHub Pages for this repository:

1. Go to your repository on GitHub
2. Click on **Settings**
3. In the left sidebar, click on **Pages**
4. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
   - The workflow in `.github/workflows/deploy_pages.yml` will handle deployment

## Accessing the Web Flasher

Once GitHub Pages is enabled and the workflow runs successfully, the web flasher will be available at:

```
https://vs4vijay.github.io/iot-playground/
```

## How It Works

- The `docs/` directory contains all the web flasher files
- The GitHub Actions workflow automatically deploys the `docs/` directory to GitHub Pages when changes are pushed to the `main` branch
- ESP Web Tools is loaded from the unpkg CDN
- Manifest files point to firmware binaries hosted in GitHub Releases

## Firmware Versions

Each project's manifest file points to the latest available compiled binary from GitHub Releases. Note that some projects may reference different release tags if their binaries were updated independently. This is normal and ensures users always get the most recent stable version for each project.

## Manual Deployment

The workflow can also be triggered manually:
1. Go to **Actions** tab
2. Select **Deploy GitHub Pages** workflow
3. Click **Run workflow**

## Testing Locally

To test the web flasher locally:

```bash
# Using Python's built-in HTTP server
cd docs
python -m http.server 8000

# Or using Node.js http-server
npm install -g http-server
cd docs
http-server
```

Then open `http://localhost:8000` in Chrome or Edge browser.

## Troubleshooting

- **Browser Compatibility**: The Web Serial API only works in Chrome and Edge browsers
- **HTTPS Required**: GitHub Pages automatically provides HTTPS, which is required for Web Serial API
- **USB Drivers**: Ensure proper USB/serial drivers (CP210x, CH340) are installed on the user's system
- **Firmware URLs**: Verify that the firmware URLs in manifest files point to valid GitHub Release assets

## Updating Firmware Versions

When new firmware is released:
1. Update the corresponding manifest file in `docs/firmware/` with the new release tag and binary URL
2. Update the HTML page with the new version number (if desired)
3. Commit and push changes - the workflow will automatically deploy
