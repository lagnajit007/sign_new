/**
 * Smoothly scrolls to an element by its ID with customizable options
 */
export const smoothScrollTo = (
  elementId: string, 
  options: { 
    offset?: number; // Pixels to offset from the top
    duration?: number; // Duration in milliseconds
  } = {}
) => {
  const { offset = 80, duration = 800 } = options;
  
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return;
  
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;
  
  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const scrollY = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, scrollY);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  
  // Easing function for smooth acceleration and deceleration
  function easeInOutQuad(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  requestAnimationFrame(animation);
};

/**
 * Handles clicks on anchor links and performs smooth scrolling
 */
export const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
  const href = e.currentTarget.getAttribute('href');
  
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const targetId = href.substring(1);
    smoothScrollTo(targetId);
  }
};

/**
 * Sets up smooth scrolling for all anchor links on the page
 */
export const initSmoothScrolling = () => {
  if (typeof window === 'undefined') return;
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href')?.substring(1);
      if (targetId) smoothScrollTo(targetId);
    });
  });
};

export default { smoothScrollTo, handleSmoothScroll, initSmoothScrolling }; 