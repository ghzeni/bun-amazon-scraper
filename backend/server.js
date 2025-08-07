import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS manually to ensure it works properly
app.use((req, res, next) => {
  // Allow requests from any localhost port for development
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Middleware for JSON
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Headers to simulate a real browser
const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
});

// Function to extract product data
const extractProductData = (dom) => {
  const products = [];
  
  // Amazon-specific selectors
  const productSelectors = [
    '[data-component-type="s-search-result"]',
    '.s-result-item[data-component-type="s-search-result"]',
    '.s-card-container'
  ];
  
  let productElements = [];
  
  // Try different selectors
  for (const selector of productSelectors) {
    productElements = dom.window.document.querySelectorAll(selector);
    if (productElements.length > 0) break;
  }
  
  console.log(`Found ${productElements.length} products`);
  
  productElements.forEach((element, index) => {
    try {
      // Product title - Updated selectors for better accuracy
      const titleSelectors = [
        // Priority 1: Full title from link with aria-label
        'h2[aria-label]',
        'a h2[aria-label]',
        
        // Priority 2: Full title from link text
        'h2 a span',
        'a.a-link-normal h2 span',
        '.a-link-normal h2 span',
        
        // Priority 3: Alternative selectors
        'h2 .a-text-normal span',
        '.s-size-mini .s-link-style a span',
        
        // Priority 4: Fallback selectors
        'h2 span',
        '.a-text-normal',
        'h2'
      ];
      
      let title = '';
      for (const selector of titleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement) {
          // Check for aria-label first (most complete title)
          if (titleElement.hasAttribute('aria-label')) {
            const ariaTitle = titleElement.getAttribute('aria-label').trim();
            if (ariaTitle && ariaTitle.length > 10) { // Ensure it's a meaningful title
              title = ariaTitle;
              break;
            }
          }
          
          // Then check text content
          if (titleElement.textContent && titleElement.textContent.trim()) {
            const textTitle = titleElement.textContent.trim();
            if (textTitle.length > 10) { // Ensure it's not just a category name like "Apple"
              title = textTitle;
              break;
            }
          }
        }
      }
      
      // Rating (stars)
      const ratingSelectors = [
        '.a-icon-alt',
        '[aria-label*="stars"]',
        '.a-icon-star span'
      ];
      
      let rating = null;
      for (const selector of ratingSelectors) {
        const ratingElement = element.querySelector(selector);
        if (ratingElement) {
          const ratingText = ratingElement.textContent || ratingElement.getAttribute('aria-label') || '';
          const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*out\s*of\s*5|(\d+\.?\d*)\s*stars?/i);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1] || ratingMatch[2]);
            break;
          }
        }
      }
      
      // Number of reviews
      const reviewSelectors = [
        '.a-size-base',
        'a[href*="#customerReviews"] span',
        '.a-link-normal span'
      ];
      
      let reviewCount = null;
      for (const selector of reviewSelectors) {
        const reviewElements = element.querySelectorAll(selector);
        for (const reviewElement of reviewElements) {
          const reviewText = reviewElement.textContent.trim();
          const reviewMatch = reviewText.match(/^([\d,]+)$/);
          if (reviewMatch) {
            reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
            break;
          }
        }
        if (reviewCount !== null) break;
      }
      
      // Image URL
      const imageSelectors = [
        '.s-image',
        'img[data-image-latency]',
        '.a-dynamic-image',
        'img'
      ];
      
      let imageUrl = '';
      for (const selector of imageSelectors) {
        const imageElement = element.querySelector(selector);
        if (imageElement && imageElement.src) {
          imageUrl = imageElement.src;
          break;
        }
      }
      
      // Only add if it has at least the title
      if (title) {
        products.push({
          title,
          rating,
          reviewCount,
          imageUrl: imageUrl || null
        });
      }
      
    } catch (error) {
      console.error(`Error processing product ${index}:`, error.message);
    }
  });
  
  return products;
};

// Main scraping endpoint
app.get('/api/scrape', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        error: 'Keyword parameter is required',
        example: '/api/scrape?keyword=smartphone'
      });
    }
    
    console.log(`Starting scraping for: ${keyword}`);
    
    // Amazon URL with search term
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    
    // Make request
    const response = await axios.get(searchUrl, {
      headers: getHeaders(),
      timeout: 15000
    });
    
    console.log('Page loaded, starting parsing...');
    
    // Parse with JSDOM
    const dom = new JSDOM(response.data);
    
    // Extract product data
    const products = extractProductData(dom);
    
    console.log(`Extracted ${products.length} products`);
    
    // Return data
    res.json({
      success: true,
      keyword,
      totalProducts: products.length,
      searchUrl,
      products: products.slice(0, 16), // Limit to 16 products from the first page
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Amazon took too long to respond'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      hint: 'Amazon may be blocking automated requests'
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Amazon Scraper API está funcionando!',
    endpoints: {
      scrape: '/api/scrape?keyword=seu_termo_aqui'
    },
    example: '/api/scrape?keyword=smartphone'
  });
});

// Health route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    runtime: 'Bun'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🔍 Test with: http://localhost:${PORT}/api/scrape?keyword=smartphone`);
});