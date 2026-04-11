# Quick Testing Commands for LuxeStone Chatbot

## 1. Using cURL to Test API

```bash
# Basic budget query
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am looking for diamond and my budget is $5000",
    "session_id": "test-session-1"
  }'

# Watch terminal for all [DEBUG] output
```

## 2. Using Django Shell

```bash
# Enter Django shell
python manage.py shell

# Test budget detection
from rings.chatbot.agent import get_agent
import uuid

session = str(uuid.uuid4())
agent = get_agent(session_id=session, user_id=None)

# This will print ALL debug output
response = agent.chat("Show me diamonds under $5000")
print("\n>>> RESPONSE:")
print(response)
```

## 3. Running Test Suite

```bash
# Run our test script
python manage.py shell < chatbot_test.py

# You'll see interactive menu to pick test cases
```

## 4. Direct Python Script

```python
# Create file: test_chatbot.py
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diamond_project.settings')

import django
django.setup()

from rings.chatbot.agent import get_agent
from rings.chatbot.tools import diamond_search_tool

# Test tool directly
print("[DEBUG] Testing diamond_search_tool directly...")
result = diamond_search_tool(max_price=5000, limit=5)
print(result)

# Test full agent flow
print("\n[DEBUG] Testing full agent flow...")
agent = get_agent(session_id="test", user_id=None)
response = agent.chat("Show me diamonds under $5000")
print("\nAgent response:")
print(response)
```

Then run:
```bash
python test_chatbot.py
```

## 5. Tests to Run

### Test Case 1: Budget Detection
**Input:** `"I am looking for diamond and my budget is $5000"`
**Expected Output:**
- [TOOL SELECTION] Budget found: $5000 → 5000.0
- [PHASE 2.1] Tool: diamond_search
- [TOOL] Available diamonds in DB: X (should not be 0)
- Response shows diamonds under $5000

### Test Case 2: Shape + Budget
**Input:** `"Show me round diamonds under $3000"`
**Expected Output:**
- [TOOL SELECTION] Budget found: $3000
- [TOOL DISPATCH] Params include shape: Round
- Results show only round diamonds

### Test Case 3: Knowledge Question
**Input:** `"What are the 4Cs of diamonds?"`
**Expected Output:**
- [PHASE 2] No tools needed
- Uses conversation history directly
- Response explains 4Cs

### Test Case 4: No Budget (Important!)
**Input:** `"Show me some diamonds"`
**Expected Output:**
- [TOOL SELECTION] ✗ No budget pattern found
- max_price=None in params
- All diamonds shown (not filtered by price)
- This is NOT a bug - it's expected behavior

## 6. What to Look For in Output

### SUCCESS Indicators
✓ [TOOL] Available diamonds in DB: 42 (not 0)
✓ [PHASE 2.1] ✓ Success - Result length
✓ [GEMINI] ✓ Response received!
✓ [PHASE 5] ✓ Extracted text length: 287 chars
✓ [API] ▶ Returning HTTP 200 to client

### ERROR Indicators
✗ [GEMINI] ✗ FATAL ERROR! → Check GEMINI_API_KEY
✗ [TOOL] Available diamonds in DB: 0 → No data in DB
✗ [PHASE 5] ✓ WARNING: Empty response text! → Gemini returned nothing
✗ [API ERROR] Unhandled exception → Check full error message

## 7. Debug Level Control

To see MORE debug info, edit agent.py and add:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Extra debug message here")
```

## 8. Performance Timing

Time each phase:
```
Tool selection: < 100ms
Tool execution: 50-500ms (diamond search fastest, Gemini slowest at 1-3s)
Total: < 5 seconds normal
```

If total > 10s, check:
- Network latency to Google Gemini API
- Database performance (add .explain() to querysets)
- Whether you have diamonds in DB

## 9. Common Issues & Fixes

| Issue | Debug Output | Fix |
|-------|--------------|-----|
| Empty response | [PHASE 5] Empty response text | Check API key, Gemini model availability |
| No diamonds | [TOOL] Available diamonds in DB: 0 | Run migrations, add diamond data |
| Budget not detected | [TOOL SELECTION] ✗ No budget pattern | Use "$" sign: "$5000" not "5000" |
| API 500 error | [API ERROR] GEMINI_API_KEY not set | Check .env file, restart server |
| Slow response | Timings > 5s | Check network, Google API quota |

## 10. Advanced Testing

### Test with Different Users
```python
# Authenticated request
agent = get_agent(session_id="test", user_id=123)
response = agent.chat("Show me diamonds")
```

### Test Edge Cases
```python
# Very long message
long_msg = "Tell me about diamonds. " * 50  # 1500+ chars
response = agent.chat(long_msg)

# Special characters
response = agent.chat("Show me §¥€£ diamonds!")

# Empty/whitespace
response = agent.chat("   ")  # Should fail validation
```

### Test Multiple Turns
```python
agent = get_agent(session_id="test", user_id=None)

# Turn 1
r1 = agent.chat("Show me round diamonds")
print("Turn 1:", r1[:50], "...")

# Turn 2 (should use context from Turn 1)
r2 = agent.chat("What about cushion cut?")
print("Turn 2:", r2[:50], "...")

# Turn 3
r3 = agent.chat("Under $4000?")
print("Turn 3:", r3[:50], "...")
```

## 11. Database Debugging

```python
from rings.models import Diamond
from rings.services.pricing import PricingEngine

# Check diamonds exist
print(f"Total diamonds: {Diamond.objects.count()}")
print(f"Available: {Diamond.objects.filter(is_available=True).count()}")

# Check prices
d = Diamond.objects.first()
if d:
    base = float(d.base_price)
    calc = float(PricingEngine.calculate_diamond_price(d))
    print(f"Sample diamond: base=${base}, calculated=${calc}")

# Check specific criteria
print(f"Round diamonds: {Diamond.objects.filter(shape='Round').count()}")
print(f"Excellent cut: {Diamond.objects.filter(cut='Excellent').count()}")
```

## 12. Network Debugging

```bash
# Network requests between frontend and backend
# Open browser DevTools → Network tab
# Send message from chatbot
# Look for: POST /api/chat/
# Check Response: should be HTTP 200 with JSON response

{
  "success": true,
  "message": "...",
  "follow_up_suggestions": [],
  "session_id": "..."
}
```

---

**Remember:** All debug output goes to Django terminal where you ran `python manage.py runserver`. Check that terminal, not the browser console!
