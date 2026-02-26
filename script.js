// ── Split Welcome Text into Per-Letter Spans ──────────────────────────────
// Uses ONE .line-mask wrapper per word-span (overflow:hidden there, not per letter),
// which eliminates the pixel cuts that appear when every char has its own clip box.
function splitWelcomeText() {
    const welcomeText = document.querySelector('.welcome-text');
    if (!welcomeText) return;

    // Prevent double-splitting if called again somehow
    if (welcomeText.querySelector('.line-mask')) return;

    const spans = Array.from(welcomeText.querySelectorAll('span'));
    let globalIndex = 0; // shared counter for continuous stagger across both spans

    spans.forEach(span => {
        const rawText = span.textContent;
        span.textContent = '';

        // ONE overflow:hidden sleeve per word span — letters share the same slot
        const lineMask = document.createElement('span');
        lineMask.className = 'line-mask';

        Array.from(rawText).forEach(char => {
            if (char === ' ') {
                // Plain spacer — no clipping needed
                const space = document.createElement('span');
                space.className = 'char-space';
                lineMask.appendChild(space);
            } else {
                // The letter itself — translateY animates through the shared slot
                const inner = document.createElement('span');
                inner.className = 'char';
                inner.textContent = char;
                inner.style.transitionDelay = `${globalIndex * 0.052}s`;
                lineMask.appendChild(inner);
                globalIndex++;
            }
        });

        span.appendChild(lineMask);
    });
}


document.addEventListener("DOMContentLoaded", () => {
  splitWelcomeText(); // Split letters as soon as DOM is ready

  // Custom Cursor
  const cursor = document.querySelector(".cursor");



  // Smooth Scroll (Lenis)
  let lenis;
  const scrollContainer = document.querySelector('.main-container');
  if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true
      });

      function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.1; // Smoothing factor (lower is slower/smoother)
      cursorY += dy * 0.1;
      
      cursor.style.left = cursorX + "px";
      cursor.style.top = cursorY + "px";
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor Hover Effects (Using event delegation for dynamic elements)
    document.body.addEventListener("mouseenter", (e) => {
        if (e.target.closest && e.target.closest("a, .work-item, .gallery-img, #photography-trigger, .apple-skill")) {
            cursor.style.transform = "translate(-50%, -50%) scale(2.5)";
            cursor.style.border = "none";
        }
    }, true);

    document.body.addEventListener("mouseleave", (e) => {
        if (e.target.closest && e.target.closest("a, .work-item, .gallery-img, #photography-trigger, .apple-skill")) {
            cursor.style.transform = "translate(-50%, -50%) scale(1)";
            cursor.style.border = "none";
        }
    }, true);
  }

  // Intro Logic with Session Persistence
  const introOverlay = document.querySelector(".intro-overlay");
  
  if (introOverlay) {
      // Always show intro initially
      document.body.classList.add("intro-active");

      // Always attach the listener so it works even if re-activated later
      introOverlay.addEventListener("click", () => {
          document.body.classList.remove("intro-active");
          document.body.classList.add("hero-anim-active"); // Trigger hero text animation
          // sessionStorage.setItem("introShown", "true"); // Not used for init check anymore
      });
  } else {
      // If intro overlay is missing for some reason, ensure animation triggers
      document.body.classList.add("hero-anim-active");
  }

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null, // Use viewport as root
    threshold: 0.05,
    rootMargin: "0px 0px -50px 0px" // Trigger slightly after they cross the bottom
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);

  // Observe all elements with the animation class
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .reveal-on-scroll');
  animatedElements.forEach(el => observer.observe(el));
  
  // Also observe sections if needed for other logic, but primarily for animation we use class
  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach(section => {
      // If sections themselves have the class, they are already observed.
      // If not, we can observe them for nav highlighting etc.
      observer.observe(section); 
  });

  // Smooth Scroll for Internal Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          const targetSection = document.querySelector(targetId);
          if (targetSection) {
              targetSection.scrollIntoView({
                  behavior: 'smooth'
              });
          }
      });
  });



  // Reset Intro Logic when clicking "HOME"
  const resetBtn = document.getElementById("reset-home");

  if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
          e.preventDefault(); 
          
          // Smooth scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Re-activate Intro
          document.body.classList.add("intro-active");
          sessionStorage.removeItem("introShown");
      });
  }

  // Scroll-Driven "About Me" Title Animation
  const aboutTitle = document.querySelector('.about-title');
  const aboutTitleWrapper = aboutTitle ? aboutTitle.parentElement : null;
  const aboutSection = document.getElementById('about');
  const scrollContainerForAbout = document.querySelector('.main-container');

  if (aboutTitleWrapper && aboutSection && window.innerWidth > 768) {
      // Set initial state on the wrapper instead of the title to avoid clipping
      aboutTitleWrapper.style.transform = "translateY(-100px)"; 
      aboutTitleWrapper.style.transition = "none";
      // Ensure the title doesn't have broken inline styles
      if (aboutTitle) {
          aboutTitle.style.transform = "";
          aboutTitle.style.transition = "";
      }

      window.addEventListener('scroll', () => {
          const rect = aboutSection.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Check if section is entering view from bottom
          if (rect.top <= viewportHeight && rect.bottom >= 0) {
              // Calculate progress
              // 0 = section top is at bottom of viewport (entering)
              // 1 = section top is at top of viewport (fully scrolled to)
              
              // We want text to start at -100px (or similar) when first entering
              // And slide to 0px when the section is fully in view (or slightly before)
              
              // Key point: The text is at the top of the section.
              // So we care about when the top of the section is visible.
              
              const distanceFromTop = rect.top;
              
              // Mapping:
              // When distanceFromTop is large (near viewport height), offset should be negative (upwards, towards black section).
              // When distanceFromTop is small (near 0 or header height), offset should be 0.
              
              // Let's say range: Viewport/2 to 0.
              
              let offset = 0;
              const range = viewportHeight / 1.5;
              
              if (distanceFromTop < range) {
                  // Normalize progress 0 to 1
                   // 1 at top edge, 0 at range start
                  const progress = (range - distanceFromTop) / range;
                  
                  // Invert: we want it to go from -100 to 0.
                  // At start of range (progress 0), offset is -100.
                  // At end of range (progress 1), offset is 0.
                  
                  // However, user said "slide from black". Black is ABOVE.
                  // So it should start "higher" (negative Y) and come down to 0.
                  
                  // Let's modify logic: simple parallax.
                  // Offset = negative value proportional to distance from top.
                  
                  offset = -1 * (distanceFromTop * 0.3); // 0.3 factor for speed
                  
                  // Cap it so it doesn't go too high off screen
                  if (offset < -150) offset = -150;
                  if (offset > 0) offset = 0; // Should not go below natural pos
                  
              } else {
                   // When further down, stay hidden or fixed? 
                   // Let's keep smooth
                   offset = -150;
              }

              aboutTitleWrapper.style.transform = `translateY(${offset}px)`;
          }
      });
  }

  // Works Section Cursor Inversion - REMOVED (Handled by CSS mix-blend-mode)
  /*
  const worksSection = document.getElementById("works");
  if (worksSection) {
     // Logic removed
  }
  */

  // Scroll-Controlled Marquee (About Me)
  const softwareTrack = document.querySelector('.software-track');
  // Re-selecting mainContainer just to be safe and local, although it's defined above
  // Using the variable 'mainContainer' which is already available in this scope is better if it covers the whole function.
  // Actually, 'mainContainer' variable scope in original file is inside "Anti-Gravity Scroll Logic" or "Scroll-Synced Text Separation". 
  // Let's use document.querySelector('.main-container') to be safe and independent.
  const marqueeScrollContainer = document.querySelector('.main-container'); 

  if (softwareTrack && marqueeScrollContainer) {
      let currentPos = 0;
      let baseSpeed = 1; // Pixels per frame
      let scrollSpeed = 0;
      let targetScrollSpeed = 0;
      
      // We need to measure width to know when to loop
      // The HTML has duplicated items. We assume half the width is one full set.
      let trackWidth = softwareTrack.scrollWidth;
      let halfWidth = trackWidth / 2;
      
      // Update width on resize
      window.addEventListener('resize', () => {
          trackWidth = softwareTrack.scrollWidth;
          halfWidth = trackWidth / 2;
      });

      // Detect Scroll
      let lastScrollTop = window.scrollY;
      
      window.addEventListener('scroll', () => {
          const scrollTop = window.scrollY;
          const delta = scrollTop - lastScrollTop;
          lastScrollTop = scrollTop;
          
          targetScrollSpeed = delta * 2.5; 
      });
      
      
      function animateMarquee() {
          // Smoothly interpolate current scrollSpeed towards target (0/stopped or active scroll)
          scrollSpeed += (targetScrollSpeed - scrollSpeed) * 0.1;
          
          // Friction to settle target back to 0 when not scrolling
          targetScrollSpeed *= 0.95; 

          // Calculate movement
          // baseSpeed is constant leftward drift.
          // scrollSpeed adds/subtracts from it.
          let moveAmount = baseSpeed + scrollSpeed;
          
          currentPos -= moveAmount;
          
          // Loop Logic
          if (currentPos <= -halfWidth) {
              currentPos += halfWidth; 
          }
          if (currentPos > 0) {
              currentPos -= halfWidth; 
          }

          softwareTrack.style.transform = `translateX(${currentPos}px)`;
          
          requestAnimationFrame(animateMarquee);
      }
      
      requestAnimationFrame(animateMarquee);
  }

  // Hero Text Smooth Parallax
  const heroTextElements = document.querySelectorAll('.hero-overlay-text .reveal-inner');
  const heroSection = document.getElementById('home');
  const mainScrollContainer = document.querySelector('.main-container');

  if (heroTextElements.length > 0 && heroSection && mainScrollContainer) {
      let currentScrollY = 0;
      let targetScrollY = 0;
      
      // Update target on scroll
      window.addEventListener('scroll', () => { // Changed to window.addEventListener
          targetScrollY = window.scrollY; // Changed to window.scrollY
      });

      const heroImage = document.querySelector('.hero-image');

      function animateHeroParallax() {
          // Lenis already smooth scrolls window.scrollY; a second JS lerp causes jitter and detachment.
          currentScrollY = targetScrollY;

          // Expansion range matches the "extra" height in #home (50vh)
          const expandRange = window.innerHeight * 0.5;
          const progress = Math.min(Math.max(currentScrollY / expandRange, 0), 1);

          // 1. Text Parallax (only during expansion)
          if (currentScrollY < window.innerHeight * 1.5) {
              heroTextElements.forEach((el, index) => {
                  const speed = 0.2 + (index * 0.05); 
                  const offset = -currentScrollY * speed;
                  
                  // Preserve original X centering depending on element class
                  const isRight = el.parentElement.classList.contains('text-right');
                  const transX = isRight ? '50%' : '-50%';
                  el.parentElement.style.transform = `translate(${transX}, calc(-50% + ${offset}px))`;
              });

              // 2. Image Expansion (90% to 100%)
              if (heroImage) {
                  // Interpolate scale from 0.9 to 1.0
                  const scale = 0.9 + (progress * 0.1);
                  heroImage.style.transform = `scale(${scale})`;

                  // 3. Welcome Section reveal is now handled by IntersectionObserver (below)
              }
          }

          requestAnimationFrame(animateHeroParallax);
      }
      animateHeroParallax();
  }

  // ── Welcome Section — Scroll-Triggered Letter Animation ──────────────────
  // Fires whenever #welcome enters OR leaves the viewport (scroll up & down).
  const welcomeSection = document.getElementById('welcome');
  if (welcomeSection) {
      const welcomeObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  // Section is approaching / in view → play letters in
                  welcomeSection.classList.add('visible');
              } else {
                  // Section has left view → reset so animation replays next visit
                  welcomeSection.classList.remove('visible');
              }
          });
      }, {
          root: null,
          // Trigger when ~15% of the section is visible (i.e. just before the
          // text reaches the screen centre — feels like "about to reach it")
          threshold: 0.15
      });

      welcomeObserver.observe(welcomeSection);
  }

  // Photography Gallery Logic
  const photographyTrigger = document.getElementById('photography-trigger');
  const photographyGallery = document.getElementById('photography-gallery');
  const galleryMasonry = document.querySelector('.gallery-masonry');

  const photographyImages = [
      "Click.jpg", "IMG_2921 copy.jpg", "WhatsApp Image 2026-02-20 at 16.10.33.jpeg",
      "WhatsApp Image 2026-02-20 at 16.10.36.jpeg", "WhatsApp Image 2026-02-20 at 16.10.40.jpeg",
      "WhatsApp Image 2026-02-20 at 16.10.42.jpeg", "WhatsApp Image 2026-02-20 at 16.11.46.jpeg",
      "WhatsApp Image 2026-02-20 at 16.11.51.jpeg", "WhatsApp Image 2026-02-20 at 16.11.54.jpeg",
      "WhatsApp Image 2026-02-20 at 16.11.56.jpeg", "WhatsApp Image 2026-02-20 at 16.11.58.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.00.jpeg", "WhatsApp Image 2026-02-20 at 16.12.02.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.04.jpeg", "WhatsApp Image 2026-02-20 at 16.12.06.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.08.jpeg", "WhatsApp Image 2026-02-20 at 16.12.33.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.35.jpeg", "WhatsApp Image 2026-02-20 at 16.12.40.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.43.jpeg", "WhatsApp Image 2026-02-20 at 16.12.45.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.47.jpeg", "WhatsApp Image 2026-02-20 at 16.12.50.jpeg",
      "WhatsApp Image 2026-02-20 at 16.12.52.jpeg", "WhatsApp Image 2026-02-20 at 16.12.56.jpeg",
      "WhatsApp Image 2026-02-20 at 16.13.53.jpeg", "WhatsApp Image 2026-02-20 at 16.13.55.jpeg",
      "WhatsApp Image 2026-02-20 at 16.15.14.jpeg", "WhatsApp Image 2026-02-20 at 16.16.56.jpeg",
      "WhatsApp Image 2026-02-20 at 16.16.59.jpeg", "WhatsApp Image 2026-02-20 at 16.17.03.jpeg",
      "WhatsApp Image 2026-02-20 at 16.17.06.jpeg", "WhatsApp Image 2026-02-20 at 16.19.00.jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.21 (1).jpeg", "WhatsApp Image 2026-02-25 at 17.29.21.jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.22 (1).jpeg", "WhatsApp Image 2026-02-25 at 17.29.22.jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.23 (1).jpeg", "WhatsApp Image 2026-02-25 at 17.29.23 (2).jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.23.jpeg", "WhatsApp Image 2026-02-25 at 17.29.24 (1).jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.24 (2).jpeg", "WhatsApp Image 2026-02-25 at 17.29.24.jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.25 (1).jpeg", "WhatsApp Image 2026-02-25 at 17.29.25 (2).jpeg",
      "kozhikode.jpg", "liyakath copy.png", "lliiyakath_pose.jpg", "malabar monochromatic.jpg",
      "manassery.jpg", "muthalam 2.jpg", "muthalam-4.jpg", "netta copy 2.jpg", "netta2.jpg",
      "palakkad-1 out.jpg", "palakkad3.jpg", "road2.jpg", "swabe copy.jpg", "swabee1 copy.jpg", "swabee3 copy.jpg"
  ];

  if (photographyTrigger && photographyGallery) {
      let galleryLoaded = false;
      
      photographyTrigger.addEventListener('click', () => {
          const isActive = photographyGallery.classList.contains('active');
          
          if (!isActive) {
              // Opening
              photographyGallery.classList.add('active');
              
              if (!galleryLoaded) {
                  // Shuffle images for random order
                  for (let i = photographyImages.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [photographyImages[i], photographyImages[j]] = [photographyImages[j], photographyImages[i]];
                  }

                  photographyImages.forEach((imgName, index) => {
                      const wrapper = document.createElement('div');
                      wrapper.className = 'gallery-item animate-on-scroll';
                      // Staggered reveal delay (based on 3-column row index)
                      // Prevents all images in the viewport from popping at once
                      const delay = (index % 3) * 0.15;
                      wrapper.style.transitionDelay = `${delay}s`;

                      const img = document.createElement('img');
                      img.src = `photography/${imgName}`;
                      img.alt = "Photography";
                      img.className = 'gallery-img';
                      
                      wrapper.appendChild(img);
                      galleryMasonry.appendChild(wrapper);
                      
                      if (typeof observer !== 'undefined') {
                          observer.observe(wrapper);
                      }
                  });
                  galleryLoaded = true;
              }
              
              // Wait for image injection and start of transition
              setTimeout(() => {
                  if (lenis) lenis.resize();
              }, 100);
          } else {
              // Closing
              photographyGallery.classList.remove('active');
          }

          // Force a final resize after animation duration (1.2s in CSS)
          setTimeout(() => {
              if (lenis) lenis.resize();
          }, 1300);
      });
  }

});
