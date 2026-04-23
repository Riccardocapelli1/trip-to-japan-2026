import { itinerary, destinationsDict } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  renderTimeline();
  setupScrollReveal();
  setupModal();
  setupDiscovery();
});

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = itinerary.map((dayData, index) => {
    // Determine intensity color
    let intensityClass = dayData.intensity.toLowerCase();
    
    // Format Date (e.g., "1 Nov, Dom")
    const dateObj = new Date(dayData.date);
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    const dateFormatted = dateObj.toLocaleDateString('es-ES', options);

    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-card glass-panel" data-index="${index}">
          <div class="day-badge">Día ${dayData.day}</div>
          <h3 class="card-title">${dateFormatted}</h3>
          <div class="card-city">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            ${dayData.baseCity}
          </div>
          <p class="text-secondary" style="margin-bottom: 0.5rem; font-size: 0.9rem;">${dayData.plan}</p>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="card-intensity ${intensityClass}">Intensidad: ${dayData.intensity}</span>
            ${dayData.note ? `<span class="note-badge">✨ ${dayData.note}</span>` : ''}
          </div>
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
    const dateFormatted = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    let mustSeeHtml = data.mustSee.length ? data.mustSee.map(spot => `
      <div class="spot-card">
        ${spot.image ? `<img src="${spot.image}" alt="${spot.name}" class="spot-image" loading="lazy" />` : ''}
        <div class="spot-content">
          <div class="spot-name">${spot.name}</div>
          <div class="spot-desc">${spot.description}</div>
          ${spot.url ? `<a href="redirect.html?url=${encodeURIComponent(spot.url)}&name=${encodeURIComponent(spot.name)}" target="_blank" class="spot-link">Descubrir más &rarr;</a>` : ''}
        </div>
      </div>
    `).join('') : '<p class="text-secondary">No hay "Must See" programados.</p>';

    let localSpotsHtml = data.localSpots.length ? data.localSpots.map(spot => `
      <div class="spot-card">
        ${spot.image ? `<img src="${spot.image}" alt="${spot.name}" class="spot-image" loading="lazy" />` : ''}
        <div class="spot-content">
          <div class="spot-name">
            ${spot.name}
            <span class="spot-type">${spot.type}</span>
          </div>
          <div class="spot-desc">${spot.description}</div>
          ${spot.url ? `<a href="redirect.html?url=${encodeURIComponent(spot.url)}&name=${encodeURIComponent(spot.name)}" target="_blank" class="spot-link">Descubrir más &rarr;</a>` : ''}
        </div>
      </div>
    `).join('') : '<p class="text-secondary">Exploración libre.</p>';

    let noteHtml = data.note ? `
      <div class="personal-note-box">
        <em>Para ti: ${data.note}</em>
        <p class="text-secondary" style="font-size: 0.85rem;">${data.noteContext}</p>
      </div>
    ` : '';

    modalBody.innerHTML = `
      <div class="modal-header">
        <div class="day-badge">Día ${data.day}</div>
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
          <p class="mb-6"><strong>Sugerencia:</strong> ${match.suggestion}</p>
          <div class="personal-note-box" style="margin-top: 0;">
            <strong>Alternativa:</strong><br/>
            ${match.alternative}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="spot-card discovery-result-card">
          <p class="text-secondary">No encontré información exacta para "${input.value}".</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Intenta con: <em>Kyoto, Onsen, Naturaleza, Comida, Compras</em></p>
        </div>
      `;
    }
  };

  btn.addEventListener('click', search);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search();
  });
}
