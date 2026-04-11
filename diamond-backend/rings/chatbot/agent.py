"""
LangChain LCEL Pipeline for the LuxeStone Chatbot.
...
"""

from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _build_llm(temperature: float = 0.3):
    from langchain_google_genai import ChatGoogleGenerativeAI

    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"\n[_build_llm] API key present: {bool(api_key)}")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. "
            "Set it in diamond-backend/diamond_project/.env to enable the AI chatbot."
        )

    print(f"[_build_llm] Building LLM → model=gemini-3-flash-preview | temperature={temperature}")
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite-preview",
        temperature=temperature,
        google_api_key=api_key,
        max_output_tokens=1024,
        convert_system_message_to_human=True,
        timeout=30,
    )
    print(f"[_build_llm] LLM built successfully ✓")
    return llm


def _history_to_langchain_messages(history: list[dict]):
    from langchain_core.messages import HumanMessage, AIMessage

    print(f"\n[_history_to_langchain_messages] Input: {len(history)} raw history entries")
    messages = []
    for i, msg in enumerate(history):
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
            print(f"  [{i}] HumanMessage: {msg['content'][:80]!r}{'...' if len(msg['content']) > 80 else ''}")
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
            print(f"  [{i}] AIMessage:    {msg['content'][:80]!r}{'...' if len(msg['content']) > 80 else ''}")

    print(f"[_history_to_langchain_messages] Output: {len(messages)} LangChain messages ✓")
    return messages


# ─────────────────────────────────────────────────────────────────────────────
# Sub-chains
# ─────────────────────────────────────────────────────────────────────────────

def build_tool_selection_chain():
    from .prompts import TOOL_SELECTION_PROMPT
    from .schemas import ToolSelection

    print("\n[build_tool_selection_chain] Building chain...")
    llm = _build_llm(temperature=0.0)
    structured_llm = llm.with_structured_output(ToolSelection)
    print("[build_tool_selection_chain] Chain ready: TOOL_SELECTION_PROMPT | structured_llm(ToolSelection) ✓")
    return TOOL_SELECTION_PROMPT | structured_llm


def build_final_response_chain():
    from .prompts import FINAL_RESPONSE_PROMPT
    from .schemas import ChatResponse

    print("\n[build_final_response_chain] Building chain...")
    llm = _build_llm(temperature=0.4)
    structured_llm = llm.with_structured_output(ChatResponse)
    print("[build_final_response_chain] Chain ready: FINAL_RESPONSE_PROMPT | structured_llm(ChatResponse) ✓")
    return FINAL_RESPONSE_PROMPT | structured_llm


# ─────────────────────────────────────────────────────────────────────────────
# Tool Executor
# ─────────────────────────────────────────────────────────────────────────────

from langchain_core.runnables import RunnableLambda


def _execute_tools(tool_selection) -> str:
    from .tools import (
        knowledge_base_tool,
        diamond_search_tool,
        setting_search_tool,
        recommendation_tool,
    )

    print(f"\n{'='*60}")
    print(f"[_execute_tools] ToolSelection flags:")
    print(f"  use_knowledge_base  = {tool_selection.use_knowledge_base}")
    print(f"  use_diamond_search  = {tool_selection.use_diamond_search}")
    print(f"  use_setting_search  = {tool_selection.use_setting_search}")
    print(f"  use_recommendations = {tool_selection.use_recommendations}")
    print(f"{'='*60}")

    results: list[str] = []

    # ── Tool 1: Knowledge Base ────────────────────────────────────────────────
    if tool_selection.use_knowledge_base and tool_selection.knowledge_base_query:
        print(f"\n[_execute_tools] → TOOL 1: knowledge_base_tool")
        print(f"  query: {tool_selection.knowledge_base_query!r}")
        r = knowledge_base_tool(tool_selection.knowledge_base_query)
        print(f"  result ({len(r)} chars): {r[:200]!r}{'...' if len(r) > 200 else ''}")
        results.append(f"[Knowledge Base]\n{r}")

    # ── Tool 2: Diamond Search ────────────────────────────────────────────────
    if tool_selection.use_diamond_search:
        print(f"\n[_execute_tools] → TOOL 2: diamond_search_tool")
        print(f"  sku       = {tool_selection.diamond_sku}")
        print(f"  shape     = {tool_selection.diamond_shape}")
        print(f"  cut       = {tool_selection.diamond_cut}")
        print(f"  color     = {tool_selection.diamond_color}")
        print(f"  clarity   = {tool_selection.diamond_clarity}")
        print(f"  min_carat = {tool_selection.diamond_min_carat}")
        print(f"  max_carat = {tool_selection.diamond_max_carat}")
        print(f"  max_price = {tool_selection.diamond_max_price}")
        r = diamond_search_tool(
            sku=tool_selection.diamond_sku,
            shape=tool_selection.diamond_shape,
            cut=tool_selection.diamond_cut,
            color=tool_selection.diamond_color,
            clarity=tool_selection.diamond_clarity,
            min_carat=tool_selection.diamond_min_carat,
            max_carat=tool_selection.diamond_max_carat,
            max_price=tool_selection.diamond_max_price,
        )
        print(f"  result ({len(r)} chars): {r[:200]!r}{'...' if len(r) > 200 else ''}")
        results.append(f"[Diamond Search]\n{r}")

    # ── Tool 3: Setting Search ────────────────────────────────────────────────
    if tool_selection.use_setting_search:
        print(f"\n[_execute_tools] → TOOL 3: setting_search_tool")
        print(f"  style     = {tool_selection.setting_style}")
        print(f"  metal     = {tool_selection.setting_metal}")
        print(f"  max_price = {tool_selection.setting_max_price}")
        r = setting_search_tool(
            style_type=tool_selection.setting_style,
            metal_type=tool_selection.setting_metal,
            max_price=tool_selection.setting_max_price,
        )
        print(f"  result ({len(r)} chars): {r[:200]!r}{'...' if len(r) > 200 else ''}")
        results.append(f"[Setting Search]\n{r}")

    # ── Tool 4: Recommendations ───────────────────────────────────────────────
    if tool_selection.use_recommendations:
        print(f"\n[_execute_tools] → TOOL 4: recommendation_tool")
        print(f"  type       = {tool_selection.recommendation_type}")
        print(f"  max_price  = {tool_selection.recommendation_max_price}")
        print(f"  diamond_id = {tool_selection.recommendation_diamond_id}")
        r = recommendation_tool(
            recommendation_type=tool_selection.recommendation_type,
            max_price=tool_selection.recommendation_max_price,
            diamond_id=tool_selection.recommendation_diamond_id,
        )
        print(f"  result ({len(r)} chars): {r[:200]!r}{'...' if len(r) > 200 else ''}")
        results.append(f"[Recommendations]\n{r}")

    if not results:
        print(f"\n[_execute_tools] ⚠ No tools triggered — returning general knowledge fallback")
        return "(No tools were called — answer from general knowledge.)"

    print(f"\n[_execute_tools] ✓ {len(results)} tool(s) executed — merging into tool_context")
    return "\n\n".join(results)


ToolExecutorRunnable = RunnableLambda(_execute_tools)


# ─────────────────────────────────────────────────────────────────────────────
# Main Pipeline  (Session-aware agent)
# ─────────────────────────────────────────────────────────────────────────────

class LuxeStoneAgent:
    _registry: dict[str, "LuxeStoneAgent"] = {}

    def __init__(self, session_id: str, user_id: Optional[int] = None):
        self.session_id = session_id
        self.user_id = user_id
        self.history: list[dict] = []
        self._tool_chain = None
        self._response_chain = None

    @classmethod
    def get_or_create(cls, session_id: str, user_id: Optional[int] = None) -> "LuxeStoneAgent":
        if session_id not in cls._registry:
            print(f"\n[LuxeStoneAgent] Creating NEW agent — session_id={session_id!r} user_id={user_id}")
            cls._registry[session_id] = cls(session_id, user_id)
        else:
            print(f"\n[LuxeStoneAgent] Reusing EXISTING agent — session_id={session_id!r}")
        return cls._registry[session_id]

    @classmethod
    def destroy(cls, session_id: str) -> None:
        print(f"\n[LuxeStoneAgent] Destroying agent — session_id={session_id!r}")
        cls._registry.pop(session_id, None)

    def _get_tool_chain(self):
        if self._tool_chain is None:
            print(f"[{self.session_id}] Lazily initialising ToolSelectionChain...")
            self._tool_chain = build_tool_selection_chain()
        return self._tool_chain

    def _get_response_chain(self):
        if self._response_chain is None:
            print(f"[{self.session_id}] Lazily initialising FinalResponseChain...")
            self._response_chain = build_final_response_chain()
        return self._response_chain

    def chat(self, user_message: str) -> dict:
        print(f"\n{'#'*60}")
        print(f"[{self.session_id}] chat() START")
        print(f"  user_message  : {user_message!r}")
        print(f"  user_id       : {self.user_id}")
        print(f"  history length: {len(self.history)} entries")
        print(f"{'#'*60}")

        window = self.history[-10:]
        print(f"[{self.session_id}] Context window: {len(window)}/10 messages")

        # ── STEP 1: Tool Selection ─────────────────────────────────────────
        print(f"\n[{self.session_id}] ── STEP 1: Tool Selection ──────────────────────")
        try:
            tool_chain = self._get_tool_chain()
            print(f"[{self.session_id}] Invoking ToolSelectionChain with user_message={user_message!r}")
            tool_selection = tool_chain.invoke({"user_message": user_message})

            print(f"[{self.session_id}] ToolSelection result:")
            print(f"  use_knowledge_base    = {tool_selection.use_knowledge_base}")
            print(f"  knowledge_base_query  = {tool_selection.knowledge_base_query!r}")
            print(f"  use_diamond_search    = {tool_selection.use_diamond_search}")
            print(f"  diamond_shape         = {tool_selection.diamond_shape}")
            print(f"  diamond_cut           = {tool_selection.diamond_cut}")
            print(f"  diamond_color         = {tool_selection.diamond_color}")
            print(f"  diamond_clarity       = {tool_selection.diamond_clarity}")
            print(f"  diamond_min_carat     = {tool_selection.diamond_min_carat}")
            print(f"  diamond_max_carat     = {tool_selection.diamond_max_carat}")
            print(f"  diamond_max_price     = {tool_selection.diamond_max_price}")
            print(f"  use_setting_search    = {tool_selection.use_setting_search}")
            print(f"  setting_style         = {tool_selection.setting_style}")
            print(f"  setting_metal         = {tool_selection.setting_metal}")
            print(f"  setting_max_price     = {tool_selection.setting_max_price}")
            print(f"  use_recommendations   = {tool_selection.use_recommendations}")
            print(f"  recommendation_type   = {tool_selection.recommendation_type}")
            print(f"  recommendation_max_price = {tool_selection.recommendation_max_price}")
            print(f"[{self.session_id}] STEP 1 ✓")

        except Exception as exc:
            print(f"[{self.session_id}] STEP 1 ✗ FAILED: {exc}")
            logger.error("[%s] Tool selection failed: %s", self.session_id, exc, exc_info=True)
            from .schemas import ToolSelection
            print(f"[{self.session_id}] STEP 1 → falling back to KB-only ToolSelection")
            tool_selection = ToolSelection(
                use_knowledge_base=True,
                knowledge_base_query=user_message,
            )

        if tool_selection.use_recommendations and self.user_id:
            print(f"[{self.session_id}] Attaching _user_id={self.user_id} for personalised recommendations")
            tool_selection.__dict__["_user_id"] = self.user_id

        # ── STEP 2: Execute Tools ──────────────────────────────────────────
        print(f"\n[{self.session_id}] ── STEP 2: Tool Execution ───────────────────────")
        try:
            tool_context = _execute_tools(tool_selection)
            print(f"[{self.session_id}] STEP 2 ✓ — tool_context length: {len(tool_context)} chars")
            print(f"[{self.session_id}] tool_context preview: {tool_context[:300]!r}{'...' if len(tool_context) > 300 else ''}")
        except Exception as exc:
            print(f"[{self.session_id}] STEP 2 ✗ FAILED: {exc}")
            logger.error("[%s] Tool execution failed: %s", self.session_id, exc, exc_info=True)
            tool_context = "(Tool execution failed — answering from general knowledge.)"
            print(f"[{self.session_id}] STEP 2 → using fallback tool_context")

        # ── STEP 3: Generate Final Response ───────────────────────────────
        print(f"\n[{self.session_id}] ── STEP 3: Final Response Generation ───────────")
        try:
            response_chain = self._get_response_chain()
            lc_history = _history_to_langchain_messages(window)

            print(f"[{self.session_id}] Invoking FinalResponseChain:")
            print(f"  user_message length    : {len(user_message)} chars")
            print(f"  tool_context length    : {len(tool_context)} chars")
            print(f"  conversation_history   : {len(lc_history)} messages")

            chat_response = response_chain.invoke({
                "user_message": user_message,
                "tool_context": tool_context,
                "conversation_history": lc_history,
            })

            message = chat_response.message
            suggestions = chat_response.follow_up_suggestions or []

            print(f"[{self.session_id}] STEP 3 ✓ ChatResponse received:")
            print(f"  message length      : {len(message)} chars")
            print(f"  message preview     : {message[:200]!r}{'...' if len(message) > 200 else ''}")
            print(f"  follow_up_suggestions ({len(suggestions)}): {suggestions}")

        except Exception as exc:
            print(f"[{self.session_id}] STEP 3 ✗ FAILED: {exc}")
            logger.error("[%s] Response generation failed: %s", self.session_id, exc, exc_info=True)
            message = (
                "I'm sorry, I encountered a technical issue. "
                "For immediate help please email hello@luxestone.com "
                "or call +1 (234) 567-8900."
            )
            suggestions = []
            print(f"[{self.session_id}] STEP 3 → returning hardcoded fallback message")

        # ── Persist to history ─────────────────────────────────────────────
        self.history.append({"role": "user", "content": user_message})
        self.history.append({"role": "assistant", "content": message})
        print(f"\n[{self.session_id}] History updated → total entries: {len(self.history)}")
        print(f"[{self.session_id}] chat() END\n{'#'*60}\n")

        return {"message": message, "follow_up_suggestions": suggestions}

    def get_history(self) -> list[dict]:
        return list(self.history)

    def clear_history(self) -> None:
        print(f"[{self.session_id}] Clearing conversation history (was {len(self.history)} entries)")
        self.history = []


# ─────────────────────────────────────────────────────────────────────────────
# Fallback Agent
# ─────────────────────────────────────────────────────────────────────────────

class FallbackAgent:
    _registry: dict[str, "FallbackAgent"] = {}

    def __init__(self, session_id: str, user_id: Optional[int] = None):
        self.session_id = session_id
        self.user_id = user_id
        self.history: list[dict] = []

    @classmethod
    def get_or_create(cls, session_id: str, user_id: Optional[int] = None) -> "FallbackAgent":
        if session_id not in cls._registry:
            print(f"\n[FallbackAgent] Creating NEW agent — session_id={session_id!r}")
            cls._registry[session_id] = cls(session_id, user_id)
        else:
            print(f"\n[FallbackAgent] Reusing EXISTING agent — session_id={session_id!r}")
        return cls._registry[session_id]

    def chat(self, user_message: str) -> dict:
        from .tools import knowledge_base_tool, diamond_search_tool, recommendation_tool

        msg = user_message.lower()
        print(f"\n[FallbackAgent][{self.session_id}] chat() — normalised: {msg!r}")

        if any(w in msg for w in ["hi", "hello", "hey", "start"]):
            print(f"[FallbackAgent][{self.session_id}] Branch matched: GREETING")
            from .prompts import FALLBACK_GREETING
            response = FALLBACK_GREETING
            suggestions = [
                "Explain the 4Cs of diamonds",
                "Show me diamonds under $5,000",
                "What makes lab-grown diamonds ethical?",
            ]

        elif any(w in msg for w in ["show", "find", "search", "browse", "under $", "budget"]):
            import re
            budget_match = re.search(r"\$(\d[\d,]*)", user_message)
            max_p = float(budget_match.group(1).replace(",", "")) if budget_match else None
            print(f"[FallbackAgent][{self.session_id}] Branch matched: DIAMOND SEARCH | max_price={max_p}")
            result = diamond_search_tool(max_price=max_p, limit=5)
            print(f"[FallbackAgent][{self.session_id}] diamond_search_tool → {len(result)} chars")
            response = (
                f"Here are some diamonds"
                f"{f' under ${max_p:,.0f}' if max_p else ''}:\n\n{result}\n\n"
                "Use our ring configurator at /configurator to build your perfect ring!"
            )
            suggestions = ["Show me round cut diamonds", "What's the best cut grade?"]

        elif any(w in msg for w in ["recommend", "trending", "popular"]):
            print(f"[FallbackAgent][{self.session_id}] Branch matched: RECOMMENDATIONS")
            result = recommendation_tool("trending")
            print(f"[FallbackAgent][{self.session_id}] recommendation_tool → {len(result)} chars")
            response = f"{result}\n\nWould you like to narrow by budget or shape?"
            suggestions = ["Show diamonds under $3,000", "What diamond shapes are popular?"]

        else:
            print(f"[FallbackAgent][{self.session_id}] Branch matched: KNOWLEDGE BASE (default)")
            result = knowledge_base_tool(user_message)
            print(f"[FallbackAgent][{self.session_id}] knowledge_base_tool → {len(result)} chars")
            response = (
                f"{result}\n\n"
                "Need more help? Browse our collection at /diamonds "
                "or build a custom ring at /configurator."
            )
            suggestions = ["Show me trending diamonds", "Help me choose within my budget"]

        self.history.append({"role": "user", "content": user_message})
        self.history.append({"role": "assistant", "content": response})
        print(f"[FallbackAgent][{self.session_id}] History updated → {len(self.history)} entries")

        return {"message": response, "follow_up_suggestions": suggestions}

    def get_history(self) -> list[dict]:
        return list(self.history)

    def clear_history(self) -> None:
        print(f"[FallbackAgent][{self.session_id}] Clearing history (was {len(self.history)} entries)")
        self.history = []


# ─────────────────────────────────────────────────────────────────────────────
# Factory
# ─────────────────────────────────────────────────────────────────────────────

def get_agent(session_id: str, user_id: Optional[int] = None):
    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"\n[get_agent] session_id={session_id!r} | user_id={user_id} | api_key_present={bool(api_key)}")

    if api_key:
        print(f"[get_agent] → Routing to LuxeStoneAgent (full LLM pipeline)")
        return LuxeStoneAgent.get_or_create(session_id, user_id)

    print(f"[get_agent] → Routing to FallbackAgent (no GEMINI_API_KEY)")
    logger.warning(
        "GEMINI_API_KEY not configured — FallbackAgent active. "
        "Set GEMINI_API_KEY in .env for full AI capabilities."
    )
    return FallbackAgent.get_or_create(session_id, user_id)