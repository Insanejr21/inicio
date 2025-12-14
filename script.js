/**
 * LÓGICA DE TEMPO, DATA E SAUDAÇÃO
 */
function updateSystemInfo() {
    const now = new Date();
    
    // 1. Relógio
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const clockElement = document.getElementById('clock');
    if (clockElement) clockElement.innerText = `${h}:${m}`;

    // 2. Data
    const day = String(now.getDate()).padStart(2, '0');
    const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
                   "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateElement = document.getElementById('date');
    if (dateElement) dateElement.innerText = `${day}/${month}/${year}`;

    // 3. Saudação
    const hour = now.getHours();
    let greetingText = "";
    if (hour >= 5 && hour < 12) greetingText = "BOM DIA";
    else if (hour >= 12 && hour < 18) greetingText = "BOA TARDE";
    else greetingText = "BOA NOITE";
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) greetingElement.innerText = greetingText;
}

setInterval(updateSystemInfo, 1000);
updateSystemInfo(); 

/**
 * MOVIMENTO 3D
 */
const card = document.getElementById('tilt-card');
if (card && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 30;
        const y = (window.innerHeight / 2 - e.pageY) / 30;
        card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
}

/**
 * UNIVERSO CANVAS
 */
const canvas = document.getElementById('universe');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    const isMobile = window.innerWidth <= 768;
    const STAR_COUNT = isMobile ? 80 : 150;
    const CONNECTION_DIST = 120;
    const MOUSE_DIST = 150;
    let stars = [];
    let meteors = [];
    let mouse = { x: null, y: null };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initStars();
    }

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 1.5 + 0.5;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    class Meteor {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width + width * 0.5;
            this.y = -100;
            this.angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);
            this.speed = Math.random() * 10 + 10;
            this.size = Math.random() * 2 + 1;
            this.length = Math.random() * 150 + 100;
            this.active = true;
            this.color = Math.random() > 0.8 ? '#00f3ff' : '#ffffff';
        }
        update() {
            this.x -= Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.x < -200 || this.y > height + 200) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            const tailX = this.x + Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;
            const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
    }

    function drawLines() {
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < CONNECTION_DIST) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist/CONNECTION_DIST * 0.1})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.stroke();
                }
            }
            if (mouse.x) {
                const dx = stars[i].x - mouse.x;
                const dy = stars[i].y - mouse.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < MOUSE_DIST) {
                    ctx.strokeStyle = `rgba(100, 200, 255, ${1 - dist/MOUSE_DIST})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    stars[i].x -= dx * 0.03;
                    stars[i].y -= dy * 0.03;
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => { star.update(); star.draw(); });
        drawLines();
        if (Math.random() < 0.03) meteors.push(new Meteor());
        meteors = meteors.filter(m => m.active);
        meteors.forEach(m => { m.update(); m.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/**
 * LÓGICA DE PESQUISA CORRIGIDA
 * Adicionamos os Event Listeners aqui embaixo para funcionar no MV3
 */
function performSearch() {
    const engineUrl = document.getElementById('search-engine').value;
    const query = document.getElementById('search-input').value;
    
    if (query.trim() !== "") {
        window.location.href = engineUrl + encodeURIComponent(query);
    }
}

// Aguarda o HTML carregar completamente antes de adicionar os eventos
document.addEventListener('DOMContentLoaded', () => {
    // Evento de Clique no Botão
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Evento de Tecla Enter no Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch();
            }
        });
    }
});
