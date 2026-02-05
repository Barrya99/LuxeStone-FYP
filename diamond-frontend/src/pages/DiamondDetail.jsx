import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Share2, Award, Shield, 
  Sparkles, ArrowLeft, CheckCircle, Info, ArrowLeftRight
} from 'lucide-react';
import { diamondAPI, reviewAPI } from '../services/api';
import { formatPrice, formatCarat, getCutBadge, getColorBadge } from '../utils/formatters';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { useComparisonStore } from '../store/useComparisonStore';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const DiamondDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diamond, setDiamond] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { selectDiamond } = useConfiguratorStore();
  const { addDiamond } = useComparisonStore();

  useEffect(() => {
    fetchDiamond();
    fetchReviews();
  }, [id]);

  const fetchDiamond = async () => {
    try {
      setLoading(true);
      const response = await diamondAPI.getById(id);
      setDiamond(response.data);
    } catch (error) {
      console.error('Error fetching diamond:', error);
      toast.error('Diamond not found');
      navigate('/diamonds');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getProductReviews({ diamond_id: id });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite(diamond.diamond_id)) {
      removeFavorite(diamond.diamond_id);
      toast.success('Removed from favorites');
    } else {
      addFavorite({ id: diamond.diamond_id, type: 'diamond', ...diamond });
      toast.success('Added to favorites');
    }
  };

  const handleAddToCart = () => {
    addItem({
      type: 'diamond',
      diamond_id: diamond.diamond_id,
      total_price: diamond.base_price,
      ...diamond,
    });
    toast.success('Added to cart');
  };

  const handleBuildRing = () => {
    selectDiamond(diamond);
    navigate('/configurator');
    toast.success('Diamond selected! Now choose a setting.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleCompare = () => {
    const success = addDiamond(diamond);
    if (success) {
      toast.success('Added to comparison');
      navigate('/comparison');
    } else {
      const { diamonds } = useComparisonStore.getState();
      if (diamonds.some(d => d.diamond_id === diamond.diamond_id)) {
        toast.error('Already in comparison');
      } else if (diamonds.length >= 3) {
        toast.error('Maximum 3 items can be compared');
      } else {
        toast.error('Cannot add to comparison');
      }
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!diamond) return null;

  const specifications = [
    { label: 'Carat Weight', value: formatCarat(diamond.carat) },
    { label: 'Cut Grade', value: diamond.cut },
    { label: 'Color Grade', value: diamond.color },
    { label: 'Clarity Grade', value: diamond.clarity },
    { label: 'Shape', value: diamond.shape },
    { label: 'Table %', value: diamond.table_percent ? `${diamond.table_percent}%` : 'N/A' },
    { label: 'Depth %', value: diamond.depth_percent ? `${diamond.depth_percent}%` : 'N/A' },
    { label: 'Polish', value: diamond.polish || 'N/A' },
    { label: 'Symmetry', value: diamond.symmetry || 'N/A' },
    { label: 'Fluorescence', value: diamond.fluorescence || 'None' },
    { label: 'Certificate', value: diamond.certificate_type || 'IGI' },
    { label: 'Cert. Number', value: diamond.certificate_number || 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/diamonds" className="text-gray-500 hover:text-gray-700">Diamonds</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {formatCarat(diamond.carat)} {diamond.shape}
            </span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/diamonds"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Diamonds
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image */}
          <div className="sticky top-24 self-start">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-to-br from-primary-200 via-blue-200 to-purple-200 rounded-full opacity-50 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-32 w-32 text-primary-400" />
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full shadow-lg">
                    {diamond.shape}
                  </span>
                  <span className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-full shadow-lg">
                    Lab-Grown
                  </span>
                  {diamond.certificate_type && (
                    <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
                      {diamond.certificate_type} Certified
                    </span>
                  )}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="p-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Award className="h-8 w-8 text-primary-600 mb-2" />
                    <span className="text-xs text-gray-600">Certified</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-xs text-gray-600">Authentic</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Sparkles className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-xs text-gray-600">Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
                {formatCarat(diamond.carat)} {diamond.shape} Lab-Grown Diamond
              </h1>
              
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-5xl font-bold text-gray-900">
                  {formatPrice(diamond.base_price)}
                </div>
                <div className="text-lg text-gray-500">
                  Certified Lab-Grown
                </div>
              </div>

              {/* Quick Specs Badges */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getCutBadge(diamond.cut)}`}>
                  {diamond.cut} Cut
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getColorBadge(diamond.color)}`}>
                  Color {diamond.color}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  {diamond.clarity} Clarity
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" onClick={handleBuildRing} className="flex-1">
                <Sparkles className="h-5 w-5" />
                Build Your Ring
              </Button>
              <Button size="lg" variant="secondary" onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleCompare}>
                <ArrowLeftRight className="h-5 w-5" />
                Compare
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleFavorite}
                className={isFavorite(diamond.diamond_id) ? 'border-red-500 text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isFavorite(diamond.diamond_id) ? 'fill-current' : ''}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Key Features */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Why Choose This Diamond?</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Ethically sourced lab-grown diamond
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {diamond.certificate_type} certified for authenticity
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Premium {diamond.cut} cut for maximum brilliance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      30-day return policy & lifetime warranty
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                {['specs', 'certificate', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'specs' && 'Specifications'}
                    {tab === 'certificate' && 'Certificate'}
                    {tab === 'shipping' && 'Shipping & Returns'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {activeTab === 'specs' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{spec.label}</span>
                      <span className="font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'certificate' && (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                    {diamond.certificate_type} Certified
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Certificate Number: {diamond.certificate_number || 'Available upon purchase'}
                  </p>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    This diamond has been independently graded and certified by the {diamond.certificate_type || 'International Gemological Institute'}, 
                    ensuring its quality and authenticity.
                  </p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Free Insured Shipping</h3>
                    <p className="text-gray-600">
                      All orders ship free with full insurance coverage. Delivery within 3-5 business days.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">30-Day Returns</h3>
                    <p className="text-gray-600">
                      Not completely satisfied? Return within 30 days for a full refund, no questions asked.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Lifetime Warranty</h3>
                    <p className="text-gray-600">
                      Every diamond comes with a lifetime warranty covering manufacturing defects.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiamondDetail;