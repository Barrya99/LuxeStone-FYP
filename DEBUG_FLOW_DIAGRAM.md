# LuxeStone Chatbot - Debug Flow Diagram

## Complete Request Flow with Debug Points

```
USER SENDS MESSAGE: "Show me diamonds under $5000"
                |
                v
        ┌───────────────────────────────────┐
        │  API LAYER (views.py)             │
        │  ═════════════════════════════════ │
        │ [API] ▶ POST /api/chat/           │
        │ [API] Request validation          │
        │ [API] ✓ Message valid             │
        │ [API] Session: abc-123-xyz        │
        │ [API PIPELINE] ▶ Init agent...    │
        └───────────────────────────────────┘
                |
                v
        ┌───────────────────────────────────┐
        │ AGENT LAYER (agent.py)            │
        │ ═════════════════════════════════ │
        │                                   │
        │ [CHAT START] Phase 1: Tool Select │
        │ [TOOL SELECTION] Keywords found   │
        │ [TOOL SELECTION] Budget: $5000    │
        │ → diamond_search_tool selected    │
        │                                   │
        │ [PHASE 2] Execute Tools           │
        │ ├─> [TOOL DISPATCH] diamond_sear  │
        │     ├─> [TOOL] DB query          │
        │     ├─> [TOOL] Available: 42      │
        │     ├─> [TOOL] Price filter       │
        │     ├─> [TOOL] Results: 5 match   │
        │     └─> ✓ Result: 450 chars       │
        │                                   │
        │ [PHASE 3] Prepare LLM input       │
        │ ├─> Inject tool context          │
        │ ├─> Build message list            │
        │ └─> Final messages: 2             │
        │                                   │
        │ [PHASE 4] Call Gemini             │
        │ ├─> [GEMINI] Init ChatGPT        │
        │ ├─> [GEMINI] Model: gemini-pro   │
        │ ├─> [GEMINI] Messages: 2         │
        │ ├─> [GEMINI] ✓ Response recv'd   │
        │ └─> [GEMINI] Type: AIMessage     │
        │                                   │
        │ [PHASE 5] Extract Response       │
        │ ├─> Has content attr? Yes         │
        │ ├─> Content type: str             │
        │ ├─> ✓ Extracted: 287 chars       │
        │ └─> Cleanup tool markers         │
        │                                   │
        │ [PHASE 6] Store in History       │
        │ └─> Total turns: 2                │
        │                                   │
        └───────────────────────────────────┘
                |
                v
        ┌───────────────────────────────────┐
        │ RESPONSE LAYER (views.py)         │
        │ ═════════════════════════════════ │
        │ [API] ✓ Response prepared         │
        │ [API]   - success: True           │
        │ [API]   - message: 287 chars      │
        │ [API]   - session_id: abc-...     │
        │ [API] ▶ HTTP 200 OK               │
        └───────────────────────────────────┘
                |
                v
        ┌───────────────────────────────────┐
        │ FRONTEND (Chatbot.jsx)            │
        │ ═════════════════════════════════ │
        │ ✓ Message displayed in UI         │
        │ ✓ User sees response              │
        └───────────────────────────────────┘
```

---

## Debug Output Mapping to Request Flow

```
USER REQUEST                    DEBUG OUTPUT                  STATUS
─────────────────────────────────────────────────────────────────────
"Show me diamonds               [API] POST /api/chat/         REQUEST
 under $5000"                   [API] Request data: {...}     RECEIVED
                                |
                                v
                                [API VALIDATION]              VALIDATING
                                [API] Message length: 50      
                                [API] ✓ Message valid         
                                |
                                v
                                [CHAT START]                  AGENT
                                [PHASE 1] TOOL SELECTION      INIT
                                |
                                v
                                [TOOL SELECTION] Keywords     PARSING
                                [TOOL SELECTION] Budget: ..   BUDGET
                                |
                                v
                                [PHASE 2] EXECUTE TOOLS       EXECUTING
                                [TOOL DISPATCH] diamond_se... TOOLS
                                [TOOL] Available diamonds:42  
                                [TOOL] After filter: 5        
                                [TOOL] ✓ Result: 450 chars    
                                |
                                v
                                [PHASE 3] PREPARE LLM INPUT   PREPARING
                                [PHASE 3] Inject context...   MESSAGE
                                |
                                v
                                [PHASE 4] CALL GEMINI         CALLING
                                [GEMINI] ✓ Response recv'd    AI MODEL
                                |
                                v
                                [PHASE 5] EXTRACT RESPONSE    PARSING
                                [PHASE 5] ✓ Extracted: 287    RESPONSE
                                |
                                v
                                [PHASE 6] STORE RESPONSE      STORING
                                |
                                v
                                [API] ✓ Response prepared     FORMATTING
                                [API] ▶ HTTP 200 OK           HTTP
"Here are 5 diamonds..." ←     [FRONTEND] Display message    DISPLAY
```

---

## Error Detection Flow

```
ISSUE                           DEBUG OUTPUT                  DETECTION
─────────────────────────────────────────────────────────────────────
Empty message                   [API] Message length: 0       VALIDATION
                                [API] ✗ FAILED                FAILED
                                |
No $ sign in budget             [TOOL SELECTION]              TOOL
                                ✗ No budget pattern found     SELECT
                                |                             FAILED
                                v
                                Results show all diamonds
                                (not filtered by price)

No diamonds in DB               [TOOL] Available diamonds: 0  EXECUTION
                                |                             FAILED
                                v
                                Tool returns "No diamonds
                                 found"

API Key not set                 [GEMINI] ✗ FATAL ERROR!       API CALL
                                [GEMINI] GEMINI_API_KEY...    FAILED
                                |
                                v
                                [API ERROR] Exception type:
                                 ValueError

Gemini returns nothing          [GEMINI] ✓ Response recv'd    PARSE
                                [PHASE 5] Empty response      FAILED
                                [PHASE 5] FALLBACK: "Sorry..."
```

---

## Phase-by-Phase Debug Tags

```
┌─────────────────────────────────────────────────────────┐
│ [API]                API REQUEST/RESPONSE LAYER         │
│ └─ [API VALIDATION]  Input validation checks            │
│ └─ [API AUTH]        User authentication                │
│ └─ [API PIPELINE]    Agent initialization               │
│ └─ [API ERROR]       Exception handling                 │
├─────────────────────────────────────────────────────────┤
│ [CHAT]               Chat session management            │
│ ├─ [INPUT]           Message validation                 │
│ ├─ [HISTORY]         Conversation window tracking       │
│ ├─ [PHASE 1]         Tool selection                     │
│ ├─ [PHASE 2]         Tool execution                     │
│ ├─ [PHASE 3]         LLM input preparation              │
│ ├─ [PHASE 4]         Gemini API call                    │
│ ├─ [PHASE 5]         Response extraction                │
│ ├─ [PHASE 6]         History storage                    │
│ └─ [FATAL ERROR]     Unhandled exceptions               │
├─────────────────────────────────────────────────────────┤
│ [TOOL SELECTION]     Heuristic tool detection           │
│ ├─ Budget pattern matching                              │
│ ├─ Keyword flag evaluation                              │
│ └─ Parameter building                                   │
├─────────────────────────────────────────────────────────┤
│ [TOOL DISPATCH]      Tool routing & execution           │
│ └─ [TOOL]            Individual tool logs               │
│    ├─ diamond_search_tool database operations           │
│    ├─ knowledge_base_tool document matching             │
│    ├─ setting_search_tool setting queries               │
│    └─ recommendation_tool trending logic                │
├─────────────────────────────────────────────────────────┤
│ [GEMINI]             Google Gemini API integration      │
│ ├─ Model initialization                                 │
│ ├─ Message preparation                                  │
│ ├─ API invocation                                       │
│ └─ Response inspection                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Through System

```
MESSAGE INPUT
     "Show me diamonds under $5000"
     |
     v [API Layer - views.py]
     Stripped, validated (50 chars, not empty, < 2000)
     |
     v [Tool Selection]
     Keyword: "diamond" → has_search = True
     Budget: "$5000" → budget_match = 5000.0
     →selectedTools = [("diamond_search", {"max_price": 5000, "limit": 5})]
     |
     v [Tool Dispatch - agent.py → tools.py]
     Tool: diamond_search_tool
     Params: {max_price: 5000, limit: 5}
     |
     v [Database Query]
     Django ORM: Diamond.objects.filter(is_available=True)
     Results: 42 available diamonds
     |
     v [Price Filtering]
     For each diamond:
       - Calculate actual price with multipliers
       - Keep if price <= 5000
     Results: 5 diamonds under budget
     |
     v [Context Building]
     Tool Output:
       "Found 5 diamonds under $5000:
        • 1.0ct Round | Cut: Excellent | ... | $2,500
        • 1.5ct Cushion | Cut: Excellent | ... | $3,200
        ..."
     |
     v [Message Injection]
     User message + Tool output combined:
       "Show me diamonds under $5000
        [CONTEXT FROM DATABASE]
        Found 5 diamonds under $5000: ..."
     |
     v [Gemini Call]
     System prompt + messages sent to gemini-pro model
     |
     v [Response Extraction]
     Gemini returns: "Great! Here are 5 excellent diamonds..."
     Extract: .content attribute (string type)
     |
     v [Validation]
     Check: not empty, not None, valid string
     |
     v [Historical Storage]
     {role: "assistant", content: "Great! Here are..."}
     |
     v [API Response]
     {
       "success": true,
       "message": "Great! Here are 5 excellent diamonds...",
       "follow_up_suggestions": [],
       "session_id": "abc-123-xyz"
     }
     |
     v [Frontend Display]
     Component: MessageBubble
     Props: {message: {...}, isExpanded: false}
     Display: "Great! Here are 5 excellent diamonds..."
```

---

## Success vs Failure Paths

```
HAPPY PATH ✅                    ERROR PATH ❌
─────────────────────────────────────────────────

Message: "$5000"        +        Message: "5000"
   |                                |
   v [API Validate]                v [API Validate]
✓ Valid                           ✓ Valid
   |                                |
   v [Tool Select]                v [Tool Select]
✓ Budget found                    ✗ No budget pattern
   |                                |
   v [DB Query]                   v [DB Query]
✓ 42 diamonds                     ✓ 42 diamonds
   |                                |
   v [Price Filter]               v [Price Filter]
✓ 5 matches                       ✗ 42 matches (no filter!)
   |                                |
   v [Gemini Call]                v [Gemini Call]
✓ Response received              ✓ Response received
   |                                |
   v [Extract]                    v [Extract]
✓ 287 chars                       ✓ 500 chars
   |                                |
   v [API Response]               v [API Response]
✓ HTTP 200                        ✓ HTTP 200
   |                                |
Display:                          Display:
"Here are 5 under $5000"         "Here are 42 diamonds"
                                  (not filtered!)
```

---

## Debug Output Levels

```
MINIMAL (Current)           INFO (Verbose)          DEBUG (Detailed)
─────────────────────────────────────────────────────────────────────
✓/✗ only                    Phase descriptions      Full parameter logs
Success/failure             Tool names              Filter values
HTTP status                 Message lengths         Content previews
                            Timing info             Exception stack traces
                            DB query counts         Individual item logs
```

All logs currently at INFO level. Detailed DEBUG messages also available.

---

## Request Timeline

```
[0ms]   User types message, hits enter
[5ms]   Browser sends HTTP POST request
[10ms]  Django receives at /api/chat/
        [API] POST /api/chat/ received
        
[15ms]  Validation begins
        [API VALIDATION] Message length: 50
        
[20ms]  Agent initialized
        [CHAT START] Session: abc-123-xyz
        
[25ms]  Tool selection
        [PHASE 1] TOOL SELECTION
        
[30ms]  Tool execution begins
        [PHASE 2] EXECUTE TOOLS
        [TOOL DISPATCH] diamond_search_tool
        [TOOL] DB query...
        
[100ms] Tool execution complete
        [TOOL] ✓ Result: 5 diamonds
        
[110ms] Message preparation
        [PHASE 3] PREPARE LLM INPUT
        
[120ms] Gemini API call begins
        [PHASE 4] CALL GEMINI API
        [GEMINI] ✓ Invoking model...
        
[2500ms] Gemini responds
        [GEMINI] ✓ Response received!
        
[2510ms] Response extraction
        [PHASE 5] EXTRACT RESPONSE
        [PHASE 5] ✓ Extracted text: 287 chars
        
[2520ms] Response formatted
        [API] ✓ Response prepared
        
[2525ms] HTTP 200 sent back
        [API] ▶ Returning HTTP 200
        
[2530ms] Browser receives response
        Display appears in chatbot UI
```

Total time: **~2.5 seconds** (most spent waiting for Gemini API)

---

Read CHATBOT_DEBUG_GUIDE.md for complete documentation!
