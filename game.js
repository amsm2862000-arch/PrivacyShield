// 1. تهيئة اللعبة وتحديد العناصر من الواجهة
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const whaleNameEl = document.getElementById('whale-name');
const whaleAmountEl = document.getElementById('whale-amount');

// إعداد أبعاد الـ Canvas لتملأ شاشة الهاتف تماماً
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

// بيانات الحوت الافتراضية (سيتم تحديثها ديناميكياً لاحقاً)
let currentWhale = {
    name: "الحوت_السيبراني_الرئيسي",
    amount: "1.50 ETH"
};

// تحديث لوحة الشرف الفاخرة بالبيانات الحالية
function updateWhalesWall() {
    whaleNameEl.textContent = currentWhale.name;
    whaleAmountEl.textContent = currentWhale.amount;
}
updateWhalesWall();

// 3. إعدادات درع الحماية (PrivacyShield) في منتصف الشاشة
const shield = {
    x: canvas.width / 2,
    y: canvas.height / 2 + 50, // منخفض قليلاً عن المنتصف ليترك مساحة للفيروسات الساقطة
    radius: 40,
    color: '#00ffcc', // لون سيبراني متوهج للدرع
    pulse: 0 // متغير لعمل تأثير نبض بصري للدرع
};

// 4. دالة رسم درع الحماية وتأثير النبض
function drawShield() {
    // زيادة النبض البصري بشكل مستمر
    shield.pulse += 0.05;
    let pulseRadius = shield.radius + Math.sin(shield.pulse) * 4;

    // رسم هالة التوهج الخارجي للدرع
    ctx.beginPath();
    ctx.arc(shield.x, shield.y, pulseRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 220, 0.15)';
    ctx.fill();
    ctx.closePath();

    // رسم الدرع الأساسي الداخلي
    ctx.beginPath();
    ctx.arc(shield.x, shield.y, shield.radius, 0, Math.PI * 2);
    ctx.fillStyle = shield.color;
    // إضافة تدرج لوني ليعطي مظهر ثلاثي الأبعاد
    let gradient = ctx.createRadialGradient(shield.x, shield.y, 5, shield.x, shield.y, shield.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#00ffcc');
    gradient.addColorStop(1, '#006655');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    // رسم علامة قفل أو رمز مبسط داخل الدرع لحماية الهوية
    ctx.fillStyle = '#090d16';
    ctx.fillRect(shield.x - 8, shield.y - 4, 16, 14);
    ctx.beginPath();
    ctx.arc(shield.x, shield.y - 4, 6, 0, Math.PI, true);
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
}

// 5. حلقة اللعبة الرئيسية (Game Loop) لتحديث الشاشة باستمرار
function gameLoop() {
    if (!gameActive) return;

    // مسح الشاشة في كل إطار لإعادة الرسم
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // رسم الدرع
    drawShield();

    // استدعاء الإطار القادم للحفاظ على سلاسة الحركة (60 إطار في الثانية)
    requestAnimationFrame(gameLoop);
}

// تشغيل محرك اللعبة لأول مرة
gameLoop();
      
