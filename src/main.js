import { itinerary, destinationsDict, pointsOfInterest } from './data.js';

function init() {
  renderDashboard();
  renderTimeline();
  setupScrollReveal();
  setupModal();
  setupDiscovery();
  renderMap();
  renderSuggestionsList();
}

try {
  init();
} catch (e) {
  document.body.innerHTML += `<div style="color:red; z-index:9999; position:fixed; top:0; left:0; background:black; padding:20px;">ERROR: ${e.message}</div>`;
}

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = itinerary.map((dayData, index) => {
    // Determine intensity color
    let intensityClass = dayData.intensity.toLowerCase();
    
    // Format Date (e.g., "1 Nov, Dom")
    const dateObj = new Date(dayData.date);
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);

    const effortMapping = {
      'baja': { rating: '2/5', time: '~4 hours' },
      'media': { rating: '3.5/5', time: '~6-7 hours' },
      'alta': { rating: '5/5', time: '8+ hours' }
    };
    const metrics = effortMapping[intensityClass] || { rating: '?', time: '?' };

    return `
      <div class="timeline-item" id="day-${dayData.day}">
        <div class="timeline-dot"></div>
        <div class="timeline-card glass-panel" data-index="${index}">
          <div class="day-badge">Day ${dayData.day}</div>
          <h3 class="card-title">${dateFormatted}</h3>
          <div class="card-city">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            ${dayData.baseCity}
          </div>
          <p class="text-secondary" style="margin-bottom: 0.5rem; font-size: 0.9rem;">${dayData.plan}</p>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="card-intensity ${intensityClass}">Intensity: ${dayData.intensity}</span>
            <span class="card-intensity" style="border-color: hsl(var(--border)); color: hsl(var(--muted-foreground));">Effort: ${metrics.rating}</span>
            <span class="card-intensity" style="border-color: hsl(var(--border)); color: hsl(var(--muted-foreground));">⏳ ${metrics.time}</span>
            <a href="#map-section" class="card-intensity" style="background: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.3); color: hsl(var(--primary)); text-decoration: none;">📍 View Map</a>
            ${dayData.note ? `<span class="note-badge">✨ ${dayData.note}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboard() {
  const statsContainer = document.getElementById('dashboard-stats');
  if (!statsContainer) return;

  const totalDays = itinerary.length;
  const uniqueCities = new Set(itinerary.map(d => d.baseCity).filter(c => c !== 'Flight')).size;
  const mustSeeCount = itinerary.reduce((acc, curr) => acc + (curr.mustSee ? curr.mustSee.length : 0), 0);
  const highIntensityDays = itinerary.filter(d => d.intensity.toLowerCase() === 'alta').length;

  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalDays}</div>
      <div class="stat-label">Trip Days</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${uniqueCities}</div>
      <div class="stat-label">Base Cities</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${mustSeeCount}</div>
      <div class="stat-label">Must See Places</div>
    </div>
    <div class="stat-card" style="border-color: hsl(var(--primary) / 0.5);">
      <div class="stat-value">${highIntensityDays}</div>
      <div class="stat-label">High Intensity Days</div>
    </div>
  `;
}

function renderMap() {
  const mapContainer = document.getElementById('itinerary-map');
  if (!mapContainer || !window.L) return;

  // Wait a tick to ensure container is fully sized
  setTimeout(() => {
    // City coordinates approximation
    const coords = {
      'Tokyo': [35.6762, 139.6503],
      'Takayama': [36.1461, 137.2523],
      'Osaka': [34.6937, 135.5023],
      'Koyasan': [34.2155, 135.5843],
      'Kinosaki': [35.6256, 134.8146],
      'Hikone': [35.2744, 136.2597],
      'Uji': [34.8906, 135.8000],
      'Nara': [34.6851, 135.8048]
    };

    const map = L.map('itinerary-map').setView([35.6762, 139.6503], 5);

    // CartoDB Voyager tiles (English labels, clean design)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const latlngs = [];
    const addedMarkers = new Set();

    itinerary.forEach(day => {
      if (day.baseCity === 'Flight') return;
      const cityCoords = coords[day.baseCity];
      if (cityCoords) {
        latlngs.push(cityCoords);
        if (!addedMarkers.has(day.baseCity)) {
          addedMarkers.add(day.baseCity);
          L.circleMarker(cityCoords, {
            radius: 8,
            fillColor: '#ea580c', // primary orange-600
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map).bindPopup(`<b>${day.baseCity}</b>`);
        }
      }
    });

    if (latlngs.length > 0) {
      // Draw path
      L.polyline(latlngs, {
        color: '#ea580c', 
        weight: 3, 
        opacity: 0.7, 
        dashArray: '5, 10'
      }).addTo(map);
      
      // Fit bounds to show the whole route
      map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
    }

    const categoryIcons = {
      hotels: '🏨',
      restaurants: '🍴',
      museums: '🏛️',
      bars: '🍺',
      shops: '👕',
      others: '✨'
    };

    const interestIcons = {
      Stay: '🏨',
      Cars: '🚗',
      Tech: '💻',
      Arcade: '🕹️',
      Nintendo: '🎮',
      'LED/Tech': '💡',
      Fashion: '👕',
      Food: '🍴',
      Architecture: '🏛️',
      Nature: '🌳',
      History: '🏯',
      Tradition: '🎋'
    };

    pointsOfInterest.forEach(poi => {
      const icon = interestIcons[poi.tag] || categoryIcons[poi.category] || '📍';
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(poi.name + ' ' + poi.baseCity + ' Japan')}`;
      
      // Find relevant day for POI based on baseCity
      const relevantDay = itinerary.find(d => d.baseCity === poi.baseCity);
      const dayLink = relevantDay ? `<a href="#day-${relevantDay.day}" style="color: hsl(var(--primary)); text-decoration: none; font-weight: 600; font-size: 0.8rem; border: 1px solid hsl(var(--primary) / 0.3); padding: 4px 8px; border-radius: 4px; display: inline-block;">← See Day ${relevantDay.day}</a>` : '';

      const categoryColors = {
        hotels: '#3b82f6',
        restaurants: '#ef4444',
        museums: '#10b981',
        bars: '#f59e0b',
        shops: '#8b5cf6',
        others: '#6b7280'
      };

      L.circleMarker(poi.coords, {
        radius: 7,
        fillColor: categoryColors[poi.category] || '#6b7280',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`
        <div style="font-family: var(--font-sans); min-width: 160px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 1.4rem;">${icon}</span>
            <span style="font-size: 0.65rem; color: #fff; background: ${categoryColors[poi.category]}; padding: 2px 6px; border-radius: 99px; text-transform: uppercase; font-weight: 700;">${poi.category}</span>
          </div>
          <div style="font-weight: 700; margin-bottom: 4px; font-size: 1.1rem; color: #1a1a1a;">${poi.name}</div>
          <div style="font-size: 0.85rem; margin-bottom: 12px; color: #4b5563; line-height: 1.4;">${poi.description}</div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px; border-top: 1px solid #eee; pt: 8px;">
            <a href="${searchUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 0.85rem; font-weight: 600;">🔍 Search on Google</a>
            ${dayLink}
          </div>
        </div>
      `);
    });
  }, 100);
}

function renderSuggestionsList() {
  const container = document.getElementById('suggestions-list');
  if (!container) return;

  const categoryIcons = {
    hotels: '🏨',
    restaurants: '🍴',
    museums: '🏛️',
    bars: '🍺',
    shops: '👕',
    others: '✨'
  };

  const interestIcons = {
    Stay: '🏨',
    Cars: '🚗',
    Tech: '💻',
    Arcade: '🕹️',
    Nintendo: '🎮',
    'LED/Tech': '💡',
    Fashion: '👕',
    Food: '🍴',
    Architecture: '🏛️',
    Nature: '🌳',
    History: '🏯',
    Tradition: '🎋'
  };

  container.innerHTML = pointsOfInterest.map(poi => {
    const icon = interestIcons[poi.tag] || categoryIcons[poi.category] || '📍';
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(poi.name + ' ' + poi.baseCity + ' Japan')}`;
    const relevantDay = itinerary.find(d => d.baseCity === poi.baseCity);
    
    return `
      <div class="suggestion-card">
        <div class="suggestion-header">
          <span class="poi-tag tag-${poi.category}">${categoryIcons[poi.category]} ${poi.category}</span>
          <span class="interest-badge">${icon} #${poi.tag}</span>
        </div>
        <div class="suggestion-title">${poi.name}</div>
        <div class="text-secondary" style="font-size: 0.85rem; margin-bottom: 1.5rem;">${poi.description}</div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto;">
          <a href="${searchUrl}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 0.85rem; font-weight: 600;">🔍 Search on Google</a>
          ${relevantDay ? `<a href="#day-${relevantDay.day}" style="color: hsl(var(--primary)); text-decoration: none; font-size: 0.85rem; font-weight: 600;">🗓️ Go to Day ${relevantDay.day}</a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        // Unobserve to run animation only once
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
}

function setupModal() {
  const modal = document.getElementById('day-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');
  const backdrop = modal.querySelector('.modal-backdrop');

  const openModal = (index) => {
    const data = itinerary[index];
    const dateObj = new Date(data.date);
    const dateFormatted = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

    let mustSeeHtml = data.mustSee.length ? data.mustSee.map(spot => `
      <div class="spot-card">
        ${spot.image ? `<img src="${spot.image}" alt="${spot.name}" class="spot-image" loading="lazy" />` : ''}
        <div class="spot-content">
          <div class="spot-name">${spot.name}</div>
          <div class="spot-desc">${spot.description}</div>
          ${spot.url ? `<a href="redirect.html?url=${encodeURIComponent(spot.url)}&name=${encodeURIComponent(spot.name)}" target="_blank" class="spot-link">Discover more &rarr;</a>` : ''}
        </div>
      </div>
    `).join('') : '<p class="text-secondary">No "Must See" spots scheduled.</p>';

    let localSpotsHtml = data.localSpots.length ? data.localSpots.map(spot => `
      <div class="spot-card">
        ${spot.image ? `<img src="${spot.image}" alt="${spot.name}" class="spot-image" loading="lazy" />` : ''}
        <div class="spot-content">
          <div class="spot-name">
            ${spot.name}
            <span class="spot-type">${spot.type}</span>
          </div>
          <div class="spot-desc">${spot.description}</div>
          ${spot.url ? `<a href="redirect.html?url=${encodeURIComponent(spot.url)}&name=${encodeURIComponent(spot.name)}" target="_blank" class="spot-link">Discover more &rarr;</a>` : ''}
        </div>
      </div>
    `).join('') : '<p class="text-secondary">Free exploration.</p>';

    let noteHtml = data.note ? `
      <div class="personal-note-box">
        <em>For you: ${data.note}</em>
        <p class="text-secondary" style="font-size: 0.85rem;">${data.noteContext}</p>
      </div>
    ` : '';

    modalBody.innerHTML = `
      <div class="modal-header">
        <div class="day-badge">Day ${data.day}</div>
        <h2 class="modal-title">${data.baseCity}</h2>
        <div class="modal-date">${dateFormatted}</div>
      </div>
      
      <div class="modal-section">
        <h3 class="modal-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
          Must See
        </h3>
        ${mustSeeHtml}
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Local Spots
        </h3>
        ${localSpotsHtml}
      </div>

      ${noteHtml}
    `;

    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.timeline-card').forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.dataset.index);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
}

function setupDiscovery() {
  const input = document.getElementById('discovery-input');
  const btn = document.getElementById('discovery-btn');
  const resultDiv = document.getElementById('discovery-result');

  const search = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    // Very simple fuzzy/includes match
    const match = destinationsDict.find(d => 
      d.keyword.toLowerCase().includes(query) || 
      query.includes(d.keyword.toLowerCase())
    );

    resultDiv.classList.remove('hidden');

    if (match) {
      resultDiv.innerHTML = `
        <div class="spot-card discovery-result-card" style="border-color: hsl(var(--primary) / 0.3);">
          <h3 class="card-title" style="color: hsl(var(--primary));">${match.keyword}</h3>
          <p class="mb-6"><strong>Suggestion:</strong> ${match.suggestion}</p>
          <div class="personal-note-box" style="margin-top: 0;">
            <strong>Alternative:</strong><br/>
            ${match.alternative}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="spot-card discovery-result-card">
          <p class="text-secondary">I couldn't find exact information for "${input.value}".</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try with: <em>Kyoto, Onsen, Nature, Food, Shopping</em></p>
        </div>
      `;
    }
  };

  btn.addEventListener('click', search);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search();
  });
}
