// Mobile menu. No tracking, no third-party code.
(function () {
  var hamburger = document.querySelector('#header .hamburger');
  var menu = document.getElementById('nav-menu');
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

  // Close the menu after choosing a link, or with the Escape key.
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
