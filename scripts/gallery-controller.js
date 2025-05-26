document.addEventListener('DOMContentLoaded', function() {
    // Initialize all galleries
    initGallery('track-gallery', 'track-prev', 'track-next');
    initGallery('rollout-gallery', 'rollout-prev', 'rollout-next');
    initGallery('video-gallery', 'video-prev', 'video-next');
    initGallery('generalization-gallery', 'generalization-prev', 'generalization-next');

    
    // Setup autoplay for all gallery videos
    setupGalleryVideos();
});

function initGallery(galleryId, prevBtnId, nextBtnId) {
    const gallery = document.getElementById(galleryId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    
    if (!gallery || !prevBtn || !nextBtn) return;
    
    // Hide any debug info element
    const debugInfo = document.getElementById(`${galleryId}-debug`);
    if (debugInfo) {
        debugInfo.style.display = 'none';
    }
    
    // Get all original videos
    const originalItems = Array.from(gallery.querySelectorAll('.gallery-video'));
    if (originalItems.length === 0) return;
    
    // Number of items visible at once (can be adjusted based on screen size)
    const visibleItems = Math.min(3, originalItems.length);
    
    // Clone items for seamless looping
    function setupClones() {
        // Remove any existing clones first
        gallery.querySelectorAll('.gallery-video-clone').forEach(clone => clone.remove());
        
        // Clone beginning items and add to end
        for (let i = 0; i < visibleItems; i++) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('gallery-video-clone');
            gallery.appendChild(clone);
        }
        
        // Clone end items and add to beginning
        for (let i = originalItems.length - visibleItems; i < originalItems.length; i++) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('gallery-video-clone');
            gallery.insertBefore(clone, gallery.firstChild);
        }
        
        // Setup all the new videos we added
        setupGalleryVideos();
    }
    
    // Set up the clones
    setupClones();
    
    // Now get all items including clones
    let currentIndex = visibleItems; // Start after the prepended clones
    let isAnimating = false;
    
    // Calculate the offset to a specific index (sum of widths)
    function calculateOffset(targetIndex) {
        const allItems = gallery.querySelectorAll('.gallery-video, .gallery-video-clone');
        let offset = 0;
        
        for (let i = 0; i < targetIndex && i < allItems.length; i++) {
            offset += allItems[i].offsetWidth;
            // Add the margin/gap between items (10px based on CSS)
            if (i < targetIndex - 1) {
                offset += 10;
            }
        }
        
        return offset;
    }
    
    // Get the width of a specific item
    function getItemWidth(index) {
        const allItems = gallery.querySelectorAll('.gallery-video, .gallery-video-clone');
        if (allItems[index]) {
            return allItems[index].offsetWidth;
        }
        return 0;
    }
    
    // Position the gallery at current index
    function positionGallery(animate = false) {
        gallery.style.transition = animate ? 'transform 0.4s ease-out' : 'none';
        const offset = calculateOffset(currentIndex);
        gallery.style.transform = `translateX(-${offset}px)`;
    }
    
    // Initialize position
    positionGallery();
    
    // Navigate to next or previous
    function navigateGallery(direction) {
        if (isAnimating) return;
        isAnimating = true;
        
        const allItems = gallery.querySelectorAll('.gallery-video, .gallery-video-clone');
        const totalItems = allItems.length;
        
        if (direction === 'next') {
            currentIndex++;
        } else {
            currentIndex--;
        }
        
        // Animate to new position
        positionGallery(true);
        
        // After animation completes, check if we need to jump
        setTimeout(() => {
            isAnimating = false;
            
            // Check if we need to reset position for infinite loop
            if (currentIndex >= originalItems.length + visibleItems) {
                // We've reached the cloned items at the end
                currentIndex = visibleItems;
                positionGallery(false);
            } else if (currentIndex < visibleItems) {
                // We've reached the cloned items at the beginning
                currentIndex = originalItems.length;
                positionGallery(false);
            }
        }, 400); // Match this to the transition duration
    }
    
    // Event listeners
    nextBtn.addEventListener('click', () => navigateGallery('next'));
    prevBtn.addEventListener('click', () => navigateGallery('prev'));
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate position with new widths
            positionGallery(false);
        }, 200);
    });
}

function setupGalleryVideos() {
    // Get all gallery videos (but not gifs/images)
    const galleryVideos = document.querySelectorAll('.gallery-video-inner video');
    
    galleryVideos.forEach(video => {
        // Ensure video attributes
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        
        // Force video to play
        video.play().catch(e => {
            // Autoplay might be blocked, try again on user interaction
            document.addEventListener('click', () => {
                video.play().catch(() => {});
            }, { once: true });
        });
        
        // Ensure video plays when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(video);
    });
    
    // Make sure GIFs/images are properly styled
    const galleryImages = document.querySelectorAll('.gallery-video-inner img');
    galleryImages.forEach(img => {
        // Apply proper styling to fit the container
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';  // Changed from 'cover' to 'contain' to match CSS
        img.style.objectPosition = 'center';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
    });
}