document.addEventListener("DOMContentLoaded", () => {
  // Custom Cursor
  const cursor = document.querySelector(".cursor");

  // Only activate cursor logic if device has hover capability
  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    // Hover Effect on Links
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

  // Intro Animation Logic (Home Section)
  const introOverlay = document.querySelector(".intro-overlay");
  
  if (introOverlay) {
      document.body.classList.add("intro-active");
      
      const removeIntro = () => {
        document.body.classList.remove("intro-active");
        // Trigger home animation simply by ensuring it's in view, 
        // though CSS animation plays on load for hero currently.
      };

      introOverlay.addEventListener("click", removeIntro);
      // Optional: Auto remove after some time? No, let user click.
  }

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: document.querySelector('.main-container'),
    threshold: 0.2 // Trigger when 20% of section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optional: Update active nav state here if needed
      } 
      // Optional: else { entry.target.classList.remove('in-view'); } 
      // depending on if we want replay ability. 
      // User said "appear in a smooth manner", usually implies enter animation.
    });
  }, observerOptions);

  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach(section => {
    observer.observe(section);
  });

  // Handle Corner Nav Click Scrolling
  // Since we are using a scroll container, standard anchor links might need help
  // if the container isn't the body. But `href="#id"` usually works inside common containers.
  // Just in case, we can manually scroll.
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

});
