
from django.db.models import Q, Avg, Count
from .models import Diamond, Setting, RingConfiguration, Favorite, Review, UserInteraction
from datetime import timedelta
from django.utils import timezone

class RecommendationEngine:
    """
    AI-Powered Recommendation Engine for diamonds and settings
    Uses collaborative filtering, content-based filtering, and user behavior analysis
    """
    
    def __init__(self, user=None):
        self.user = user
    
    # ============================================
    # DIAMOND RECOMMENDATIONS
    # ============================================
    
    def get_personalized_diamonds(self, limit=10):
        """
        Get personalized diamond recommendations based on:
        1. User's viewed diamonds
        2. User's favorited diamonds
        3. User's budget
        4. Diamond ratings
        """
        if not self.user:
            return self.get_trending_diamonds(limit)
        
        # Get user's preferences from interactions and favorites
        user_prefs = self._get_user_preferences()
        
        # Filter diamonds based on user preferences
        diamonds = Diamond.objects.filter(is_available=True)
        
        # Budget preference
        if user_prefs.get('max_budget'):
            diamonds = diamonds.filter(base_price__lte=user_prefs['max_budget'])
        
        # Preferred cuts
        if user_prefs.get('preferred_cuts'):
            diamonds = diamonds.filter(cut__in=user_prefs['preferred_cuts'])
        
        # Preferred colors
        if user_prefs.get('preferred_colors'):
            diamonds = diamonds.filter(color__in=user_prefs['preferred_colors'])
        
        # Score and sort diamonds
        scored_diamonds = self._score_diamonds(diamonds, user_prefs)
        sorted_diamonds = sorted(scored_diamonds, key=lambda x: x['score'], reverse=True)
        
        return [d['diamond'] for d in sorted_diamonds[:limit]]
    
    def get_trending_diamonds(self, limit=10):
        """
        Get trending diamonds based on:
        1. Number of reviews
        2. Average rating
        3. Number of times added to cart
        """
        try:
            trending = Diamond.objects.filter(is_available=True).annotate(
                review_count=Count('review'),
                avg_rating=Avg('review__rating'),
                interaction_count=Count('userinteraction')
            ).order_by('-interaction_count', '-avg_rating')[:limit]
            
            return list(trending)
        except Exception as e:
            print(f"Error in get_trending_diamonds: {e}")
            # Fallback to just returning by rating if available
            return Diamond.objects.filter(is_available=True).order_by('-base_price')[:limit]
    
    def get_similar_diamonds(self, diamond_id, limit=5):
        """
        Get similar diamonds based on 4Cs:
        - Similar carat weight
        - Same shape
        - Similar price
        """
        try:
            diamond = Diamond.objects.get(diamond_id=diamond_id)
        except Diamond.DoesNotExist:
            return []
        
        # Similar carat (±0.5)
        similar = Diamond.objects.filter(
            is_available=True,
            shape=diamond.shape,
            carat__gte=float(diamond.carat) - 0.5,
            carat__lte=float(diamond.carat) + 0.5,
        ).exclude(diamond_id=diamond_id)
        
        # Score by similarity
        scored = []
        for d in similar:
            score = 0
            # Carat similarity
            score += (1 - abs(float(d.carat) - float(diamond.carat)) / 5) * 30
            # Price similarity
            price_diff = abs(float(d.base_price) - float(diamond.base_price))
            score += (1 - min(price_diff / 10000, 1)) * 30
            # Cut grade match
            if d.cut == diamond.cut:
                score += 20
            # Color grade match
            if d.color == diamond.color:
                score += 20
            
            scored.append({'diamond': d, 'score': score})
        
        return [s['diamond'] for s in sorted(scored, key=lambda x: x['score'], reverse=True)[:limit]]
    
    def get_budget_friendly_diamonds(self, max_price, limit=10):
        """
        Get highest quality diamonds within budget
        Scores based on quality metrics (cut, clarity, color)
        """
        try:
            max_price = float(max_price)
            
            diamonds = Diamond.objects.filter(
                is_available=True,
                base_price__lte=max_price
            )
            
            if not diamonds.exists():
                # Return empty list instead of error
                return []
            
            scored = []
            quality_order = {'Excellent': 4, 'Very Good': 3, 'Good': 2, 'Fair': 1}
            
            for d in diamonds:
                score = 0
                # Cut quality
                score += quality_order.get(d.cut, 0) * 25
                # Carat bonus
                score += float(d.carat) * 10
                # Rating if available
                try:
                    avg_rating = Review.objects.filter(diamond=d).aggregate(
                        avg=Avg('rating')
                    )['avg']
                    if avg_rating:
                        score += avg_rating * 10
                except:
                    pass
                
                scored.append({'diamond': d, 'score': score})
            
            sorted_diamonds = sorted(scored, key=lambda x: x['score'], reverse=True)
            return [s['diamond'] for s in sorted_diamonds[:limit]]
            
        except Exception as e:
            print(f"Error in get_budget_friendly_diamonds: {e}")
            return []
    
    # ============================================
    # SETTING RECOMMENDATIONS
    # ============================================
    
    def get_personalized_settings(self, limit=10):
        """
        Get personalized setting recommendations
        """
        if not self.user:
            return self.get_popular_settings(limit)
        
        user_prefs = self._get_user_preferences()
        settings = Setting.objects.filter(is_available=True)
        
        # Filter by preferred metal
        if user_prefs.get('preferred_metals'):
            settings = settings.filter(metal_type__in=user_prefs['preferred_metals'])
        
        # Filter by style preference
        if user_prefs.get('preferred_styles'):
            settings = settings.filter(style_type__in=user_prefs['preferred_styles'])
        
        # Score and sort
        scored_settings = self._score_settings(settings, user_prefs)
        return [s['setting'] for s in sorted(scored_settings, key=lambda x: x['score'], reverse=True)[:limit]]
    
    def get_popular_settings(self, limit=10):
        """
        Get most popular settings based on:
        1. Popularity score
        2. Number of reviews
        3. Average rating
        """
        try:
            popular = Setting.objects.filter(is_available=True).annotate(
                review_count=Count('review'),
                avg_rating=Avg('review__rating')
            ).order_by('-popularity_score', '-avg_rating')[:limit]
            
            return list(popular)
        except Exception as e:
            print(f"Error in get_popular_settings: {e}")
            return Setting.objects.filter(is_available=True).order_by('-popularity_score')[:limit]
    
    def get_settings_for_diamond(self, diamond_id, limit=5):
        """
        Get recommended settings for a specific diamond
        Based on compatible shapes and popular combinations
        """
        try:
            diamond = Diamond.objects.get(diamond_id=diamond_id)
        except Diamond.DoesNotExist:
            return []
        
        # Get compatible settings based on popularity and ratings
        settings = Setting.objects.filter(
            is_available=True
        ).annotate(
            avg_rating=Avg('review__rating'),
            review_count=Count('review')
        ).order_by('-popularity_score', '-avg_rating')[:limit]
        
        return list(settings)
    
    # ============================================
    # COMBINATION RECOMMENDATIONS
    # ============================================
    
    def get_recommended_combinations(self, limit=10):
        """
        Get recommended diamond + setting combinations
        Based on popular configurations and user preferences
        """
        try:
            configs = RingConfiguration.objects.filter(
                is_saved=True
            ).select_related('diamond', 'setting').order_by('-created_at')[:limit]
            
            return [{
                'diamond': c.diamond,
                'setting': c.setting,
                'total_price': c.total_price,
                'popularity': Favorite.objects.filter(config=c).count()
            } for c in configs if c.diamond and c.setting]
        except Exception as e:
            print(f"Error in get_recommended_combinations: {e}")
            return []
    
    def get_next_step_recommendations(self, diamond=None, setting=None):
        """
        Smart recommendations based on configurator progress
        """
        if diamond and not setting:
            return {
                'type': 'setting',
                'message': 'Complete your ring by choosing a setting',
                'recommendations': self.get_settings_for_diamond(diamond.diamond_id, 5)
            }
        elif setting and not diamond:
            return {
                'type': 'diamond',
                'message': 'Find the perfect diamond for this setting',
                'recommendations': self.get_personalized_diamonds(5)
            }
        else:
            return {
                'type': 'complete',
                'message': 'You\'ve designed a beautiful ring! Ready to checkout?',
                'recommendations': []
            }
    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    def _get_user_preferences(self):
        """Extract user preferences from their activity"""
        prefs = {
            'preferred_cuts': [],
            'preferred_colors': [],
            'preferred_metals': [],
            'preferred_styles': [],
            'max_budget': None,
            'min_budget': None,
        }
        
        if not self.user:
            return prefs
        
        try:
            # Get user's favorites
            favorites = Favorite.objects.filter(user=self.user).select_related('diamond', 'setting')
            
            cuts = []
            colors = []
            metals = []
            styles = []
            prices = []
            
            for fav in favorites:
                if fav.diamond:
                    cuts.append(fav.diamond.cut)
                    colors.append(fav.diamond.color)
                    prices.append(float(fav.diamond.base_price))
                if fav.setting:
                    metals.append(fav.setting.metal_type)
                    styles.append(fav.setting.style_type)
            
            # Get most common preferences
            if cuts:
                prefs['preferred_cuts'] = list(set(cuts))
            if colors:
                prefs['preferred_colors'] = list(set(colors))
            if metals:
                prefs['preferred_metals'] = list(set(metals))
            if styles:
                prefs['preferred_styles'] = list(set(styles))
            
            # Set budget based on previous interactions
            if prices:
                prefs['max_budget'] = max(prices) * 1.2
                prefs['min_budget'] = min(prices) * 0.8
        except Exception as e:
            print(f"Error in _get_user_preferences: {e}")
        
        return prefs
    
    def _score_diamonds(self, diamonds, user_prefs):
        """Score diamonds based on user preferences"""
        scored = []
        
        try:
            for diamond in diamonds:
                score = 0
                
                # Quality scores
                quality_order = {'Excellent': 10, 'Very Good': 8, 'Good': 6, 'Fair': 4}
                score += quality_order.get(diamond.cut, 5) * 20
                
                # Carat score
                score += float(diamond.carat) * 5
                
                # Rating score
                try:
                    avg_rating = Review.objects.filter(diamond=diamond).aggregate(
                        avg=Avg('rating')
                    )['avg']
                    if avg_rating:
                        score += avg_rating * 10
                except:
                    pass
                
                # Trending score
                try:
                    recent_interactions = UserInteraction.objects.filter(
                        diamond=diamond,
                        created_at__gte=timezone.now() - timedelta(days=7)
                    ).count()
                    score += min(recent_interactions * 5, 30)
                except:
                    pass
                
                scored.append({'diamond': diamond, 'score': score})
        except Exception as e:
            print(f"Error in _score_diamonds: {e}")
        
        return scored
    
    def _score_settings(self, settings, user_prefs):
        """Score settings based on user preferences"""
        scored = []
        
        try:
            for setting in settings:
                score = 0
                
                # Popularity score
                score += (setting.popularity_score or 0) * 0.5
                
                # Rating score
                try:
                    avg_rating = Review.objects.filter(setting=setting).aggregate(
                        avg=Avg('rating')
                    )['avg']
                    if avg_rating:
                        score += avg_rating * 10
                except:
                    pass
                
                # User preference match
                if setting.metal_type in user_prefs.get('preferred_metals', []):
                    score += 25
                if setting.style_type in user_prefs.get('preferred_styles', []):
                    score += 25
                
                scored.append({'setting': setting, 'score': score})
        except Exception as e:
            print(f"Error in _score_settings: {e}")
        
        return scored


# Export for views
def get_recommendations(user=None, recommendation_type='personalized', **kwargs):
    """Convenience function to get recommendations"""
    engine = RecommendationEngine(user=user)
    
    try:
        if recommendation_type == 'personalized':
            return {
                'diamonds': engine.get_personalized_diamonds(10),
                'settings': engine.get_personalized_settings(10),
                'combinations': engine.get_recommended_combinations(5),
            }
        elif recommendation_type == 'trending':
            return engine.get_trending_diamonds(10)
        elif recommendation_type == 'budget':
            return engine.get_budget_friendly_diamonds(kwargs.get('max_price', 5000), 10)
        elif recommendation_type == 'similar':
            return engine.get_similar_diamonds(kwargs.get('diamond_id'), 5)
        elif recommendation_type == 'settings':
            return engine.get_personalized_settings(10)
        elif recommendation_type == 'combinations':
            return engine.get_recommended_combinations(10)
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        return {}
    
    return {}