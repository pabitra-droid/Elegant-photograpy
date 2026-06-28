document.addEventListener('DOMContentLoaded', function() {
    // 1. PRELOADER
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 2500);
    }

    // 2. NAVBAR & SMOOTH SCROLL
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const observerOptions = {
        threshold: 0.3
    };
    
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));

    // 3. MOBILE MENU
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 4. SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. PARTICLES CANVAS
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
                this.radius = Math.random() * 1.5 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 168, 76, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(201, 168, 76, ${0.2 * (1 - distance / 120)})`;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // 6. SCROLL REVEAL
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Apply a delay if it's part of a grid/list
                const delay = (index % 4) * 0.1; 
                entry.target.style.transitionDelay = `${delay}s`;
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => revealObserver.observe(reveal));

    // 7. PORTFOLIO FILTER
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // 8. LIGHTBOX
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let currentImages = [];
    let currentIndex = 0;

    if (lightbox) {
        document.querySelectorAll('.portfolio-zoom').forEach((zoomBtn, index) => {
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Gather visible images
                currentImages = Array.from(document.querySelectorAll('.portfolio-item:not(.hidden) img')).map(img => img.src);
                const imgSrc = zoomBtn.closest('.portfolio-item').querySelector('img').src;
                currentIndex = currentImages.indexOf(imgSrc);
                
                lightboxImage.src = imgSrc;
                lightbox.classList.add('active');
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        const showImage = (index) => {
            if (index >= currentImages.length) index = 0;
            if (index < 0) index = currentImages.length - 1;
            currentIndex = index;
            lightboxImage.src = currentImages[currentIndex];
        };

        lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
        lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));

        window.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') lightbox.classList.remove('active');
            if (e.key === 'ArrowRight') showImage(currentIndex + 1);
            if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }

    // 9. TESTIMONIAL AUTO-SCROLL
    const reviewsScroll = document.querySelector('.modern-reviews-scroll');
    if (reviewsScroll) {
        let scrollAmount = 0;
        let scrollStep = 374; // 350px card width + 24px gap
        
        let autoScroll = setInterval(() => {
            if (reviewsScroll.scrollLeft + reviewsScroll.clientWidth >= reviewsScroll.scrollWidth - 10) {
                reviewsScroll.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                reviewsScroll.scrollBy({ left: scrollStep, behavior: 'smooth' });
            }
        }, 3500);

        reviewsScroll.addEventListener('mouseenter', () => clearInterval(autoScroll));
        reviewsScroll.addEventListener('mouseleave', () => {
            autoScroll = setInterval(() => {
                if (reviewsScroll.scrollLeft + reviewsScroll.clientWidth >= reviewsScroll.scrollWidth - 10) {
                    reviewsScroll.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    reviewsScroll.scrollBy({ left: scrollStep, behavior: 'smooth' });
                }
            }, 3500);
        });
    }

    // 10. STATS COUNTER
    const stats = document.querySelectorAll('.stat-number');
    let statsStarted = false;

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !statsStarted) {
            statsStarted = true;
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                const duration = 2000;
                let start = null;
                
                const step = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    stat.innerText = Math.floor(progress * target);
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        stat.innerText = target;
                    }
                };
                window.requestAnimationFrame(step);
            });
        }
    });

    const statsContainer = document.querySelector('.about-stats');
    if (statsContainer) statsObserver.observe(statsContainer);

    // 13. TOAST
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (toast && toastMessage) {
            toastMessage.innerText = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // 11. CONTACT FORM
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            const icon = submitBtn.querySelector('i.fa-paper-plane');
            
            btnText.style.display = 'none';
            if (icon) icon.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (result.success) {
                    showToast('Message sent successfully!');
                    contactForm.reset();
                    formStatus.innerText = '';
                } else {
                    formStatus.innerText = result.message;
                    formStatus.className = 'form-status error';
                }
            } catch (err) {
                formStatus.innerText = 'Failed to send message. Please try again.';
                formStatus.className = 'form-status error';
            } finally {
                btnText.style.display = 'inline-block';
                if (icon) icon.style.display = 'inline-block';
                btnLoader.style.display = 'none';
            }
        });
    }

    // 12. BACK TO TOP
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 14. NEWSLETTER
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }

    // 15. PARALLAX
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scroll = window.scrollY;
            if (scroll < window.innerHeight) {
                heroBg.style.transform = `translateY(${scroll * 0.3}px) scale(1.1)`;
            }
        });
    }
});
