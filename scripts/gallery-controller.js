document.addEventListener('DOMContentLoaded', function() {
    // Initialize all galleries
    initGallery('track-gallery', 'track-prev', 'track-next');
    initGallery('rollout-gallery', 'rollout-prev', 'rollout-next');
    initGallery('video-gallery', 'video-prev', 'video-next');
    
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
    const allItems = Array.from(gallery.querySelectorAll('.gallery-video'));
    
    // Calculate item width including margin
    const itemWidth = originalItems[0].offsetWidth + parseInt(getComputedStyle(originalItems[0]).marginRight);
    
    // Start position (after the cloned end items)
    let currentIndex = visibleItems;
    let isAnimating = false;
    
    // Initial positioning
    function positionGallery(animate = false) {
        gallery.style.transition = animate ? 'transform 0.4s ease-out' : 'none';
        const translateX = -currentIndex * itemWidth;
        gallery.style.transform = `translateX(${translateX}px)`;
    }
    
    // Initialize position
    positionGallery();
    
    // Navigate to next or previous
    function navigateGallery(direction) {
        if (isAnimating) return;
        isAnimating = true;
        
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
            
            // If we're at a clone, jump to the real item
            if (currentIndex >= originalItems.length + visibleItems) {
                // We've gone past the last real item to a clone
                currentIndex = visibleItems;
                positionGallery();
            } else if (currentIndex < visibleItems) {
                // We've gone before the first real item to a clone
                currentIndex = originalItems.length;
                positionGallery();
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
            // Recalculate item width
            const newItemWidth = originalItems[0].offsetWidth + 
                                 parseInt(getComputedStyle(originalItems[0]).marginRight);
            
            if (Math.abs(newItemWidth - itemWidth) > 5) {
                // Update position with new width
                const translateX = -currentIndex * newItemWidth;
                gallery.style.transition = 'none';
                gallery.style.transform = `translateX(${translateX}px)`;
            }
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
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
    });
}