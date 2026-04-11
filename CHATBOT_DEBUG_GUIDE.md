# LuxeStone Chatbot - Complete Debug Guide

## Overview

The chatbot system now includes comprehensive phase-by-phase logging to trace every step of request processing. This guide explains what each debug output means and how to identify issues.

## Complete Request Flow with Debug Output

### Phase 1: API Request (views.py)

```
================================================================================
[API] ▶ POST /api/chat/ REQUEST RECEIVED
================================================================================
[API] Request timestamp: 2024-01-15 10:30:45.123456
[API] Request data: {'message': 'I am looking for diamond and my budget is 13000', 'session_id': '...'}
[API] Content-Type: application/json

[API VALIDATION]
[API VALIDATION] Message length: 50 chars
[API VALIDATION] Message content: 'I am looking for diamond and my budget is 13000'
[API VALIDATION] ✓ Message valid

[API] Session ID: abc-123-xyz
[API AUTHENTICATION] Request user object: AnonymousUser
[API AUTHENTICATION] ✗ Request.user is None - anonymous request
```

**What to look for:**
- ✓ Message valid = Request passed validation
- ✗ Empty message / too long = Validation failed (stop here)
- Session ID = Unique identifier for this conversation
- user_id = Optional; helps with personalization

---

### Phase 2: Agent Initialization

```
[API PIPELINE]
[API PIPELINE] ▶ Initializing agent for session abc-123-xyz...
[API PIPELINE] ✓ Agent initialized: LuxeStoneAgent
```

**What to look for:**
- ✓ Agent initialized = Ready to process your message
- Different agent class = Fallback mode (check environment)

---

### Phase 3: Message Processing - Tool Selection (agent.py)

```
[CHAT START] Session: abc-123-xyz | User: None
================================================================================
[INPUT] Message: 'I am looking for diamond and my budget is 13000'
[INPUT] Length: 50 chars

[HISTORY] Total turns now: 1
[HISTORY] Window size: 1 turns

────────────────────────────────────────────────────────────────────
[PHASE 1] TOOL SELECTION
────────────────────────────────────────────────────────────────────
[PHASE 1] Analyzing message for keywords...

[TOOL SELECTION] Searching for budget pattern: r'\$(\d[\d,]*)'
[TOOL SELECTION] ✗ No budget pattern found
[TOOL SELECTION] Keyword flags: educational=False, search=True, rec=False

[TOOL SELECTION] → Search detected, building search params...
[TOOL SELECTION] → Adding diamond_search tool with params: {'limit': 5}
```

**What to look for:**
- Budget pattern found = Parsed $13000 → 13000.0
- ✗ No budget pattern = Message has no $ sign - system won't filter by price
- → Adding diamond_search tool = Correct tool selected
- search params = What filters will be used

**💡 TIP:** If budget not detected, message format issue. Try "$13000" with dollar sign.

---

### Phase 4: Tool Execution (agent.py + tools.py)

```
────────────────────────────────────────────────────────────────────
[PHASE 2] EXECUTE TOOLS
────────────────────────────────────────────────────────────────────
[PHASE 2] Executing 1 tool(s)...

[PHASE 2.1] Tool: diamond_search
[PHASE 2.1] Input: {'limit': 5}

[TOOL DISPATCH] ────────────────────────────────────────────────────
[TOOL DISPATCH] Tool Name: diamond_search
[TOOL DISPATCH] Input Parameters: {'limit': 5}
[TOOL DISPATCH] → Diamond Search Tool
[TOOL DISPATCH]   Params: {'shape': None, 'cut': None, 'color': None, 'clarity': None, 'min_carat': None, 'max_carat': None, 'max_price': None, 'limit': 5}
[TOOL DISPATCH]   Active filters: {'limit': 5}

[TOOL] diamond_search_tool called
[TOOL]   shape=None, cut=None, color=None, clarity=None
[TOOL]   min_carat=None, max_carat=None
[TOOL]   max_price=None, limit=5
[TOOL] Starting diamond search...
[TOOL] Available diamonds in DB: 42

[TOOL] Fetching up to 5 candidates for price filtering...
[TOOL] Fetched 5 candidates

[TOOL]   [1] SKU-001: base=$2,000.00 → calculated=$2,500.00
[TOOL]       ✓ Within budget (no budget filter)
[TOOL]   [2] SKU-002: base=$3,000.00 → calculated=$3,500.00
[TOOL]       ✓ Within budget
[TOOL]   [3] SKU-003: base=$4,000.00 → calculated=$4,500.00
[TOOL]       ✓ Within budget
[TOOL]   [4] SKU-004: base=$5,000.00 → calculated=$5,500.00
[TOOL]       ✓ Within budget
[TOOL]   [5] SKU-005: base=$6,000.00 → calculated=$6,500.00
[TOOL]       ✓ Within budget
[TOOL] Reached limit of 5 results

[TOOL] ✓ Search complete: 5 diamonds found
[TOOL] Result text length: 450 chars, 5 diamonds

[PHASE 2.1] ✓ Success - Result length: 450 chars
[PHASE 2.1] Result preview: Found 5 diamond(s):
• 1.0ct Round | Cut: Excellent | Colour: D | Clarity: VS1 ...
```

**What to look for:**

| ✓ Inside budget | vs | ✗ Over budget |
|---|---|---|
| Matches criteria | vs | Filtered out |
| Appears in results | vs | Skipped |

- **No diamonds in DB** = [TOOL] Available diamonds in DB: 0 → Fix database!
- **Results too many** = [TOOL] Reached limit of N results → Normal, limited for performance
- **0 diamonds returned** = [TOOL] ✓ Search complete: 0 diamonds found → No matches for budget

---

### Phase 5: Context Preparation (agent.py)

```
────────────────────────────────────────────────────────────────────
[PHASE 3] PREPARE LLM INPUT
────────────────────────────────────────────────────────────────────
[PHASE 3] Base messages: 1
[PHASE 3] Injecting 450 chars of tool context...
[PHASE 3] Updated last message with tool context

[PHASE 3] Final messages to send to Gemini: 2
[PHASE 3]   [1] system: "You are the LuxeStone Diamond Expert..."
[PHASE 3]   [2] user: "I am looking for diamond and my budget is 13000

[CONTEXT FROM DATABASE/KNOWLEDGE BASE - use this to answer]
Found 5 diamond(s):
• 1.0ct Round | Cut: Excellent..."
```

**What to look for:**
- Message count = How many messages sent to Gemini (includes system prompt)
- Tool context injected = Database results are attached
- user message shows database context = Gemini will see real diamonds

---

### Phase 6: Gemini API Call (agent.py)

```
────────────────────────────────────────────────────────────────────
[PHASE 4] CALL GEMINI API
────────────────────────────────────────────────────────────────────
[GEMINI] Input: 2 messages

[GEMINI]   [1] system: 80 chars
[GEMINI]       "You are the LuxeStone Diamond Expert — a knowledgeable, warm, and..."
[GEMINI]   [2] user: 650 chars
[GEMINI]       "I am looking for diamond and my budget is 13000\n\n[CONTEXT FROM DATA..."

[GEMINI] Initializing ChatGoogleGenerativeAI...
[GEMINI]   Model: gemini-pro
[GEMINI]   Temperature: 0.7

[GEMINI] Converting 2 messages to LangChain format...
[GEMINI] Adding system prompt to message sequence...
[GEMINI] Final message count: 3

[GEMINI] ✓ Invoking model (this may take a few seconds)...
[GEMINI] ✓ Response received!
[GEMINI] Response type: AIMessage
[GEMINI] Response content type: str
[GEMINI] Response content length: 287 chars
[GEMINI] Content preview: 'Great! Here are 5 excellent lab-grown diamonds under your budget. All meet...'
```

**What to look for:**
- ✓ Response received = Gemini API succeeded
- ✗ FATAL ERROR = API key issue or network problem
- Response content length: 0 = **Empty response** → This is the problem to investigate!
- Model: gemini-pro = Correct model (free tier compatible)

---

### Phase 7: Response Extraction (agent.py)

```
────────────────────────────────────────────────────────────────────
[PHASE 5] EXTRACT RESPONSE TEXT
────────────────────────────────────────────────────────────────────
[PHASE 5] Has content attribute: str
[PHASE 5] Content is string-like, converting to str
[PHASE 5] ✓ Extracted text length: 287 chars
[PHASE 5] Text preview: 'Great! Here are 5 excellent lab-grown diamonds under your budget. All...'

[PHASE 5] ✓ WARNING: Empty response text!  ← THIS IS THE PROBLEM!
[PHASE 5] → Fallback: "I apologize, I couldn't generate a response..."

[PHASE 5] Cleaning up tool markers...
[PHASE 5] Final text length: 287 chars
```

**What to look for:**
- ✓ Extracted text length > 0 = Success
- ✗ Empty response text = Gemini returned nothing or unparseable format
- Final text length = What gets sent back to user

---

### Phase 8: Response Storage (agent.py)

```
────────────────────────────────────────────────────────────────────
[PHASE 6] STORE RESPONSE
────────────────────────────────────────────────────────────────────
[PHASE 6] Adding to conversation history...
[PHASE 6] ✓ Total conversation turns: 2
[PHASE 6] ✓ Chat complete!
================================================================================
```

---

### Phase 9: API Response (views.py)

```
[API PIPELINE] ✓ Agent response received
[API PIPELINE] Response type: str
[API PIPELINE] Response length: 287 chars
[API PIPELINE] Response preview: 'Great! Here are 5 excellent lab-grown diamonds under your budget...'

[API] ✓ Response object prepared
[API]   - success: True
[API]   - message length: 287 chars
[API]   - follow_up_suggestions: 0 items
[API]   - session_id: abc-123-xyz
[API] ▶ Returning HTTP 200 to client
================================================================================
```

**What to look for:**
- HTTP 200 = Request succeeded
- HTTP 500 = Error (check error message above)
- message length = Chars sent to frontend

---

## Troubleshooting Guide

### Problem: Empty Response from AI

**Debug Output:**
```
[PHASE 5] ✓ WARNING: Empty response text!
[PHASE 5] Fallback: "I apologize, I couldn't generate a response..."
```

**Solutions:**
1. ✓ Check Gemini API response
   - Look for: `[GEMINI] ✓ Response received`
   - If ✗ FATAL ERROR, check API key
2. ✓ Verify diamonds found
   - Look for: `[TOOL] ✓ Search complete: X diamonds found`
   - If 0, try different filters or higher budget

---

### Problem: Budget Not Detected

**Debug Output:**
```
[TOOL SELECTION] ✗ No budget pattern found
[TOOL SELECTION] → Adding diamond_search tool with params: {'limit': 5}
```

**Solutions:**
1. ✓ Message must include "$" sign: "$13000" not "13000"
2. ✓ Use standard format: "$13,000" or "$13000" both work
3. ✓ Verify regex pattern in [TOOL SELECTION] line

---

### Problem: No Diamonds Found

**Debug Output:**
```
[TOOL] Available diamonds in DB: 0
[TOOL] ✓ Search complete: 0 diamonds found
[TOOL] Result: "No diamonds found matching those criteria..."
```

**Solutions:**
1. ✓ Check DB migrations ran: `python manage.py migrate`
2. ✓ Check diamonds exist: Go to Django admin → Rings → Diamonds
3. ✓ Check filters aren't too restrictive
   - Try with no filters: just "show me diamonds"

---

### Problem: Database Query Errors

**Debug Output:**
```
[TOOL] ✗ ERROR: IntegrityError: ...
[TOOL] Input was: {'max_price': 13000.0, 'shape': 'Round'}
```

**Solutions:**
1. ✓ Check shapes match DB values: "Round" vs "round" case sensitivity
2. ✓ Run migrations: `python manage.py migrate`
3. ✓ Check Diamond model constraints in models.py

---

### Problem: API Returns 500 Error

**Debug Output:**
```
[API ERROR]
[API ERROR] ✗ UNHANDLED EXCEPTION
[API ERROR] Exception type: ValueError
[API ERROR] Exception message: GEMINI_API_KEY not set in environment
```

**Solutions:**
- Check .env file has: `GEMINI_API_KEY=your-key`
- Restart Django server after changing .env
- Check key is valid in Google Cloud Console

---

## Key Metrics to Monitor

| Metric | OK Range | Warning | Critical |
|--------|----------|---------|----------|
| [PHASE 1] Tool selection | < 100ms | - | - |
| [PHASE 2] Tool execution | 50-500ms | > 1s | > 5s (timeout) |
| [PHASE 4] Gemini response | 1-3s | > 5s | ❌ FATAL ERROR |
| [PHASE 5] Extracted text | > 0 chars | < 50 | = 0 (empty) |
| Total request | < 5s | > 10s | > 30s (timeout) |

---

## How to Read Full Debug Output

1. **Open Django Dev Server Console** (terminal running `python manage.py runserver`)
2. **Send a message** from the chatbot UI
3. **Scroll through output** looking for:
   - `[CHAT START]` = Request start
   - `[PHASE N]` = Each phase
   - ✓ = Success indicators
   - ✗ = Error indicators
   - `[API] ▶ Returning HTTP 200` = Request complete

---

## Running Tests with Debug Output

```bash
# Run with full verbosity
python manage.py test rings.chatbot.tests -v 2

# Run specific test
python manage.py test rings.chatbot.tests.ChatViewTests.test_post_message -v 2
```

All debug output will appear in test results.

---

## Example Complete Flow: "$13000 Budget Query"

```
User message: "I am looking for diamond and my budget is 13000"

1. API receives request
2. Tool selection detects "diamond" keyword → diamond_search_tool
3. Budget parsing: "13000" → NO $ SIGN! → max_price=None
4. Diamond search finds all diamonds (no budget filter)
5. Gemini sees: "Show 5 diamonds" (not "under budget")
6. Response: "Here are 5 diamonds..." (not filtered)
```

**FIX:** Say "I am looking for a diamond under $13000"

---

## Questions?

Check the debug output for:
- Which phase fails?
- What's the exact error message?
- Is data passing between phases correctly?

This guide covers 95% of issues. Debug output is your friend! 🔍
