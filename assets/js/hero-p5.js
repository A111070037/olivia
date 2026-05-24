/**
 * Hero Section — p5.js 粒子文字效果
 * 文字由粒子組成，滑鼠靠近時粒子散開，移開後回歸原位
 *
 * 放置路徑：assets/js/hero-p5.js
 * HTML 引入方式（必須是普通 script，不加 type="module"）：
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
 *   <script src="assets/js/hero-p5.js"></script>
 */

new p5(function (p) {

  // ── 設定區（可自行調整）────────────────────────────────
  const TEXT_LINES   = ['Olivia Lee', 'Designer & Developer'];  // 要顯示的文字
  const FONT_SIZE    = [100, 50];          // 每行字體大小（px）
  const PARTICLE_GAP = 4;                 // 粒子取樣間距，越小粒子越多越密
  const PARTICLE_R   = 2;                 // 粒子半徑
  const MOUSE_RADIUS = 100;              // 滑鼠排斥半徑
  const REPEL_FORCE  = 8;                // 排斥力道
  const RETURN_SPEED = 0.08;             // 回歸速度（0~1，越大越快）
  const PARTICLE_COLOR = [200, 200, 255]; // 粒子顏色 [R, G, B]
  const BG_COLOR     = [4, 11, 20];      // 背景色（配合 #040b14）
  // ────────────────────────────────────────────────────────

  let particles = [];
  let container;

  // ── Particle 類別 ───────────────────────────────────────
  class Particle {
    constructor(x, y) {
      this.home = p.createVector(x, y);     // 原始目標位置
      this.pos  = p.createVector(            // 初始隨機散落位置
        p.random(p.width),
        p.random(p.height)
      );
      this.vel  = p.createVector(0, 0);
      this.acc  = p.createVector(0, 0);
    }

    update(mx, my) {
      // 計算到滑鼠的距離
      const dx   = this.pos.x - mx;
      const dy   = this.pos.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 0) {
        // 在排斥範圍內：推離滑鼠
        const force  = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle  = Math.atan2(dy, dx);
        this.acc.x  += Math.cos(angle) * force * REPEL_FORCE;
        this.acc.y  += Math.sin(angle) * force * REPEL_FORCE;
      }

      // 朝原位彈回（彈簧力）
      const toHome = p5.Vector.sub(this.home, this.pos);
      toHome.mult(RETURN_SPEED);
      this.acc.add(toHome);

      // 阻尼（模擬空氣阻力）
      this.vel.mult(0.85);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
    }

    draw() {
      p.fill(PARTICLE_COLOR[0], PARTICLE_COLOR[1], PARTICLE_COLOR[2],
             p.map(PARTICLE_R, 1, 4, 180, 255));
      p.noStroke();
      p.ellipse(this.pos.x, this.pos.y, PARTICLE_R * 2);
    }
  }

  // ── 用 canvas 取樣文字像素，產生粒子群 ─────────────────
  function buildParticles() {
    particles = [];

    // 建立離屏 canvas 來取像素
    const offscreen = document.createElement('canvas');
    offscreen.width  = p.width;
    offscreen.height = p.height;
    const ctx = offscreen.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // 計算多行文字的總高度並垂直置中
    const lineHeights = FONT_SIZE.map(s => s * 1.3);
    const totalH      = lineHeights.reduce((a, b) => a + b, 0);
    let   startY      = (p.height - totalH) / 2 + FONT_SIZE[0];

    TEXT_LINES.forEach((line, i) => {
      ctx.font = `800 ${FONT_SIZE[i]}px "Montserrat", "Raleway", sans-serif`;
      ctx.fillText(line, p.width / 2, startY);
      startY += lineHeights[i];
    });

    // 取樣像素
    const imageData = ctx.getImageData(0, 0, p.width, p.height).data;
    for (let x = 0; x < p.width;  x += PARTICLE_GAP) {
      for (let y = 0; y < p.height; y += PARTICLE_GAP) {
        const idx = (x + y * p.width) * 4;
        if (imageData[idx] > 128) {           // 白色區域 → 放粒子
          particles.push(new Particle(x, y));
        }
      }
    }
  }

  // ── p5 生命週期 ─────────────────────────────────────────
  p.setup = function () {
    container = document.getElementById('hero-canvas');
    if (!container) return;

    const cnv = p.createCanvas(container.clientWidth, container.clientHeight);
    cnv.parent('hero-canvas');

    buildParticles();
  };

  p.draw = function () {
    p.background(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);

    const mx = p.mouseX;
    const my = p.mouseY;

    for (const pt of particles) {
      pt.update(mx, my);
      pt.draw();
    }
  };

  p.windowResized = function () {
    if (!container) return;
    p.resizeCanvas(container.clientWidth, container.clientHeight);
    buildParticles();
  };
});