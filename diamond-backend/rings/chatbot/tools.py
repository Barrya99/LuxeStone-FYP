"""
Tool functions for the LuxeStone chatbot pipeline.

Each tool returns a plain string that is fed back into the final-response
LLM call as grounding context.  Tools use the CALCULATED price (including
all quality multipliers) so budget filters match what the customer sees.
"""

from __future__ import annotations

import logging
from decimal import Decimal
from typing import Optional

logger = logging.getLogger(__name__)


# ── Tool 1: Knowledge Base ────────────────────────────────────────────────────

def knowledge_base_tool(query: str) -> str:
    """
    Semantic keyword retrieval over the LuxeStone knowledge base.
    Returns the top-2 most relevant document chunks.
    """
    try:
        print(f"\n[TOOL] knowledge_base_tool called")
        print(f"[TOOL]   query: {repr(query[:80])}..." if len(query) > 80 else f"[TOOL]   query: {repr(query)}")
        
        from .knowledge_base import KNOWLEDGE_DOCUMENTS

        query_lower = query.lower()
        print(f"[TOOL] Searching {len(KNOWLEDGE_DOCUMENTS)} knowledge documents...")

        topic_keywords: dict[str, list[str]] = {
            "cut": ["cut", "facet", "brilliant", "ideal", "excellent", "very good", "fire", "scintillation"],
            "carat": ["carat", "weight", "ct", "size", "half carat", "one carat", "two carat"],
            "color": ["color", "colour", "colorless", "near colorless", "d-f", "g-h", "tint", "yellow"],
            "clarity": ["clarity", "inclusion", "blemish", "flawless", "vvs", "vs1", "vs2", "si1", "si2", "eye-clean"],
            "4cs": ["4c", "four c", "quality", "grade", "grading", "igi", "gia", "certificate"],
            "lab_grown": ["lab", "lab-grown", "laboratory", "cvd", "hpht", "synthetic", "man-made", "created"],
            "lab_grown_comparison": ["natural", "mined", "real diamond", "difference", "compare", "better", "worth"],
            "ring_components": [
                "shape", "round", "princess", "cushion", "oval", "emerald", "asscher", "pear", "heart",
                "setting", "solitaire", "halo", "three stone", "pave", "channel", "bezel", "vintage",
                "metal", "platinum", "gold", "white gold", "rose gold", "yellow gold", "band",
            ],
            "ring_sizing": ["ring size", "sizing", "measure", "fit", "finger", "resize"],
            "ethical_sourcing": ["ethical", "conflict", "blood diamond", "mining", "eco", "environment", "sustainable"],
            "company_policies": ["return", "refund", "ship", "delivery", "warranty", "policy", "guarantee", "payment", "finance"],
            "buying_guide": ["budget", "afford", "how much", "spend", "value", "guide", "choose", "best", "recommend"],
            "pricing_transparency": ["price", "cost", "formula", "multiplier", "calculate", "how priced", "markup"],
        }

        scored: list[tuple[int, dict]] = []

        for doc in KNOWLEDGE_DOCUMENTS:
            score = 0
            topic = doc["metadata"].get("topic", "")

            if topic in topic_keywords:
                for kw in topic_keywords[topic]:
                    if kw in query_lower:
                        score += 4  # Topic match is a strong signal

            content_lower = doc["content"].lower()
            for word in query_lower.split():
                if len(word) > 3 and word in content_lower:
                    score += 1

            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_docs = scored[:2]
        print(f"[TOOL] Top {len(top_docs)} matching documents:")
        for idx, (score, doc) in enumerate(top_docs, 1):
            topic = doc["metadata"].get("topic", "?")
            print(f"[TOOL]   [{idx}] Topic: {topic}, Score: {score}")

        if not top_docs:
            print(f"[TOOL] No matches found, using fallback documents...")
            fallback = [d for d in KNOWLEDGE_DOCUMENTS if d["id"] in ("4cs_overview", "buying_guide")]
            top_docs = [(0, d) for d in fallback[:2]]

        parts = [doc["content"].strip() for _, doc in top_docs]
        result_text = "\n\n---\n\n".join(parts)
        print(f"[TOOL] ✓ Result: {len(result_text)} chars, {len(parts)} document(s)")
        return result_text

    except Exception as exc:
        print(f"[TOOL] ✗ ERROR: {type(exc).__name__}: {exc}")
        logger.error("knowledge_base_tool error: %s", exc, exc_info=True)
        return "Knowledge base unavailable. Please try again."


# ── Tool 2a: Diamond Search (budget = calculated price) ───────────────────────

def diamond_search_tool(
    shape: Optional[str] = None,
    cut: Optional[str] = None,
    color: Optional[str] = None,
    clarity: Optional[str] = None,
    min_carat: Optional[float] = None,
    max_carat: Optional[float] = None,
    max_price: Optional[float] = None,   # FINAL calculated price ceiling
    sku: Optional[str] = None,            # NEW: Specific product SKU
    limit: int = 6,
) -> str:
    """
    Search live diamond inventory.

    If sku is provided, search for that specific diamond first (takes priority).
    Otherwise, filter by 4Cs and price (CALCULATED price, not base price).
    
    Price filtering is done on the CALCULATED price (base × quality multipliers)
    so the budget the customer sees in the UI matches what we filter on here.
    We fetch a wider set from the DB then post-filter by calculated price.
    """
    try:
        print(f"\n[TOOL] diamond_search_tool called")
        print(f"[TOOL]   sku={sku}, shape={shape}, cut={cut}, color={color}, clarity={clarity}")
        print(f"[TOOL]   min_carat={min_carat}, max_carat={max_carat}")
        print(f"[TOOL]   max_price={max_price}, limit={limit}")
        
        from rings.models import Diamond
        from rings.services.pricing import PricingEngine

        print(f"[TOOL] Starting diamond search...")
        
        # ── SKU LOOKUP (Priority) ──────────────────────────────────────────
        if sku:
            print(f"[TOOL] SKU specified: '{sku}' — searching for this specific product...")
            try:
                diamond = Diamond.objects.get(sku__iexact=sku, is_available=True)
                print(f"[TOOL] ✓ SKU '{sku}' found in database")
                
                # Calculate price for this diamond
                try:
                    calc_price = float(PricingEngine.calculate_diamond_price(diamond))
                except Exception as price_err:
                    print(f"[TOOL] Warning: Could not calculate price for SKU {sku}: {price_err}")
                    calc_price = float(diamond.base_price)
                
                # Check if it matches the budget (if budget was also specified)
                if max_price is not None and calc_price > max_price:
                    msg = (
                        f"SKU: {diamond.sku} is available but its price (${calc_price:,.0f}) "
                        f"exceeds your budget of ${max_price:,.0f}.\n\n"
                        f"• {diamond.carat}ct {diamond.shape} | Cut: {diamond.cut} | "
                        f"Colour: {diamond.color} | Clarity: {diamond.clarity} | "
                        f"Final Price: ${calc_price:,.0f} | SKU: {diamond.sku}\n\n"
                        f"Would you like to increase your budget or explore alternatives?"
                    )
                    print(f"[TOOL] Diamond exceeds budget, returning message with price info")
                    return msg
                
                # Found and within budget — return it immediately
                result = (
                    f"Found diamond:\n"
                    f"• {diamond.carat}ct {diamond.shape} | Cut: {diamond.cut} | "
                    f"Colour: {diamond.color} | Clarity: {diamond.clarity} | "
                    f"Final Price: ${calc_price:,.0f} | SKU: {diamond.sku}"
                )
                print(f"[TOOL] ✓ Returning specific SKU result: {diamond.sku} @ ${calc_price:,.0f}")
                return result
                
            except Diamond.DoesNotExist:
                msg = f"SKU '{sku}' not found in our current inventory. Please check the code and try again, or browse our available diamonds."
                print(f"[TOOL] ✗ SKU '{sku}' not found")
                return msg
        
        # ── GENERAL SEARCH (if no specific SKU) ────────────────────────────
        queryset = Diamond.objects.filter(is_available=True)
        print(f"[TOOL] Available diamonds in DB: {queryset.count()}")

        if shape:
            queryset = queryset.filter(shape__iexact=shape)
            print(f"[TOOL] After shape filter: {queryset.count()}")
        if cut:
            queryset = queryset.filter(cut__iexact=cut)
            print(f"[TOOL] After cut filter: {queryset.count()}")
        if color:
            queryset = queryset.filter(color__iexact=color.upper())
            print(f"[TOOL] After color filter: {queryset.count()}")
        if clarity:
            queryset = queryset.filter(clarity__iexact=clarity.upper())
            print(f"[TOOL] After clarity filter: {queryset.count()}")
        if min_carat is not None:
            queryset = queryset.filter(carat__gte=Decimal(str(min_carat)))
            print(f"[TOOL] After min_carat filter: {queryset.count()}")
        if max_carat is not None:
            queryset = queryset.filter(carat__lte=Decimal(str(max_carat)))
            print(f"[TOOL] After max_carat filter: {queryset.count()}")

        # Fetch ALL matching diamonds for price filtering to avoid missing valid results
        # Only apply limit AFTER price filtering, not before
        print(f"[TOOL] Fetching ALL matching diamonds for price filtering...")
        candidates = queryset.order_by("-created_at")
        candidates_list = list(candidates)
        print(f"[TOOL] Fetched {len(candidates_list)} candidates (no limit yet—will filter by price first)")

        results = []
        for idx, d in enumerate(candidates_list, 1):
            try:
                calc_price = float(PricingEngine.calculate_diamond_price(d))
            except Exception as price_err:
                print(f"[TOOL] Warning: Could not calculate price for diamond {d.sku}: {price_err}")
                calc_price = float(d.base_price)

            print(f"[TOOL]   [{idx}] {d.sku}: base=${float(d.base_price):,.0f} → calculated=${calc_price:,.0f}")
            
            # Apply budget filter on CALCULATED price
            if max_price is not None and calc_price > max_price:
                print(f"[TOOL]       ✗ Over budget (${calc_price:,.0f} > ${max_price:,.0f})")
                continue
            
            print(f"[TOOL]       ✓ Within budget")
            results.append({
                "diamond": d,
                "calculated_price": calc_price,
            })

        # Sort by price descending (closest to budget first, highest price first)
        results.sort(key=lambda r: r["calculated_price"], reverse=True)
        # Now limit the results to the requested count (AFTER price filtering AND sorting)
        results = results[:limit]
        print(f"\n[TOOL] ✓ Search complete: {len(results)} diamonds found (after price filter and limit applied)")
        sorted_prices = [f'${r["calculated_price"]:,.0f}' for r in results]
        print(f"[TOOL] Sorted by price descending: {sorted_prices}")
        if not results:
            msg = "No diamonds found matching those criteria."
            if max_price:
                msg += (
                    f" Your budget of ${max_price:,.0f} is based on the final price "
                    "(including quality adjustments). Try a slightly higher budget or "
                    "relax the cut/colour filters."
                )
            print(f"[TOOL] Returning: {msg}")
            return msg

        lines = []
        for r in results:
            d = r["diamond"]
            p = r["calculated_price"]
            line = (
                f"• {d.carat}ct {d.shape} | Cut: {d.cut} | Colour: {d.color} | "
                f"Clarity: {d.clarity} | Final Price: ${p:,.0f} | SKU: {d.sku}"
            )
            lines.append(line)

        header = (
            f"Found {len(results)} diamond(s)"
            + (f" under ${max_price:,.0f} (final price)" if max_price else "")
            + ":\n"
        )
        result_text = header + "\n".join(lines)
        print(f"[TOOL] Result text length: {len(result_text)} chars, {len(lines)} diamonds")
        return result_text

    except Exception as exc:
        print(f"[TOOL] ✗ ERROR: {type(exc).__name__}: {exc}")
        logger.error("diamond_search_tool error: %s", exc, exc_info=True)
        import traceback
        traceback.print_exc()
        return "Diamond search is temporarily unavailable. Please use the Browse Diamonds page."


# ── Tool 2b: Setting Search ───────────────────────────────────────────────────

def setting_search_tool(
    style_type: Optional[str] = None,
    metal_type: Optional[str] = None,
    max_price: Optional[float] = None,
    limit: int = 5,
) -> str:
    """Search ring setting inventory with optional filters."""
    try:
        from rings.models import Setting

        queryset = Setting.objects.filter(is_available=True)

        if style_type:
            queryset = queryset.filter(style_type__icontains=style_type)
        if metal_type:
            queryset = queryset.filter(metal_type__icontains=metal_type)
        if max_price is not None:
            queryset = queryset.filter(base_price__lte=Decimal(str(max_price)))

        settings = queryset.order_by("-popularity_score")[:limit]

        if not settings.exists():
            return "No settings found matching those criteria. Try broadening your style or metal filters."

        lines = [
            f"• {s.name} | Style: {s.style_type} | Metal: {s.metal_type} | "
            f"Price: ${float(s.base_price):,.0f} | SKU: {s.sku}"
            for s in settings
        ]
        return f"Found {settings.count()} setting(s):\n" + "\n".join(lines)

    except Exception as exc:
        logger.error("setting_search_tool error: %s", exc, exc_info=True)
        return "Setting search is temporarily unavailable. Please use the Browse Settings page."


# ── Tool 3: Recommendation Engine ─────────────────────────────────────────────

def recommendation_tool(
    recommendation_type: str = "trending",
    max_price: Optional[float] = None,   # FINAL calculated price
    diamond_id: Optional[int] = None,
    user_id: Optional[int] = None,
) -> str:
    """
    Recommendations via the existing RecommendationEngine.

    For 'budget' recommendations, candidates are post-filtered on
    CALCULATED price so the suggestion matches the customer's UI budget.
    """
    try:
        from rings.recommendation_engine import RecommendationEngine
        from rings.models import User
        from rings.services.pricing import PricingEngine

        user = None
        if user_id:
            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                pass

        engine = RecommendationEngine(user=user)

        def _format_diamond(d, label_prefix="•"):
            try:
                calc = float(PricingEngine.calculate_diamond_price(d))
                price_str = f"${calc:,.0f} (final)"
            except Exception:
                price_str = f"${float(d.base_price):,.0f}"
            return f"{label_prefix} {d.carat}ct {d.shape} | {d.cut} cut | {d.color} colour | {price_str}"

        # ── Trending ─────────────────────────────────────────────────────────
        if recommendation_type == "trending":
            diamonds = engine.get_trending_diamonds(8)
            if not diamonds:
                return "No trending diamonds available right now."
            lines = [_format_diamond(d) for d in diamonds[:5]]
            return "🔥 Trending Diamonds:\n" + "\n".join(lines)

        # ── Budget (filter on CALCULATED price) ───────────────────────────────
        elif recommendation_type == "budget":
            if not max_price:
                return "Please provide a budget to find budget-friendly diamonds."

            # Get a larger candidate pool and post-filter on calculated price
            candidates = engine.get_budget_friendly_diamonds(max_price * 2, 20)
            filtered = []
            for d in candidates:
                try:
                    calc = float(PricingEngine.calculate_diamond_price(d))
                except Exception:
                    calc = float(d.base_price)
                if calc <= max_price:
                    filtered.append((d, calc))

            # Sort by quality score: calc_price desc (best value near budget ceiling)
            filtered.sort(key=lambda x: x[1], reverse=True)

            if not filtered:
                return (
                    f"No diamonds found under ${max_price:,.0f} (final calculated price). "
                    "The final price includes quality adjustments for cut, colour, and clarity. "
                    "Try increasing your budget slightly or broadening quality requirements."
                )

            lines = [
                f"• {d.carat}ct {d.shape} | {d.cut} cut | {d.color} colour | ${p:,.0f} final"
                for d, p in filtered[:5]
            ]
            return f"💰 Best Diamonds Under ${max_price:,.0f} (final price):\n" + "\n".join(lines)

        # ── Similar ───────────────────────────────────────────────────────────
        elif recommendation_type == "similar" and diamond_id:
            similars = engine.get_similar_diamonds(diamond_id, 5)
            if not similars:
                return "No similar diamonds found."
            lines = [_format_diamond(d) for d in similars]
            return "🔍 Similar Diamonds:\n" + "\n".join(lines)

        # ── Personalised ──────────────────────────────────────────────────────
        elif recommendation_type == "personalized":
            diamonds = engine.get_personalized_diamonds(5)
            settings = engine.get_personalized_settings(3)
            parts = ["✨ Personalised Recommendations:"]
            if diamonds:
                parts.append("Diamonds:")
                parts.extend(_format_diamond(d) for d in diamonds)
            if settings:
                parts.append("Settings:")
                parts.extend(
                    f"• {s.name} | {s.metal_type} | ${float(s.base_price):,.0f}"
                    for s in settings
                )
            return "\n".join(parts)

        return "Please specify a recommendation type: trending, budget, similar, or personalized."

    except Exception as exc:
        logger.error("recommendation_tool error: %s", exc, exc_info=True)
        return "Recommendations are temporarily unavailable. Please browse our diamond collection."