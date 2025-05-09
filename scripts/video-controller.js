document.addEventListener('DOMContentLoaded', function () {
    const videos = document.querySelectorAll('video.custom-video');

        videos.forEach((video) => {
            // Attribute parsing
            const autoPlay = video.hasAttribute('data-autoplay');
            const hasAudio = video.hasAttribute('data-audio');
            const showControls = video.hasAttribute('data-controls');
            const shouldLoop = video.hasAttribute('data-loop');
            const loopDelay = parseInt(video.getAttribute('data-loop-delay') || '0');
            const isMuted = video.hasAttribute('data-muted') || !hasAudio;

            // Apply native attributes
            if (isMuted) video.muted = true;
            if (showControls) video.controls = true;
            if (shouldLoop) video.loop = true;

            // Autoplay logic using Intersection Observer
            if (autoPlay) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    video.play();
                    if (!shouldLoop && loopDelay === 0) {
                    observer.unobserve(video); // don't need to watch anymore
                    }
                }
                });
            }, { threshold: 0.4 });

            observer.observe(video);
            }

            // Custom loop with delay
            if (loopDelay > 0) {
            video.addEventListener('ended', () => {
                setTimeout(() => {
                video.currentTime = 0;
                video.play();
                }, loopDelay);
            });
            }
        });
});
