// js/main.js
// Replaces existing file: preloads all video iframes and keeps modal/slider logic intact.

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------- Video carousel (preload + graceful fallback) ----------------- */
  const carousel = document.getElementById('videoCarousel');
  const videoSlides = carousel ? carousel.querySelectorAll('.video-slide') : [];
  let vCurrent = 0;

  // Ensure carousel has proper transition
  if (carousel) {
    carousel.style.transition = carousel.style.transition || 'transform 0.5s ease';
    carousel.style.willChange = 'transform';
  }

  // Create iframe and attach, but also handle non-embeddable videos
  function createIframe(url) {
    const iframe = document.createElement('iframe');
    // add '?rel=0' to reduce unrelated suggested videos
    iframe.src = url + (url.includes('?') ? '&rel=0' : '?rel=0');
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    return iframe;
  }

  // Insert iframe, and if it fails to load (embed blocked) show a fallback
  function attachVideoToSlide(slide) {
    if (!slide || slide.querySelector('iframe') || slide.querySelector('.video-fallback')) return;

    const url = slide.dataset.video;
    if (!url) return;

    // Create a container to measure network/visual failures gracefully
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.background = '#000';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.position = 'relative';
    slide.appendChild(wrapper);

    // Create the iframe
    const iframe = createIframe(url);

    // Some browsers/network/CSP or YouTube settings block embeds and show an error inside iframe.
    // We attach a short timeout: if after X seconds the iframe hasn't visibly loaded, show a fallback link.
    let fallbackTimer = setTimeout(() => {
      // If iframe hasn't been marked as loaded, show fallback link
      if (!iframe.dataset.loaded) {
        // remove iframe if present and show fallback
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        const fallback = document.createElement('div');
        fallback.className = 'video-fallback';
        fallback.style.color = '#fff';
        fallback.style.textAlign = 'center';
        fallback.innerHTML = `
          <div style="max-width:80%;padding:16px;">
            <p style="margin:0 0 8px;font-weight:700;">Video cannot be embedded</p>
            <a href="${url}" target="_blank" style="color:#fff;text-decoration:underline;">Watch on YouTube</a>
          </div>`;
        wrapper.appendChild(fallback);
      }
    }, 2500); // 2.5s wait

    // Listen for iframe load event (not all errors trigger load)
    iframe.addEventListener('load', () => {
      // mark as loaded and clear fallback timer
      iframe.dataset.loaded = '1';
      clearTimeout(fallbackTimer);
      // remove any fallback that might have been added
      const existingFallback = wrapper.querySelector('.video-fallback');
      if (existingFallback) existingFallback.remove();
    });

    // Try to append iframe (may still show an internal YouTube error)
    wrapper.appendChild(iframe);
  }

  // Preload all slides at start: this prevents an apparently-empty slide when user navigates.
  // It also reveals non-embeddable videos as a fallback right away.
  videoSlides.forEach(slide => attachVideoToSlide(slide));

  // Move carousel by percentage of viewport (slides are flex: 0 0 100%)
  function updateVideoCarousel() {
    if (!carousel) return;
    const offset = -vCurrent * 100;
    carousel.style.transform = `translateX(${offset}%)`;
    // defensive: if the target slide somehow wasn't preloaded, attach now
    attachVideoToSlide(videoSlides[vCurrent]);
  }

  // next / prev handlers
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (!videoSlides.length) return;
    vCurrent = (vCurrent + 1) % videoSlides.length;
    updateVideoCarousel();
  });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (!videoSlides.length) return;
    vCurrent = (vCurrent - 1 + videoSlides.length) % videoSlides.length;
    updateVideoCarousel();
  });

  // initial position
  updateVideoCarousel();
  window.addEventListener('resize', updateVideoCarousel);

  /* ----------------- Sample data: places & packages ----------------- */
  // (This portion preserved from your working file - keeps modal slider, etc.)
  const samplePlaces = [
    { name: 'Himalayan Retreat', images: ['https://picsum.photos/seed/himalaya1/1200/800','https://picsum.photos/seed/himalaya2/1200/800','https://picsum.photos/seed/himalaya3/1200/800'], desc: 'Nestled in the serene mountains — cozy homestays with guided treks.' },
    { name: 'Goa Beachfront', images: ['https://picsum.photos/seed/goa1/1200/800','https://picsum.photos/seed/goa2/1200/800'], desc: 'Luxury beachfront homestays with private cabana and sea views.' },
    { name: 'Rajasthan Haveli', images: ['https://picsum.photos/seed/raj1/1200/800','https://picsum.photos/seed/raj2/1200/800'], desc: 'Palatial haveli stays — royal interiors and cultural evenings.' }
  ];

  const samplePackages = [
    { name: 'Royal Rajasthan', images:['https://picsum.photos/seed/raja1/1200/800','https://picsum.photos/seed/raja2/1200/800'], desc: '7 days of regal desert charm — forts, palaces & private safaris.' },
    { name: 'Kerala Backwaters', images:['https://picsum.photos/seed/kerala1/1200/800','https://picsum.photos/seed/kerala2/1200/800'], desc: 'Houseboat experience, spice plantation visit, and Ayurveda relaxation.' },
    { name: 'Himalayan Wellness', images:['https://picsum.photos/seed/hw1/1200/800','https://picsum.photos/seed/hw2/1200/800'], desc: 'Yoga, meditation and mountain walks with homestay hospitality.' }
  ];

  /* ----------------- Render grids ----------------- */
  const placesGrid = document.getElementById('placesGrid');
  const packagesGrid = document.getElementById('packagesGrid');

  function createCard(item, type) {
    const article = document.createElement('article');
    article.className = 'card';
    const thumb = item.images && item.images[0] ? item.images[0] : 'https://picsum.photos/seed/default/800/600';
    article.innerHTML = `<img src="${thumb}" alt="${item.name}"><div class="card-content"><h3>${item.name}</h3><p>${item.desc}</p></div>`;
    article.addEventListener('click', () => openModal(item, type));
    return article;
  }

  samplePlaces.forEach(p => placesGrid.appendChild(createCard(p, 'place')));
  samplePackages.forEach(p => packagesGrid.appendChild(createCard(p, 'package')));

  /* ----------------- Modal + slider ----------------- */
  const modalContainer = document.getElementById('modalContainer');
  const modalInner = document.getElementById('modalInner');
  const modalCloseBtn = document.querySelector('.modal-close');

  let sliderState = { images: [], index: 0 };

  function openModal(item, type) {
    sliderState.images = item.images || [];
    sliderState.index = 0;
    modalInner.innerHTML = buildModalHTML(item);
    modalContainer.classList.remove('hidden');
    modalContainer.setAttribute('aria-hidden', 'false');
    // focus for accessibility
    const firstFocusable = modalInner.querySelector('#sliderPrev') || modalInner;
    firstFocusable && firstFocusable.focus();
    attachModalHandlers();
    updateSlider();
  }

  function buildModalHTML(item) {
    const imagesHTML = sliderState.images.map((src, i) => `<div class="slide" data-idx="${i}" style="display:${i===0?'block':'none'}"><img src="${src}" alt="${item.name} image ${i+1}"></div>`).join('');
    return `
      <div class="modal-slider" id="modalSlider">
        ${imagesHTML}
        <div class="slider-controls">
          <button class="slider-btn" id="sliderPrev" aria-label="Previous image">&larr;</button>
          <button class="slider-btn" id="sliderNext" aria-label="Next image">&rarr;</button>
        </div>
      </div>
      <div class="modal-body">
        <h2>${item.name}</h2>
        <p>${item.desc}</p>
      </div>
    `;
  }

  function attachModalHandlers() {
    // controls
    const prevBtn = modalInner.querySelector('#sliderPrev');
    const nextBtn = modalInner.querySelector('#sliderNext');
    prevBtn && prevBtn.addEventListener('click', () => showSlide(sliderState.index - 1));
    nextBtn && nextBtn.addEventListener('click', () => showSlide(sliderState.index + 1));

    // overlay click closes when clicked outside modal-content
    modalContainer.addEventListener('click', overlayClick);

    // keyboard events
    document.addEventListener('keydown', keyHandler);

    // swipe support
    const slider = modalInner.querySelector('#modalSlider');
    if (slider) {
      let startX = 0, endX = 0;
      slider.addEventListener('touchstart', e => startX = e.touches[0].clientX);
      slider.addEventListener('touchmove', e => endX = e.touches[0].clientX);
      slider.addEventListener('touchend', () => {
        if (startX - endX > 30) showSlide(sliderState.index + 1);
        if (endX - startX > 30) showSlide(sliderState.index - 1);
      });
    }
  }

  function overlayClick(e) {
    if (e.target === modalContainer) closeModal();
  }

  function keyHandler(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showSlide(sliderState.index - 1);
    if (e.key === 'ArrowRight') showSlide(sliderState.index + 1);
  }

  function closeModal() {
    modalContainer.classList.add('hidden');
    modalContainer.setAttribute('aria-hidden', 'true');
    modalInner.innerHTML = '';
    // cleanup
    modalContainer.removeEventListener('click', overlayClick);
    document.removeEventListener('keydown', keyHandler);
  }

  modalCloseBtn && modalCloseBtn.addEventListener('click', closeModal);

  function showSlide(idx) {
    if (!sliderState.images.length) return;
    if (idx < 0) idx = sliderState.images.length - 1;
    if (idx >= sliderState.images.length) idx = 0;
    sliderState.index = idx;
    updateSlider();
  }

  function updateSlider() {
    const slides = modalInner.querySelectorAll('.slide');
    slides.forEach(s => s.style.display = 'none');
    const active = modalInner.querySelector(`.slide[data-idx="${sliderState.index}"]`);
    if (active) active.style.display = 'block';
  }

});
