  // Scroll-Controlled Marquee (About Me)
  const softwareTrack = document.querySelector('.software-track');
  const scrollContainer = document.querySelector('.main-container'); // Use main-container which handles scroll

  if (softwareTrack && scrollContainer) {
      let currentPos = 0;
      let baseSpeed = 1; // Pixels per frame
      let scrollSpeed = 0;
      let targetScrollSpeed = 0;
      let isHovering = false; // Optional, can add hover-pause if needed
      
      // We need to measure width to know when to loop
      // Assuming the content is duplicated for seamless loop (which it is in HTML)
      // The total width of track is what matters. 
      // Ideally correct seamless loop is: translate moves from 0 to -halfWidth, then resets to 0.
      
      let trackWidth = softwareTrack.scrollWidth;
      let halfWidth = trackWidth / 2; // Since we duplicated items
      
      // Update width on resize
      window.addEventListener('resize', () => {
          trackWidth = softwareTrack.scrollWidth;
          halfWidth = trackWidth / 2;
      });

      // Detect Scroll
      let lastScrollTop = scrollContainer.scrollTop;
      
      scrollContainer.addEventListener('scroll', () => {
          const scrollTop = scrollContainer.scrollTop;
          const delta = scrollTop - lastScrollTop;
          lastScrollTop = scrollTop;
          
          // Map delta to speed boost
          // If delta is positive (scrolling down), we want to increase Left movement (negative X).
          // If delta is negative (scrolling up), we want to Reverse direction (positive X).
          
          // Normal movement is logic: currentPos -= speed. (Moving Left)
          // So if we scroll down (delta > 0), we want to ADD to the subtraction (make it more negative).
          // If we scroll up (delta < 0), we want to SUBTRACT from subtraction (make it positive).
          
          targetScrollSpeed = delta * 2; // Sensitivity factor
      });
      
      function animateMarquee() {
          // Lerp scrollSpeed execution
          scrollSpeed += (targetScrollSpeed - scrollSpeed) * 0.1;
          
          // Friction to return to 0
          targetScrollSpeed *= 0.9; 

          // Calculate total speed
          // Base speed always moves left (positive value subtracted later)
          // If scrollSpeed is positive (down scroll), it adds to base -> Faster Left
          // If scrollSpeed is negative (up scroll), it subtracts from base -> Slower/Right
          
          let moveAmount = baseSpeed + scrollSpeed;
          
          currentPos -= moveAmount;
          
          // Loop Logic
          // Moving Left: currentPos gets more negative.
          if (currentPos <= -halfWidth) {
              currentPos += halfWidth; // Reset by shifting back right
          }
          // Moving Right: currentPos gets positive
          if (currentPos > 0) {
              currentPos -= halfWidth; // Reset by shifting back left
          }

          softwareTrack.style.transform = `translateX(${currentPos}px)`;
          
          requestAnimationFrame(animateMarquee);
      }
      
      requestAnimationFrame(animateMarquee);
  }
