(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slider = document.getElementById("heroSlider");
    if (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const prev = slider.querySelector("[data-hero-prev]");
        const next = slider.querySelector("[data-hero-next]");
        let active = 0;
        let timer = null;

        const show = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }
        start();
    }

    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
        const input = scope.querySelector("[data-card-search]");
        const year = scope.querySelector("[data-card-year]");
        const type = scope.querySelector("[data-card-type]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));

        if (input && input.dataset.urlQuery) {
            const params = new URLSearchParams(window.location.search);
            const value = params.get(input.dataset.urlQuery);
            if (value) {
                input.value = value;
            }
        }

        const apply = function () {
            const q = input ? input.value.trim().toLowerCase() : "";
            const y = year ? year.value : "";
            const t = type ? type.value : "";
            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category,
                    card.innerText
                ].join(" ").toLowerCase();
                const matchedText = !q || haystack.indexOf(q) !== -1;
                const matchedYear = !y || card.dataset.year === y;
                const matchedType = !t || card.dataset.type === t;
                card.classList.toggle("is-hidden", !(matchedText && matchedYear && matchedType));
            });
        };

        [input, year, type].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        apply();
    });
})();
