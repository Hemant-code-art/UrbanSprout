/**
 * UrbanSprout - main.js
 * Futuristic interactions and animations.
 */

// ===== CART GLOBAL STATE =====
let cart = JSON.parse(localStorage.getItem('urbanSproutCart')) || [];

// ===== CART FUNCTIONS =====
const showCartNotification = (message) => {
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

const updateCartUI = () => {
    const cartTriggerCount = document.getElementById('cartTriggerCount');
    const cartTrigger = document.getElementById('cartTrigger');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalValue = document.getElementById('cartTotalValue');

    if (!cartTriggerCount || !cartItemsList || !cartTotalValue) return;

    // Update trigger
    cartTriggerCount.textContent = cart.length;
    cartTrigger.style.display = cart.length > 0 ? 'flex' : 'none';

    // Render items
    cartItemsList.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        total += price;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
            <button class="close-cart" style="font-size: 1.2rem;" onclick="window.removeFromCart(${index})">&times;</button>
        `;
        cartItemsList.appendChild(itemEl);
    });

    cartTotalValue.textContent = `Rs. ${total.toLocaleString()}`;
    localStorage.setItem('urbanSproutCart', JSON.stringify(cart));
};

window.addToCart = (productName, productPrice) => {
    if (!productName || !productPrice) {
        showCartNotification('Error: Product information missing');
        return false;
    }

    cart.push({ name: productName, price: productPrice });
    updateCartUI();
    showCartNotification(`${productName} added to your kit!`);

    setTimeout(() => {
        const cartDrawer = document.getElementById('cartDrawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
        }
    }, 500);

    return true;
};

window.removeFromCart = (index) => {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCartUI();
    }
};

window.handleAddToCartClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const card = btn.closest('.product-card') || btn.closest('.arrival-card') || btn.closest('.neural-card');
    
    if (!card) {
        showCartNotification('Error: Could not find product information');
        return false;
    }

    const nameEl = card.querySelector('.product-name, h3, h4');
    const name = nameEl ? nameEl.textContent.trim() : 'Unknown Item';
    
    let priceText = 'Rs. 0';
    const discountPrice = card.querySelector('.discount-price');
    const arrivalPrice = card.querySelector('.arrival-price-badge');
    
    if (discountPrice) {
        priceText = discountPrice.textContent.trim();
    } else if (arrivalPrice) {
        priceText = arrivalPrice.textContent.trim();
    } else {
        const priceEl = card.querySelector('.product-price');
        if (priceEl) {
            const allText = priceEl.textContent.trim();
            priceText = allText.split('\n')[0].trim();
        }
    }

    return addToCart(name, priceText);
};

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

    // 4. Cart Logic - Inject UI and set up event listeners
    const injectCartUI = () => {
        const cartHTML = `
            <div class="cart-drawer" id="cartDrawer">
                <div class="cart-header">
                    <h2>Garden Kit</h2>
                    <button class="close-cart" id="closeCart">&times;</button>
                </div>
                <div class="cart-items" id="cartItemsList">
                    <!-- Items injected here -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total</span>
                        <span id="cartTotalValue">Rs. 0</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="alert('Proceeding to Secure Neural Checkout...')">Checkout</button>
                </div>
            </div>
            <div class="cart-trigger" id="cartTrigger">
                <span>🛒</span>
                <span class="cart-trigger-count" id="cartTriggerCount">0</span>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    };

    injectCartUI();

    // Set up cart event listeners
    const cartDrawer = document.getElementById('cartDrawer');
    const cartTrigger = document.getElementById('cartTrigger');
    const closeCart = document.getElementById('closeCart');

    if (cartTrigger) {
        cartTrigger.addEventListener('click', () => {
            cartDrawer.classList.add('open');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
        });
    }

    // Initial UI update
    updateCartUI();

    // Handle Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showCartNotification('Message sent! Our experts will contact you soon.');
            contactForm.reset();
        });
    }

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

    // 7. Login Card 3D Tilt
    const loginCard = document.getElementById('loginCard');
    if (loginCard) {
        loginCard.addEventListener('mousemove', (e) => {
            const rect = loginCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            loginCard.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        loginCard.addEventListener('mouseleave', () => {
            loginCard.style.transform = `perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    }
    // 8. Custom Reactive Cursor
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    const animateCursor = () => {
        let distX = mouseX - outlineX;
        let distY = mouseY - outlineY;
        outlineX = outlineX + distX * 0.15;
        outlineY = outlineY + distY * 0.15;
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top = outlineY + 'px';
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const hoverables = document.querySelectorAll('a, button, .btn, .product-card, .arrival-card, .portfolio-card, .article');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '70px';
            cursorOutline.style.height = '70px';
            cursorOutline.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
            cursorOutline.style.borderColor = 'transparent';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
            cursorOutline.style.backgroundColor = 'transparent';
            cursorOutline.style.borderColor = 'var(--primary-color)';
        });
    });
});
