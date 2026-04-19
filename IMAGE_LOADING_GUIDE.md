# Image Proxy Debugging Guide

## Quick Setup & Run

```bash
# From project root
npm install
npm start
```

This starts both backend and frontend. Then open http://localhost:5173

## If Images Still Don't Show

### 1. Check Backend Proxy Endpoint

Open browser DevTools (F12) → Network tab and try to load a settings page.

Look for requests to:
```
http://127.0.0.1:8000/api/images/proxy/?url=https%3A%2F%2Fimages.openai.com%2F...
```

### 2. Test the Proxy Directly

Open a new tab and visit:
```
http://127.0.0.1:8000/api/images/proxy/?url=https://images.openai.com/static-rsc-4/KhWLhSmYc6BLO_qpz5Qceysp8sdQWmvD4_Oca59oqsJ6R-HZ14Chhe1B445mArXs2ckzJs4-nWJmD4WJmf0plziBdvqgh3Hfm3hOR_lZO82jh_V4VuXnwd0HOdE-CCOn4KVPijrK9s6SZxt1g3-QCk_B_tXhUa825PNVVYmT_ZU?purpose=inline
```

If this loads an image, the proxy works! If not, there's a backend issue.

### 3. Check Browser Console

Open DevTools → Console tab and look for messages like:

```
[ProductImage] Proxying external URL: {
  original: "https://images.openai.com/...",
  apiBase: "http://127.0.0.1:8000/api",
  proxied: "http://127.0.0.1:8000/api/images/proxy/?url=..."
}
```

### 4. Check Backend Logs

In the backend terminal window, you should see:
```
[image_proxy] Fetching image: https://images.openai.com/...
[image_proxy] ✓ Successfully fetched XXXX bytes, cached for 24h
```

If you see "Failed to fetch" or "Blocked image request from untrusted domain", check that:
- The domain is in the whitelist in `diamond-backend/rings/image_proxy.py`
- The OpenAI image URL is still valid (URLs may expire)

### 5. Common Issues & Fixes

#### Issue: "Cannot GET /api/images/proxy/"
**Solution**: Backend is not running. Run `npm start` from project root.

#### Issue: "Domain not allowed" error
**Solution**: The domain might not be in the whitelist. Add it to:
```python
# diamond-backend/rings/image_proxy.py, line ~21
ALLOWED_IMAGE_DOMAINS = [
    'images.openai.com',
    'your-domain.com',  # Add here
]
```

#### Issue: Images loaded but very slow
**Solution**: This is normal the first time. Images are cached for 24 hours on the backend.

#### Issue: Old cached images showing
**Solution**: Clear cache:
```bash
# From diamond-backend directory
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
>>> exit()
```

## How It Works

1. **Frontend** requests image via ProductImage component
2. If it's an external URL (http/https), it routes through backend proxy
3. **Backend** checks if domain is whitelisted
4. **Backend** fetches image from OpenAI with proper headers
5. **Backend** caches the image for 24 hours
6. **Frontend** displays the cached image

## Requirements

- Python 3.8+
- Node.js 16+
- Backend running on http://localhost:8000
- Frontend running on http://localhost:5173
