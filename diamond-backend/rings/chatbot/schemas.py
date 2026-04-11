"""
Pydantic v2 schemas for all structured LLM outputs in the LuxeStone chatbot.

Every LLM call that needs structured data uses one of these schemas via
.with_structured_output(Schema). This eliminates fragile keyword-parsing
and guarantees type-safe, validated outputs even when users give fuzzy input.
"""

from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


# ─────────────────────────────────────────────────────────────────────────────
# 1.  Tool-routing schema
#     LLM reads the user message and decides WHICH tools to invoke.
# ─────────────────────────────────────────────────────────────────────────────

class ToolSelection(BaseModel):
    """
    Structured tool-routing decision produced by the LLM.
    The model reads the raw user message (including typos) and returns
    which tools to call and with what normalised parameters.
    """

    use_knowledge_base: bool = Field(
        default=False,
        description=(
            "True if the user is asking an EDUCATIONAL question (how, why, what, explain) "
            "about: 4Cs, lab-grown diamonds, ring components, sizing, company policies "
            "(shipping, returns, warranty), ethical sourcing, certifications, pricing formulas, "
            "or needs a buying guide. Also use for 'why' questions like 'why is this diamond X price?' "
            "or 'why lab-grown vs natural?'. Default to True if intent is ambiguous."
        ),
    )
    knowledge_base_query: Optional[str] = Field(
        default=None,
        description=(
            "A clean, grammatically correct restatement of what the user wants "
            "to learn. Fix any spelling mistakes. Required if use_knowledge_base=True. "
            "Include context from conversation history if relevant."
        ),
    )

    use_diamond_search: bool = Field(
        default=False,
        description=(
            "True if the user wants to FIND or VIEW actual diamond products from inventory. "
            "Trigger conditions (in priority order):\n"
            "  1. Product-specific: 'SKU-123', 'product code', specific diamond name\n"
            "  2. Price queries for products: 'price of SKU-*', 'cost of [diamond]'\n"
            "  3. Search with attributes: 'show/find/search' + shape/cut/color/clarity/carat/price\n"
            "  4. Browse intent: 'show me', 'what diamonds', 'what do you have', 'available'\n"
            "  5. Vague product intent: just shape mention with no 'explain' context.\n"
            "Also True if user asks 'show me anything' or browsing type queries. "
            "Extract ALL diamond_* filters mentioned; tool will compute results."
        ),
    )
    diamond_shape: Optional[str] = Field(
        default=None,
        description=(
            "Normalised diamond shape. One of: Round, Princess, Cushion, Oval, "
            "Emerald, Asscher, Marquise, Pear, Heart, Radiant. "
            "Fix typos (e.g. 'cushan' → 'Cushion'). Null if not mentioned."
        ),
    )
    diamond_cut: Optional[str] = Field(
        default=None,
        description=(
            "Normalised cut grade. One of: Excellent, Very Good, Good, Fair, Poor. "
            "Fix typos. Null if not mentioned."
        ),
    )
    diamond_color: Optional[str] = Field(
        default=None,
        description="Colour grade D-Z. Fix case/typos. Null if not mentioned.",
    )
    diamond_clarity: Optional[str] = Field(
        default=None,
        description=(
            "Clarity grade. One of: FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1. "
            "Fix typos. Null if not mentioned."
        ),
    )
    diamond_min_carat: Optional[float] = Field(
        default=None,
        description="Minimum carat weight as float. Extract from text like '1ct', '1 carat', 'at least 1.5'. Null if not mentioned.",
    )
    diamond_max_carat: Optional[float] = Field(
        default=None,
        description="Maximum carat weight as float. Extract from '0.5ct', 'half carat', 'up to 2ct'. Null if not mentioned.",
    )
    diamond_max_price: Optional[float] = Field(
        default=None,
        description=(
            "Maximum budget for the diamond in USD as float. "
            "Extract from '$5000', 'under 5k', 'budget of five thousand', etc. "
            "This is the FINAL price the customer wants to pay (including all quality multipliers). "
            "Null if not mentioned."
        ),
    )
    diamond_sku: Optional[str] = Field(
        default=None,
        description=(
            "Product SKU code if user references a specific diamond. "
            "Extract from patterns like 'SKU: DIA-RND-003', 'SKU-RND-003', 'product code: DIA-RND-003', "
            "or explicit product names/codes mentioned. Format: uppercase alphanumeric (e.g., 'DIA-RND-003'). "
            "Priority: If user asks about a SPECIFIC diamond by SKU, this takes precedence over other filters. "
            "Null if not mentioned or if user is doing a general product search."
        ),
    )

    use_setting_search: bool = Field(
        default=False,
        description=(
            "True if the user explicitly asks about ring settings, bands, metals, "
            "or mounting styles (solitaire, halo, three-stone, pavé, etc.)."
        ),
    )
    setting_style: Optional[str] = Field(
        default=None,
        description="Normalised style type, e.g. Solitaire, Halo, Three Stone, Vintage, Pavé. Fix typos. Null if not mentioned.",
    )
    setting_metal: Optional[str] = Field(
        default=None,
        description="Normalised metal type, e.g. Platinum, White Gold, Yellow Gold, Rose Gold. Fix typos. Null if not mentioned.",
    )
    setting_max_price: Optional[float] = Field(
        default=None,
        description="Maximum budget for the setting in USD as float. Null if not mentioned.",
    )

    use_recommendations: bool = Field(
        default=False,
        description=(
            "True if the user wants personalised/trending/popular/budget recommendations. "
            "Trigger words: 'recommend', 'suggest', 'best value', 'best option', "
            "'popular', 'trending', 'what should I', 'good choice', 'best bang for buck'. "
            "DO NOT set this if user asked for product search with specific attributes. "
            "Set recommendation_type based on context:\n"
            "  - 'budget': if a price limit is mentioned\n"
            "  - 'trending': if asking for popular/hot items or no specific budget\n"
            "  - 'personalized': if user is logged-in with purchase history\n"
            "  - 'similar': if asking 'show me diamonds like SKU-X' (+ recommendation_diamond_id)"
        ),
    )
    recommendation_type: Literal["trending", "budget", "personalized", "similar"] = Field(
        default="trending",
        description=(
            "Type of recommendation:\n"
            "  'trending': popular/hot items (default when no specific context)\n"
            "  'budget': when user mentioned a price ceiling → set recommendation_max_price\n"
            "  'personalized': for logged-in users with prior history\n"
            "  'similar': when asking for diamonds similar to a specific SKU/diamond_id"
        ),
    )
    recommendation_max_price: Optional[float] = Field(
        default=None,
        description=(
            "Budget ceiling in USD for recommendations — the FINAL calculated price "
            "that the customer will actually pay (including quality multipliers). "
            "Extract from '$5000', 'under 5k', 'budget of five thousand', etc. "
            "Required if recommendation_type='budget'. Null otherwise."
        ),
    )
    recommendation_diamond_id: Optional[int] = Field(
        default=None,
        description=(
            "Internal diamond_id for 'similar' recommendations. Extract from context "
            "or conversation history if user asks 'show me diamonds like this one'. "
            "Required if recommendation_type='similar'. Null otherwise."
        ),
    )

    # ── validators ────────────────────────────────────────────────────────────

    @field_validator("diamond_shape", mode="before")
    @classmethod
    def normalise_shape(cls, v):
        if v is None:
            return None
        mapping = {
            "round": "Round", "rounds": "Round",
            "princess": "Princess", "princss": "Princess",
            "cushion": "Cushion", "cushan": "Cushion", "cushon": "Cushion",
            "oval": "Oval", "ovale": "Oval",
            "emerald": "Emerald",
            "asscher": "Asscher", "ascher": "Asscher",
            "marquise": "Marquise", "marqise": "Marquise",
            "pear": "Pear",
            "heart": "Heart",
            "radiant": "Radiant",
        }
        return mapping.get(str(v).lower().strip(), v.title())

    @field_validator("diamond_cut", mode="before")
    @classmethod
    def normalise_cut(cls, v):
        if v is None:
            return None
        mapping = {
            "excellent": "Excellent", "exc": "Excellent", "excelent": "Excellent",
            "very good": "Very Good", "verygood": "Very Good", "vg": "Very Good",
            "good": "Good",
            "fair": "Fair",
            "poor": "Poor",
        }
        return mapping.get(str(v).lower().strip(), v.title())

    @field_validator("diamond_color", mode="before")
    @classmethod
    def normalise_color(cls, v):
        if v is None:
            return None
        return str(v).strip().upper()

    @field_validator("diamond_clarity", mode="before")
    @classmethod
    def normalise_clarity(cls, v):
        if v is None:
            return None
        mapping = {
            "fl": "FL", "if": "IF",
            "vvs1": "VVS1", "vvs2": "VVS2",
            "vs1": "VS1", "vs2": "VS2",
            "si1": "SI1", "si2": "SI2",
            "i1": "I1",
        }
        return mapping.get(str(v).lower().strip(), str(v).upper())

    @model_validator(mode="after")
    def require_kb_query_when_kb_used(self) -> "ToolSelection":
        if self.use_knowledge_base and not self.knowledge_base_query:
            self.knowledge_base_query = "diamond quality and purchasing guide"
        return self

    @model_validator(mode="after")
    def budget_implies_recommendation(self) -> "ToolSelection":
        """If a price is given with use_recommendations, switch to budget type."""
        if self.use_recommendations and self.recommendation_max_price:
            self.recommendation_type = "budget"
        return self


# ─────────────────────────────────────────────────────────────────────────────
# 2.  Final response schema
#     Keeps the model from hallucinating product SKUs.
# ─────────────────────────────────────────────────────────────────────────────

class ChatResponse(BaseModel):
    """
    The final response the user sees in the chatbot UI.
    Forces the model to separate prose from any product lists.
    """

    message: str = Field(
        description=(
            "The full assistant reply to display to the user. "
            "Friendly, warm, and concise. Never mention tool names or JSON. "
            "Use line breaks and bullet points (•) for readability. "
            "If product data was provided in context, reference it naturally — "
            "do NOT invent SKUs or prices that were not in the context."
        )
    )

    follow_up_suggestions: list[str] = Field(
        default_factory=list,
        max_length=3,
        description=(
            "0-3 short follow-up questions to offer the user as clickable chips. "
            "Make them specific and actionable, e.g. "
            "'Show me only Excellent cut round diamonds' or "
            "'What does VS2 clarity mean?'. Empty list if context is complete."
        ),
    )

    @field_validator("message", mode="after")
    @classmethod
    def strip_tool_artifacts(cls, v: str) -> str:
        """Remove any accidental [TOOL: …] or JSON bleed in the response."""
        import re
        v = re.sub(r"\[TOOL:[^\]]*\]", "", v)
        v = re.sub(r"\{[^}]{0,200}\}", "", v)
        return v.strip()