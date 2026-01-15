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

  // Smooth Page Transition (Exit)
  const anchors = document.querySelectorAll("a");
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Allow external links or hash links to behave normally
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto")
      )
        return;

      e.preventDefault();
      document.body.style.opacity = "0";
      document.body.style.transition = "opacity 0.5s ease";

      setTimeout(() => {
        window.location.href = href;
      }, 500); // Wait for transition to finish
    });
  });
});
