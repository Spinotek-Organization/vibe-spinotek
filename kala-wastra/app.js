/**
 * KALA Wastra - Premium Interactive JavaScript
 * ==============================================
 */

document.addEventListener("DOMContentLoaded", function () {
  // =====================
  // Mobile Menu Toggle
  // =====================
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menu-icon");
  let isMenuOpen = false;

  mobileMenuBtn.addEventListener("click", function () {
    isMenuOpen = !isMenuOpen;

    // Toggle menu visibility
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("open");

    // Animate hamburger icon with smooth transition
    if (isMenuOpen) {
      menuIcon.style.transition = "all 0.3s ease";
      menuIcon.setAttribute("d", "M6 18L18 6M6 6l12 12");
    } else {
      menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
    }
  });

  // Close mobile menu when clicking a link
  const mobileLinks = mobileMenu.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", function () {
      isMenuOpen = false;
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("open");
      menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
    });
  });

  // =====================
  // Navbar Scroll Effect
  // =====================
  const navbar = document.getElementById("navbar");
  let lastScrollY = 0;

  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }

    // Hide/show navbar on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 300) {
      navbar.style.transform = "translateY(-100%)";
    } else {
      navbar.style.transform = "translateY(0)";
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener("scroll", handleNavbarScroll);
  handleNavbarScroll();

  // =====================
  // Enhanced Scroll Animations
  // =====================
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -80px 0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay =
          entry.target.style.animationDelay ||
          entry.target.getAttribute("data-delay") ||
          "0s";
        const delayMs = parseFloat(delay) * 1000;

        setTimeout(() => {
          entry.target.classList.add("visible");
        }, delayMs);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // =====================
  // Smooth Scroll for Anchor Links
  // =====================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));

      if (target) {
        const navbarHeight = navbar.offsetHeight;
        const targetPosition =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // =====================
  // Product Card Enhanced Hover
  // =====================
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    // Mouse movement tilt effect
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `translateY(-12px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "translateY(0) scale(1) rotateX(0) rotateY(0)";
    });

    // Touch support for mobile
    let touchStartY = 0;
    let isTouching = false;

    card.addEventListener(
      "touchstart",
      function (e) {
        touchStartY = e.touches[0].clientY;
        isTouching = true;
      },
      { passive: true },
    );

    card.addEventListener(
      "touchmove",
      function (e) {
        if (!isTouching) return;

        const touchY = e.touches[0].clientY;
        const diff = Math.abs(touchY - touchStartY);

        if (diff < 10) {
          this.classList.add("touch-active");
        }
      },
      { passive: true },
    );

    card.addEventListener("touchend", function () {
      isTouching = false;
      setTimeout(() => {
        this.classList.remove("touch-active");
      }, 2000);
    });
  });

  // =====================
  // Parallax Effect for Hero
  // =====================
  const heroSection = document.getElementById("hero");
  const heroImage = heroSection?.querySelector("img");
  const heroContent = heroSection?.querySelector(".animate-on-scroll");

  if (heroImage && heroContent) {
    window.addEventListener("scroll", function () {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;

      if (scrolled < heroHeight) {
        const parallaxSpeed = 0.4;
        heroImage.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(1.1)`;

        // Subtle content parallax
        const contentParallax = scrolled * 0.1;
        heroContent.style.transform = `translateY(${contentParallax}px)`;
      }
    });
  }

  // =====================
  // Magnetic Button Effect
  // =====================
  const magneticButtons = document.querySelectorAll(
    ".cta-button, .cta-button-large",
  );

  magneticButtons.forEach((button) => {
    button.addEventListener("mousemove", function (e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    button.addEventListener("mouseleave", function () {
      button.style.transform = "translate(0, 0)";
    });
  });

  // =====================
  // Pillar Cards Hover Animation
  // =====================
  const pillarCards = document.querySelectorAll(".pillar-card");

  pillarCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      // Add slight scale to siblings
      pillarCards.forEach((sibling) => {
        if (sibling !== card) {
          sibling.style.opacity = "0.7";
          sibling.style.transform = "scale(0.98)";
        }
      });
    });

    card.addEventListener("mouseleave", function () {
      pillarCards.forEach((sibling) => {
        sibling.style.opacity = "1";
        sibling.style.transform = "scale(1)";
      });
    });
  });

  // =====================
  // Text Reveal on Scroll
  // =====================
  const revealTexts = document.querySelectorAll("h1, h2, blockquote");

  const textObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "textReveal 0.8s ease forwards";
          textObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );

  revealTexts.forEach((text) => {
    text.style.opacity = "0";
    textObserver.observe(text);
  });

  // =====================
  // Counter Animation for Stats
  // =====================
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  // =====================
  // Cursor Follower (Desktop Only)
  // =====================
  if (window.innerWidth > 1024) {
    const cursor = document.createElement("div");
    cursor.className = "cursor-follower";
    cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid #D4AF37;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
            mix-blend-mode: difference;
            opacity: 0;
        `;
    document.body.appendChild(cursor);

    let cursorVisible = false;

    document.addEventListener("mousemove", function (e) {
      if (!cursorVisible) {
        cursor.style.opacity = "1";
        cursorVisible = true;
      }
      cursor.style.left = e.clientX - 10 + "px";
      cursor.style.top = e.clientY - 10 + "px";
    });

    // Enlarge cursor on interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, .product-card, .pillar-card",
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.width = "40px";
        cursor.style.height = "40px";
        cursor.style.left = parseInt(cursor.style.left) - 10 + "px";
        cursor.style.top = parseInt(cursor.style.top) - 10 + "px";
        cursor.style.backgroundColor = "rgba(212, 175, 55, 0.1)";
      });

      el.addEventListener("mouseleave", () => {
        cursor.style.width = "20px";
        cursor.style.height = "20px";
        cursor.style.backgroundColor = "transparent";
      });
    });
  }

  // =====================
  // Active Navigation Highlighting
  // =====================
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function highlightNav() {
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("text-kala-gold");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("text-kala-gold");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightNav);

  // =====================
  // Preload Images
  // =====================
  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  }

  // Preload secondary product images
  document.querySelectorAll(".product-image.secondary").forEach((img) => {
    preloadImage(img.src);
  });

  // =====================
  // Scroll Progress Indicator
  // =====================
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #D4AF37, #E8C85A);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + "%";
  });

  // =====================
  // Intersection Observer for Lazy Loading
  // =====================
  const lazyImages = document.querySelectorAll("img[data-src]");

  const lazyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          lazyObserver.unobserve(img);
        }
      });
    },
    { rootMargin: "100px" },
  );

  lazyImages.forEach((img) => lazyObserver.observe(img));

  // =====================
  // Performance: Debounce scroll events
  // =====================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Apply debounce to scroll-heavy functions
  const debouncedHighlightNav = debounce(highlightNav, 10);
  window.addEventListener("scroll", debouncedHighlightNav);

  // =====================
  // Console Welcome Message
  // =====================
  console.log(
    "%c🧵 KALA Wastra",
    "font-size: 24px; font-weight: bold; color: #D4AF37;",
  );
  console.log(
    "%cMenenun Masa Lalu, Mengenakan Masa Depan",
    "font-size: 14px; color: #2D2D2D;",
  );
  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #D4AF37;");
  console.log(
    "%cDibuat oleh Spinotek - spinotek.com",
    "font-size: 12px; color: #666;",
  );
  console.log(
    "%c✨ Premium Interactive Experience Enabled",
    "font-size: 11px; color: #D4AF37;",
  );
});

// =====================
// Page Load Animation
// =====================
window.addEventListener("load", function () {
  document.body.classList.add("loaded");

  // Reveal hero content after page load
  const heroElements = document.querySelectorAll("#hero .animate-on-scroll");
  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, index * 200);
  });
});
