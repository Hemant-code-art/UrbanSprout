/**
 * UrbanSprout - main.js
 * Futuristic interactions and animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Auto-apply reveal class to sections if not present, then observe
    document.querySelectorAll('section, .preview-card, .product-card, .arrival-card').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // 2. New Arrivals Slider Logic
    const slider = document.getElementById('arrivalSlider');
    if (slider) {
        let currentIdx = 0;
        const cards = slider.querySelectorAll('.arrival-card');
        const cardCount = cards.length;

        window.moveSlider = (direction) => {
            const cardWidth = cards[0].offsetWidth + 30; // 30 is the gap
            const containerWidth = slider.parentElement.offsetWidth;
            const visibleCards = Math.floor(containerWidth / cardWidth);
            const maxIdx = cardCount - visibleCards;

            currentIdx += direction;

            if (currentIdx < 0) currentIdx = 0;
            if (currentIdx > maxIdx) currentIdx = maxIdx;

            slider.style.transform = `translateX(-${currentIdx * cardWidth}px)`;
        };

        // Resize listener to reset slider position
        window.addEventListener('resize', () => {
            currentIdx = 0;
            slider.style.transform = `translateX(0)`;
        });
    }

    // 3. Navbar change on scroll (iOS Style)
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Cart Logic
    let cart = JSON.parse(localStorage.getItem('urbanSproutCart')) || [];
    const cartCountEl = document.getElementById('cartCount');
    
    const updateCartUI = () => {
        if (cartCountEl) {
            cartCountEl.textContent = cart.length;
            cartCountEl.style.display = cart.length > 0 ? 'flex' : 'none';
        }
        localStorage.setItem('urbanSproutCart', JSON.stringify(cart));
    };

    const showNotification = (message) => {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<span>🌱</span> ${message}`;
        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    };

    // Global listener for "Add to Cart" buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-primary') && e.target.textContent.includes('Add to Cart')) {
            const card = e.target.closest('.product-card') || e.target.closest('.arrival-card');
            const name = card.querySelector('h3, h4').textContent;
            
            cart.push({ name, price: card.querySelector('p').textContent });
            updateCartUI();
            showNotification(`${name} added to your garden kit!`);
        }
    });

    // Handle Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message sent! Our experts will contact you soon.');
            contactForm.reset();
        });
    }

    // Initial UI Update
    updateCartUI();

    // 5. Blog Page Interactions (Progress Bar & Parallax)
    const progressBar = document.getElementById('progressBar');
    const articles = document.querySelectorAll('.article');

    window.addEventListener('scroll', () => {
        // Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";

        // Parallax for Article Images
        articles.forEach(article => {
            const img = article.querySelector('.article-img');
            if (img) {
                const speed = 0.2;
                const rect = article.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const yPos = -(rect.top * speed);
                    img.style.transform = `translateY(${yPos}px)`;
                }
            }
        });
    });

    // 6. 3D Tilt Effect & Dynamic Glow
    articles.forEach(article => {
        article.addEventListener('mousemove', (e) => {
            const rect = article.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update glow position
            article.style.setProperty('--x', `${(x / rect.width) * 100}%`);
            article.style.setProperty('--y', `${(y / rect.height) * 100}%`);

            // 3D Tilt calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            article.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        article.addEventListener('mouseleave', () => {
            article.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
});
