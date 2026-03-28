# diamond-backend/rings/management/commands/send_followup_emails.py
# Run with: python manage.py send_followup_emails
# Schedule with cron or a task scheduler.

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Send 24-hour follow-up emails for orders that haven't received one yet."

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours-after',
            type=int,
            default=24,
            help='Hours after order creation to send follow-up (default: 24)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print qualifying orders without sending emails',
        )

    def handle(self, *args, **options):
        from rings.models import Order
        from rings.email_service import send_order_followup

        hours = options['hours_after']
        dry_run = options['dry_run']

        now = timezone.now()
        window_start = now - timedelta(hours=hours + 2)   # slight buffer
        window_end   = now - timedelta(hours=hours)

        # Orders created in the target window that are not cancelled
        orders = Order.objects.filter(
            created_at__gte=window_start,
            created_at__lte=window_end,
            customer_email__isnull=False,
        ).exclude(status='cancelled').exclude(customer_email='')

        self.stdout.write(
            self.style.NOTICE(
                f"Found {orders.count()} order(s) in the {hours}-hour follow-up window "
                f"({'DRY RUN' if dry_run else 'SENDING'})"
            )
        )

        sent = 0
        failed = 0
        for order in orders:
            if dry_run:
                self.stdout.write(f"  Would email: {order.customer_email} — {order.order_number}")
                continue

            ok = send_order_followup(order)
            if ok:
                sent += 1
                self.stdout.write(self.style.SUCCESS(f"  ✓ {order.order_number} → {order.customer_email}"))
            else:
                failed += 1
                self.stdout.write(self.style.ERROR(f"  ✗ {order.order_number} — failed"))

        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(f"\nDone — sent: {sent}, failed: {failed}")
            )