# diamond-backend/rings/services/pricing.py

from decimal import Decimal

class PricingEngine:
    """
    Diamond pricing calculator with quality multipliers
    Formula: Price = (Base Price Per Carat) × (Carat Weight) × (Quality Multiplier)
    """
    
    # Quality Multipliers based on Cut and Color combinations
    QUALITY_MULTIPLIERS = {
        # (cut, color) → multiplier
        ('Excellent', 'D'): Decimal('1.15'),
        ('Excellent', 'E'): Decimal('1.14'),
        ('Excellent', 'F'): Decimal('1.13'),
        ('Excellent', 'G'): Decimal('1.12'),
        ('Excellent', 'H'): Decimal('1.10'),
        ('Excellent', 'I'): Decimal('1.08'),
        
        ('Very Good', 'D'): Decimal('1.08'),
        ('Very Good', 'E'): Decimal('1.07'),
        ('Very Good', 'F'): Decimal('1.06'),
        ('Very Good', 'G'): Decimal('1.05'),
        ('Very Good', 'H'): Decimal('1.03'),
        ('Very Good', 'I'): Decimal('1.01'),
        
        ('Good', 'D'): Decimal('1.00'),
        ('Good', 'E'): Decimal('1.00'),
        ('Good', 'F'): Decimal('0.99'),
        ('Good', 'G'): Decimal('0.98'),
        ('Good', 'H'): Decimal('0.96'),
        ('Good', 'I'): Decimal('0.94'),
        
        ('Fair', 'D'): Decimal('0.85'),
        ('Fair', 'E'): Decimal('0.84'),
        ('Fair', 'F'): Decimal('0.82'),
        ('Fair', 'G'): Decimal('0.80'),
        ('Fair', 'H'): Decimal('0.78'),
        ('Fair', 'I'): Decimal('0.75'),
    }
    
    # Clarity adjustments (additional multiplier on top of cut/color)
    CLARITY_ADJUSTMENTS = {
        'IF': Decimal('1.05'),      # Internally Flawless
        'VVS1': Decimal('1.04'),    # Very Very Slightly Included 1
        'VVS2': Decimal('1.03'),
        'VS1': Decimal('1.01'),     # Very Slightly Included 1
        'VS2': Decimal('1.00'),
        'SI1': Decimal('0.98'),     # Slightly Included 1
        'SI2': Decimal('0.95'),
        'I1': Decimal('0.90'),      # Included
    }
    
    # Size premium (magic sizes command higher prices)
    SIZE_PREMIUMS = {
        'round': {
            0.5: Decimal('1.0'),      # No premium for 0.5ct
            1.0: Decimal('1.1'),      # 10% premium for 1.0ct
            1.5: Decimal('1.05'),     # 5% premium for 1.5ct
            2.0: Decimal('1.15'),     # 15% premium for 2.0ct
        },
        'cushion': {
            1.0: Decimal('1.05'),
            2.0: Decimal('1.10'),
        },
        # Add other shapes as needed
    }
    
    @staticmethod
    def get_quality_multiplier(cut, color):
        """
        Get base quality multiplier for cut + color combination
        
        Args:
            cut: str (e.g., 'Excellent', 'Very Good', 'Good', 'Fair')
            color: str (e.g., 'D', 'E', 'F', 'G', etc.)
        
        Returns:
            Decimal: multiplier value
        """
        key = (cut, color)
        return PricingEngine.QUALITY_MULTIPLIERS.get(key, Decimal('1.0'))
    
    @staticmethod
    def get_clarity_adjustment(clarity):
        """
        Get clarity adjustment multiplier
        
        Args:
            clarity: str (e.g., 'VS1', 'SI1', 'IF')
        
        Returns:
            Decimal: multiplier value
        """
        return PricingEngine.CLARITY_ADJUSTMENTS.get(clarity, Decimal('1.0'))
    
    @staticmethod
    def get_size_premium(carat, shape='round'):
        """
        Get size premium for specific carat weight and shape
        
        Args:
            carat: float or Decimal
            shape: str (default 'round')
        
        Returns:
            Decimal: premium multiplier
        """
        shape_premiums = PricingEngine.SIZE_PREMIUMS.get(shape.lower(), {})
        
        # Find exact match or return 1.0
        carat_decimal = Decimal(str(carat))
        for carat_key, premium in shape_premiums.items():
            if abs(carat_decimal - Decimal(str(carat_key))) < Decimal('0.01'):
                return premium
        
        return Decimal('1.0')
    
    @staticmethod
    def calculate_diamond_price(diamond):
        """
        Calculate final diamond price with all multipliers
        
        Formula:
        Final Price = Base Price Per Carat 
                     × Carat Weight 
                     × Quality Multiplier (Cut + Color)
                     × Clarity Adjustment
                     × Size Premium
        
        Args:
            diamond: Diamond model instance
        
        Returns:
            Decimal: calculated price
        """
        # Base price per carat (from database)
        base_price = Decimal(str(diamond.base_price))
        carat = Decimal(str(diamond.carat))
        
        # Get multipliers
        quality_mult = PricingEngine.get_quality_multiplier(
            diamond.cut,
            diamond.color
        )
        clarity_adj = PricingEngine.get_clarity_adjustment(diamond.clarity)
        size_premium = PricingEngine.get_size_premium(carat, diamond.shape)
        
        # Calculate final price
        final_price = base_price * carat * quality_mult * clarity_adj * size_premium
        
        # Round to 2 decimal places
        return final_price.quantize(Decimal('0.01'))
    
    @staticmethod
    def calculate_ring_price(diamond, setting, ring_size=None, customizations=None):
        """
        Calculate complete ring price (diamond + setting + customizations)
        
        Args:
            diamond: Diamond model instance
            setting: Setting model instance
            ring_size: str (e.g., '7') - optional for size surcharge
            customizations: dict (e.g., {'engraving': 200, 'upgrade_band': 500})
        
        Returns:
            dict: {
                'diamond_price': Decimal,
                'setting_price': Decimal,
                'ring_size_surcharge': Decimal,
                'customization_total': Decimal,
                'subtotal': Decimal,
                'tax': Decimal (if calculated),
                'total': Decimal
            }
        """
        # Calculate diamond price
        diamond_price = PricingEngine.calculate_diamond_price(diamond)
        
        # Setting price (use base_price from database)
        setting_price = Decimal(str(setting.base_price))
        
        # Ring size surcharge (if applicable)
        ring_size_surcharge = PricingEngine.calculate_ring_size_surcharge(ring_size)
        
        # Customizations total
        customization_total = Decimal('0')
        if customizations:
            customization_total = sum(
                Decimal(str(v)) for v in customizations.values()
            )
        
        # Subtotal
        subtotal = diamond_price + setting_price + ring_size_surcharge + customization_total
        
        return {
            'diamond_price': diamond_price,
            'setting_price': setting_price,
            'ring_size_surcharge': ring_size_surcharge,
            'customization_total': customization_total,
            'subtotal': subtotal,
            'total': subtotal,  # Tax can be added by caller based on location
        }
    
    @staticmethod
    def calculate_ring_size_surcharge(ring_size):
        """
        Calculate surcharge for larger ring sizes
        
        Args:
            ring_size: str (e.g., '7', '8', '12')
        
        Returns:
            Decimal: surcharge amount
        """
        if not ring_size:
            return Decimal('0')
        
        try:
            size = int(ring_size)
            
            # Size surcharges (in dollars)
            if size <= 7:
                return Decimal('0')      # No surcharge
            elif size <= 9:
                return Decimal('50')     # $50 for sizes 8-9
            elif size <= 11:
                return Decimal('100')    # $100 for sizes 10-11
            else:
                return Decimal('150')    # $150 for sizes 12+
        except (ValueError, TypeError):
            return Decimal('0')
    
    @staticmethod
    def get_price_breakdown(diamond, setting, ring_size=None):
        """
        Get human-readable price breakdown for display
        
        Args:
            diamond: Diamond model instance
            setting: Setting model instance
            ring_size: str (optional)
        
        Returns:
            dict: formatted breakdown
        """
        pricing = PricingEngine.calculate_ring_price(
            diamond, setting, ring_size
        )
        
        return {
            'items': [
                {
                    'name': f"{diamond.carat}ct {diamond.shape} Diamond",
                    'description': f"{diamond.cut} Cut, {diamond.color} Color, {diamond.clarity} Clarity",
                    'price': float(pricing['diamond_price'])
                },
                {
                    'name': setting.name,
                    'description': f"{setting.metal_type} Setting",
                    'price': float(pricing['setting_price'])
                },
            ],
            'surcharges': [],
            'subtotal': float(pricing['subtotal']),
            'total': float(pricing['total']),
        }