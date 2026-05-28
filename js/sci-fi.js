/* ============================================
   Hexo Butterfly — 科技感动画引擎 v4.0
   粒子网络 + 鼠标拖尾 + Header光点 + 数码雨
   + 点击波纹 + 自定义光标 + 加载屏 + 滚动进度
   + 文字视差 + 3D Tilt + ScrollReveal
   ============================================ */

(function () {
  'use strict';

  var PI = Math.PI, random = Math.random, floor = Math.floor, sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt;
  var absY = 0;

  /* ========================================
     0. 全局滚动位置追踪
     ======================================== */
  function updateAbsY() {
    absY = window.pageYOffset || document.documentElement.scrollTop;
  }
  window.addEventListener('scroll', updateAbsY);
  updateAbsY();

  /* ========================================
     1. 加载屏幕
     ======================================== */
  function initLoadingScreen() {
    var overlay = document.createElement('div');
    overlay.id = 'scifi-loading';
    overlay.innerHTML =
      '<div class="scifi-loader">' +
        '<svg class="loader-ring" viewBox="0 0 100 100">' +
          '<circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,196,255,0.15)" stroke-width="2"/>' +
          '<circle class="loader-arc" cx="50" cy="50" r="40" fill="none" stroke="#00c4ff" stroke-width="2" ' +
            'stroke-dasharray="251" stroke-dashoffset="251" stroke-linecap="round"/>' +
          '<polygon class="loader-hex" points="50,20 76,35 76,65 50,80 24,65 24,35" ' +
            'fill="none" stroke="rgba(124,58,237,0.4)" stroke-width="1.5"/>' +
        '</svg>' +
        '<div class="loader-text">' +
          '<span>S</span><span>Y</span><span>S</span><span>T</span><span>E</span><span>M</span>' +
          '<span>&nbsp;</span>' +
          '<span>B</span><span>O</span><span>O</span><span>T</span>' +
        '</div>' +
        '<div class="loader-dots"><span>.</span><span>.</span><span>.</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    window.addEventListener('load', function () {
      setTimeout(function () {
        overlay.classList.add('fade-out');
        document.body.style.overflow = '';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 600);
      }, 800);
    });

    // 防止卡死：3秒后强制隐藏
    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.classList.add('fade-out');
        document.body.style.overflow = '';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 600);
      }
    }, 3500);
  }

  /* ========================================
     2. Canvas 粒子网络背景
     ======================================== */
  function initParticleNetwork() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');
    var w, h, particles = [];
    var CONNECT_DIST = 150, MOUSE_DIST = 180;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = document.documentElement.scrollHeight;
    }
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY + absY;
    });

    for (var i = 0; i < 80; i++) {
      particles.push({
        x: random() * (window.innerWidth || 1200),
        y: random() * (document.documentElement.scrollHeight || 3000),
        vx: (random() - 0.5) * 0.5,
        vy: (random() - 0.5) * 0.5,
        r: random() * 2.5 + 1,
        opacity: random() * 0.5 + 0.3,
        hue: random() < 0.3 ? 270 : 195
      });
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;

        var dx = mouse.x - p.x, dy = mouse.y - p.y;
        var dist = sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST && dist > 0) {
          var force = (1 - dist / MOUSE_DIST) * 0.04;
          p.vx += dx * force; p.vy += dy * force;
        }
        p.vx *= 0.999; p.vy *= 0.999;
        if (random() < 0.003) { p.vx += (random() - 0.5) * 0.15; p.vy += (random() - 0.5) * 0.15; }
        var speed = sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx = (p.vx / speed) * 1.5; p.vy = (p.vy / speed) * 1.5; }
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ',80%,65%,' + p.opacity + ')';
        ctx.fill();
      }

      // 粒子连线
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx2 = particles[i].x - particles[j].x, dy2 = particles[i].y - particles[j].y;
          var dist2 = sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0,196,255,' + ((1 - dist2 / CONNECT_DIST) * 0.2) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // 鼠标连线
      for (var i = 0; i < particles.length; i++) {
        var dx3 = mouse.x - particles[i].x, dy3 = mouse.y - particles[i].y;
        var dist3 = sqrt(dx3 * dx3 + dy3 * dy3);
        if (dist3 < MOUSE_DIST) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(particles[i].x, particles[i].y);
          ctx.strokeStyle = 'rgba(0,196,255,' + ((1 - dist3 / MOUSE_DIST) * 0.6) + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      requestAnimationFrame(animate);
    }

    resize();
    animate();

    var observer = new MutationObserver(function () {
      h = canvas.height = document.documentElement.scrollHeight;
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: false });
  }

  /* ========================================
     3. 数码雨 (Matrix Rain)
     ======================================== */
  function initMatrixRain() {
    var canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.18;';
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;

    window.addEventListener('resize', function () {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    var chars = 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF<>/\\[]{}|#@$%&';
    var fontSize = 14;
    var cols = floor(w / fontSize);
    var drops = [];
    for (var i = 0; i < cols; i++) {
      drops[i] = random() * -h;
    }

    function draw() {
      ctx.fillStyle = 'rgba(6,11,24,0.06)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = fontSize + 'px "MS Gothic", "Yu Gothic", monospace';
      ctx.textBaseline = 'top';

      for (var i = 0; i < drops.length; i++) {
        var char = chars[floor(random() * chars.length)];
        var x = i * fontSize;
        var y = drops[i] * fontSize;

        // 头部亮色
        ctx.fillStyle = 'rgba(180,240,255,0.9)';
        ctx.fillText(char, x, y);

        // 尾部渐变
        for (var j = 1; j < 8; j++) {
          var trailChar = chars[floor(random() * chars.length)];
          var alpha = 0.8 - j * 0.1;
          if (alpha <= 0) break;
          ctx.fillStyle = 'rgba(0,196,255,' + alpha + ')';
          ctx.fillText(trailChar, x, y - j * fontSize);
        }

        drops[i] += 0.25 + random() * 0.35;
        if (y > h && random() > 0.975) {
          drops[i] = random() * -5;
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ========================================
     4. 鼠标拖尾 + 自定义光标 + 点击波纹
     ======================================== */
  function initOverlayCanvas() {
    var canvas = document.createElement('canvas');
    canvas.id = 'overlay-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;

    window.addEventListener('resize', function () {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    // --- 鼠标拖尾 ---
    var trails = [];
    var MAX_TRAILS = 45;
    var mx = -100, my = -100, prevMx = -100, prevMy = -100;

    document.addEventListener('mousemove', function (e) {
      prevMx = mx; prevMy = my;
      mx = e.clientX; my = e.clientY;
    });

    // --- 点击波纹粒子 ---
    var ripples = [];

    document.addEventListener('click', function (e) {
      var cx = e.clientX, cy = e.clientY;
      for (var i = 0; i < 22; i++) {
        var angle = (PI * 2 / 22) * i + random() * 0.5;
        var spd = random() * 4 + 2;
        ripples.push({
          x: cx, y: cy,
          vx: cos(angle) * spd,
          vy: sin(angle) * spd,
          life: 1,
          decay: random() * 0.025 + 0.02,
          r: random() * 2 + 1,
          hue: random() < 0.4 ? 195 : 270
        });
      }
      // 光圈
      ripples.push({
        x: cx, y: cy, vx: 0, vy: 0,
        life: 1, decay: 0.04, r: 5,
        hue: 195, isRing: true, maxR: random() * 40 + 30
      });
      if (ripples.length > 100) ripples.splice(0, ripples.length - 100);
    });

    function spawnTrailParticle(tx, ty, tvx, tvy) {
      return {
        x: tx, y: ty,
        vx: tvx || (random() - 0.5) * 1.5,
        vy: tvy || (random() - 0.5) * 1.5,
        life: 1,
        decay: random() * 0.015 + 0.012,
        r: random() * 3 + 1.5,
        hue: random() < 0.4 ? 195 : (random() < 0.5 ? 270 : 180)
      };
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);

      // --- 拖尾粒子 ---
      var dx = mx - prevMx, dy = my - prevMy;
      var speed = sqrt(dx * dx + dy * dy);
      if (speed > 1 && mx > 0 && my > 0) {
        var count = Math.min(floor(speed / 3), 5);
        for (var i = 0; i < count; i++) {
          var t = i / (count || 1);
          trails.push(spawnTrailParticle(
            prevMx + dx * t + (random() - 0.5) * 8,
            prevMy + dy * t + (random() - 0.5) * 8,
            (random() - 0.5) * 0.8,
            (random() - 0.5) * 0.8
          ));
          if (trails.length > MAX_TRAILS) trails.shift();
        }
      }
      if (mx > 0 && my > 0 && random() < 0.4) {
        var angle = random() * PI * 2;
        trails.push(spawnTrailParticle(
          mx + cos(angle) * (random() * 20 + 5),
          my + sin(angle) * (random() * 20 + 5),
          cos(angle) * 0.3,
          sin(angle) * 0.3
        ));
        if (trails.length > MAX_TRAILS) trails.shift();
      }

      for (var i = trails.length - 1; i >= 0; i--) {
        var p = trails[i];
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) { trails.splice(i, 1); continue; }

        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, 'hsla(' + p.hue + ',90%,70%,' + (p.life * 0.9) + ')');
        grad.addColorStop(0.4, 'hsla(' + p.hue + ',80%,55%,' + (p.life * 0.5) + ')');
        grad.addColorStop(1, 'hsla(' + p.hue + ',70%,40%,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.6, 0, PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (p.life * 0.8) + ')';
        ctx.fill();
      }

      // --- 点击波纹 ---
      for (var i = ripples.length - 1; i >= 0; i--) {
        var rp = ripples[i];
        rp.x += rp.vx; rp.y += rp.vy; rp.life -= rp.decay;
        if (rp.life <= 0) { ripples.splice(i, 1); continue; }

        if (rp.isRing) {
          rp.r += 3;
          var ringAlpha = rp.life * 0.5;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r, 0, PI * 2);
          ctx.strokeStyle = 'rgba(0,196,255,' + ringAlpha + ')';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          var rGrad = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, rp.r * 2);
          rGrad.addColorStop(0, 'hsla(' + rp.hue + ',90%,75%,' + rp.life + ')');
          rGrad.addColorStop(0.5, 'hsla(' + rp.hue + ',80%,55%,' + (rp.life * 0.4) + ')');
          rGrad.addColorStop(1, 'hsla(' + rp.hue + ',70%,40%,0)');
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r * 2, 0, PI * 2);
          ctx.fillStyle = rGrad;
          ctx.fill();
        }
      }

      // --- 自定义光标 ---
      if (mx > 0 && my > 0) {
        // 外环
        ctx.beginPath();
        ctx.arc(mx, my, 14, 0, PI * 2);
        ctx.strokeStyle = 'rgba(0,196,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 外环缺口（旋转效果通过绘制弧形实现）
        var t = Date.now() / 1000;
        ctx.beginPath();
        ctx.arc(mx, my, 14, t * 0.8, t * 0.8 + PI * 1.6);
        ctx.strokeStyle = 'rgba(0,196,255,0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 内环
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, PI * 2);
        ctx.strokeStyle = 'rgba(124,58,237,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 中心点
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, PI * 2);
        ctx.fillStyle = 'rgba(0,196,255,0.85)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 1, 0, PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();

        // 光晕
        var cGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 22);
        cGlow.addColorStop(0, 'rgba(0,196,255,0.15)');
        cGlow.addColorStop(0.5, 'rgba(124,58,237,0.06)');
        cGlow.addColorStop(1, 'rgba(0,196,255,0)');
        ctx.beginPath();
        ctx.arc(mx, my, 22, 0, PI * 2);
        ctx.fillStyle = cGlow;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ========================================
     5. Header 标题区域浮动光点
     ======================================== */
  function initHeaderSparks() {
    var header = document.querySelector('#page-header');
    if (!header) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'header-sparks-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    header.style.position = 'relative';
    header.style.overflow = 'hidden';
    header.insertBefore(canvas, header.firstChild);

    var ctx = canvas.getContext('2d');
    var w, h;
    var MAX_SPARKS = 30;
    var sparks = [];

    function resize() {
      var rect = header.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    function getTargetArea() {
      var siteInfo = header.querySelector('#site-info');
      if (!siteInfo) return { cx: w / 2, cy: h / 2, rw: w * 0.4, rh: h * 0.3 };
      var rect = siteInfo.getBoundingClientRect();
      var headerRect = header.getBoundingClientRect();
      return {
        cx: rect.left + rect.width / 2 - headerRect.left,
        cy: rect.top + rect.height / 2 - headerRect.top,
        rw: rect.width * 0.9,
        rh: rect.height * 0.9
      };
    }

    function Spark() { this.reset(); }
    Spark.prototype.reset = function () {
      var area = getTargetArea();
      this.baseX = area.cx + (random() - 0.5) * area.rw;
      this.baseY = area.cy + (random() - 0.5) * area.rh;
      this.x = this.baseX; this.y = this.baseY;
      this.vx = (random() - 0.5) * 0.3;
      this.vy = -random() * 0.6 - 0.2;
      this.r = random() * 1.8 + 0.5;
      this.life = 1;
      this.decay = random() * 0.003 + 0.0025;
      this.phase = random() * PI * 2;
      this.amp = random() * 35 + 10;
      this.freq = random() * 0.02 + 0.01;
      this.time = 0;
      this.hue = random() < 0.3 ? 270 : 195;
    };
    Spark.prototype.update = function () {
      this.time++; this.life -= this.decay;
      this.x = this.baseX + sin(this.time * this.freq + this.phase) * this.amp;
      this.y += this.vy; this.baseX += this.vx;
      if (this.life <= 0 || this.y < -20 || this.y > h + 20) this.reset();
    };
    Spark.prototype.draw = function () {
      var alpha = this.life;
      var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
      grad.addColorStop(0, 'hsla(' + this.hue + ',90%,75%,' + alpha + ')');
      grad.addColorStop(0.5, 'hsla(' + this.hue + ',80%,55%,' + (alpha * 0.4) + ')');
      grad.addColorStop(1, 'hsla(' + this.hue + ',70%,40%,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    for (var i = 0; i < MAX_SPARKS; i++) sparks.push(new Spark());

    function animate() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < sparks.length; i++) { sparks[i].update(); sparks[i].draw(); }
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ========================================
     6. 滚动进度条
     ======================================== */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    });
  }

  /* ========================================
     7. 标题文字悬浮视差
     ======================================== */
  function initTextParallax() {
    var title = document.querySelector('#site-title');
    var subtitle = document.querySelector('#site-subtitle');
    if (!title && !subtitle) return;

    document.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;

      if (title) {
        title.style.transform = 'translate3d(' + (dx * 6) + 'px,' + (dy * 4) + 'px,0)';
        title.style.transition = 'transform 0.3s ease-out';
      }
      if (subtitle) {
        subtitle.style.transform = 'translate3d(' + (dx * 3) + 'px,' + (dy * 2) + 'px,0)';
        subtitle.style.transition = 'transform 0.3s ease-out';
      }
    });
  }

  /* ========================================
     8. GSAP ScrollTrigger 滚动揭示
     ======================================== */
  function initScrollReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var cards = document.querySelectorAll('.recent-post-item');
    if (cards.length) {
      gsap.from(cards, {
        scrollTrigger: { trigger: cards[0].parentElement, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 50, duration: 0.6, stagger: 0.1, ease: 'power3.out'
      });
    }

    var headings = document.querySelectorAll('#article-container h2, #article-container h3');
    if (headings.length) {
      gsap.from(headings, {
        scrollTrigger: { trigger: headings[0], start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, x: -30, duration: 0.5, stagger: 0.08, ease: 'power2.out'
      });
    }

    var codeBlocks = document.querySelectorAll('#article-container figure');
    if (codeBlocks.length) {
      gsap.from(codeBlocks, {
        scrollTrigger: { trigger: codeBlocks[0], start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0, y: 30, duration: 0.5, stagger: 0.08, ease: 'power2.out'
      });
    }

    var images = document.querySelectorAll('#article-container img');
    if (images.length) {
      gsap.from(images, {
        scrollTrigger: { trigger: images[0], start: 'top 90%', toggleActions: 'play none none none' },
        opacity: 0, scale: 0.95, duration: 0.5, stagger: 0.06, ease: 'power2.out'
      });
    }
  }

  /* ========================================
     9. 3D Card Tilt
     ======================================== */
  function initCardTilt() {
    var cards = document.querySelectorAll('.recent-post-item');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left, y = e.clientY - rect.top;
        var rx = ((y - rect.height / 2) / (rect.height / 2)) * -5;
        var ry = ((x - rect.width / 2) / (rect.width / 2)) * 5;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';

        // 封面图反方向视差 (N)
        var cover = card.querySelector('.post_cover img');
        if (cover) {
          var px = ((x - rect.width / 2) / (rect.width / 2)) * -8;
          var py = ((y - rect.height / 2) / (rect.height / 2)) * -6;
          cover.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) scale(1.08)';
          cover.style.transition = 'transform 0.1s ease-out';
        }
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';

        var cover = card.querySelector('.post_cover img');
        if (cover) {
          cover.style.transform = 'translate3d(0,0,0) scale(1)';
          cover.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        }
      });
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.1s ease-out';
      });
    });
  }

  /* ========================================
     10. 首页加载 GSAP 入场
     ======================================== */
  function initPageLoad() {
    if (typeof gsap === 'undefined') return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });
    tl.from('#nav', { y: -60, opacity: 0, duration: 0.6 })
      .from('#site-title', { opacity: 0, y: 15, duration: 0.5 }, '-=0.2')
      .from('#site-subtitle', { opacity: 0, y: 10, duration: 0.4 }, '-=0.2')
      .from('#site_social_icons', { opacity: 0, scale: 0.8, duration: 0.3 }, '-=0.1')
      .from('#scroll-down', { opacity: 0, y: -8, duration: 0.3 }, '-=0.1');
  }

  /* ========================================
     启动
     ======================================== */
  initLoadingScreen();

  document.addEventListener('DOMContentLoaded', function () {
    initParticleNetwork();
    initMatrixRain();
    initOverlayCanvas();
    initHeaderSparks();
    initScrollProgress();
    initTextParallax();
    initPageLoad();
    initCardTilt();

    window.addEventListener('load', function () {
      initScrollReveal();
    });
  });
})();
