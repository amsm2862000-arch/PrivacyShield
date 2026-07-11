// 1. تهيئة اللعبة وتحديد العناصر من الواجهة
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const whaleNameEl = document.getElementById('whale-name');
const whaleAmountEl = document.getElementById('whale-amount');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 2. متغيرات حالة اللعبة الأساسية
let score = 0;
let timeLeft = 60;
let gameActive = true;

let currentWhale = {
    name: "الحوت_السيبراني_الرئيسي",
    amount: "1.50 ETH"
};

function updateWhalesWall() {
    whaleNameEl.textContent = currentWhale.name;
    whaleAmountEl.textContent = currentWhale.amount;
}
updateWhalesWall();

// 3. إعدادات درع الحماية (PrivacyShield)
const shield = {
    x: canvas.width / 2,
    y: canvas.height / 2 + 50,
    radius: 40,
    color: '#00ffcc',
    pulse: 0
};

// 4. مصفوفة وإعدادات الفيروسات
let viruses = [];
let lastVirusSpawn = 0;
let spawnInterval = 1000; 
let baseVirusSpeed = 2; 

function spawnVirus() {
    const colors = ['#ff3333', '#ff0055', '#ff9900', '#cc00ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // جعل الفيروسات تظهر بعيداً عن الحواف لسهولة الضغط
    const padding = 30;
    const randomX = padding + Math.random() * (canvas.width - padding * 2);
    
    const virus = {
        x: randomX, 
        y: -20, 
        radius: Math.random() * 6 + 16, // تكبير حجم الفيروس قليلاً لسهولة صيده باللمس
        color: randomColor,
        speed: baseVirusSpeed + Math.random() * 1.5 
    };
    viruses.push(virus);
}

function updateViruses() {
    for (let i = viruses.length - 1; i >= 0; i--) {
        let v = viruses[i];
        
        let dx = shield.x - v.x;
        let dy = shield.y - v.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        v.x += (dx / distance) * v.speed;
        v.y += (dy / distance) * v.speed;
        
        if (distance < shield.radius + v.radius) {
            viruses.splice(i, 1);
            score = Math.max(0, score - 5);
            scoreEl.textContent = score;
            continue;
        }
        
        if (v.y > canvas.height + 20) {
            viruses.splice(i, 1);
        }
    }
}

function drawViruses() {
    viruses.forEach(v => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
        ctx.fillStyle = v.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = v.color; 
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    });
}

function drawShield() {
    shield.pulse += 0.05;
    let pulseRadius = shield.radius + Math.sin(shield.pulse) * 4;

    ctx.beginPath();
    ctx.arc(shield.x, shield.y, pulseRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 220, 0.15)';
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(shield.x, shield.y, shield.radius, 0, Math.PI * 2);
    let gradient = ctx.createRadialGradient(shield.x, shield.y, 5, shield.x, shield.y, shield.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#00ffcc');
    gradient.addColorStop(1, '#006655');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = '#090d16';
    ctx.fillRect(shield.x - 8, shield.y - 4, 16, 14);
    ctx.beginPath();
    ctx.arc(shield.x, shield.y - 4, 6, 0, Math.PI, true);
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
}

// 5. دالة حساب الإحداثيات الدقيقة للمس على الهواتف والشاشات المختلفة
function getTouchPos(clientX, clientY) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function handleDefense(touchX, touchY) {
    if (!gameActive) return;

    for (let i = viruses.length - 1; i >= 0; i--) {
        let v = viruses[i];
        let dx = touchX - v.x;
        let dy = touchY - v.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // زيادة مساحة اللمس المحيطة بالفيروس لتسهيل الصيد بالإصبع
        if (distance < v.radius + 25) {
            viruses.splice(i, 1);
            score += 10;
            scoreEl.textContent = score;
            break; 
        }
    }
}

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if(e.touches.length > 0) {
        let touch = e.targetTouches[0];
        let pos = getTouchPos(touch.clientX, touch.clientY);
        handleDefense(pos.x, pos.y);
    }
}, { passive: false });

canvas.addEventListener('mousedown', function(e) {
    let pos = getTouchPos(e.clientX, e.clientY);
    handleDefense(pos.x, pos.y);
});

// 6. حلقة اللعبة الرئيسية (Game Loop)
function gameLoop(timestamp) {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timestamp - lastVirusSpawn > spawnInterval) {
        spawnVirus();
        lastVirusSpawn = timestamp;
        if (spawnInterval > 300) spawnInterval -= 5;
    }

    updateViruses();
    drawViruses();
    drawShield();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// 7. نظام المؤقت التنازلي وشاشة نهاية اللعبة (Game Over)
const gameTimer = setInterval(function() {
    if (!gameActive) {
        clearInterval(gameTimer);
        return;
    }
    
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        gameActive = false;
        clearInterval(gameTimer);
        showGameOver();
    }
}, 1000);

function showGameOver() {
    ctx.fillStyle = 'rgba(13, 17, 23, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ff3333';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3333';
    ctx.fillText('انتهى جدار الحماية! ⚠️', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.shadowBlur = 0;
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`مجموع النقاط المحصودة: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#00ffcc';
    ctx.fillText('قم بتحديث الصفحة لإعادة المحاولة 🔄', canvas.width / 2, canvas.height / 2 + 70);
}

// 8. محرك التبرع الذكي وتفعيل القوة الخارقة (الدعم الجوي)
const airSupportBtn = document.getElementById('air-support-btn');

airSupportBtn.addEventListener('click', function() {
    window.open('https://giveth.io/es/project/from-rubble-to-code:-help-a-dev-rebuild-his-life', '_blank');
});

function triggerImperialShield(newWhaleName, donationAmount) {
    if (!gameActive) return;
    
    currentWhale.name = newWhaleName;
    currentWhale.amount = donationAmount;
    updateWhalesWall();
    
    viruses = [];
    
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    shield.radius = 80; 
    setTimeout(() => {
        shield.radius = 40; 
    }, 2000);
    
    alert(`👑 الحوت [${newWhaleName}] يطلق درع الحماية الإمبراطوري الآن!`);
}
