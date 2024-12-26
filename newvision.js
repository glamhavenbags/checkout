// Function to apply fade-in effect for text
function fadeInText(element, delay = 0) {
    element.style.opacity = 0;
    element.style.transition = `opacity 1s ease-in-out ${delay}s`;
    setTimeout(() => {
      element.style.opacity = 1;
    }, delay * 1000);
  }
  
  // Example of applying effects to text when the page loads
  window.addEventListener('DOMContentLoaded', () => {
    // Fade-in effect on the hero section text
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    fadeInText(heroTitle, 0.5);
    fadeInText(heroSubtitle, 1);
  
    // Fade-in effect on other sections
    const aboutSection = document.querySelector('.about');
    const sneakPeekSection = document.querySelector('.sneak-peek');
    const teaserSection = document.querySelector('.teaser');
    const ctaSection = document.querySelector('.cta-section');
    fadeInText(aboutSection, 1.5);
    fadeInText(sneakPeekSection, 2);
    fadeInText(teaserSection, 2.5);
    fadeInText(ctaSection, 3);
  });
  