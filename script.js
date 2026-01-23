document.addEventListener("DOMContentLoaded", () => {
  // Custom Cursor
  const cursor = document.querySelector(".cursor");

  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    const links = document.querySelectorAll("a, .work-item");
    links.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(2.5)";
        cursor.style.backgroundColor = "rgba(0,0,0,0.05)";
        cursor.style.border = "none";
      });
      link.addEventListener("mouseleave", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        cursor.style.backgroundColor = "transparent";
        cursor.style.border = "1px solid var(--text-color)";
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
    threshold: 0.15 // Trigger a bit earlier
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optional: We can add logic here to update active nav state if desired
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach(section => {
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
});
