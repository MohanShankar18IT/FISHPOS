from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any


class PricingService:
    @staticmethod
    def calculate_line_item(
        weight_kg: Decimal,
        unit_price: Decimal,
        discount_amount: Decimal = Decimal("0.00"),
        tax_rate_percent: Decimal = Decimal("5.00")
    ) -> Dict[str, Decimal]:
        """
        Authoritatively calculates fish line item totals using exact decimal arithmetic.
        Formula:
          Base Amount = Weight * Unit Price
          Taxable Amount = Base Amount - Discount
          Tax Amount = Taxable Amount * (Tax Rate / 100)
          Subtotal = Taxable Amount + Tax Amount
        """
        base_amount = (weight_kg * unit_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        taxable_amount = max(Decimal("0.00"), base_amount - discount_amount)
        tax_multiplier = tax_rate_percent / Decimal("100.00")
        tax_amount = (taxable_amount * tax_multiplier).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        subtotal = taxable_amount + tax_amount

        return {
            "base_amount": base_amount,
            "taxable_amount": taxable_amount,
            "tax_amount": tax_amount,
            "subtotal": subtotal
        }

    @staticmethod
    def calculate_sale_totals(
        item_subtotals: list[Decimal],
        item_taxes: list[Decimal],
        overall_discount: Decimal = Decimal("0.00")
    ) -> Dict[str, Decimal]:
        raw_subtotal = sum(item_subtotals)
        raw_tax = sum(item_taxes)
        discounted_total = max(Decimal("0.00"), raw_subtotal - overall_discount)
        
        # Round off to nearest integer for retail cash/card payment
        grand_total = discounted_total.quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)
        round_off = (grand_total - discounted_total).quantize(Decimal("0.01"))

        return {
            "subtotal": raw_subtotal,
            "discount_amount": overall_discount,
            "tax_amount": raw_tax,
            "round_off": round_off,
            "grand_total": grand_total
        }
