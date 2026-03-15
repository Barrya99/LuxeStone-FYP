"""
Debug script - tests the actual API request handling
Save in your project root (same folder as manage.py)
Run with: python debug_api_routes.py
"""

import os
import sys
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diamond_project.settings')
django.setup()

# ============================================================
# TEST 1: Check URL routing
# ============================================================
print("\n" + "="*60)
print("TEST 1: Checking URL routes...")
print("="*60)

from django.urls import reverse, resolve
from django.test import RequestFactory

urls_to_test = [
    '/api/recommendations/',
    '/api/recommendations/trending/',
    '/api/recommendations/personalized/',
    '/api/recommendations/budget/',
    '/api/recommendations/similar/',
    '/api/recommendations/settings/',
    '/api/recommendations/combinations/',
]

for url in urls_to_test:
    try:
        resolved = resolve(url)
        print(f"✅ {url} → {resolved.func.cls.__name__}.{resolved.func.actions}")
    except Exception as e:
        print(f"❌ {url} → FAILED: {e}")


# ============================================================
# TEST 2: Check what methods RecommendationViewSet has
# ============================================================
print("\n" + "="*60)
print("TEST 2: Checking RecommendationViewSet methods...")
print("="*60)

try:
    from rings.views import RecommendationViewSet
    import inspect

    print(f"✅ RecommendationViewSet imported")
    print(f"   Base classes: {[c.__name__ for c in RecommendationViewSet.__mro__]}")
    
    # Check for list method
    if hasattr(RecommendationViewSet, 'list'):
        print(f"✅ has list() method")
    else:
        print(f"❌ MISSING list() method — this is why it's not in router root")

    # Check for queryset
    if hasattr(RecommendationViewSet, 'queryset'):
        print(f"✅ has queryset: {RecommendationViewSet.queryset}")
    else:
        print(f"⚠️  No queryset (expected for ViewSet)")

    # List all action methods
    actions = []
    for name, method in inspect.getmembers(RecommendationViewSet, predicate=inspect.isfunction):
        if hasattr(method, 'mapping') or hasattr(method, 'kwargs'):
            actions.append(name)
        elif not name.startswith('_'):
            actions.append(name)
    
    print(f"   Methods: {actions}")

except Exception as e:
    print(f"❌ FAILED: {e}")
    traceback.print_exc()


# ============================================================
# TEST 3: Simulate actual HTTP request to trending
# ============================================================
print("\n" + "="*60)
print("TEST 3: Simulating HTTP GET /api/recommendations/trending/")
print("="*60)

try:
    from django.test import Client
    client = Client()
    
    response = client.get('/api/recommendations/trending/')
    print(f"   Status code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Response 200 OK")
        import json
        data = json.loads(response.content)
        print(f"   Response keys: {list(data.keys())}")
    elif response.status_code == 500:
        print(f"❌ Response 500 - Content: {response.content[:1000]}")
    else:
        print(f"⚠️  Response {response.status_code}: {response.content[:500]}")

except Exception as e:
    print(f"❌ Request simulation FAILED: {e}")
    traceback.print_exc()


# ============================================================
# TEST 4: Simulate HTTP GET /api/recommendations/
# ============================================================
print("\n" + "="*60)
print("TEST 4: Simulating HTTP GET /api/recommendations/")
print("="*60)

try:
    from django.test import Client
    client = Client()
    
    response = client.get('/api/recommendations/')
    print(f"   Status code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Response 200 OK")
        import json
        data = json.loads(response.content)
        print(f"   Response: {data}")
    elif response.status_code == 500:
        print(f"❌ Response 500")
        print(f"   Content: {response.content[:2000]}")
    else:
        print(f"⚠️  Response {response.status_code}: {response.content[:500]}")

except Exception as e:
    print(f"❌ FAILED: {e}")
    traceback.print_exc()


# ============================================================
# TEST 5: Check router registration
# ============================================================
print("\n" + "="*60)
print("TEST 5: Checking router registration...")
print("="*60)

try:
    from rings.urls import router
    print(f"✅ Router imported")
    print(f"   Registered viewsets:")
    for prefix, viewset, basename in router.registry:
        print(f"   → /{prefix}/ → {viewset.__name__} (basename={basename})")
    
    print(f"\n   Generated URLs:")
    for url in router.urls:
        print(f"   → {url.name}: {url.pattern}")

except Exception as e:
    print(f"❌ Router check FAILED: {e}")
    traceback.print_exc()


# ============================================================
# TEST 6: Force call the viewset action directly
# ============================================================
print("\n" + "="*60)
print("TEST 6: Calling viewset action directly...")
print("="*60)

try:
    from rings.views import RecommendationViewSet
    from django.test import RequestFactory
    
    factory = RequestFactory()
    
    # Test trending
    request = factory.get('/api/recommendations/trending/')
    
    # Simulate DRF request
    from rest_framework.request import Request
    from rest_framework.parsers import JSONParser
    drf_request = Request(request, parsers=[JSONParser()])
    
    viewset = RecommendationViewSet()
    viewset.request = drf_request
    viewset.format_kwarg = None
    viewset.kwargs = {}
    viewset.action = 'trending'
    
    response = viewset.trending(drf_request)
    print(f"✅ viewset.trending() called successfully")
    print(f"   Status: {response.status_code}")
    print(f"   Data: {response.data}")

except Exception as e:
    print(f"❌ Direct viewset call FAILED: {e}")
    traceback.print_exc()


# ============================================================
# TEST 7: Check for Django middleware / settings issues
# ============================================================
print("\n" + "="*60)
print("TEST 7: Checking Django settings...")
print("="*60)

try:
    from django.conf import settings
    
    print(f"   DEBUG: {settings.DEBUG}")
    print(f"   INSTALLED_APPS includes 'rings': {'rings' in settings.INSTALLED_APPS}")
    print(f"   INSTALLED_APPS includes 'rest_framework': {'rest_framework' in settings.INSTALLED_APPS}")
    print(f"   INSTALLED_APPS includes 'django_filters': {'django_filters' in settings.INSTALLED_APPS}")
    
    rest_framework = getattr(settings, 'REST_FRAMEWORK', {})
    print(f"   REST_FRAMEWORK DEFAULT_PERMISSION_CLASSES: {rest_framework.get('DEFAULT_PERMISSION_CLASSES', 'not set')}")
    
    print(f"✅ Settings look OK")

except Exception as e:
    print(f"❌ Settings check FAILED: {e}")
    traceback.print_exc()


# ============================================================
# TEST 8: Enable Django logging to catch the 500 error
# ============================================================
print("\n" + "="*60)
print("TEST 8: Catching exact 500 error with logging...")
print("="*60)

import logging
logging.basicConfig(level=logging.DEBUG)

try:
    from django.test import Client, override_settings
    
    with override_settings(DEBUG=True):
        client = Client(raise_request_exception=True)
        try:
            response = client.get('/api/recommendations/trending/')
            print(f"✅ No exception raised - status: {response.status_code}")
        except Exception as e:
            print(f"❌ EXCEPTION CAUGHT (this is the root cause):")
            traceback.print_exc()

except Exception as e:
    print(f"❌ Test 8 setup failed: {e}")
    traceback.print_exc()


print("\n" + "="*60)
print("DEBUG COMPLETE - share all ❌ output above")
print("="*60)