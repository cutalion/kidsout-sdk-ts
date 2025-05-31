# Kidsout SDK Examples

This directory contains various examples demonstrating how to use the Kidsout SDK in different scenarios.

## Examples Overview

### 🌐 `lazy-avatar-browser.html` - Interactive Browser Demo

An interactive HTML page that demonstrates:
- **Real API Integration** with the Kidsout SDK
- **Lazy Loading Avatars** using Intersection Observer
- **HTMX Enhancement** for modern web interactions
- **Progressive Enhancement** with fallback JavaScript
- **Real-time Pagination** with API data

**Features:**
- Loads real sitter data from api.kidsout.ru
- Avatars load only when visible (performance optimization)
- HTMX-enhanced "Load More" button with loading states
- Responsive design with modern CSS (separated into external stylesheet)
- Error handling for network issues

**How to run:**
```bash
# From project root
npm run build
python3 -m http.server 8000
# Open: http://localhost:8000/examples/lazy-avatar-browser.html
```

### 📝 `example.js` - Basic SDK Usage

Demonstrates fundamental SDK operations and lazy loading strategies:

**Strategies covered:**
1. **Async Generator Pattern** - Load avatars one by one
2. **Cached On-Demand Loading** - Load with caching mechanism
3. **Batch Loading** - Load avatars in controlled batches

**How to run:**
```bash
# From project root
cd examples
node example.js
```

### 🎯 `example-with-models.js` - Advanced Model Usage

Shows advanced patterns using SDK model classes:

**Features:**
- **SitterModel** usage for easier data access
- **Model-based Avatar Loading** with sophisticated caching
- **Virtual Scrolling** approach for large datasets
- **Concurrency Control** for batch operations
- **Cache Statistics** and performance monitoring

**Patterns demonstrated:**
1. **Lazy Loading with Models** - Using SitterModel for clean data access
2. **Model Avatar Loader** - Advanced caching and batch processing
3. **Virtual Avatar Loader** - Pagination and viewport-based loading

**How to run:**
```bash
# From project root
cd examples
node example-with-models.js
```

## Common Setup

All examples require the SDK to be built first:

```bash
# From project root
npm run build
```

## Browser vs Node.js

- **`lazy-avatar-browser.html`** - Runs in the browser, requires HTTP server
- **`example.js`** & **`example-with-models.js`** - Run in Node.js

## API Key Usage

The JavaScript examples include placeholder API key usage:
```javascript
const sdk = new KidsoutSDK('https://api.kidsout.ru/api/v2', 'your-api-key');
```

For production usage, replace `'your-api-key'` with your actual API key.

## File Structure

```
examples/
├── README.md                    # This file
├── lazy-avatar-browser.html     # Interactive browser demo
├── lazy-avatar-styles.css       # CSS styles for the browser demo
├── example.js                   # Basic SDK usage
└── example-with-models.js       # Advanced model usage
```

## Technologies Used

- **KidsoutSDK** - Main SDK for API calls
- **HTMX** - Enhanced web interactions (browser demo only)
- **Intersection Observer** - Lazy loading implementation
- **ES6 Modules** - Modern JavaScript imports
- **TypeScript Models** - Type-safe data handling

## Learning Path

1. Start with **`example.js`** to understand basic SDK usage
2. Explore **`example-with-models.js`** for advanced patterns
3. Try **`lazy-avatar-browser.html`** to see everything in action in a browser

Each example builds upon the concepts from the previous ones, providing a comprehensive learning experience for the Kidsout SDK. 
