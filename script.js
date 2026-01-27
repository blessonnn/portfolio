document.addEventListener("DOMContentLoaded", () => {
  // Custom Cursor
  const cursor = document.querySelector(".cursor");

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
      if (!sessionStorage.getItem("introShown")) {
        document.body.classList.add("intro-active");
        
        introOverlay.addEventListener("click", () => {
            document.body.classList.remove("intro-active");
            sessionStorage.setItem("introShown", "true");
        });
      }
      // If introShown is true, body doesn't get .intro-active, so it's hidden by CSS.
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
        // Stop observing once animated if desired, but keeping it allows re-triggering if logic changes
        // observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  // Observe all elements with the animation class
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
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
          e.preventDefault(); // Prevent default anchor jump first
          sessionStorage.removeItem("introShown"); // Clear the flag
          window.location.reload(); // Reload page to restart intro
      });
  }

  // Scroll-Synced Text Separation Logic (About Me)
  const aboutSection = document.getElementById('about');
  const splitLeft = document.querySelectorAll('.split-text.left');
  const splitRight = document.querySelectorAll('.split-text.right');
  const journeyContent = document.querySelector('.journey-content');
  const mainContainer = document.querySelector('.main-container');

  if (aboutSection && mainContainer && (splitLeft.length > 0 || splitRight.length > 0) && window.innerWidth > 768) {
      mainContainer.addEventListener('scroll', () => {
          const sectionTop = aboutSection.offsetTop;
          const sectionHeight = aboutSection.offsetHeight;
          const scrollY = mainContainer.scrollTop; // Use container scroll
          const viewportHeight = mainContainer.clientHeight; // Use container height

          // Check if section is in view
          const rect = aboutSection.getBoundingClientRect();
          
          if (rect.top < viewportHeight && rect.bottom > 0) {
              // Calculate centers
              const viewportCenter = viewportHeight / 2;
              const blockCenter = rect.top + rect.height / 2;

              // Vertical Slide Logic
              if (journeyContent) {
                  const scrollProgress = (viewportHeight - rect.top) / viewportHeight;
                  const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
                  const startY = -viewportHeight * 0.25; 
                  const currentY = startY * (1 - clampedProgress);
                  journeyContent.style.transform = `translateY(${currentY}px)`;
              }
              
              let separation = 0;
              
              // Only separate when the block moves upwards past the center of the viewport
              if (blockCenter < viewportCenter) {
                  // Calculate progress from center (0) to top (1)
                  // When blockCenter is at viewportCenter, progress is 0.
                  // When blockCenter is at 0 (top of screen), progress is 1.
                  const progress = (viewportCenter - blockCenter) / viewportCenter; 
                  
                  // Cap the separation to a reasonable amount (e.g., 100px)
                  separation = progress * 100; 
              } 

              // Apply transform
              splitLeft.forEach(el => {
                  el.style.transform = `translateX(-${separation}px)`;
              });
              
              splitRight.forEach(el => {
                  el.style.transform = `translateX(${separation}px)`;
              });
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
});
