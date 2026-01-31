document.addEventListener("DOMContentLoaded", () => {
  // Custom Cursor
  const cursor = document.querySelector(".cursor");

  // Randomize Work Grid Images
  const masonryGrid = document.querySelector('.masonry-wrapper');
  if (masonryGrid) {
      const cols = Array.from(masonryGrid.querySelectorAll('.masonry-col'));
      const uniqueImages = [];
      const seenSrcs = new Set();
      
      // 1. Collect all unique images from the HTML
      cols.forEach(col => {
          const images = col.querySelectorAll('img');
          images.forEach(img => {
              const src = img.getAttribute('src');
              if (src && !seenSrcs.has(src)) {
                  seenSrcs.add(src);
                  uniqueImages.push(img.cloneNode(true));
              }
          });
      });
      
      // 2. Fisher-Yates Shuffle
      for (let i = uniqueImages.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [uniqueImages[i], uniqueImages[j]] = [uniqueImages[j], uniqueImages[i]];
      }
      
      // 3. Redistribute to columns
      if (uniqueImages.length > 0) {
        cols.forEach(col => col.innerHTML = ''); // Clear existing

        const itemsPerCol = Math.ceil(uniqueImages.length / cols.length);
        
        cols.forEach((col, i) => {
            const start = i * itemsPerCol;
            const end = start + itemsPerCol;
            const colItems = uniqueImages.slice(start, end);
            
            // Append Unique Set
            colItems.forEach(item => col.appendChild(item));
            
            // Append Duplicate Set (for infinite scroll loop)
            colItems.forEach(item => {
                const clone = item.cloneNode(true);
                col.appendChild(clone);
            });
        });
      }
  }

  // Smooth Scroll (Lenis)
  const scrollContainer = document.querySelector('.main-container');
  if (typeof Lenis !== 'undefined' && scrollContainer) {
      const lenis = new Lenis({
          wrapper: scrollContainer,
          // content property removed to allow Lenis to animate scrollTop (preserving sticky)
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

    const links = document.querySelectorAll("a, .work-item");
    links.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(2.5)";
        cursor.style.border = "none";
      });
      link.addEventListener("mouseleave", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        cursor.style.border = "none";
      });
    });
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
    root: document.querySelector('.main-container'), // Use main-container as root
    threshold: 0.1 // Trigger when 10% visible
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

  // Anti-Gravity Scroll Logic
  const masonryWrapper = document.querySelector('.masonry-wrapper');
  if (masonryWrapper && window.innerWidth > 768) {
    // Wait for images to load for correct height calculation
    window.addEventListener('load', () => {
      const columns = [...document.querySelectorAll('.masonry-col')];
      let scrollY = 0;
      let targetY = 0;
      
      const mainContainer = document.querySelector('.main-container');

      // Sync with Main Container Scroll
      if (mainContainer) {
          mainContainer.addEventListener('scroll', () => {
              targetY = mainContainer.scrollTop;
          });
      }

      // Lerp Helper
      const lerp = (start, end, factor) => start + (end - start) * factor;

      function animate() {
          scrollY = lerp(scrollY, targetY, 0.1); // Slightly increased factor for snappier feel
          
          columns.forEach((col, i) => {
              const speed = (i % 2 === 0) ? -1.0 : 1.2; // Odd: Down/Slow, Even: Up/Fast
              const colHeight = col.scrollHeight / 2; // Assuming duplication by factor of 2
              
              if (colHeight > 0) { // Safety check
                  // Infinite Loop Calculation
                  let offset = (scrollY * speed) % colHeight;
                  if (offset > 0) offset -= colHeight;
                  col.style.transform = `translate3d(0, ${offset}px, 0)`;
              }
          });

          requestAnimationFrame(animate);
      }
      animate();
    });
  }

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
  const aboutTitle = document.getElementById('about-title');
  const aboutSection = document.getElementById('about');
  // Use existing mainContainer if available, else re-query
  const scrollContainerForAbout = document.querySelector('.main-container');

  if (aboutTitle && aboutSection && scrollContainerForAbout && window.innerWidth > 768) {
      // Set initial state
      aboutTitle.style.transform = "translateY(-100px)"; 
      aboutTitle.style.transition = "transform 0.1s linear"; // Smooth follow

      scrollContainerForAbout.addEventListener('scroll', () => {
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

              aboutTitle.style.transform = `translateY(${offset}px)`;
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
      let lastScrollTop = marqueeScrollContainer.scrollTop;
      
      marqueeScrollContainer.addEventListener('scroll', () => {
          const scrollTop = marqueeScrollContainer.scrollTop;
          const delta = scrollTop - lastScrollTop;
          lastScrollTop = scrollTop;
          
          // If delta is positive (scrolling down), we want to increase Left movement.
          // If delta is negative (scrolling up), we want to Move Right.
          
          targetScrollSpeed = delta * 2.5; // Sensitivity factor
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
      mainScrollContainer.addEventListener('scroll', () => {
          targetScrollY = mainScrollContainer.scrollTop;
      });

      function animateHeroParallax() {
          // Smooth Lerp
          currentScrollY += (targetScrollY - currentScrollY) * 0.1;

          // Parallax calculation
          // Only apply if near the top to save resources
          if (currentScrollY < window.innerHeight) {
              heroTextElements.forEach((el, index) => {
                  // Move text UP when scrolling DOWN (negative offset)
                  // Vary speed slightly for depth? Let's keep it uniform for now or slight stagger
                  const speed = 0.2 + (index * 0.05); 
                  const offset = -currentScrollY * speed;
                  
                  // Apply transform. 
                  // Note: reveal-inner already has a transform for the intro animation (translateY(0)).
                  // We need to add to that, or ensure we don't overwrite the reveal state.
                  // Since the reveal transitions to 0, we can modulate it.
                  // BUT: CSS transition might fight JS. 
                  // Better to apply parallax to the PARENT (.hero-overlay-text) which has no transform.
                  
                  // Re-targeting to parent
                  el.parentElement.style.transform = `translateY(${offset}px)`;
              });
          }

      requestAnimationFrame(animateHeroParallax);
      }
      animateHeroParallax();
  }

  // WORKS Text Transition Animation
  const worksTransitionText = document.querySelector('.works-title-transition');
  const worksSection = document.getElementById('works');

  if (worksTransitionText && worksSection && mainScrollContainer) {
       // We use the same RAF loop or a new one. Since we already have Lenis or main container scroll, let's just listen to scroll event for simplicity or add to RAF if performance needed.
       // Using RAF for smoothness if we want Lerp, but direct mapping is fine for opacity/scale usually.
       
       mainScrollContainer.addEventListener('scroll', () => {
          const worksRect = worksSection.getBoundingClientRect();
          const worksTop = worksRect.top;
          const viewportHeight = window.innerHeight;
          
          // Position: "move along with the work starting point"
          // We attach it just above the rising black section. 
          // Constant offset from top of works section.
          const offsetFromWorksTop = 80; // Valid offset to place it above the cut
          const textY = worksTop - offsetFromWorksTop;
          
          worksTransitionText.style.top = `${textY}px`;
          
          // Animation Logic:
          // "enlarge and fade out same time" as it rises.
          // Start: When worksTop is near bottom of viewport (viewportHeight).
          // End: When worksTop is near top of viewport (0).
          
          // Determine progress of Works section rising across screen
          // 0 = at bottom (entering), 1 = at top (fully covered Home)
          // Actually, we want it to fade OUT as it goes UP.
          
          // Let's refine range:
          // Start fading out/scaling when it's crossing the middle or upper half?
          
          // Normalized Position: 1 (bottom) -> 0 (top)
          const positionNorm = Math.max(0, Math.min(1, worksTop / viewportHeight));
          
          // Logic Update:
          // 1. "Disappear till scrolling start": Keep hidden near bottom (1.0).
          // 2. Visible during the rise.
          // 3. "Fading (and resize) should start only when it reaches 3/4 of the screen":
          //    This implies it travels 3/4 of the way UP before fading out.
          //    So trigger point is at positionNorm ~ 0.25 (Top 25%).
          
          let opacity = 0;
          let scale = 1;

          // Define Phases
          const startPoint = 0.95; // Where it starts to appear
          const solidPoint = 0.9;  // Where it is fully visible
          const actionPoint = 0.35; // ~3/4 way up (1 - 0.75 = 0.25). Using 0.35 for smooth transition space.
          
          if (positionNorm > startPoint) {
              // HIDDEN (At bottom)
              opacity = 0;
              scale = 1;
          } else if (positionNorm > solidPoint) {
              // FADE IN (Entering screen)
              // Map startPoint -> solidPoint to 0 -> 1
              const progress = (startPoint - positionNorm) / (startPoint - solidPoint);
              opacity = progress;
              scale = 1;
          } else if (positionNorm > actionPoint) {
               // HOLD (Moving Up)
               opacity = 1;
               scale = 1;
          } else {
               // ACTION (Top ~30%): Enlarge and Fade Out
               // Map actionPoint -> 0.0 to Progress 0 -> 1
               const actionProgress = (actionPoint - positionNorm) / actionPoint;
               
               opacity = 1 - actionProgress; // Fade to 0
               scale = 1 + (actionProgress * 4); // Scale to 5x
          }
          
          worksTransitionText.style.opacity = Math.max(0, Math.min(1, opacity));
          worksTransitionText.style.transform = `translateX(-50%) scale(${scale})`;
       });
   }

});
