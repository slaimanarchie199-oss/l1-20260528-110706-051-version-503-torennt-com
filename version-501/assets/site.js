(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activateHero(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activateHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateHero((current + 1) % slides.length);
      }, 5200);
    }
  }

  var searchForms = document.querySelectorAll('[data-search-form]');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyCardFilters(root) {
    var list = root.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var emptyState = root.querySelector('[data-empty-state]');
    var localInput = root.querySelector('[data-local-search]');
    var globalInput = root.querySelector('[data-global-search]');
    var categorySelect = root.querySelector('[data-category-select]');
    var typeSelect = root.querySelector('[data-type-select]');
    var typeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-type]'));
    var activeType = '全部';

    function matches(card, keyword, category, type) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-keywords')
      ].join(' '));
      var cardCategory = card.getAttribute('data-category') || '';
      var cardType = card.getAttribute('data-type') || '';
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      var categoryOk = !category || cardCategory === category;
      var typeOk = !type || type === '全部' || cardType === type;
      return keywordOk && categoryOk && typeOk;
    }

    function update() {
      var keyword = normalize((localInput || globalInput || {}).value || '');
      var category = categorySelect ? categorySelect.value : '';
      var selectType = typeSelect ? typeSelect.value : '';
      var type = selectType || activeType;
      var visible = 0;

      cards.forEach(function (card) {
        var show = matches(card, keyword, category, type);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '全部';
        typeButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        update();
      });
    });

    [localInput, globalInput, categorySelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && globalInput) {
      globalInput.value = query;
    }

    update();
  }

  applyCardFilters(document);
}());

function initMoviePlayer(sourceUrl) {
  var video = document.querySelector('[data-player]');
  var cover = document.querySelector('.player-cover');
  var hlsInstance = null;
  var startButtons = document.querySelectorAll('[data-player-start]');

  if (!video || !cover || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlayback() {
    attachSource();
    cover.classList.add('is-hidden');
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  cover.addEventListener('click', startPlayback);
  startButtons.forEach(function (button) {
    button.addEventListener('click', startPlayback);
  });
  video.addEventListener('click', function () {
    if (video.getAttribute('data-ready') !== '1') {
      startPlayback();
      return;
    }
    if (video.paused) {
      video.play();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
