const https = require('https');
const fs = require('fs');

// Avtomechti Dealer ID: 16611
const DEALER_ID = '16611';
const MOBILE_BG_URL = `https://www.mobile.bg/en/listings?criterion_od_id_ad=${DEALER_ID}`;

async function fetchPage(pageUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'bg-BG,bg;q=0.9',
        'Cache-Control': 'no-cache'
      }
    };
    
    https.get(pageUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractCars(html) {
  const cars = [];
  
  // Extract ad IDs
  const adIdRegex = /data-ad-id="(\d+)"/g;
  const adIds = [];
  let match;
  while ((match = adIdRegex.exec(html)) !== null) {
    adIds.push(match[1]);
  }
  
  // Extract car models/titles
  const titleRegex = /class="[^"]*?title[^"]*?"[^>]*?>([^<]+)<\/(?:a|span|h\d)/gi;
  const titles = [];
  while ((match = titleRegex.exec(html)) !== null) {
    const title = match[1].trim();
    if (title.length > 2 && title.length < 100) {
      titles.push(title);
    }
  }
  
  // Extract images
  const imgRegex = /src="(https:\/\/[^"]*mobile\.bg[^"]*\.(?:jpg|png|jpeg|webp))"/gi;
  const images = [];
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  // Extract prices
  const priceRegex = /class="[^"]*?price[^"]*?"[^>]*?>([^<]*(?:\d[^<]*)?лв?)<\/(?:span|div)/gi;
  const prices = [];
  while ((match = priceRegex.exec(html)) !== null) {
    const price = match[1].trim();
    if (price && price.length > 0) {
      prices.push(price);
    }
  }
  
  // Combine all data
  const count = Math.min(adIds.length, titles.length, 20);
  for (let i = 0; i < count; i++) {
    cars.push({
      title: titles[i],
      price: prices[i] || 'Contact for price',
      image: images[i] || 'https://via.placeholder.com/300x200?text=Car+Listing',
      link: `https://www.mobile.bg/en/listings/${adIds[i]}`
    });
  }
  
  return cars;
}

async function main() {
  try {
    console.log('🚗 Scraping Avtomechti listings from Mobile.bg...');
    const html = await fetchPage(MOBILE_BG_URL);
    
    if (!html || html.length < 1000) {
      throw new Error('Empty or invalid response from Mobile.bg');
    }
    
    const cars = extractCars(html);
    
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data', { recursive: true });
    }
    
    fs.writeFileSync('data/cars.json', JSON.stringify(cars, null, 2));
    
    console.log(`✅ Success! Saved ${cars.length} car listings to data/cars.json`);
    
    if (cars.length === 0) {
      console.warn('⚠️  Warning: No cars found. Mobile.bg HTML structure may have changed.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data', { recursive: true });
    }
    fs.writeFileSync('data/cars.json', JSON.stringify([], null, 2));
    process.exit(1);
  }
}

main();