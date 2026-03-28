# diamond-backend/rings/email_service.py
# Drop this file into your rings/ app directory.

import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  HTML email templates (inline — no template files needed)
# ─────────────────────────────────────────────

def _base_html(content: str, title: str) -> str:
    """Wraps content in a minimal, mobile-friendly HTML shell."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5; color: #1a1a1a; line-height: 1.6; }}
    .wrapper {{ max-width: 600px; margin: 32px auto; background: #ffffff;
                border-radius: 12px; overflow: hidden;
                box-shadow: 0 2px 12px rgba(0,0,0,.08); }}
    .header  {{ background: linear-gradient(135deg, #0284c7, #0369a1);
                padding: 36px 32px; text-align: center; }}
    .header h1 {{ color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }}
    .header p  {{ color: #bae6fd; font-size: 14px; margin-top: 6px; }}
    .gem  {{ font-size: 32px; display: block; margin-bottom: 12px; }}
    .body {{ padding: 36px 32px; }}
    .section {{ margin-bottom: 28px; }}
    .section h2 {{ font-size: 16px; font-weight: 600; color: #0369a1;
                   border-bottom: 1px solid #e0f2fe; padding-bottom: 8px; margin-bottom: 14px; }}
    .row {{ display: flex; justify-content: space-between; align-items: flex-start;
            padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }}
    .row:last-child {{ border-bottom: none; }}
    .row .label {{ color: #64748b; }}
    .row .value {{ font-weight: 500; color: #1a1a1a; text-align: right; max-width: 60%; }}
    .total-row {{ background: #f0f9ff; border-radius: 8px; padding: 12px 16px;
                  display: flex; justify-content: space-between; margin-top: 12px; }}
    .total-row .label {{ font-weight: 600; color: #0369a1; font-size: 15px; }}
    .total-row .value {{ font-weight: 700; color: #0284c7; font-size: 18px; }}
    .status-badge {{ display: inline-block; background: #dcfce7; color: #166534;
                     border-radius: 20px; padding: 4px 14px; font-size: 13px;
                     font-weight: 600; margin-top: 4px; }}
    .cta {{ text-align: center; margin: 28px 0 8px; }}
    .cta a {{ display: inline-block; background: #0284c7; color: #ffffff;
               text-decoration: none; padding: 14px 32px; border-radius: 8px;
               font-weight: 600; font-size: 15px; }}
    .features {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
                 margin: 24px 0; }}
    .feat {{ text-align: center; padding: 16px 8px; background: #f8fafc;
             border-radius: 8px; }}
    .feat .icon {{ font-size: 20px; }}
    .feat p {{ font-size: 12px; color: #64748b; margin-top: 6px; }}
    .footer {{ background: #f8fafc; padding: 24px 32px; text-align: center;
               font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
    .footer a {{ color: #0284c7; text-decoration: none; }}
    @media (max-width: 480px) {{
      .body {{ padding: 24px 20px; }}
      .features {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    {content}
    <div class="footer">
      <p>© {timezone.now().year} LuxeStone — Lab-Grown Diamond Engagement Rings</p>
      <p style="margin-top:6px">
        <a href="#">Privacy Policy</a> &nbsp;·&nbsp;
        <a href="#">Terms of Service</a> &nbsp;·&nbsp;
        <a href="#">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>"""


def _order_confirmation_html(order, items) -> str:
    """Full HTML body for order-confirmation emails."""
    customer_name = (
        f"{order.customer_first_name or ''} {order.customer_last_name or ''}".strip()
        or order.customer_email
    )

    # Build items rows
    item_rows = ""
    for item in items:
        desc = item.item_description or "Ring"
        item_rows += f"""
        <div class="row">
          <span class="label">{desc}</span>
          <span class="value">${float(item.item_total):,.2f}</span>
        </div>"""

    # Shipping address
    addr_parts = [
        order.shipping_address_line1,
        order.shipping_address_line2,
        f"{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}",
        order.shipping_country,
    ]
    shipping_addr = "<br>".join(p for p in addr_parts if p and p.strip(", "))

    content = f"""
    <div class="header">
      <span class="gem">💎</span>
      <h1>LuxeStone</h1>
      <p>Lab-Grown Diamond Engagement Rings</p>
    </div>
    <div class="body">
      <div class="section">
        <h2>Order confirmed!</h2>
        <p style="font-size:15px;color:#334155">
          Hi {customer_name}, your order has been received and is being prepared.
          You'll receive a shipping notification once it's on its way.
        </p>
        <div style="margin-top:12px">
          <div class="row">
            <span class="label">Order number</span>
            <span class="value" style="font-family:monospace;color:#0284c7">{order.order_number}</span>
          </div>
          <div class="row">
            <span class="label">Order status</span>
            <span class="value"><span class="status-badge">{(order.status or 'confirmed').title()}</span></span>
          </div>
          <div class="row">
            <span class="label">Order date</span>
            <span class="value">{timezone.now().strftime('%B %d, %Y')}</span>
          </div>
          <div class="row">
            <span class="label">Payment</span>
            <span class="value">{(order.payment_method or 'Credit card').replace('_', ' ').title()}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Items ordered</h2>
        {item_rows if item_rows else '<p style="color:#64748b;font-size:14px">Ring configuration</p>'}
        <div class="row" style="margin-top:8px">
          <span class="label">Subtotal</span>
          <span class="value">${float(order.subtotal or 0):,.2f}</span>
        </div>
        <div class="row">
          <span class="label">Tax</span>
          <span class="value">${float(order.tax_amount or 0):,.2f}</span>
        </div>
        <div class="row">
          <span class="label">Shipping</span>
          <span class="value">{('FREE' if float(order.shipping_cost or 0) == 0 else f"${float(order.shipping_cost):,.2f}")}</span>
        </div>
        <div class="total-row">
          <span class="label">Total charged</span>
          <span class="value">${float(order.total_amount):,.2f}</span>
        </div>
      </div>

      <div class="section">
        <h2>Shipping address</h2>
        <p style="font-size:14px;color:#334155;line-height:1.7">{shipping_addr}</p>
      </div>

      <div class="features">
        <div class="feat"><div class="icon">🚚</div><p>Free insured shipping</p></div>
        <div class="feat"><div class="icon">🔄</div><p>30-day returns</p></div>
        <div class="feat"><div class="icon">💎</div><p>Lifetime warranty</p></div>
      </div>

      <div class="cta">
        <a href="{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/account">View Your Order</a>
      </div>

      <p style="font-size:13px;color:#94a3b8;text-align:center;margin-top:16px">
        Questions? Reply to this email or contact us at
        <a href="mailto:{settings.DEFAULT_FROM_EMAIL}" style="color:#0284c7">
          {settings.DEFAULT_FROM_EMAIL}
        </a>
      </p>
    </div>"""

    return _base_html(content, f"Order {order.order_number} confirmed — LuxeStone")


def _followup_html(order) -> str:
    """24-hour follow-up / review-request email."""
    customer_name = (
        f"{order.customer_first_name or ''}".strip() or "there"
    )
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

    content = f"""
    <div class="header">
      <span class="gem">💎</span>
      <h1>LuxeStone</h1>
      <p>Lab-Grown Diamond Engagement Rings</p>
    </div>
    <div class="body">
      <div class="section">
        <h2>How are you feeling, {customer_name}?</h2>
        <p style="font-size:15px;color:#334155">
          It's been a little while since you placed order
          <strong style="color:#0284c7">{order.order_number}</strong>.
          We hope everything is going smoothly — we're here if you need anything.
        </p>
      </div>

      <div class="section">
        <h2>Order status</h2>
        <div class="row">
          <span class="label">Current status</span>
          <span class="value"><span class="status-badge">{(order.status or 'processing').title()}</span></span>
        </div>
        <div class="row">
          <span class="label">Order number</span>
          <span class="value" style="font-family:monospace;color:#0284c7">{order.order_number}</span>
        </div>
        <div class="row">
          <span class="label">Total</span>
          <span class="value">${float(order.total_amount):,.2f}</span>
        </div>
      </div>

      <div class="section">
        <h2>While you wait…</h2>
        <div class="features">
          <div class="feat"><div class="icon">📏</div><p>Check our ring size guide</p></div>
          <div class="feat"><div class="icon">📖</div><p>Learn the 4Cs</p></div>
          <div class="feat"><div class="icon">💬</div><p>Chat with an expert</p></div>
        </div>
      </div>

      <div class="cta">
        <a href="{frontend}/account">Track Your Order</a>
      </div>

      <div style="margin-top:28px;padding:20px;background:#f0f9ff;border-radius:8px;text-align:center">
        <p style="font-size:14px;color:#0369a1;font-weight:600;margin-bottom:8px">
          Share your experience
        </p>
        <p style="font-size:13px;color:#64748b">
          If you've already received your ring, we'd love to hear what you think.
        </p>
        <a href="{frontend}/reviews/new?order={order.order_number}"
           style="display:inline-block;margin-top:12px;background:#0284c7;color:#fff;
                  text-decoration:none;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:600">
          Leave a Review
        </a>
      </div>
    </div>"""

    return _base_html(content, f"Your LuxeStone order {order.order_number} — update")


# ─────────────────────────────────────────────
#  Public API
# ─────────────────────────────────────────────

def send_order_confirmation(order) -> bool:
    """
    Send an HTML order-confirmation email immediately after an order is created.

    Usage (in OrderViewSet.perform_create):
        from .email_service import send_order_confirmation
        send_order_confirmation(serializer.instance)

    Returns True on success, False on any error.
    """
    try:
        recipient = order.customer_email
        if not recipient:
            logger.warning("send_order_confirmation: no customer_email on order %s", order.order_number)
            return False

        items = list(getattr(order, 'items', order.__class__.objects.none()).all()) \
            if hasattr(order, 'items') else []

        subject = f"Your LuxeStone order {order.order_number} is confirmed! 💎"

        # Plain-text fallback
        plain = (
            f"Hi {order.customer_first_name or 'there'},\n\n"
            f"Your order {order.order_number} has been confirmed.\n"
            f"Total: ${float(order.total_amount):,.2f}\n\n"
            "Thank you for choosing LuxeStone!\n\n"
            "— The LuxeStone Team"
        )

        html = _order_confirmation_html(order, items)

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@luxestone.com')
        msg = EmailMultiAlternatives(subject, plain, from_email, [recipient])
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=False)

        logger.info("Order confirmation sent to %s for order %s", recipient, order.order_number)
        return True

    except Exception as exc:
        logger.error(
            "Failed to send order confirmation for %s: %s",
            getattr(order, 'order_number', '?'), exc, exc_info=True
        )
        return False


def send_order_followup(order) -> bool:
    """
    Send a follow-up / review-request email ~24 hours after the order.

    Intended to be called from a management command or Celery task:

        from rings.email_service import send_order_followup
        send_order_followup(order)

    Returns True on success, False on any error.
    """
    try:
        recipient = order.customer_email
        if not recipient:
            return False

        subject = f"How's your LuxeStone order going? 💍 ({order.order_number})"
        plain = (
            f"Hi {order.customer_first_name or 'there'},\n\n"
            f"Just checking in on your order {order.order_number}.\n"
            f"Current status: {order.status or 'processing'}\n\n"
            "If you have any questions, just reply to this email.\n\n"
            "— The LuxeStone Team"
        )
        html = _followup_html(order)

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@luxestone.com')
        msg = EmailMultiAlternatives(subject, plain, from_email, [recipient])
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=False)

        logger.info("Follow-up email sent to %s for order %s", recipient, order.order_number)
        return True

    except Exception as exc:
        logger.error(
            "Failed to send follow-up for %s: %s",
            getattr(order, 'order_number', '?'), exc, exc_info=True
        )
        return False