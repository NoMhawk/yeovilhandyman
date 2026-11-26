// Mobile menu and header background. No tracking, no third-party code.
(function () {
  var hamburger = document.querySelector('#header .hamburger');
  var menu = document.getElementById('nav-menu');
  var header = document.querySelector('#header .header');
  if (!hamburger || !menu) return;

  function setOpen(open) {
    hamburger.classList.toggle('active', open);
    menu.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  hamburger.addEventListener('click', function () {
    setOpen(!menu.classList.contains('active'));
  });

  // Close the menu after choosing a section, or with the Escape key.
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  // Make the header solid once the page has scrolled, so it stays readable.
  // Pages without the dark hero picture (privacy, thank-you) keep it solid all the time.
  var alwaysSolid = !document.getElementById('hero');
  function onScroll() {
    if (header) header.style.backgroundColor = (alwaysSolid || window.scrollY > 250) ? '#29323c' : '';
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
