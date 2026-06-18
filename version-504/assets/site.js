(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      const frame = img.closest('.media-frame, .rank-poster, .related-thumb, .detail-poster, .hero-bg, .detail-bg');
      if (frame) {
        frame.classList.add('image-empty');
      }
      img.remove();
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    const activate = function (index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        activate(current + 1);
      });
    });
    hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
      button.addEventListener('click', function () {
        activate(current - 1);
      });
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    activate(0);
    window.setInterval(function () {
      activate(current + 1);
    }, 5000);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));
  const chips = Array.from(document.querySelectorAll('[data-filter-chip]'));
  const applyFilter = function () {
    const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const activeChip = document.querySelector('[data-filter-chip].active');
    const chipValue = activeChip ? activeChip.getAttribute('data-filter-chip').toLowerCase() : '';
    cards.forEach(function (card) {
      const hay = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      const matchQuery = !query || hay.indexOf(query) !== -1;
      const matchChip = !chipValue || hay.indexOf(chipValue) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchQuery && matchChip));
    });
  };
  if (filterInput && cards.length) {
    filterInput.addEventListener('input', applyFilter);
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('active');
      });
      if (chip.getAttribute('data-filter-chip')) {
        chip.classList.add('active');
      }
      applyFilter();
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('[data-play-trigger]');
    const status = shell.querySelector('[data-player-status]');
    const stream = shell.getAttribute('data-stream-url');
    let attached = false;
    let hls = null;

    const setStatus = function (text) {
      if (status) {
        status.textContent = text;
      }
    };

    const attachStream = function () {
      if (!video || !stream || attached) return;
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('正在播放');
          video.play().catch(function () {
            setStatus('点击画面继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络连接恢复中');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('画面恢复中');
            hls.recoverMediaError();
          } else {
            setStatus('暂时无法播放，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          setStatus('正在播放');
          video.play().catch(function () {
            setStatus('点击画面继续播放');
          });
        });
      } else {
        setStatus('暂时无法播放，请稍后重试');
      }
    };

    const start = function () {
      shell.classList.add('is-playing');
      attachStream();
      if (video && attached) {
        video.play().catch(function () {
          setStatus('点击画面继续播放');
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          start();
        } else {
          video.pause();
          setStatus('已暂停');
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (attached) {
          setStatus('已暂停');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
