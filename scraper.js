const https = require('https');
const fs = require('fs');

// Dealer ID за Avtomechti: 16611
const DEALER_ID = '16611';
const MOBILE_BG_URL = `https://www.mobile.bg/en/listings?criterion_od_id_ad=${DEALER_ID}`;

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractCars(html) {
  const cars = [];
  
  // RegExp за извличане на карти с коли
  const carRegex = /<div\s+class="listing-item"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g;
  const matches = html.matchAll(carRegex);
  
  for (const match of matches) {
    const cardHtml = match[0];
    
    // Снимка
    const imgMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
    const image = imgMatch ? imgMatch[1] : '';
    
    // Линк към обява
    const linkMatch = cardHtml.match(/<a\s+href="([^"]*)"[^>]*class="[^"]*listing-link[^"]*"/);
    const link = linkMatch ? 'https://mobile.bg' + linkMatch[1] : '';
    
    // Модел и марка
    const titleMatch = cardHtml.match(/<h3[^>]*>([^<]*)<\/h3>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Цена
    const priceMatch = cardHtml.match(/<span\s+class="[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/);
    const price = priceMatch ? priceMatch[1].trim() : '';
    
    if (image && link && title) {
      cars.push({
        title,
        price,
        image,
        link
      });
    }
  }
  
  return cars;
}

async function main() {
  try {
    console.log('Fetching cars from Mobile.bg...');
    const html = await fetchPage(MOBILE_BG_URL);
    
    const cars = extractCars(html);
    console.log(`Found ${cars.length} cars`);
    
    // Създай data папка ако не съществува
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data');
    }
    
    // Запиши JSON
    fs.writeFileSync('data/cars.json', JSON.stringify(cars, null, 2));
    console.log('✓ cars.json updated successfully');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
