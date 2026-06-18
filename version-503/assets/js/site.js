(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        show(0);
        start();
    }

    function setupSearch() {
        var form = document.querySelector("[data-search-form]");
        if (!form) {
            return;
        }
        var keyword = form.querySelector("[data-filter-keyword]");
        var type = form.querySelector("[data-filter-type]");
        var year = form.querySelector("[data-filter-year]");
        var region = form.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty]");
        function lower(value) {
            return String(value || "").toLowerCase();
        }
        function apply() {
            var q = lower(keyword && keyword.value).trim();
            var t = type ? type.value : "";
            var y = year ? year.value : "";
            var r = region ? region.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = lower(card.getAttribute("data-search"));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && card.getAttribute("data-type") !== t) {
                    ok = false;
                }
                if (y && card.getAttribute("data-year") !== y) {
                    ok = false;
                }
                if (r && card.getAttribute("data-region") !== r) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        form.addEventListener("input", apply);
        form.addEventListener("change", apply);
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });

    window.initSitePlayer = function (videoId, buttonId, overlayId, sourceUrl) {
        ready(function () {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var overlay = document.getElementById(overlayId);
            var attached = false;
            if (!video || !button || !overlay || !sourceUrl) {
                return;
            }
            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                    video.hlsController = hls;
                } else {
                    video.src = sourceUrl;
                }
            }
            function start() {
                attach();
                overlay.classList.add("is-hidden");
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }
            button.addEventListener("click", start);
            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
        });
    };
})();
