"""
Knowledge base documents for ChromaDB RAG.
These cover the 4Cs, lab-grown diamonds, ethical sourcing,
company policies, ring components, and buying guides.
"""

KNOWLEDGE_DOCUMENTS = [
    # ─── 4Cs ────────────────────────────────────────────────────────────────
    {
        "id": "4cs_overview",
        "content": """
The 4Cs of Diamond Quality — Overview

The 4Cs (Cut, Carat, Color, and Clarity) are the universal language for describing diamond quality,
created by the Gemological Institute of America (GIA). Together they determine a diamond's beauty
and value.

Understanding all four characteristics helps you choose a diamond that balances quality and budget.
No single C is most important — they work together. A flawless diamond with a poor cut will look
dull, while a well-cut diamond with minor inclusions will sparkle brilliantly.
        """,
        "metadata": {"category": "education", "topic": "4cs"},
    },
    {
        "id": "4cs_cut",
        "content": """
Diamond Cut — The Most Important of the 4Cs

Cut refers to how well a diamond's facets interact with light. It is the most important factor
in a diamond's beauty. A well-cut diamond reflects light internally from one mirror-like facet to
another, dispersing it through the top of the stone as brilliance and fire.

Cut grades (from best to worst): Excellent, Very Good, Good, Fair, Poor.

Excellent Cut: Maximum brightness and scintillation. Light enters and reflects directly back.
Very Good Cut: Nearly identical to Excellent but slightly less precise. Great value.
Good Cut: Reflects most light. Significantly less expensive than Excellent.
Fair Cut: Some light escapes through the sides or bottom.
Poor Cut: Most light escapes. Dull and glassy appearance.

At LuxeStone, we recommend Excellent or Very Good cut for maximum sparkle. Our pricing engine
applies a quality multiplier for cut grade — Excellent cut carries a 1.15× multiplier on base price.

Cut also encompasses the diamond's proportions, symmetry, and polish.
        """,
        "metadata": {"category": "education", "topic": "cut"},
    },
    {
        "id": "4cs_carat",
        "content": """
Diamond Carat Weight

Carat is the unit of measurement for a diamond's weight, not its size. One carat equals 0.2 grams.
Diamonds are also weighed in points — 100 points equals one carat (so 0.50 ct = 50 points).

Carat weight directly impacts price. However, two diamonds of equal carat weight can have very
different values depending on their cut, color, and clarity.

"Magic sizes" (0.50, 0.75, 1.00, 1.50, 2.00 ct) command premium prices because of demand.
A 0.99 ct diamond costs noticeably less than a 1.00 ct diamond of the same quality.

Size perception tip: Cut quality affects how large a diamond appears. An Excellent cut 0.90 ct
often looks larger than a Poor cut 1.00 ct.

Our LuxeStone collection ranges from 0.30 ct to 5.0 ct lab-grown diamonds. All carat weights
shown are certified by IGI.
        """,
        "metadata": {"category": "education", "topic": "carat"},
    },
    {
        "id": "4cs_color",
        "content": """
Diamond Color Grading

Diamond color is graded on a scale from D (colorless) to Z (light yellow/brown).
The GIA/IGI color scale:

D-F: Colorless — The rarest and most valuable. No detectable color even to a trained eye.
G-J: Near Colorless — Face-up colorless. Excellent value. G and H are the sweet spot.
K-M: Faint Yellow — Slight yellow visible to untrained eye. Significantly less expensive.
N-Z: Very Light to Light Yellow — Yellow visible to the naked eye.

For engagement rings, LuxeStone recommends D-H color grades for the best look and value.
Color is more noticeable in larger diamonds and in yellow gold settings (which can offset color).

Our pricing engine applies color multipliers:
- D color: adds premium factor of up to 1.15×
- G color: 1.12× multiplier — excellent value sweet spot
- H color: 1.10× — near-colorless, great for yellow gold
        """,
        "metadata": {"category": "education", "topic": "color"},
    },
    {
        "id": "4cs_clarity",
        "content": """
Diamond Clarity

Clarity measures the absence of internal inclusions and external blemishes.
GIA/IGI clarity scale (best to worst):

FL (Flawless): No inclusions or blemishes visible under 10× magnification. Extremely rare.
IF (Internally Flawless): No internal inclusions. Only surface blemishes under 10×.
VVS1/VVS2 (Very Very Slightly Included): Inclusions extremely difficult to detect at 10×.
VS1/VS2 (Very Slightly Included): Inclusions minor and difficult to see at 10×.
SI1/SI2 (Slightly Included): Inclusions noticeable at 10× magnification. Usually eye-clean.
I1/I2/I3 (Included): Inclusions visible to the naked eye. Affects transparency and brilliance.

"Eye-clean" means no inclusions visible to the naked eye. VS2 and SI1 are often eye-clean
and offer the best value. Our pricing applies clarity adjustment: IF adds 1.04× factor, VS2 is 1.00×
baseline, SI2 is 0.95×.

For most engagement rings, VS1 or VS2 offers the perfect balance of beauty and value.
        """,
        "metadata": {"category": "education", "topic": "clarity"},
    },

    # ─── Lab-Grown Diamonds ─────────────────────────────────────────────────
    {
        "id": "lab_grown_overview",
        "content": """
Lab-Grown Diamonds — Everything You Need to Know

Lab-grown diamonds are real diamonds. They are not simulants like cubic zirconia or moissanite.
They have the exact same physical, chemical, and optical properties as natural diamonds — both are
pure carbon arranged in a diamond cubic crystal structure.

The difference is origin: natural diamonds form over billions of years under extreme heat and
pressure in the Earth's mantle. Lab-grown diamonds are created in controlled laboratory environments
in 6-10 weeks using two methods:

1. HPHT (High Pressure High Temperature): Replicates Earth's natural process.
2. CVD (Chemical Vapor Deposition): Carbon-rich gas crystallizes onto a seed crystal.

Both methods produce genuine diamonds certified by the same grading labs (IGI, GIA).

LuxeStone sells only IGI-certified lab-grown diamonds. Every stone has a certificate number
traceable to its grading report, confirming all 4C grades independently.
        """,
        "metadata": {"category": "education", "topic": "lab_grown"},
    },
    {
        "id": "lab_grown_vs_natural",
        "content": """
Lab-Grown vs Natural Diamonds — Comparison

IDENTICAL PROPERTIES:
- Chemical composition: 100% pure carbon (both)
- Hardness: 10 on Mohs scale (hardest substance known)
- Refractive index, brilliance, fire, scintillation — identical
- Can only be distinguished by specialist equipment

DIFFERENCES:
Price: Lab-grown diamonds cost 30-50% less than comparable natural diamonds.
Environment: Lab-grown diamonds require no mining, causing zero habitat destruction.
Conflict-free: No risk of financing armed conflict (blood diamonds).
Availability: Lab-grown diamonds can be produced in any size or cut on demand.
Resale value: Natural diamonds hold resale value better (lab-grown market is growing).

COMMON MYTHS DEBUNKED:
- "Lab diamonds aren't real diamonds" — FALSE. Chemically and physically identical.
- "Jewelers can tell the difference" — Only with specialist detection equipment.
- "Lab diamonds lose their sparkle" — FALSE. They maintain brilliance indefinitely.

AT LUXESTONE:
We believe lab-grown diamonds are the smart choice for engagement rings — identical beauty,
lower cost, better ethics. All our diamonds are IGI certified and come with grading reports.
        """,
        "metadata": {"category": "education", "topic": "lab_grown_comparison"},
    },

    # ─── Ring Components ────────────────────────────────────────────────────
    {
        "id": "ring_components",
        "content": """
Understanding Engagement Ring Components

An engagement ring has two main parts:

1. THE DIAMOND (Center Stone)
The focal point. Chosen based on the 4Cs. Shape options include:
- Round Brilliant: Most popular. Maximum brilliance. Timeless.
- Princess: Second most popular. Modern square shape. Great sparkle.
- Cushion: Soft square/rectangle with rounded corners. Romantic vintage feel.
- Oval: Elongates the finger. Brilliant-cut faceting. Very trendy.
- Emerald: Rectangular step-cut. Dramatic hall-of-mirrors effect. Art deco.
- Asscher: Square step-cut emerald. Vintage glamour.
- Pear: Teardrop shape. Unique and distinctive.
- Marquise: Elongated pointed oval. Maximum finger coverage illusion.
- Heart: Romantic symbol shape. Excellent sentimental choice.

2. THE SETTING (Ring Band + Mounting)
Style types:
- Solitaire: Single stone, classic prong setting. Timeless and elegant.
- Halo: Center stone surrounded by smaller diamonds. Maximizes sparkle.
- Three-Stone: Three diamonds representing past, present, future.
- Pavé: Band encrusted with tiny diamonds along the sides.
- Channel: Diamonds set flush in a channel cut into the band.
- Vintage/Milgrain: Antique-inspired with decorative bead-edge details.

Metal types: Platinum (most durable), 18K White Gold (popular), 18K Yellow Gold (classic),
18K Rose Gold (romantic, trendy), 14K White/Yellow/Rose Gold (budget-friendly).
        """,
        "metadata": {"category": "education", "topic": "ring_components"},
    },
    {
        "id": "ring_sizing",
        "content": """
Ring Sizing Guide

Standard US ring sizes range from 3 to 13.5, with half and quarter sizes available.
Most women's engagement rings are sized between 5 and 7, with size 6 being average.

HOW TO MEASURE YOUR RING SIZE:
Method 1 — String/Paper Method:
1. Wrap a thin strip of paper around the base of your finger.
2. Mark where the paper overlaps.
3. Measure the length in mm.
4. Use a ring size chart to convert mm to US size.

Method 2 — Existing Ring:
1. Place an existing ring on a ruler.
2. Measure the inside diameter in mm.
3. Convert to ring size: 14.9mm = size 4, 15.7mm = size 5, 16.5mm = size 6,
   17.3mm = size 7, 18.2mm = size 8, 19.0mm = size 9, 19.8mm = size 10.

Method 3 — Visit a local jeweler for free sizing.

IMPORTANT NOTES:
- Fingers swell in heat and shrink in cold. Measure when your hands are at a normal temperature.
- Size up if between sizes — it's easier to resize down.
- LuxeStone offers sizes 4 to 11 in half increments.
- Ring resizing is available as a service.
- Surcharges apply for sizes above 7: $50 for sizes 8-9, $100 for sizes 10-11, $150 for size 12+.
        """,
        "metadata": {"category": "guide", "topic": "ring_sizing"},
    },

    # ─── Ethical Sourcing ────────────────────────────────────────────────────
    {
        "id": "ethical_sourcing",
        "content": """
LuxeStone's Commitment to Ethical Sourcing

WHY WE CHOSE LAB-GROWN:
Traditional diamond mining has serious ethical and environmental concerns:
- Blood diamonds / conflict diamonds fund armed conflict in some regions.
- Mining causes significant habitat destruction and ecosystem damage.
- Open-pit mines leave permanent scars on landscapes.
- Mining uses massive water resources and creates toxic waste.
- Dangerous working conditions for miners, especially in developing nations.

OUR ETHICAL PROMISE:
1. Zero Mining: All our diamonds are grown in laboratories — no earth is disturbed.
2. Conflict-Free: Impossible for lab diamonds to fund armed conflict.
3. IGI Certified: Every diamond has a traceable chain of custody from lab to ring.
4. Carbon Footprint: We offset all energy used in diamond production.
5. Fair Supply Chain: We work only with vetted, ethical lab operators.
6. Transparent Pricing: Our pricing engine is fully transparent — you see exactly what you pay for.

CERTIFICATIONS:
All LuxeStone diamonds carry IGI (International Gemological Institute) certification.
IGI is the world's largest independent gem certification and appraisal institute.
Each IGI report includes full 4C grading, proportions, and finish grades.
        """,
        "metadata": {"category": "ethics", "topic": "ethical_sourcing"},
    },

    # ─── Company Policies ───────────────────────────────────────────────────
    {
        "id": "company_policies",
        "content": """
LuxeStone — Company Policies

SHIPPING:
- All orders ship free with full insurance coverage.
- Standard delivery: 5-7 business days.
- Expedited delivery: 2-3 business days (additional charge).
- All rings are shipped in secure, tamper-evident packaging.
- Signature required on delivery.
- Shipping to all US states and international destinations.

RETURNS & EXCHANGES:
- 30-day no-questions-asked return policy from delivery date.
- Item must be in original unworn condition with all original packaging.
- Free return shipping label provided.
- Full refund processed within 5-7 business days.
- Ring resizing is free within 60 days of purchase.

WARRANTY:
- Lifetime warranty covering manufacturing defects.
- Free annual cleaning and inspection.
- Diamond replacement guarantee: if a side stone falls out within 1 year, replaced free.
- Main stone replacement at our discretion for manufacturing-related issues.

PAYMENT:
- Secure payment processing for all major credit cards.
- Financing available through partner lenders (0% APR for 12 months on orders over $1,000).
- Affirm, Klarna, and Afterpay buy-now-pay-later options available.
- All transactions secured with bank-grade encryption.

CUSTOMER SUPPORT:
- Available 24/7 via chat.
- Phone: +1 (234) 567-8900
- Email: hello@luxestone.com
- Response time: within 2 hours for chat, 4 hours for email.
        """,
        "metadata": {"category": "policy", "topic": "company_policies"},
    },
    {
        "id": "buying_guide",
        "content": """
LuxeStone Diamond Buying Guide

BUDGET ALLOCATION RECOMMENDATION:
For a 1.00 ct Excellent/Very Good cut, G-H color, VS1-VS2 clarity lab-grown diamond:
- Budget range: $2,500 - $4,500 for the diamond.
- Setting: $500 - $2,000 depending on style and metal.
- Total ring: $3,000 - $6,500.

BEST VALUE COMBINATIONS (for different budgets):
Under $3,000: 0.70-0.80 ct, Good-Very Good cut, G-H color, SI1-SI2 clarity
$3,000-$5,000: 1.00 ct, Very Good-Excellent cut, G-H color, VS1-VS2 clarity
$5,000-$8,000: 1.25-1.50 ct, Excellent cut, F-G color, VS1 clarity
$8,000+: 2.00+ ct, Excellent cut, D-F color, VVS2-VS1 clarity

STEP-BY-STEP PROCESS:
1. Set your budget.
2. Choose diamond shape (this is the most personal preference).
3. Prioritize cut quality — never compromise on cut.
4. Choose color grade (G-H offers best value for white gold; H-I works in yellow gold).
5. Choose clarity (VS2 or SI1 is usually eye-clean and offers great value).
6. Select carat weight to fit remaining budget.
7. Choose setting style and metal.
8. Select ring size.

Our AI configurator walks you through each step with live pricing.
        """,
        "metadata": {"category": "guide", "topic": "buying_guide"},
    },
    {
        "id": "pricing_transparency",
        "content": """
LuxeStone Pricing Transparency

HOW OUR PRICING ENGINE WORKS:
LuxeStone uses a transparent quality-multiplier pricing formula:

Diamond Price = Base Price Per Carat × Carat Weight × Cut+Color Multiplier × Clarity Adjustment × Size Premium

QUALITY MULTIPLIERS (Cut + Color combinations):
- Excellent cut + D color = 1.15× multiplier
- Excellent cut + G color = 1.12×
- Very Good cut + G color = 1.05×
- Good cut + G color = 0.98×

CLARITY ADJUSTMENTS:
- IF (Internally Flawless): +5% (1.05×)
- VVS1: +4% (1.04×)
- VS1: +1% (1.01×)
- VS2: baseline (1.00×)
- SI1: -2% (0.98×)
- SI2: -5% (0.95×)

SIZE PREMIUMS (magic sizes):
- 1.00 ct round: +10% premium
- 2.00 ct round: +15% premium

WHAT THIS MEANS FOR YOU:
Every price you see on LuxeStone includes these quality adjustments. There are no hidden fees
or price changes at checkout. The price displayed is the price you pay.

Setting prices are the base price listed. Ring size surcharges (sizes 8+) are added at checkout.
        """,
        "metadata": {"category": "policy", "topic": "pricing"},
    },
]
