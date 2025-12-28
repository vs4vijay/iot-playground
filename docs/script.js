// ===================================
// IoT Playground - Interactive Features
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initLinkInput();
    initScrollAnimations();
    initSmoothScroll();
});

// ===================================
// Link Input Feature
// ===================================

function initLinkInput() {
    const linkInput = document.getElementById('linkInput');
    const submitBtn = document.getElementById('submitLink');
    const feedback = document.getElementById('inputFeedback');
    
    if (!linkInput || !submitBtn || !feedback) return;
    
    // Real-time validation
    linkInput.addEventListener('input', function() {
        const value = linkInput.value.trim();
        if (value === '') {
            updateFeedback('', '');
            return;
        }
        
        if (isValidURL(value)) {
            updateFeedback('✓ Valid URL detected', 'success');
        } else {
            updateFeedback('⚠ Please enter a valid URL', 'error');
        }
    });
    
    // Submit handler
    submitBtn.addEventListener('click', function() {
        const value = linkInput.value.trim();
        
        if (value === '') {
            updateFeedback('⚠ Please enter a URL', 'error');
            return;
        }
        
        if (!isValidURL(value)) {
            updateFeedback('⚠ Invalid URL format', 'error');
            return;
        }
        
        processLink(value);
    });
    
    // Enter key support
    linkInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function updateFeedback(message, type) {
    const feedback = document.getElementById('inputFeedback');
    feedback.textContent = message;
    feedback.className = 'input-feedback ' + type;
}

function processLink(url) {
    updateFeedback('🔍 Processing link...', 'info');
    
    // Simulate processing
    setTimeout(() => {
        // Check if it's a GitHub link
        if (url.includes('github.com')) {
            updateFeedback('✓ GitHub repository detected! Checking for IoT projects...', 'success');
            
            setTimeout(() => {
                displayLinkResult({
                    type: 'github',
                    url: url,
                    message: 'This appears to be a GitHub repository. You can explore IoT projects and contribute!'
                });
            }, 1000);
        }
        // Check if it's an Arduino/ESP link
        else if (url.includes('arduino') || url.includes('esp32') || url.includes('esp8266')) {
            updateFeedback('✓ Arduino/ESP resource detected!', 'success');
            
            setTimeout(() => {
                displayLinkResult({
                    type: 'arduino',
                    url: url,
                    message: 'This is an Arduino or ESP32/ESP8266 related resource. Great for IoT development!'
                });
            }, 1000);
        }
        // Generic link
        else {
            updateFeedback('✓ Link processed successfully', 'success');
            
            setTimeout(() => {
                displayLinkResult({
                    type: 'generic',
                    url: url,
                    message: 'Link validated. Visit the URL to explore the content.'
                });
            }, 1000);
        }
    }, 500);
}

function displayLinkResult(result) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'link-result fade-in';
    resultDiv.style.cssText = `
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(168, 85, 247, 0.1));
        border: 2px solid var(--accent-blue);
        border-radius: var(--radius-lg);
        animation: fadeInUp 0.5s ease-out;
    `;
    
    resultDiv.innerHTML = `
        <h3 style="color: var(--accent-blue); margin-bottom: 0.5rem; font-size: 1.2rem;">
            ${getIconForType(result.type)} Link Analysis Result
        </h3>
        <p style="color: var(--text-muted); margin-bottom: 1rem;">
            ${result.message}
        </p>
        <a href="${result.url}" target="_blank" rel="noopener noreferrer" 
           class="btn btn-secondary" style="display: inline-flex;">
            🔗 Visit Link
        </a>
    `;
    
    // Remove any existing result
    const existingResult = document.querySelector('.link-result');
    if (existingResult) {
        existingResult.remove();
    }
    
    document.getElementById('inputFeedback').after(resultDiv);
}

function getIconForType(type) {
    const icons = {
        github: '🐙',
        arduino: '🔌',
        generic: '🔗'
    };
    return icons[type] || '🔗';
}

// ===================================
// Scroll Animations
// ===================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards
    document.querySelectorAll('.feature-card, .project-card').forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// ===================================
// Smooth Scroll
// ===================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Particle Effect (Optional Enhancement)
// ===================================

function createParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2;
            this.opacity = Math.random() * 0.5;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    function init() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
}

// Uncomment to enable particle effect
// createParticles();

// ===================================
// Copy to Clipboard Functionality
// ===================================

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('✓ Copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        // Note: document.execCommand is deprecated but used here as fallback for older browsers
        // that don't support the modern navigator.clipboard API
        document.execCommand('copy');
        showNotification('✓ Copied to clipboard!');
    } catch (err) {
        showNotification('✗ Failed to copy');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: fadeInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
