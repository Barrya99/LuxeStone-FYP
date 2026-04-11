# diamond-backend/rings/image_views.py
"""
Image proxy views - handles external image URL requests.
"""

from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import cache_page
import logging
from urllib.parse import unquote

from .image_proxy import proxy_image_response

logger = logging.getLogger(__name__)


@require_http_methods(['GET'])
@cache_page(60 * 60 * 24)  # Cache for 24 hours
def proxy_image(request):
    """
    Proxy endpoint for external images.
    
    GET /api/images/proxy/?url=https://images.openai.com/...
    
    Returns the image directly with proper content-type and caching headers.
    """
    image_url = request.GET.get('url', '').strip()
    
    if not image_url:
        logger.warning('[proxy_image] Missing URL parameter')
        return HttpResponse(
            b'Missing url parameter',
            status=400,
            content_type='text/plain',
        )
    
    # URL decode if needed
    image_url = unquote(image_url)
    
    logger.info(f'[proxy_image] Request: {image_url[:80]}...')
    
    return proxy_image_response(image_url)
