export const DIAMOND_SHAPES = [
  { value: 'Round', label: 'Round', icon: '⬤' },
  { value: 'Princess', label: 'Princess', icon: '◆' },
  { value: 'Cushion', label: 'Cushion', icon: '◇' },
  { value: 'Emerald', label: 'Emerald', icon: '▭' },
  { value: 'Oval', label: 'Oval', icon: '⬭' },
  { value: 'Radiant', label: 'Radiant', icon: '⬟' },
  { value: 'Asscher', label: 'Asscher', icon: '⬢' },
  { value: 'Marquise', label: 'Marquise', icon: '◊' },
  { value: 'Heart', label: 'Heart', icon: '♥' },
  { value: 'Pear', label: 'Pear', icon: '💧' },
];

export const DIAMOND_CUTS = [
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Poor',
];

export const DIAMOND_COLORS = [
  'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'
];

export const DIAMOND_CLARITIES = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'
];

export const SETTING_STYLES = [
  { value: 'Solitaire', label: 'Solitaire', description: 'Classic single stone' },
  { value: 'Halo', label: 'Halo', description: 'Surrounded by smaller diamonds' },
  { value: 'Three-Stone', label: 'Three-Stone', description: 'Past, present, future' },
  { value: 'Vintage', label: 'Vintage', description: 'Antique-inspired' },
  { value: 'Pavé', label: 'Pavé', description: 'Paved with small diamonds' },
  { value: 'Channel', label: 'Channel', description: 'Diamonds set in channel' },
  { value: 'Tension', label: 'Tension', description: 'Held by tension' },
  { value: 'Bezel', label: 'Bezel', description: 'Surrounded by metal' },
  { value: 'Split Shank', label: 'Split Shank', description: 'Split band design' },
];

export const METAL_TYPES = [
  { value: 'Platinum', label: 'Platinum', color: '#E5E4E2' },
  { value: '18K White Gold', label: '18K White Gold', color: '#F5F5F5' },
  { value: '18K Yellow Gold', label: '18K Yellow Gold', color: '#FFD700' },
  { value: '18K Rose Gold', label: '18K Rose Gold', color: '#B76E79' },
  { value: '14K White Gold', label: '14K White Gold', color: '#F8F8F8' },
  { value: '14K Yellow Gold', label: '14K Yellow Gold', color: '#FFDF00' },
  { value: '14K Rose Gold', label: '14K Rose Gold', color: '#C9A0A0' },
];

export const RING_SIZES = [
  '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'
];

export const PRICE_RANGES = [
  { label: 'Under $2,000', min: 0, max: 2000 },
  { label: '$2,000 - $5,000', min: 2000, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000 - $20,000', min: 10000, max: 20000 },
  { label: '$20,000+', min: 20000, max: 1000000 },
];

export const CARAT_RANGES = [
  { label: '0.3 - 0.5ct', min: 0.3, max: 0.5 },
  { label: '0.5 - 0.75ct', min: 0.5, max: 0.75 },
  { label: '0.75 - 1.0ct', min: 0.75, max: 1.0 },
  { label: '1.0 - 1.5ct', min: 1.0, max: 1.5 },
  { label: '1.5 - 2.0ct', min: 1.5, max: 2.0 },
  { label: '2.0ct+', min: 2.0, max: 10.0 },
];

export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'carat_asc', label: 'Carat: Low to High' },
  { value: 'carat_desc', label: 'Carat: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  processing: { label: 'Processing', color: 'purple' },
  shipped: { label: 'Shipped', color: 'indigo' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};