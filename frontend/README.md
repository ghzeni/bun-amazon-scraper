# 🎨 Amazon Scraper Frontend

A modern, responsive frontend for the Amazon scraper using **Vanilla JavaScript**, **CSS3** and **Vite**.

## 🚀 Getting Started

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) or use your package manager.

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Test the Interface

- Open `http://localhost:5173`
- Try searches like:
  - "wireless headphones"
  - "gaming laptop" 
  - "coffee maker"
  - "running shoes"

## 🖥️ Interface Components

### Search Section
- Input field with dynamic placeholder suggestions
- Search button with loading states
- Form validation and error handling

### Results Display
- **Product cards** with:
  - Product images
  - Product titles
  - Star ratings (out of 5)
  - Review counts

## 🔧 Configuration

### Backend Connection
The frontend connects to the backend at `http://localhost:3000` by default.

To change the backend URL, modify the `API_BASE_URL` constant in `index.html`:
```javascript
const API_BASE_URL = 'http://your-backend-url:port';
```


## 🤝 Integration with Backend

### Required Backend Endpoints
- `GET /api/scrape?keyword=term` - Main scraping endpoint
- `GET /health` - Health check endpoint

### Expected Response Format
```json
{
  "success": true,
  "keyword": "laptop",
  "totalProducts": 16,
  "products": [...],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

