"""
Django REST views for the LuxeStone AI Chatbot.

POST /api/chat/          — Send a message, receive AI response + follow-up chips
POST /api/chat/clear/    — Clear session history (client + server)
GET  /api/chat/history/  — Fetch conversation history for a session
"""

from __future__ import annotations

import logging
import uuid

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class ChatView(APIView):
    """
    POST /api/chat/

    Request body:
        {
            "message":    "Show me round diamonds under $5000",   // required
            "session_id": "uuid-string"                           // optional
        }

    Headers:
        Authorization: Token <token>   // optional; enables personalised recommendations

    Response:
        {
            "success": true,
            "message": "Here are 5 round diamonds under $5,000…",
            "follow_up_suggestions": ["What's Excellent cut?", "Show Cushion too"],
            "session_id": "uuid-string"
        }
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print(f"\n\n{'='*80}")
        print(f"[API] ▶ POST /api/chat/ REQUEST RECEIVED")
        print(f"{'='*80}")
        print(f"[API] Request timestamp: {__import__('datetime').datetime.now()}")
        print(f"[API] Request data: {request.data}")
        print(f"[API] Content-Type: {request.content_type}")
        
        # ── Validate input ────────────────────────────────────────────────
        print(f"\n[API VALIDATION]")
        message = (request.data.get("message") or "").strip()
        print(f"[API VALIDATION] Message length: {len(message)} chars")
        print(f"[API VALIDATION] Message content: {repr(message)}")
        
        if not message:
            print(f"[API VALIDATION] ✗ FAILED: Empty message")
            return Response(
                {"success": False, "error": "message is required and cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(message) > 2000:
            print(f"[API VALIDATION] ✗ FAILED: Message too long ({len(message)} chars)")
            return Response(
                {"success": False, "error": "message must be under 2000 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        print(f"[API VALIDATION] ✓ Message valid")

        session_id = (request.data.get("session_id") or "").strip() or str(uuid.uuid4())
        print(f"[API] Session ID: {session_id}")

        # ── Extract authenticated user_id ─────────────────────────────────
        print(f"\n[API AUTHENTICATION]")
        user_id = None
        try:
            user = getattr(request, "user", None)
            print(f"[API AUTHENTICATION] Request user object: {type(user).__name__}")
            if user is not None:
                # Handle AuthenticatedUser wrapper from rings.authentication
                inner = getattr(user, "_user", user)
                uid = getattr(inner, "user_id", None)
                if uid:
                    user_id = int(uid)
                    print(f"[API AUTHENTICATION] ✓ Authenticated user_id: {user_id}")
                else:
                    print(f"[API AUTHENTICATION] ✗ No user_id found on user object")
            else:
                print(f"[API AUTHENTICATION] ✗ Request.user is None - anonymous request")
        except Exception as e:
            print(f"[API AUTHENTICATION] ✗ Error extracting user_id: {e}")
            pass

        # ── Run pipeline ──────────────────────────────────────────────────
        print(f"\n[API PIPELINE]")
        try:
            print(f"[API PIPELINE] ▶ Initializing agent for session {session_id}...")
            from .agent import get_agent
            agent = get_agent(session_id=session_id, user_id=user_id)
            print(f"[API PIPELINE] ✓ Agent initialized: {agent.__class__.__name__}")
            
            print(f"[API PIPELINE] ▶ Sending message to agent.chat()...")
            print(f"[API PIPELINE]   Input: {repr(message[:80])}..." if len(message) > 80 else f"[API PIPELINE]   Input: {repr(message)}")
            
            result = agent.chat(message)
            
            print(f"\n[API PIPELINE] ✓ Agent response received")
            print(f"[API PIPELINE] Response type: {type(result).__name__}")
            
            # Agent returns dict with 'message' and 'follow_up_suggestions'
            if isinstance(result, dict):
                message_text = result.get("message", "")
                suggestions = result.get("follow_up_suggestions", [])
                print(f"[API PIPELINE] Message length: {len(message_text)} chars")
                print(f"[API PIPELINE] Suggestions: {len(suggestions)} item(s)")
            else:
                # Fallback: should not happen but handle gracefully
                message_text = str(result) if result else ""
                suggestions = []
                print(f"[API PIPELINE] ⚠ WARNING: Response was not dict, fell back to string")
            
            response = {
                "success": True,
                "message": message_text,
                "follow_up_suggestions": suggestions,
                "session_id": session_id,
            }
            print(f"\n[API] ✓ Response object prepared")
            print(f"[API]   - success: True")
            print(f"[API]   - message length: {len(message_text)} chars")
            print(f"[API]   - follow_up_suggestions: {len(suggestions)} item(s)")
            print(f"[API]   - session_id: {session_id}")
            print(f"[API] ▶ Returning HTTP 200 to client")
            print(f"{'='*80}\n")
            return Response(response)

        except Exception as exc:
            print(f"\n[API ERROR]")
            print(f"[API ERROR] ✗ UNHANDLED EXCEPTION")
            print(f"[API ERROR] Exception type: {type(exc).__name__}")
            print(f"[API ERROR] Exception message: {exc}")
            print(f"[API ERROR] Session ID: {session_id}")
            logger.error("ChatView unhandled error: %s", exc, exc_info=True)
            import traceback
            traceback.print_exc()
            print(f"[API ERROR] ▶ Returning HTTP 500 to client")
            print(f"{'='*80}\n")
            return Response(
                {
                    "success": False,
                    "error": "The chatbot is temporarily unavailable. Please try again.",
                    "session_id": session_id,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChatClearView(APIView):
    """
    POST /api/chat/clear/

    Request body: { "session_id": "uuid-string" }
    Clears server-side conversation memory for that session.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        session_id = (request.data.get("session_id") or "").strip()
        if not session_id:
            return Response(
                {"success": False, "error": "session_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from .agent import LuxeStoneAgent
            print(f"[CLEAR] Clearing session: {session_id}")
            LuxeStoneAgent.destroy(session_id)
            print(f"[CLEAR] Session {session_id} cleared successfully")
            return Response({"success": True, "message": "Conversation cleared."})
        except Exception as exc:
            print(f"[CLEAR ERROR] Failed to clear session {session_id}: {exc}")
            logger.error("ChatClearView error: %s", exc, exc_info=True)
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChatHistoryView(APIView):
    """
    GET /api/chat/history/?session_id=<uuid>
    Returns raw [{role, content}] history for debugging / history restore.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        session_id = (request.query_params.get("session_id") or "").strip()
        if not session_id:
            return Response({"success": True, "history": [], "session_id": None})

        try:
            from .agent import get_agent
            agent = get_agent(session_id=session_id)
            return Response({
                "success": True,
                "history": agent.get_history(),
                "session_id": session_id,
            })
        except Exception as exc:
            logger.error("ChatHistoryView error: %s", exc)
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )