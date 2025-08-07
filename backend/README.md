# 🛒 Amazon Scraper API

A simple and efficient Amazon scraper using **Bun**, **Express**, **Axios** and **JSDOM**.

## 🚀 Getting Started

### 1. Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install dependencies
```bash
bun install
```

### 3. Run the server
```bash
bun start
```

## 📡 API Endpoints

### `GET /api/scrape?keyword=term`

Scrapes Amazon products for the specified term.

**Example:**
```
GET http://localhost:3000/api/scrape?keyword=smartphone
```

**Response:**
```json
{
  "keyword": "smartphone",
  "totalProducts": 12,
  "searchUrl": "https://www.amazon.com/s?k=smartphone",
  "products": [
    {
      "title": "iPhone 15 Pro Max",
      "rating": 4.5,
      "reviewCount": 1234,
      "imageUrl": "https://..."
    }
  ]
}
```

### `GET /` 
Home page with API information

### `GET /health`
Server health status

## 🎯 Features

- Extracts product **title**
- Extracts **rating** (stars)
- Extracts **number of reviews**
- Extracts **image URL**
