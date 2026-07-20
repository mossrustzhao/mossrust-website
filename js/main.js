document.addEventListener("DOMContentLoaded", function() {

    // ===== Mobile Menu =====
    var hamburger = document.getElementById("hamburger");
    var mobileMenu = document.getElementById("mobileMenu");
    if (hamburger && mobileMenu) {
        hamburger.addEventListener("click", function() {
            hamburger.classList.toggle("active");
            mobileMenu.classList.toggle("active");
        });
    }

    // ===== Stat Counter Animation =====
    var statNumbers = document.querySelectorAll(".stat-number");
    function animateStats() {
        statNumbers.forEach(function(el) {
            var isPercent = el.parentElement.querySelector(".stat-label") && el.parentElement.querySelector(".stat-label").textContent.includes("%");
            var target = parseInt(el.dataset.target);
            if (!target) return;
            var current = 0;
            var duration = 2000;
            var step = Math.ceil(target / (duration / 30));
            var interval = setInterval(function() {
                current += step;
                if (current >= target) { current = target; clearInterval(interval); }
                el.textContent = current + (isPercent ? "%" : "+");
            }, 30);
        });
    }
    var heroStats = document.querySelector(".hero-stats");
    if (heroStats) {
        var observer = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) { animateStats(); observer.disconnect(); }
        }, { threshold: .5 });
        observer.observe(heroStats);
    }

    // ===== Visitor Counter =====
    var counter = document.getElementById("visitorCount");
    if (counter) {
        var visitors = parseInt(counter.dataset.visitors) || 12407;
        var currentCount = 0;
        var countDuration = 3000;
        var countStep = Math.ceil(visitors / (countDuration / 30));
        var counterObserver = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                var countInterval = setInterval(function() {
                    currentCount += countStep;
                    if (currentCount >= visitors) { currentCount = visitors; clearInterval(countInterval); }
                    counter.textContent = currentCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }, 30);
                counterObserver.disconnect();
            }
        }, { threshold: .5 });
        counterObserver.observe(counter);
    }

    // ===== Cart Functionality =====
    var cart = JSON.parse(localStorage.getItem("mossrust_cart") || "[]");
    var cartToggle = document.querySelector(".cart-toggle");
    var cartCount = document.querySelector(".cart-count");
    var cartDrawer = document.querySelector(".cart-drawer");
    var cartOverlay = document.querySelector(".cart-overlay");
    var cartClose = document.querySelector(".cart-close");
    var cartBody = document.querySelector(".cart-body");
    var cartFooter = document.querySelector(".cart-footer");
    var cartTotalPrice = document.querySelector(".cart-total-price");

    function saveCart() { localStorage.setItem("mossrust_cart", JSON.stringify(cart)); }
    function updateCartUI() {
        var totalItems = cart.reduce(function(s, i) { return s + i.qty; }, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            if (totalItems > 0) { cartCount.classList.add("bump"); setTimeout(function() { cartCount.classList.remove("bump"); }, 200); }
        }
        renderCartBody();
    }
    function renderCartBody() {
        if (!cartBody || !cartFooter) return;
        if (cart.length === 0) { cartBody.innerHTML = '<p class="cart-empty">Your cart is empty.</p>'; cartFooter.style.display = "none"; return; }
        cartFooter.style.display = "block";
        var html = ""; var subtotal = 0;
        cart.forEach(function(item, idx) {
            var itemTotal = item.price * item.qty; subtotal += itemTotal;
            html += '<div class="cart-item"><div class="cart-item-img"><img src="' + item.img + '" alt=""></div><div class="cart-item-details"><p class="cart-item-name">' + item.name + '</p><p class="cart-item-price">$' + itemTotal.toFixed(2) + '</p><div class="cart-item-qty"><button onclick="window.updateCartQty(' + idx + ', -1)">&#x2212;</button><span>' + item.qty + '</span><button onclick="window.updateCartQty(' + idx + ', 1)">+</button></div><button class="cart-item-remove" onclick="window.removeCartItem(' + idx + ')">Remove</button></div></div>';
        });
        cartBody.innerHTML = html;
        cartTotalPrice.textContent = "$" + subtotal.toFixed(2);
    }
    window.updateCartQty = function(idx, delta) { cart[idx].qty += delta; if (cart[idx].qty <= 0) cart.splice(idx, 1); saveCart(); updateCartUI(); };
    window.removeCartItem = function(idx) { cart.splice(idx, 1); saveCart(); updateCartUI(); };
    function addToCart(product) { var existing = cart.find(function(i) { return i.id === product.id; }); if (existing) existing.qty += 1; else cart.push({ id: product.id, name: product.name, price: parseFloat(product.price), img: product.img, qty: 1 }); saveCart(); updateCartUI(); }
    function openCart() { if (cartDrawer) cartDrawer.classList.add("open"); if (cartOverlay) cartOverlay.classList.add("active"); document.body.style.overflow = "hidden"; }
    function closeCart() { if (cartDrawer) cartDrawer.classList.remove("open"); if (cartOverlay) cartOverlay.classList.remove("active"); document.body.style.overflow = ""; }
    if (cartToggle) cartToggle.addEventListener("click", openCart);
    if (cartClose) cartClose.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", function(e) { if (e.key === "Escape" && cartDrawer && cartDrawer.classList.contains("open")) closeCart(); });
    document.querySelectorAll(".add-to-cart-btn").forEach(function(btn) { btn.addEventListener("click", function() { addToCart({ id: this.dataset.id, name: this.dataset.name, price: this.dataset.price, img: this.dataset.img }); this.classList.add("added"); setTimeout(function() { btn.classList.remove("added"); }, 600); openCart(); }); });
    var checkoutBtn = document.querySelector(".cart-checkout-btn");
    if (checkoutBtn) { checkoutBtn.addEventListener("click", function() { if (cart.length === 0) return; var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0).toFixed(2); alert("Proceeding to checkout - $" + total + "\n\nIn production, this would link to a secure payment gateway.\nThank you for your order!"); }); }

    // ===== Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener("click", function(e) {
            var target = document.querySelector(this.getAttribute("href"));
            if (target) { e.preventDefault(); var header = document.querySelector(".header"); var offset = header ? header.offsetHeight : 0; window.scrollTo({ top: target.offsetTop - offset - 10, behavior: "smooth" }); }
        });
    });

    updateCartUI();

    // ===== Lightbox =====
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxCaption = document.getElementById("lightbox-caption");

    if (lightbox && lightboxImg) {
        document.querySelectorAll(".product-img").forEach(function(imgDiv) {
            imgDiv.style.cursor = "zoom-in";
            imgDiv.addEventListener("click", function(e) {
                var img = this.querySelector("img");
                if (img && img.src) {
                    lightboxImg.src = img.src;
                    if (lightboxCaption) {
                        var card = this.closest(".product-card");
                        var titleEl = card ? card.querySelector("h3") : null;
                        lightboxCaption.textContent = titleEl ? titleEl.textContent : "";
                    }
                    lightbox.classList.add("active");
                    document.body.style.overflow = "hidden";
                }
            });
        });

        lightbox.addEventListener("click", function(e) {
            if (e.target === lightbox || e.target.classList.contains("lightbox-close")) {
                lightbox.classList.remove("active");
                document.body.style.overflow = "";
            }
        });

        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && lightbox.classList.contains("active")) {
                lightbox.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }
});