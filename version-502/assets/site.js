(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-nav-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      body.classList.remove('menu-open');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function scheduleSlide() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      scheduleSlide();
    });
  });

  showSlide(0);
  scheduleSlide();

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var genreSelect = filterRoot.querySelector('[data-filter-genre]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var emptyBox = filterRoot.querySelector('[data-filter-empty]');
    var items = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-search-item]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var genre = normalize(genreSelect ? genreSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var itemGenre = normalize(item.getAttribute('data-genre'));
        var itemRegion = normalize(item.getAttribute('data-region'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && itemYear !== year) {
          matched = false;
        }

        if (genre && itemGenre.indexOf(genre) === -1) {
          matched = false;
        }

        if (region && itemRegion.indexOf(region) === -1) {
          matched = false;
        }

        item.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyBox) {
        emptyBox.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, yearSelect, genreSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var trigger = document.querySelector('[data-play-trigger]');
  var message = document.querySelector('[data-player-message]');
  var attached = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function showMessage() {
    if (message) {
      message.textContent = '播放暂时无法加载，请稍后再试。';
      message.classList.add('is-visible');
    }
  }

  function attach() {
    if (attached) {
      return true;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage();
        }
      });

      attached = true;
      return true;
    }

    showMessage();
    return false;
  }

  function start() {
    if (!attach()) {
      return;
    }

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showMessage();
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
