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

// 4. مصفوفة وإعدادات الفيروسات (البرمجيات الخبيثة)
let viruses = [];
let lastVirusSpawn = 0;
let spawnInterval = 1000; // سرعة ظهور فيروس جديد (ملي ثانية) وكلما قل الوقت تزداد الصعوبة
let baseVirusSpeed = 2; // السرعة الأساسية لسقوط الفيروسات

// دالة لتوليد فيروس جديد في مصفوفة اللعبة
function spawnVirus() {
    // تحديد نوع الفيروس وألوان سيبرانية مختلفة عشوائياً
    const colors = ['#ff3333', '#ff0055', '#ff9900', '#cc00ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const virus = {
        x: Math.random() * canvas.width, // يظهر في مكان أفقي عشوائي
        y: -20, // يبدأ من أعلى الشاشة تماماً خارج الرؤية
        radius: Math.random() * 8 + 12, // أحجام متفاوتة للفيروسات
        color: randomColor,
        speed: baseVirusSpeed + Math.random() * 1.5 // سرعات متفاوتة قليلاً للحماس
    };
    viruses.push(virus);
}

// 5. دالة تحديث حركة الفيروسات وفحص اصطدامها بالدرع
function updateViruses() {
    for (let i = viruses.length - 1; i >= 0; i--) {
        let v = viruses[i];
        
        // الفيروسات تتحرك نحو الأسفل والمنتصف باتجاه الدرع
        // حساب الاتجاه الرياضي نحو الدرع
        let dx = shield.x - v.x;
        let dy = shield.y - v.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // تحريك الفيروس خطوة بخطوة نحو الدرع
        v.x += (dx / distance) * v.speed;
        v.y += (dy / distance) * v.speed;
        
        // فحص الاصطدام: إذا لمس الفيروس درع الحماية
        if (distance < shield.radius + v.radius) {
            // حذف الفيروس من المصفوفة عند الاصطدام
            viruses.splice(i, 1);
            // تقليل النقاط كعقوبة للاختراق (لا تنزل عن صفر)
            score = Math.max(0, score - 5);
            scoreEl.textContent = score;
            continue;
        }
        
        // حذف الفيروس إذا خرج تماماً عن حدود الشاشة السفلية لحفظ الذاكرة لأجهزة الهاتف
        if (v.y > canvas.height + 20) {
            viruses.splice(i, 1);
        }
    }
}

// دالة رسم الفيروسات على الشاشة بتأثير سيبراني مدبب
function drawViruses() {
    viruses.forEach(v => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
        ctx.fillStyle = v.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = v.color; // توهج نيون بلون الفيروس
        ctx.fill();
        ctx.closePath();
        
        // تصفير التوهج حتى لا يؤثر على بقية العناصر المرسومة
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

// 6. حلقة اللعبة الرئيسية (Game Loop) المحدثة
function gameLoop(timestamp) {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // إدارة توقيت ظهور الفيروسات وزيادة الصعوبة مع الوقت
    if (timestamp - lastVirusSpawn > spawnInterval) {
        spawnVirus();
        lastVirusSpawn = timestamp;
        
        // زيادة الصعوبة تدريجياً بتقليل زمن الظهور
        if (spawnInterval > 300) spawnInterval -= 5;
    }

    // تحديث ورسم العناصر
    updateViruses();
    drawViruses();
    drawShield();

    requestAnimationFrame(gameLoop);
}

// بدء تشغيل المحرك مع تمرير الوقت الإفتراضي للـ Loop
requestAnimationFrame(gameLoop);
