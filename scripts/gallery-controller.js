document.addEventListener('DOMContentLoaded', function() {
    // Set up each gallery
    setupGallery('track-gallery', 'track-prev', 'track-next', 'track-debug');
    setupGallery('rollout-gallery', 'rollout-prev', 'rollout-next', 'rollout-debug');
    setupGallery('video-gallery', 'video-prev', 'video-next', 'video-debug');
    
    // Function to set up a gallery
    function setupGallery(galleryId, prevId, nextId, debugId) {
        const gallery = document.getElementById(galleryId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        const debugElement = document.getElementById(debugId);
        
        // Safety check
        if (!gallery || !prevBtn || !nextBtn) {
            console.error('Missing gallery elements for', galleryId);
            return;
        }
        
        // Get all videos and count them
        const videos = gallery.querySelectorAll('.gallery-video');
        const videoCount = videos.length;
        const visibleCount = 3; // Number of visible videos at once
        
        // Log initial count
        console.log(`Gallery ${galleryId} has ${videoCount} videos`);
        
        // Initial state
        let position = 0;
        updateButtonState();
        
        // Event listeners
        prevBtn.addEventListener('click', function() {
            if (position > 0) {
                position--;
                moveGallery();
                console.log(`${galleryId}: moved to position ${position}`);
            }
        });
        
        nextBtn.addEventListener('click', function() {
            if (position < videoCount - visibleCount) {
                position++;
                moveGallery();
                console.log(`${galleryId}: moved to position ${position}`);
            }
        });
        
        // Move the gallery based on position
        function moveGallery() {
            // Calculate the width of a single video container including margins
            const videoWidth = videos[0].offsetWidth + 
                               parseInt(getComputedStyle(videos[0]).marginLeft) + 
                               parseInt(getComputedStyle(videos[0]).marginRight);
            
            const translateX = -position * videoWidth;
            gallery.style.transform = `translateX(${translateX}px)`;
            updateButtonState();
        }
        
        // Update button states based on position
        function updateButtonState() {
            // Disable prev at beginning
            prevBtn.disabled = position === 0;
            prevBtn.style.opacity = position === 0 ? '0.5' : '1';
            
            // Disable next at end
            const isEnd = position >= videoCount - visibleCount;
            nextBtn.disabled = isEnd;
            nextBtn.style.opacity = isEnd ? '0.5' : '1';
        }
    }
});
