async function loadCars() {
  try {
    const response = await fetch('data/cars.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const cars = await response.json();
    displayCars(cars);
  } catch (error) {
    console.error('Error loading cars:', error);
    document.getElementById('cars-container').innerHTML = 
      '<p class="text-red-500">Error loading cars</p>';
  }
}

function displayCars(cars) {
  const container = document.getElementById('cars-container');
  
  if (!cars || cars.length === 0) {
    container.innerHTML = '<p class="text-gray-400">No cars available at the moment</p>';
    return;
  }
  
  container.innerHTML = cars.map(car => `
    <div class="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
      <a href="${car.link}" target="_blank" rel="noopener noreferrer" class="block">
        <img src="${car.image}" alt="${car.title}" class="w-full h-48 object-cover hover:opacity-80 transition-opacity">
      </a>
      <div class="p-4">
        <h3 class="text-lg font-bold text-white">${car.title}</h3>
        <p class="text-green-400 text-xl font-bold mt-2">${car.price}</p>
        <a href="${car.link}" target="_blank" rel="noopener noreferrer" 
           class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
          View on Mobile.bg
        </a>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadCars);
