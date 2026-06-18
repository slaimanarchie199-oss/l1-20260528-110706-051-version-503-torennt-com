const MoviePlayer = {
    start: function (options) {
        const video = document.getElementById(options.videoId);
        const button = document.getElementById(options.buttonId);
        const source = options.source;
        let prepared = false;

        if (!video || !button || !source) {
            return;
        }

        const prepare = function () {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        };

        const play = function () {
            prepare();
            button.classList.add("is-hidden");
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        };

        button.addEventListener("click", play);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    }
};
