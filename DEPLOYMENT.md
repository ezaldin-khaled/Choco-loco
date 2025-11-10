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

### ⚠️ IMPORTANT: HTTPS Configuration

**If your frontend is served over HTTPS** (which it is on Digital Ocean App Platform), you **MUST** use HTTPS for your API URLs to avoid mixed content errors.

Make sure these are set in Digital Ocean App Platform:

**Option 1: If API server supports HTTPS (Recommended)**
```
REACT_APP_API_URL=https://164.90.215.173/graphql/
REACT_APP_MEDIA_URL=https://164.90.215.173/media
NODE_ENV=production
```

**Option 2: If API server doesn't support HTTPS yet**
You have two choices:
1. **Set up HTTPS on your API server** (recommended)
   - Use Let's Encrypt for free SSL certificates
   - Configure nginx or your web server to serve HTTPS
   
2. **Use a reverse proxy with SSL termination**
   - Set up nginx on the API server with SSL
   - Point the frontend to the HTTPS endpoint

**Option 3: Auto-detection (Current Implementation)**
If you don't set `REACT_APP_API_URL` and `REACT_APP_MEDIA_URL`, the app will automatically:
- Use HTTPS when the frontend is on HTTPS
- Use HTTP when the frontend is on HTTP

**⚠️ Note:** If the API server doesn't support HTTPS, requests will fail with network errors. You must set up HTTPS on the API server or use a reverse proxy.

### Troubleshooting Network Errors

If you see `NetworkError when attempting to fetch resource`:

1. **Check browser console** for detailed error messages
2. **Verify API URL** - Check what URL is being used (should be HTTPS if frontend is HTTPS)
3. **Test API endpoint** - Try accessing `https://164.90.215.173/graphql/` directly in browser
4. **Check CORS** - Ensure API server allows requests from your frontend domain
5. **Verify SSL** - If using HTTPS, ensure the API server has a valid SSL certificate

