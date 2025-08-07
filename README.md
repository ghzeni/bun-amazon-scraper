# Amazon Product Scraper

This is a full-stack web application that allows users to search for products on Amazon by keyword. The app performs web scraping on the first page of Amazon search results and displays structured data (product title, rating, reviews, and image) on a simple front-end interface.

## Project Structure

```
├── backend/    # Bun-based API for scraping Amazon  
├── frontend/   # Vite + Vanilla JS frontend interface  
└── README.md   # Project overview  
```

- [`backend/`](./backend/): Contains the server code using Bun, `axios` for HTTP requests, and `jsdom` for parsing HTML. It exposes a `/api/scrape?keyword=...` endpoint that performs the scraping and returns JSON data.
- [`frontend/`](./frontend/): Contains a simple web UI built with Vite and vanilla JavaScript. Users can input keywords and view results directly in the browser.

## How It Works

1. The user enters a keyword in the frontend.
2. The frontend sends a GET request to `/api/scrape?keyword=...`.
3. The backend fetches and parses Amazon's search result page.
4. The response is sent back as JSON and rendered on the page.

## Features

- Keyword-based Amazon scraping (first page only)
- Extracts:
  - Product title
  - Rating (out of 5 stars)
  - Number of reviews
  - Product image URL

## Requirements

- Bun
- Node.js (for the frontend)

## Setup Instructions
### 1. Clone the repository

```bash
git clone git@github.com:ghzeni/bun-amazon-scraper.git
cd bun-amazon-scraper
```

### 2. Run the backend
```
cd backend
bun install
bun server.js
```

### 3. Run the frontend
```
cd frontend
npm install
npm run dev
```

Access the frontend at http://localhost:5173 and use the input field to search.

### Disclaimer

This project is for educational purposes only. Web scraping Amazon may violate terms of service.