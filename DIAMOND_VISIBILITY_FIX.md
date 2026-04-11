# Diamond Visibility Issue - Root Cause & Fix

## Issue
Diamond record (DIA-RND-004) is available in database but not showing on Browse Diamonds page.

**Diamond Details:**
- ID: 4
- SKU: DIA-RND-004
- Carat: 2.00
- Base Price: 15,000.00
- Is Available: true
- Cut: Excellent, Color: D, Clarity: IF

## Root Cause
**Price Filter Mismatch** - The default maximum price filter was too low:

### Frontend (BrowseDiamonds.jsx):
```javascript
max_price: 10000  // ← TOO LOW
```

### Backend (views.py - DiamondViewSet):
```python
if max_price:
    queryset = queryset.filter(base_price__lte=max_price)
```

### Result:
Since `diamond.base_price (15000) > frontend_max_price (10000)`, the diamond was filtered out on the backend.

## Fix Applied ✅

Updated [BrowseDiamonds.jsx](diamond-frontend/src/pages/BrowseDiamonds.jsx):

1. **Initial filter state** (line ~25):
   ```javascript
   max_price: 50000  // Changed from 10000
   ```

2. **Reset filters function** (line ~95):
   ```javascript
   max_price: 50000  // Changed from 10000
   ```

## Verification Steps

1. **Clear browser cache** to ensure new default is loaded
2. **Reload the Browse Diamonds page**
3. **Check that the diamond now appears** (or increase filter if needed)
4. **Test price slider** - should now support prices up to $50,000

## Note for Higher-Priced Diamonds

If you add diamonds with prices > $50,000:
- Increase the `max_price` value in BrowseDiamonds.jsx
- Update the price range slider max in FilterSidebar.jsx (already set to 50000)
- Consider making this dynamic based on backend statistics endpoint

## Files Modified
- ✅ `diamond-frontend/src/pages/BrowseDiamonds.jsx` (2 changes)

## Testing
Run the frontend and navigate to Browse Diamonds page to confirm DIA-RND-004 is now visible.
