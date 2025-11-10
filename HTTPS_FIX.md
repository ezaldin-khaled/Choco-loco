# HTTPS Network Error Fix Guide

## Problem
You're seeing `NetworkError when attempting to fetch resource` because:
- Your frontend is served over **HTTPS** (`https://clownfish-app-2ehbt.ondigitalocean.app/`)
- Your API is on **HTTP** (`http://164.90.215.173/graphql/`)
- Browsers block HTTP requests from HTTPS pages (mixed content security policy)

## Immediate Solutions

### Solution 1: Set Up HTTPS on API Server (Recommended)

1. **SSH into your API server** (164.90.215.173)

2. **Install Certbot** (Let's Encrypt):
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

3. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d your-api-domain.com
   ```
   Or if using IP only, you may need to use DNS challenge or a reverse proxy.

4. **Configure nginx** to serve HTTPS:
   ```nginx
   server {
       listen 443 ssl;
       server_name 164.90.215.173;
       
       ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;
       
       location /graphql/ {
           proxy_pass http://localhost:8000/graphql/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /media {
           alias /path/to/media;
       }
   }
   ```

5. **Set environment variables in Digital Ocean**:
   ```
   REACT_APP_API_URL=https://164.90.215.173/graphql/
   REACT_APP_MEDIA_URL=https://164.90.215.173/media
   ```

6. **Rebuild and redeploy** your frontend

### Solution 2: Use Reverse Proxy with SSL Termination

If you can't set up HTTPS directly on the API server:

1. **Set up nginx with SSL** on a separate server or the same server
2. **Configure it to proxy** to your HTTP API
3. **Point frontend** to the HTTPS proxy endpoint

### Solution 3: Use Same Domain (If Possible)

If your API and frontend can be on the same domain:
- Frontend: `https://yourdomain.com/`
- API: `https://yourdomain.com/graphql/`

This avoids CORS and mixed content issues entirely.

## Quick Test

To test if your API server supports HTTPS:

```bash
curl -I https://164.90.215.173/graphql/
```

If you get a connection error, HTTPS is not set up.

## After Fixing

1. **Rebuild your frontend**:
   ```bash
   npm run build
   ```

2. **Redeploy to Digital Ocean**

3. **Check browser console** - you should see:
   - `API URL (resolved): https://164.90.215.173/graphql/`
   - No more network errors

## Current Code Changes

The code has been updated to:
- ✅ Automatically detect HTTPS and use HTTPS for API URLs
- ✅ Provide detailed error messages in console
- ✅ Log the resolved API URL for debugging

You just need to:
1. Set up HTTPS on your API server
2. Rebuild and redeploy the frontend

