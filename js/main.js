// main.js — carousel fix with proper slide width calculation

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------- Mobile Menu Toggle ----------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      
      // Update aria-expanded for accessibility
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close menu when clicking on a nav link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------- Smooth Scroll with Header Offset ----------------- */
  // Get header height dynamically
  const header = document.querySelector('.navbar');
  const headerHeight = header ? header.offsetHeight : 80;
  const offset = headerHeight + 20; // Header height + 20px padding

  // Handle all anchor links with hash
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or empty
      if (!href || href === '#') return;
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Calculate position accounting for header
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        // Smooth scroll to position
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL hash
        history.pushState(null, null, href);
      }
    });
  });
  /* ----------------- Video Carousel ----------------- */
  const carousel = document.getElementById('videoCarousel');
  const carouselContainer = document.querySelector('.carousel-container');
  const slides = carousel ? carousel.querySelectorAll('.video-slide') : [];
  let current = 0;

  // Load iframe for each slide
  slides.forEach((slide, index) => {
    const url = slide.dataset.video;
    if (url) {
      const iframe = document.createElement('iframe');
      iframe.src = url + (url.includes('?') ? '&rel=0' : '?rel=0');
      iframe.frameBorder = '0';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      slide.appendChild(iframe);
    }
  });

  // Core translation logic - get the actual slide width
  function slideTo(index) {
    if (!carousel || slides.length === 0) return;
    
    // Get the width of a single slide (they should all be the same)
    const slideWidth = slides[0].offsetWidth;
    
    // Ensure index wraps around
    current = ((index % slides.length) + slides.length) % slides.length;
    
    // Apply transform
    carousel.style.transform = `translateX(-${current * slideWidth}px)`;
    
    console.log(`Sliding to index ${current}, slideWidth: ${slideWidth}px, transform: -${current * slideWidth}px`);
  }

  // Buttons
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log('Next clicked, current:', current);
      slideTo(current + 1);
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log('Prev clicked, current:', current);
      slideTo(current - 1);
    });
  }

  // On resize, recalculate and maintain current position
  window.addEventListener('resize', () => {
    slideTo(current);
  });

  // Initialize after a small delay to ensure layout is complete
  setTimeout(() => {
    slideTo(0);
  }, 100);

  /* ----------------- Sample Data ----------------- */
  const samplePlaces = [
    {
      name: 'Himalayan Retreat',
      images: [
        'https://picsum.photos/seed/himalaya1/1200/800',
        'https://picsum.photos/seed/himalaya2/1200/800',
        'https://picsum.photos/seed/himalaya3/1200/800'
      ],
      desc:
        'Nestled in the serene mountains — cozy homestays with guided treks.'
    },
    {
      name: 'Goa Beachfront',
      images: [
        'https://picsum.photos/seed/goa1/1200/800',
        'https://picsum.photos/seed/goa2/1200/800'
      ],
      desc:
        'Luxury beachfront homestays with private cabana and sea views.'
    },
    {
      name: 'Rajasthan Haveli',
      images: [
        'https://picsum.photos/seed/raj1/1200/800',
        'https://picsum.photos/seed/raj2/1200/800'
      ],
      desc: 'Palatial haveli stays — royal interiors and cultural evenings.'
    }
  ];

  const samplePackages = [
    {
      name: 'Royal Rajasthan',
      images: [
        'https://picsum.photos/seed/raja1/1200/800',
        'https://picsum.photos/seed/raja2/1200/800'
      ],
      desc:
        '7 days of regal desert charm — forts, palaces & private safaris.'
    },
    {
      name: 'Kerala Backwaters',
      images: [
        'https://picsum.photos/seed/kerala1/1200/800',
        'https://picsum.photos/seed/kerala2/1200/800'
      ],
      desc:
        'Houseboat experience, spice plantation visit, and Ayurveda relaxation.'
    },
    {
      name: 'Himalayan Wellness',
      images: [
        'https://picsum.photos/seed/hw1/1200/800',
        'https://picsum.photos/seed/hw2/1200/800'
      ],
      desc:
        'Yoga, meditation and mountain walks with homestay hospitality.'
    }
  ];

  /* ----------------- Render Cards ----------------- */
  const placesGrid = document.getElementById('placesGrid');
  const packagesGrid = document.getElementById('packagesGrid');

  function createCard(item) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${item.images[0]}" alt="${item.name}" loading="lazy">
      <div class="card-content">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `;
    el.addEventListener('click', () => openModal(item));
    return el;
  }

  samplePlaces.forEach(p => placesGrid.appendChild(createCard(p)));
  samplePackages.forEach(p => packagesGrid.appendChild(createCard(p)));

  /* ----------------- Modal with Slider ----------------- */
  const modal = document.getElementById('modalContainer');
  const modalInner = document.getElementById('modalInner');
  const closeBtn = document.querySelector('.modal-close');
  let activeImages = [];
  let activeIndex = 0;

  function openModal(item) {
    activeImages = item.images;
    activeIndex = 0;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    renderModal(item);
  }

  function renderModal(item) {
    // Create slides with data-src for lazy loading
    const slides = activeImages
      .map(
        (img, i) => `
        <div class="slide" data-idx="${i}" style="display:${
          i === activeIndex ? 'block' : 'none'
        }">
          <img data-src="${img}" alt="${item.name} ${i + 1}" class="modal-img">
        </div>`
      )
      .join('');
    modalInner.innerHTML = `
      <div class="modal-slider" id="modalSlider">
        ${slides}
        <div class="slider-controls">
          <button class="slider-btn" id="prevImg">&larr;</button>
          <button class="slider-btn" id="nextImg">&rarr;</button>
        </div>
      </div>
      <div class="modal-body">
        <h2>${item.name}</h2>
        <p>${item.desc}</p>
      </div>
    `;

    // Load the first image immediately
    loadSlideImage(activeIndex);

    document
      .getElementById('prevImg')
      .addEventListener('click', () => showSlide(activeIndex - 1));
    document
      .getElementById('nextImg')
      .addEventListener('click', () => showSlide(activeIndex + 1));
  }

  // Function to load image for a specific slide
  function loadSlideImage(index) {
    const slides = modalInner.querySelectorAll('.slide');
    if (slides[index]) {
      const img = slides[index].querySelector('img');
      const dataSrc = img.getAttribute('data-src');
      
      // Only load if not already loaded
      if (dataSrc && !img.src) {
        img.src = dataSrc;
        img.removeAttribute('data-src');
      }
    }
  }

  function showSlide(i) {
    if (i < 0) i = activeImages.length - 1;
    if (i >= activeImages.length) i = 0;
    activeIndex = i;
    const slides = modalInner.querySelectorAll('.slide');
    slides.forEach(s => (s.style.display = 'none'));
    slides[activeIndex].style.display = 'block';
    
    // Load current image + preload next and previous for smooth experience
    loadSlideImage(activeIndex);
    
    // Preload adjacent images
    const nextIndex = (activeIndex + 1) % activeImages.length;
    const prevIndex = (activeIndex - 1 + activeImages.length) % activeImages.length;
    loadSlideImage(nextIndex);
    loadSlideImage(prevIndex);
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    modalInner.innerHTML = '';
  }
});
