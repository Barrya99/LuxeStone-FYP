# diamond-backend/rings/image_proxy.py
"""
Image Proxy Service - Handles external image URLs with CORS/auth issues.

Fetches images from external sources (e.g., OpenAI) server-side to bypass
browser CORS restrictions and auth token requirements.
"""

import logging
import requests
from django.core.cache import cache
from django.http import HttpResponse
from functools import wraps
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Whitelist of allowed image domains to prevent abuse
ALLOWED_IMAGE_DOMAINS = [
    'images.openai.com',
    'cdn.openai.com',
    'github.com',
    'imgur.com',
    'cloudinary.com',
    'res.cloudinary.com',
]

# Cache images for 24 hours (86400 seconds)
IMAGE_CACHE_TIMEOUT = 86400


def is_url_allowed(url: str) -> bool:
    """Check if URL domain is in whitelist."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        for allowed in ALLOWED_IMAGE_DOMAINS:
            if domain.endswith(allowed) or domain == allowed:
                return True
        
        logger.warning(f"[image_proxy] Blocked image request from untrusted domain: {domain}")
        return False
    except Exception as e:
        logger.error(f"[image_proxy] Error parsing URL: {e}")
        return False


def fetch_external_image(image_url: str, timeout: int = 10) -> dict:
    """
    Fetch external image and return bytes + metadata.
    
    Returns:
        {
            'success': bool,
            'status_code': int,
            'content_type': str,
            'content': bytes,
            'error': str (if failed)
        }
    """
    try:
        # Check domain whitelist
        if not is_url_allowed(image_url):
            return {
                'success': False,
                'status_code': 403,
                'error': 'Image domain not allowed',
            }
        
        # Check cache first
        cache_key = f"image_proxy:{image_url}"
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"[image_proxy] Cache hit for {image_url[:60]}...")
            return {
                'success': True,
                'status_code': 200,
                'content_type': cached['content_type'],
                'content': cached['content'],
                'cached': True,
            }
        
        logger.info(f"[image_proxy] Fetching image: {image_url[:80]}...")
        
        # Fetch with User-Agent to avoid being blocked as bot
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
        
        response = requests.get(
            image_url,
            timeout=timeout,
            headers=headers,
            allow_redirects=True,
            stream=True,
        )
        
        # Check status
        if response.status_code != 200:
            logger.warning(f"[image_proxy] Failed to fetch {image_url}: {response.status_code}")
            return {
                'success': False,
                'status_code': response.status_code,
                'error': f'Remote returned {response.status_code}',
            }
        
        # Read content
        content = response.content
        content_type = response.headers.get('content-type', 'application/octet-stream')
        
        # Validate it's an image
        if not content_type.startswith('image/'):
            logger.warning(f"[image_proxy] Invalid content-type: {content_type}")
            return {
                'success': False,
                'status_code': 415,
                'error': 'Response is not an image',
            }
        
        # Cache the image
        cache.set(cache_key, {
            'content_type': content_type,
            'content': content,
        }, IMAGE_CACHE_TIMEOUT)
        
        logger.info(f"[image_proxy] ✓ Successfully fetched {len(content)} bytes, cached for 24h")
        
        return {
            'success': True,
            'status_code': 200,
            'content_type': content_type,
            'content': content,
            'cached': False,
        }
        
    except requests.Timeout:
        logger.error(f"[image_proxy] Timeout fetching {image_url}")
        return {
            'success': False,
            'status_code': 504,
            'error': 'Fetch timeout (remote server slow)',
        }
    except requests.ConnectionError as e:
        logger.error(f"[image_proxy] Connection error: {e}")
        return {
            'success': False,
            'status_code': 502,
            'error': 'Cannot connect to image server',
        }
    except Exception as e:
        logger.error(f"[image_proxy] Unexpected error: {e}", exc_info=True)
        return {
            'success': False,
            'status_code': 500,
            'error': str(e),
        }


def proxy_image_response(image_url: str) -> HttpResponse:
    """Fetch image and return as HTTP response."""
    result = fetch_external_image(image_url)
    
    if not result['success']:
        logger.warning(f"[proxy_image_response] Failed: {result.get('error')}")
        # Return 404 to frontend (image not available)
        return HttpResponse(
            b'Image not available',
            status=result.get('status_code', 500),
            content_type='text/plain',
        )
    
    # Stream image to client
    response = HttpResponse(
        result['content'],
        content_type=result['content_type'],
    )
    
    # Set cache headers (24 hours)
    response['Cache-Control'] = 'public, max-age=86400'
    response['X-Image-Cached'] = 'true' if result.get('cached') else 'false'
    
    return response
