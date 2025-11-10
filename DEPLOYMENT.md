# Deployment Guide for Digital Ocean

## Issue Identified

The server is currently serving `public/index.html` (source file) instead of `build/index.html` (built file). This causes:
- `%PUBLIC_URL%` not being replaced
- React JavaScript bundle not loading
- White screen

## Solution

### For Digital Ocean App Platform:

1. **Build Command**: Make sure your build command is:
   ```bash
   npm run build
   ```

2. **Output Directory**: Set the output directory to:
   ```
   build
   ```

3. **HTTP Port**: Set to `8080` (or whatever port your static server uses)

4. **Static Site Configuration**: 
   - If using App Platform, make sure it's configured as a "Static Site"
   - The root directory should be `build/`

### For Digital Ocean Droplet (Manual):

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Serve from build directory**:
   ```bash
   # Option 1: Using serve
   npm install -g serve
   serve -s build -l 8080
   
   # Option 2: Using nginx
   # Copy build/* to /var/www/html/
   sudo cp -r build/* /var/www/html/
   ```

3. **Nginx Configuration** (if using nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Verification

After deployment, check the browser console. You should see:
- ✅ `PUBLIC_URL properly replaced (or not present)`
- ✅ `Main script tag found: /static/js/main.xxxxx.js`
- ✅ `🚀 Starting app initialization...`

If you see `%PUBLIC_URL%` in the console, the server is still serving the wrong files.

## Environment Variables

Make sure these are set in Digital Ocean:
- `REACT_APP_API_URL=http://164.90.215.173/graphql/`
- `REACT_APP_MEDIA_URL=http://164.90.215.173/media`
- `NODE_ENV=production`

