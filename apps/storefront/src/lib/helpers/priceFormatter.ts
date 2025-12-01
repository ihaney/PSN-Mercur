/**
 * Formats product prices with automatic "Request Quote" for blank or zero prices
 * Handles Medusa price format (amounts in cents)
 */

function isPriceEmpty(price: string | number | null | undefined): boolean {
  if (!price || price === 0 || price === '0') return true;
  
  const cleanPrice = typeof price === 'string' 
    ? price.replace(/[$€£¥₹,\s]/g, '') 
    : price.toString();
    
  if (cleanPrice === '0' || cleanPrice === '0.00' || cleanPrice === '0.0') return true;
  
  const numericValue = parseFloat(cleanPrice);
  return isNaN(numericValue) || numericValue === 0;
}

/**
 * Formats a price string, returning "Request Quote" for empty/zero prices
 * Assumes Medusa prices are in cents (divide by 100)
 */
export function formatPrice(price: string | number | null | undefined): string {
  if (isPriceEmpty(price)) {
    return 'Request Quote';
  }
  
  // Handle Medusa price format (amounts in cents)
  const numPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.-]/g, '')) 
    : price;
    
  // If price is > 1000, assume it's in cents, otherwise assume it's already in dollars
  const priceInDollars = numPrice > 1000 ? numPrice / 100 : numPrice;
  
  if (isNaN(priceInDollars) || priceInDollars === 0) {
    return 'Request Quote';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(priceInDollars);
}

/**
 * Checks if a price should show "Request Quote" styling
 */
export function isRequestQuotePrice(price: string | number | null | undefined): boolean {
  return isPriceEmpty(price);
}

