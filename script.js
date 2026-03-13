// ── Split Welcome Text into Per-Letter Spans ──────────────────────────────
// Uses ONE .line-mask wrapper per word-span (overflow:hidden there, not per letter),
// which eliminates the pixel cuts that appear when every char has its own clip box.
function splitWelcomeText() {
    const welcomeText = document.querySelector('.welcome-text');
    if (!welcomeText) return;

    // Prevent double-splitting if called again somehow
    if (welcomeText.querySelector('.line-mask')) return;

    const spans = Array.from(welcomeText.querySelectorAll('.split-target'));
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
function splitIntroText() {
    const introOverlay = document.querySelector('.intro-overlay');
    if (!introOverlay) return;

    if (introOverlay.querySelector('.intro-char-mask')) return;

    const spans = Array.from(introOverlay.querySelectorAll('span'));
    let globalIndex = 0;

    spans.forEach(span => {
        // Skip child spans if anything else triggers this
        if (span.children.length > 0) return;

        const rawText = span.textContent;
        span.textContent = '';

        Array.from(rawText).forEach(char => {
            if (char === ' ') {
                const space = document.createElement('span');
                space.innerHTML = '&nbsp;';
                span.appendChild(space);
            } else {
                const charMask = document.createElement('span');
                charMask.className = 'intro-char-mask';

                const inner = document.createElement('span');
                inner.className = globalIndex % 2 === 0 ? 'intro-char up' : 'intro-char down';
                inner.textContent = char;
                inner.style.animationDelay = `${0.3 + globalIndex * 0.08}s`;

                charMask.appendChild(inner);
                span.appendChild(charMask);
                globalIndex++;
            }
        });
    });
}

function splitChars() {
    const targets = document.querySelectorAll('.split-chars');
    targets.forEach(target => {
        let globalIndex = 0;
        
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (!text.trim() && !text.includes(' ')) return; // Skip purely empty/whitespace nodes without visible spaces
                
                const fragment = document.createDocumentFragment();
                let hasValidContent = false;
                
                Array.from(text).forEach((char) => {
                    if (char === ' ') {
                        const space = document.createElement('span');
                        space.className = 'char-space';
                        space.innerHTML = '&nbsp;';
                        fragment.appendChild(space);
                        hasValidContent = true;
                    } else if (char !== '\n' && char !== '\r' && char !== '\t') {
                        const mask = document.createElement('span');
                        mask.className = 'line-mask';
                        const inner = document.createElement('span');
                        inner.className = 'char-reveal';
                        inner.textContent = char;
                        inner.style.transitionDelay = `${globalIndex * 0.05}s`;
                        mask.appendChild(inner);
                        fragment.appendChild(mask);
                        globalIndex++;
                        hasValidContent = true;
                    }
                });
                
                if (hasValidContent) {
                    node.parentNode.replaceChild(fragment, node);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList.contains('line-mask') || node.classList.contains('char-reveal')) return;
                const children = Array.from(node.childNodes);
                children.forEach(child => processNode(child));
            }
        }
        
        const children = Array.from(target.childNodes);
        children.forEach(child => processNode(child));
    });
}

document.addEventListener("DOMContentLoaded", () => {
  splitIntroText();
  splitWelcomeText(); // Split letters as soon as DOM is ready
  splitChars();

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
        const targetElem = e.target.closest && e.target.closest("a, .work-item, .gallery-item, .gallery-img, #photography-trigger, .apple-skill");
        if (targetElem) {
            // Do not enlarge cursor on ukulele/keyboard gallery images
            if (targetElem.closest && targetElem.closest('.ukulele-gallery .gallery-item, .keyboard-gallery .gallery-item')) return;
            
            cursor.style.transform = "translate(-50%, -50%) scale(2.5)";
            cursor.style.border = "none";
        }
    }, true);

    document.body.addEventListener("mouseleave", (e) => {
        const targetElem = e.target.closest && e.target.closest("a, .work-item, .gallery-item, .gallery-img, #photography-trigger, .apple-skill");
        if (targetElem) {
            if (targetElem.closest && targetElem.closest('.ukulele-gallery .gallery-item, .keyboard-gallery .gallery-item')) return;
            
            cursor.style.transform = "translate(-50%, -50%) scale(1)";
            cursor.style.border = "none";
        }
    }, true);
  }

  // Intro Logic with Session Persistence
  const introOverlay = document.querySelector(".intro-overlay");
  
  // Idle Timeout Logic
  let idleTimer = null;
  const IDLE_TIMEOUT_MS = 60000; // 60 seconds of inactivity triggers the screen
  
  function resetIdleTimer() {
      clearTimeout(idleTimer);
      // Only start the countdown if the intro is not currently showing
      if (!document.body.classList.contains("intro-active")) {
          idleTimer = setTimeout(() => {
              document.body.classList.add("intro-active");
          }, IDLE_TIMEOUT_MS);
      }
  }

  // Listen for any form of user interaction to keep the site "awake"
  const interactionEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];
  interactionEvents.forEach(event => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
  });

  if (introOverlay) {
      // Always show intro initially
      document.body.classList.add("intro-active");

      // Always attach the listener so it works even if re-activated later
      introOverlay.addEventListener("click", () => {
          document.body.classList.remove("intro-active");
          document.body.classList.add("hero-anim-active"); // Trigger hero text animation
          resetIdleTimer(); // Start the idle countdown as soon as they engage
      });
  } else {
      // If intro overlay is missing for some reason, ensure animation triggers
      document.body.classList.add("hero-anim-active");
      resetIdleTimer();
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

              // 2. Element Expansion (90% to 100%)
              if (heroImage) {
                  // Interpolate scale from 0.9 to 1.0
                  const scale = 0.9 + (progress * 0.1);
                  heroImage.style.transform = `scale(${scale})`;
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

  if (welcomeSection) {
      const multilingualInners = document.querySelectorAll('.multilingual-inner');
      const welcomeVideoWrapper = document.querySelector('.welcome-video-wrapper');
      multilingualInners.forEach(inner => inner.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'); // Re-add smooth snap transition

      window.addEventListener('scroll', () => {
          const rect = welcomeSection.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // 1. Multilingual Text Translation
          if (multilingualInners.length > 0) {
              // Start changing text only when section sticks at the top
              const startTop = 0;
              const endTop = -viewportHeight * 1.0; // Adjusted for 200vh section
              
              let progress = (startTop - rect.top) / (startTop - endTop);
              if (progress < 0) progress = 0;
              if (progress > 1) progress = 1;

              multilingualInners.forEach(inner => {
                  if (inner.children.length > 0) {
                      const itemHeight = inner.children[0].offsetHeight;
                      const numItems = inner.children.length;
                      
                      // Map progress to exact indices to avoid stopping between lines
                      let index = Math.floor(progress * numItems);
                      if (index >= numItems) index = numItems - 1; // Cap at max
                      if (progress === 1) index = numItems - 1;    // Ensure last item at bottom
                      
                      const yTranslate = index * itemHeight;
                      
                      inner.style.transform = `translateY(-${yTranslate}px)`;
                  }
              });
          }

          // 2. Video Zoom Effect
          if (welcomeVideoWrapper) {
              // Start zooming when it's fully stuck at top (rect.top <= 0)
              // Finish zooming when reaching the end of the section (-viewportHeight * 1.0)
              let videoProgress = -rect.top / (viewportHeight * 1.0);
              if (videoProgress < 0) videoProgress = 0;
              if (videoProgress > 1) videoProgress = 1;

              // Starting dimensions: 30vw width, 40vh height, 5px radius
              // Ending dimensions: 60vw width, 60vh height, 5px radius
              const currentWidth = 30 + (30 * videoProgress); // 30 + 30 = 60vw max
              const currentHeight = 40 + (20 * videoProgress); // 40 + 20 = 60vh max
              const currentRadius = 5;

              welcomeVideoWrapper.style.width = `${currentWidth}vw`;
              welcomeVideoWrapper.style.height = `${currentHeight}vh`;
              welcomeVideoWrapper.style.borderRadius = `${currentRadius}px`;
          }
      });
  }

  // Photography Gallery Logic
  const photographyTrigger = document.getElementById('photography-trigger');
  const photographyGallery = document.getElementById('photography-gallery');
  const galleryMasonry = document.querySelector('.gallery-masonry');

  const photographyImages = [
      "ifthar-ietm.png", "Click.jpg", "IMG_2921 copy.jpg", "WhatsApp Image 2026-02-20 at 16.10.33.jpeg",
      "WhatsApp Image 2026-02-20 at 16.10.36.jpeg", "WhatsApp Image 2026-02-20 at 16.10.42.jpeg",
      "WhatsApp Image 2026-02-20 at 16.11.46.jpeg", "WhatsApp Image 2026-02-20 at 16.11.51.jpeg",
      "WhatsApp Image 2026-02-20 at 16.11.54.jpeg", "WhatsApp Image 2026-02-20 at 16.11.56.jpeg",
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
      "WhatsApp Image 2026-02-25 at 17.29.23 (1).jpeg", "WhatsApp Image 2026-02-25 at 17.29.23.jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.24 (1).jpeg", "WhatsApp Image 2026-02-25 at 17.29.24 (2).jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.24.jpeg", "WhatsApp Image 2026-02-25 at 17.29.25 (1).jpeg",
      "WhatsApp Image 2026-02-25 at 17.29.25 (2).jpeg", "WhatsApp Image 2026-02-27 at 08.31.49 (1).jpeg",
      "WhatsApp Image 2026-02-27 at 08.31.49.jpeg", "WhatsApp Image 2026-02-27 at 08.31.50.jpeg",
      "WhatsApp Image 2026-02-27 at 08.31.51 (1).jpeg", "WhatsApp Image 2026-02-27 at 08.31.51.jpeg",
      "WhatsApp Image 2026-02-27 at 08.31.52.jpeg", "kozhikode.jpg", "liyakath copy.png",
      "malabar monochromatic.jpg", "manassery.jpg", "muthalam 2.jpg", "muthalam-4.jpg",
      "netta copy 2.jpg", "netta2.jpg", "palakkad-1 out.jpg", "palakkad3.jpg", "road2.jpg",
      "swabe copy.jpg", "swabee1 copy.jpg", "swabee3 copy.jpg"
  ];

  if (photographyTrigger && photographyGallery) {
      let galleryLoaded = false;
      
      photographyTrigger.addEventListener('click', () => {
          const isActive = photographyGallery.classList.contains('active');
          
          if (!isActive) {
              // Close others
              ['drawing-gallery', 'ukulele-gallery', 'keyboard-gallery'].forEach(id => {
                  const el = document.getElementById(id);
                  if (el) el.classList.remove('active');
              });

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

  // Drawing Gallery Logic
  const drawingTrigger = document.getElementById('drawing-trigger');
  const drawingGallery = document.getElementById('drawing-gallery');
  const drawingMasonry = drawingGallery ? drawingGallery.querySelector('.gallery-masonry') : null;

  const drawingImages = [
      "WhatsApp Image 2026-02-26 at 10.39.43 (1).jpeg", "WhatsApp Image 2026-02-26 at 10.39.43.jpeg",
      "WhatsApp Image 2026-02-26 at 10.39.44 (1).jpeg", "WhatsApp Image 2026-02-26 at 10.39.44.jpeg"
  ];

  if (drawingTrigger && drawingGallery && drawingMasonry) {
      let drawingLoaded = false;
      
      drawingTrigger.addEventListener('click', () => {
          const isActive = drawingGallery.classList.contains('active');
          
          if (!isActive) {
              // Close others
              ['photography-gallery', 'ukulele-gallery', 'keyboard-gallery'].forEach(id => {
                  const el = document.getElementById(id);
                  if (el) el.classList.remove('active');
              });

              // Opening
              drawingGallery.classList.add('active');
              
              if (!drawingLoaded) {
                  // Shuffle images for random order
                  for (let i = drawingImages.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [drawingImages[i], drawingImages[j]] = [drawingImages[j], drawingImages[i]];
                  }

                  drawingImages.forEach((imgName, index) => {
                      const wrapper = document.createElement('div');
                      wrapper.className = 'gallery-item animate-on-scroll';
                      // Staggered reveal delay (based on 3-column row index)
                      const delay = (index % 3) * 0.15;
                      wrapper.style.transitionDelay = `${delay}s`;

                      const img = document.createElement('img');
                      img.src = `drawing/${imgName}`;
                      img.alt = "Drawing";
                      img.className = 'gallery-img';
                      
                      wrapper.appendChild(img);
                      drawingMasonry.appendChild(wrapper);
                      
                      if (typeof observer !== 'undefined') {
                          observer.observe(wrapper);
                      }
                  });
                  drawingLoaded = true;
              }
              
              // Wait for image injection and start of transition
              setTimeout(() => {
                  if (lenis) lenis.resize();
              }, 100);
          } else {
              // Closing
              drawingGallery.classList.remove('active');
          }

          // Force a final resize after animation duration (1.2s in CSS)
          setTimeout(() => {
              if (lenis) lenis.resize();
          }, 1300);
      });
  }

  // Ukulele Gallery Logic
  const ukuleleTrigger = document.getElementById('ukulele-trigger');
  const ukuleleGallery = document.getElementById('ukulele-gallery');
  const ukuleleMasonry = ukuleleGallery ? ukuleleGallery.querySelector('.gallery-masonry') : null;

  const ukuleleImages = [
      "uku.jpeg"
  ];

  if (ukuleleTrigger && ukuleleGallery && ukuleleMasonry) {
      let ukuleleLoaded = false;
      
      ukuleleTrigger.addEventListener('click', () => {
          const isActive = ukuleleGallery.classList.contains('active');
          
          if (!isActive) {
              // Close others
              ['photography-gallery', 'drawing-gallery', 'keyboard-gallery'].forEach(id => {
                  const el = document.getElementById(id);
                  if (el) el.classList.remove('active');
              });

              // Opening
              ukuleleGallery.classList.add('active');
              
              if (!ukuleleLoaded) {
                  // Shuffle images for random order (only 1 image but keeping logic consistent)
                  for (let i = ukuleleImages.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [ukuleleImages[i], ukuleleImages[j]] = [ukuleleImages[j], ukuleleImages[i]];
                  }

                  ukuleleImages.forEach((imgName, index) => {
                      const wrapper = document.createElement('div');
                      wrapper.className = 'gallery-item animate-on-scroll';
                      // Staggered reveal delay (based on 3-column row index)
                      const delay = (index % 3) * 0.15;
                      wrapper.style.transitionDelay = `${delay}s`;

                      wrapper.innerHTML = `
                          <img src="ukulele/${imgName}" alt="Ukulele" class="gallery-img">
                          <div class="listen-btn-container hover-overlay-content">
                              <a href="#about" class="listen-btn ukulele-about-btn">About</a>
                              <a href="https://drive.google.com/drive/folders/1VLMlWOnvdrWqk0vMXKlntKmnReYUOJKT?usp=drive_link" target="_blank" class="listen-btn">Listen</a>
                              <a href="#mystory" class="listen-btn ukulele-story-btn">My Story</a>
                          </div>
                          <div class="ukulele-about-content">
                              <p>The ukulele (/ˌjuːkəˈleɪli/ YOO-kə-LAY-lee; Hawaiian: [ʔukulele]), also called a uke (informally), is a member of the lute (ancient guitar) family of instruments. The ukulele is of Portuguese origin and was popularized in Hawaii. The tone and volume of the instrument vary with size and construction. Ukuleles commonly come in four sizes: soprano, concert, tenor, and baritone.<br><br>Ukuleles generally have four nylon strings tuned to GCEA (except baritone, which is normally tuned DGBE). They have 16–22 frets depending on the size</p>
                              <a href="#" class="listen-btn ukulele-back-btn">Back</a>
                          </div>
                          <div class="ukulele-story-content">
                              <p>My musical evolution took a rhythmic turn during my first year of university. While in the hostel, I was introduced to the ukulele by a friend, Ahmed Rishan. Having already mastered the keyboard, I quickly discovered the underlying structural connections between the keys and the strings.<br><br>This existing musical "logic" allowed me to accelerate my learning. Through daily practice, I moved beyond the basics to master complex chord progressions and intricate strumming patterns. Today, I enjoy the creative freedom of arranging and playing songs by ear—a testament to how a strong foundation in one discipline can fuel mastery in another.</p>
                              <a href="#" class="listen-btn ukulele-story-back-btn">Back</a>
                          </div>
                      `;
                      ukuleleMasonry.appendChild(wrapper);
                      
                      const aboutBtn = wrapper.querySelector('.ukulele-about-btn');
                      const backBtn = wrapper.querySelector('.ukulele-back-btn');
                      const storyBtn = wrapper.querySelector('.ukulele-story-btn');
                      const storyBackBtn = wrapper.querySelector('.ukulele-story-back-btn');
                      const btnContainer = wrapper.querySelector('.listen-btn-container');
                      const aboutContent = wrapper.querySelector('.ukulele-about-content');
                      const storyContent = wrapper.querySelector('.ukulele-story-content');

                      aboutBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          btnContainer.classList.add('hidden-state');
                          aboutContent.classList.add('active-state');
                      });

                      backBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          aboutContent.classList.remove('active-state');
                          btnContainer.classList.remove('hidden-state');
                      });

                      storyBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          btnContainer.classList.add('hidden-state');
                          storyContent.classList.add('active-state');
                      });

                      storyBackBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          storyContent.classList.remove('active-state');
                          btnContainer.classList.remove('hidden-state');
                      });
                      
                      if (typeof observer !== 'undefined') {
                          observer.observe(wrapper);
                      }
                  });
                  ukuleleLoaded = true;
              }
              
              // Wait for image injection and start of transition
              setTimeout(() => {
                  if (lenis) lenis.resize();
              }, 100);
          } else {
              // Closing
              ukuleleGallery.classList.remove('active');
          }

          // Force a final resize after animation duration (1.2s in CSS)
          setTimeout(() => {
              if (lenis) lenis.resize();
          }, 1300);
      });
  }

  // Keyboard Gallery Logic
  const keyboardTrigger = document.getElementById('keyboard-trigger');
  const keyboardGallery = document.getElementById('keyboard-gallery');
  const keyboardMasonry = keyboardGallery ? keyboardGallery.querySelector('.gallery-masonry') : null;

  const keyboardImages = [
      "keys.jpeg"
  ];

  if (keyboardTrigger && keyboardGallery && keyboardMasonry) {
      let keyboardLoaded = false;
      
      keyboardTrigger.addEventListener('click', () => {
          const isActive = keyboardGallery.classList.contains('active');
          
          if (!isActive) {
              // Close others
              ['photography-gallery', 'drawing-gallery', 'ukulele-gallery'].forEach(id => {
                  const el = document.getElementById(id);
                  if (el) el.classList.remove('active');
              });

              // Opening
              keyboardGallery.classList.add('active');
              
              if (!keyboardLoaded) {
                  // Shuffle images for random order (only 1 image but keeping logic consistent)
                  for (let i = keyboardImages.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [keyboardImages[i], keyboardImages[j]] = [keyboardImages[j], keyboardImages[i]];
                  }

                  keyboardImages.forEach((imgName, index) => {
                      const wrapper = document.createElement('div');
                      wrapper.className = 'gallery-item animate-on-scroll';
                      // Staggered reveal delay (based on 3-column row index)
                      const delay = (index % 3) * 0.15;
                      wrapper.style.transitionDelay = `${delay}s`;

                      wrapper.innerHTML = `
                          <img src="keyboard/${imgName}" alt="Musical Keyboard" class="gallery-img">
                          <div class="listen-btn-container hover-overlay-content">
                              <a href="#about" class="listen-btn keyboard-about-btn">About</a>
                              <a href="https://drive.google.com/drive/folders/1VLMlWOnvdrWqk0vMXKlntKmnReYUOJKT?usp=drive_link" target="_blank" class="listen-btn">Listen</a>
                              <a href="#mystory" class="listen-btn keyboard-story-btn">My Story</a>
                          </div>
                          <div class="keyboard-about-content">
                              <p>A musical keyboard is the set of adjacent depressible levers or keys on a musical instrument. Keyboards typically contain keys for playing the twelve notes of the Western musical scale, with a combination of larger, longer keys and smaller, shorter keys that repeat at the interval of an octave. Pressing a key on the keyboard makes the instrument produce a sound—either by mechanically striking a string or tine (acoustic and electric piano, clavichord), plucking a string (harpsichord), causing air to flow through a pipe (pipe organ), striking a bell (carillon), or activating an electronic circuit (synthesizer, digital piano, electronic keyboard). Since the most commonly encountered keyboard instrument is the piano, the keyboard layout is often referred to as the piano keyboard or simply piano keys.</p>
                              <a href="#" class="listen-btn keyboard-back-btn">Back</a>
                          </div>
                          <div class="keyboard-story-content">
                              <p>My journey with the keys began in the 4th standard, fueled by an early-age passion for the language of music. Over six years of dedicated study through my 10th standard, I immersed myself in the rigorous discipline of both Carnatic and Western classical music.<br><br>This dual foundation allowed me to master the intricate melodic structures of the East and the harmonic complexity of the West. Beyond the practice room, my time spent performing on stage taught me the art of presence and the importance of precision under pressure—skills that I now carry into every design and code I craft.</p>
                              <a href="#" class="listen-btn keyboard-story-back-btn">Back</a>
                          </div>
                      `;
                      keyboardMasonry.appendChild(wrapper);
                      
                      const aboutBtn = wrapper.querySelector('.keyboard-about-btn');
                      const backBtn = wrapper.querySelector('.keyboard-back-btn');
                      const storyBtn = wrapper.querySelector('.keyboard-story-btn');
                      const storyBackBtn = wrapper.querySelector('.keyboard-story-back-btn');
                      const btnContainer = wrapper.querySelector('.listen-btn-container');
                      const aboutContent = wrapper.querySelector('.keyboard-about-content');
                      const storyContent = wrapper.querySelector('.keyboard-story-content');

                      aboutBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          btnContainer.classList.add('hidden-state');
                          aboutContent.classList.add('active-state');
                      });

                      backBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          aboutContent.classList.remove('active-state');
                          btnContainer.classList.remove('hidden-state');
                      });

                      storyBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          btnContainer.classList.add('hidden-state');
                          storyContent.classList.add('active-state');
                      });

                      storyBackBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          storyContent.classList.remove('active-state');
                          btnContainer.classList.remove('hidden-state');
                      });
                      
                      if (typeof observer !== 'undefined') {
                          observer.observe(wrapper);
                      }
                  });
                  keyboardLoaded = true;
              }
              
              // Wait for image injection and start of transition
              setTimeout(() => {
                  if (lenis) lenis.resize();
              }, 100);
          } else {
              // Closing
              keyboardGallery.classList.remove('active');
          }

          // Force a final resize after animation duration (1.2s in CSS)
          setTimeout(() => {
              if (lenis) lenis.resize();
          }, 1300);
      });
  }

});
