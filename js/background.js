/* ============================================================
   DEEPWOOD — khu rừng top-down vẽ hoàn toàn bằng canvas
   ============================================================ */

const Background = (() => {
  "use strict";

  const canvas = document.getElementById("world");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;

  if (!canvas || !ctx) {
    return { init() {} };
  }

  const TAU = Math.PI * 2;
  const TILE = 48;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    terrain: null,
    waterPath: null,
    pond: null,
    character: null,
    hideTraveler: false,
    fireflies: [],
    glow: null,
    mist: [],
    mistSprite: null,
    time: 0,
    last: 0,
    resizeTimer: 0,
    mapType: "night",
  };

  /* ---------- helpers ---------- */

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function circle(g, x, y, r) {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }

  function lerpAngle(a, b, t) {
    let d = ((b - a + Math.PI) % TAU) - Math.PI;
    if (d < -Math.PI) d += TAU;
    return a + d * t;
  }

  /* ---------- địa hình ---------- */

  function pondShape() {
    const { w, h } = state;

    if (w < 700) {
      return { cx: w * 0.86, cy: h * 0.9, rx: w * 0.24, ry: h * 0.075 };
    }

    const rx = clamp(w * 0.16, 150, 320);
    const ry = clamp(h * 0.13, 100, 190);
    return { cx: w - rx * 0.9, cy: h - ry * 0.7, rx, ry };
  }

  function wobble(angle) {
    return 1 + 0.07 * Math.sin(angle * 3 + 1.4) + 0.045 * Math.cos(angle * 5 - 0.7);
  }

  function isWaterPoint(x, y) {
    const p = state.pond;
    if (!p) return false;

    const dx = (x - p.cx) / p.rx;
    const dy = (y - p.cy) / p.ry;
    const r = Math.hypot(dx, dy);

    if (r > 1.3) return false;
    return r < wobble(Math.atan2(dy, dx));
  }

  function pathY(nx) {
    return (
      0.615 +
      Math.sin(nx * Math.PI * 1.6 + 0.55) * 0.075 +
      Math.sin(nx * Math.PI * 3.2 + 1.2) * 0.022
    );
  }

  function onPath(nx, ny) {
    const half = (TILE * 0.72) / state.h;
    return Math.abs(ny - pathY(nx)) < half;
  }

  function inSafeZone(nx, ny) {
    return nx > 0.245 && nx < 0.755 && ny > 0.06 && ny < 0.96;
  }

  function buildTrees() {
    const { w, h } = state;
    const scale = clamp(Math.min(w, h) / 820, 0.72, 1.3);
    const target = Math.round(clamp((w * h) / 26000, 18, 60));
    const trees = [];
    let guard = 0;

    while (trees.length < target && guard < target * 50) {
      guard += 1;
      const nx = Math.random();
      const ny = Math.random();

      if (inSafeZone(nx, ny)) continue; // chỉ trồng ngoài vùng menu
      if (onPath(nx, ny)) continue;

      const x = nx * w;
      const y = ny * h;
      if (isWaterPoint(x, y)) continue;

      const r = rand(26, 54) * scale;
      let tooClose = false;

      for (const tree of trees) {
        if (Math.hypot(tree.x - x, tree.y - y) < (tree.r + r) * 0.78) {
          tooClose = true;
          break;
        }
      }

      if (tooClose) continue;
      trees.push({ x, y, r, seed: Math.random() });
    }

    trees.sort((a, b) => a.y - b.y);
    return trees;
  }

  function buildBushes() {
    const { w, h } = state;
    const bushes = [];
    const target = Math.round(clamp((w * h) / 70000, 8, 26));
    let guard = 0;

    while (bushes.length < target && guard < target * 24) {
      guard += 1;
      const nx = Math.random();
      const ny = Math.random();

      if (nx > 0.3 && nx < 0.7 && ny > 0.08 && ny < 0.92) continue;
      if (onPath(nx, ny)) continue;

      const x = nx * w;
      const y = ny * h;
      if (isWaterPoint(x, y)) continue;

      bushes.push({ x, y, r: rand(8, 18), seed: Math.random() });
    }

    return bushes;
  }

  /* ---------- vẽ địa hình (một lần) ---------- */

  function buildTerrain() {
    const { w, h } = state;

    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(w * state.dpr));
    off.height = Math.max(1, Math.round(h * state.dpr));

    const g = off.getContext("2d");
    g.scale(state.dpr, state.dpr);

    const base = g.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, "#0b1e14");
    base.addColorStop(0.55, "#081810");
    base.addColorStop(1, "#051009");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);

    // Nền cỏ: các mảng màu hữu cơ thay cho lưới ô để tránh hiệu ứng bàn cờ
    const patchCount = Math.round((w * h) / 5200);
    for (let i = 0; i < patchCount; i += 1) {
      const x = rand(-60, w + 60);
      const y = rand(-60, h + 60);
      const radius = rand(40, 170);
      const hue = rand(134, 162);
      const sat = rand(20, 32);
      const light = rand(7.5, 13.5);

      const grad = g.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${rand(0.05, 0.14)})`);
      grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);

      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(x, y, radius, radius * rand(0.5, 0.85), rand(0, TAU), 0, TAU);
      g.fill();
    }

    // Cỏ rải ngẫu nhiên
    const tuftCount = Math.round((w * h) / 780);
    for (let i = 0; i < tuftCount; i += 1) {
      const x = rand(0, w);
      const y = rand(0, h);
      const blades = 1 + Math.floor(Math.random() * 3);
      const alpha = rand(0.14, 0.38);

      for (let b = 0; b < blades; b += 1) {
        const bx = x + rand(-4, 4);
        const by = y + rand(-1, 1);
        g.strokeStyle = `hsla(${rand(122, 152)}, ${rand(22, 36)}%, ${rand(16, 26)}%, ${alpha})`;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(bx + rand(-2.2, 2.2), by - rand(2, 5.5));
        g.stroke();
      }
    }

    // Hoa dại, sỏi và nấm nhỏ
    const detailCount = Math.round((w * h) / 42000);
    for (let i = 0; i < detailCount; i += 1) {
      const x = rand(0, w);
      const y = rand(0, h);
      const roll = Math.random();

      if (roll > 0.55) {
        g.fillStyle = `rgba(226, 222, 180, ${rand(0.3, 0.6)})`;
        circle(g, x, y, rand(0.8, 1.5));
        g.fillStyle = `rgba(172, 196, 116, ${rand(0.2, 0.35)})`;
        circle(g, x - 2, y + 1.4, 0.9);
        circle(g, x + 2, y + 1, 0.8);
      } else if (roll > 0.2) {
        g.fillStyle = `rgba(74, 82, 68, ${rand(0.35, 0.6)})`;
        g.beginPath();
        g.ellipse(x, y, rand(1.4, 3.6), rand(1.2, 2.6), rand(0, TAU), 0, TAU);
        g.fill();
      } else {
        g.fillStyle = "rgba(150, 76, 56, 0.55)";
        g.beginPath();
        g.ellipse(x, y, 2.4, 1.6, 0, 0, TAU);
        g.fill();
        g.fillStyle = "rgba(210, 190, 150, 0.4)";
        circle(g, x, y + 1.3, 0.9);
      }
    }

    drawPath(g);
    drawPond(g);

    const bushes = buildBushes();
    for (const bush of bushes) drawBush(g, bush);

    state.trees = buildTrees();
    for (const tree of state.trees) drawTree(g, tree);

    drawMoonlight(g);

    state.terrain = off;
  }

  function drawPath(g) {
    const { w, h } = state;
    const points = [];

    for (let x = -40; x <= w + 40; x += 20) {
      points.push([x, pathY(x / w) * h]);
    }

    const trace = () => {
      g.beginPath();
      g.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i += 1) {
        g.lineTo(points[i][0], points[i][1]);
      }
    };

    g.lineCap = "round";
    g.lineJoin = "round";

    trace();
    g.strokeStyle = "rgba(16, 24, 15, 0.75)";
    g.lineWidth = TILE * 1.35;
    g.stroke();

    trace();
    g.strokeStyle = "#292314";
    g.lineWidth = TILE * 1.05;
    g.stroke();

    trace();
    g.strokeStyle = "rgba(57, 47, 29, 0.6)";
    g.lineWidth = TILE * 0.55;
    g.stroke();

    for (let i = 0; i < 120; i += 1) {
      const x = rand(-20, w + 20);
      const y = pathY(x / w) * h + rand(-TILE * 0.5, TILE * 0.5);
      if (isWaterPoint(x, y)) continue;

      g.fillStyle = Math.random() > 0.5
        ? "rgba(78, 66, 44, 0.5)"
        : "rgba(18, 27, 17, 0.6)";
      g.beginPath();
      g.ellipse(x, y, rand(1, 3.4), rand(1, 2.2), rand(0, TAU), 0, TAU);
      g.fill();
    }
  }

  function pondPath(mult) {
    const p = state.pond;
    const path = new Path2D();
    const steps = 56;

    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * TAU;
      const k = wobble(a) * mult;
      const x = p.cx + Math.cos(a) * p.rx * k;
      const y = p.cy + Math.sin(a) * p.ry * k;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }

    path.closePath();
    return path;
  }

  function drawLily(g, x, y, r) {
    g.save();
    g.translate(x, y);
    g.rotate(Math.random() * TAU);

    g.fillStyle = "rgba(33, 71, 42, 0.9)";
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, r, 0.32, TAU - 0.06);
    g.closePath();
    g.fill();

    g.fillStyle = "rgba(105, 155, 85, 0.3)";
    g.beginPath();
    g.ellipse(-r * 0.18, -r * 0.22, r * 0.55, r * 0.3, -0.4, 0, TAU);
    g.fill();

    g.restore();
  }

  function drawPond(g) {
    const p = state.pond;

    const bank = pondPath(1.2);
    g.fillStyle = "rgba(20, 33, 22, 0.9)";
    g.fill(bank);
    g.strokeStyle = "rgba(10, 18, 11, 0.8)";
    g.lineWidth = 10;
    g.stroke(bank);

    const water = pondPath(1);
    state.waterPath = water;

    const grad = g.createRadialGradient(
      p.cx - p.rx * 0.25,
      p.cy - p.ry * 0.35,
      p.rx * 0.08,
      p.cx,
      p.cy,
      p.rx * 1.12
    );
    grad.addColorStop(0, "#1a5a5b");
    grad.addColorStop(0.55, "#0f3b3e");
    grad.addColorStop(1, "#082427");

    g.fillStyle = grad;
    g.fill(water);
    g.strokeStyle = "rgba(130, 210, 185, 0.28)";
    g.lineWidth = 1.5;
    g.stroke(water);

    g.save();
    g.clip(water);

    // Vệt trăng phản chiếu
    const moon = g.createLinearGradient(
      p.cx - p.rx * 0.05,
      p.cy - p.ry * 0.9,
      p.cx + p.rx * 0.1,
      p.cy + p.ry * 0.35
    );
    moon.addColorStop(0, "rgba(200, 236, 218, 0.16)");
    moon.addColorStop(0.55, "rgba(170, 220, 205, 0.06)");
    moon.addColorStop(1, "rgba(170, 220, 205, 0)");
    g.fillStyle = moon;
    g.beginPath();
    g.ellipse(p.cx - p.rx * 0.02, p.cy - p.ry * 0.25, p.rx * 0.14, p.ry * 0.6, 0.12, 0, TAU);
    g.fill();

    for (let i = 0; i < 16; i += 1) {
      const a = rand(0, TAU);
      const rr = Math.sqrt(Math.random()) * 0.75;
      const x = p.cx + Math.cos(a) * p.rx * rr;
      const y = p.cy + Math.sin(a) * p.ry * rr;

      g.strokeStyle = `rgba(150, 220, 195, ${rand(0.03, 0.08)})`;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(x, y, rand(8, 40), rand(2, 6), rand(-0.4, 0.4), 0, TAU);
      g.stroke();
    }

    for (let i = 0; i < 5; i += 1) {
      const a = rand(0, TAU);
      const rr = rand(0.25, 0.7);
      const x = p.cx + Math.cos(a) * p.rx * rr;
      const y = p.cy + Math.sin(a) * p.ry * rr;
      drawLily(g, x, y, rand(9, 18));
    }

    g.restore();

    for (let i = 0; i < 16; i += 1) {
      const a = rand(0, TAU);
      const k = wobble(a) * 1.06;
      const x = p.cx + Math.cos(a) * p.rx * k;
      const y = p.cy + Math.sin(a) * p.ry * k;
      const tall = rand(10, 26);

      g.strokeStyle = `rgba(70, 105, 62, ${rand(0.25, 0.5)})`;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + rand(-5, 5), y - tall * 0.6, x + rand(-8, 8), y - tall);
      g.stroke();
    }
  }

  function drawBush(g, bush) {
    const { x, y, r } = bush;

    g.save();
    g.fillStyle = "rgba(1, 5, 3, 0.35)";
    g.beginPath();
    g.ellipse(x + r * 0.25, y + r * 0.55, r * 1.1, r * 0.5, 0, 0, TAU);
    g.fill();

    g.fillStyle = "#12291a";
    circle(g, x - r * 0.5, y, r * 0.65);
    circle(g, x + r * 0.45, y + r * 0.1, r * 0.6);
    circle(g, x, y - r * 0.3, r * 0.7);

    g.fillStyle = "#1b3a24";
    circle(g, x - r * 0.25, y - r * 0.3, r * 0.42);
    circle(g, x + r * 0.25, y + r * 0.05, r * 0.36);

    g.restore();
  }

  function drawTree(g, tree) {
    const { x, y, r, seed } = tree;
    const autumn = seed > 0.93;

    let dark;
    let mid;
    let rim;

    if (autumn) {
      dark = "#232511";
      mid = "#323218";
      rim = "rgba(120, 112, 54, 0.28)";
    } else if (seed < 0.33) {
      dark = "#0a2014";
      mid = "#133622";
      rim = "rgba(96, 150, 104, 0.24)";
    } else if (seed < 0.66) {
      dark = "#0a2218";
      mid = "#12352a";
      rim = "rgba(86, 144, 118, 0.22)";
    } else {
      dark = "#0b2419";
      mid = "#153b26";
      rim = "rgba(110, 156, 100, 0.22)";
    }

    g.save();

    g.save();
    g.translate(x + r * 0.28, y + r * 0.52);
    g.scale(1, 0.52);

    const shadow = g.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.18);
    shadow.addColorStop(0, "rgba(1, 5, 3, 0.55)");
    shadow.addColorStop(0.6, "rgba(1, 5, 3, 0.34)");
    shadow.addColorStop(1, "rgba(1, 5, 3, 0)");

    g.fillStyle = shadow;
    g.beginPath();
    g.arc(0, 0, r * 1.18, 0, TAU);
    g.fill();
    g.restore();

    g.fillStyle = "#24190f";
    g.fillRect(x - r * 0.08, y + r * 0.18, r * 0.16, r * 0.55);

    const blobs = [
      [0, -r * 0.05, 1],
      [-r * 0.52, -r * 0.12, 0.68],
      [r * 0.5, -r * 0.16, 0.64],
      [-r * 0.18, -r * 0.5, 0.6],
      [r * 0.24, r * 0.26, 0.6],
      [-r * 0.4, r * 0.32, 0.5],
    ];

    const canopy = new Path2D();
    for (const [ox, oy, s] of blobs) {
      const bx = x + ox;
      const by = y + oy;
      const br = r * s;
      canopy.moveTo(bx + br, by);
      canopy.arc(bx, by, br, 0, TAU);
    }

    g.fillStyle = dark;
    g.fill(canopy);

    const grad = g.createRadialGradient(
      x - r * 0.38,
      y - r * 0.42,
      r * 0.08,
      x,
      y,
      r * 1.02
    );
    grad.addColorStop(0, mid);
    grad.addColorStop(0.62, dark);
    grad.addColorStop(1, dark);
    g.fillStyle = grad;
    g.fill(canopy);

    g.save();
    g.clip(canopy);

    g.strokeStyle = rim;
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(x - r * 0.06, y - r * 0.08, r * 0.84, Math.PI * 1.02, Math.PI * 1.78);
    g.stroke();

    for (let i = 0; i < 22; i += 1) {
      const a = rand(Math.PI * 0.9, Math.PI * 2.1);
      const rr = Math.sqrt(Math.random()) * r * 0.92;
      const dx = x + Math.cos(a) * rr;
      const dy = y + Math.sin(a) * rr - r * 0.12;
      g.fillStyle = autumn
        ? `rgba(190, 178, 96, ${rand(0.04, 0.13)})`
        : `rgba(130, 185, 130, ${rand(0.04, 0.13)})`;
      circle(g, dx, dy, rand(0.8, 2.4));
    }

    g.restore();
    g.restore();
  }

  function drawMoonlight(g) {
    g.save();
    g.globalCompositeOperation = "lighter";

    for (let i = 0; i < 3; i += 1) {
      const x = rand(0, state.w);
      const y = rand(0, state.h * 0.5);
      const radius = rand(200, 460);
      const grad = g.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, "rgba(120, 170, 120, 0.035)");
      grad.addColorStop(0.6, "rgba(90, 140, 100, 0.015)");
      grad.addColorStop(1, "rgba(90, 140, 100, 0)");
      g.fillStyle = grad;
      g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    g.restore();
  }

  /* ---------- đom đóm & nhân vật ---------- */

  function makeGlow() {
    const size = 64;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;

    const g = sprite.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255, 244, 186, 0.9)");
    grad.addColorStop(0.22, "rgba(240, 214, 120, 0.5)");
    grad.addColorStop(1, "rgba(240, 214, 120, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    return sprite;
  }

  function makeMistSprite() {
    const size = 256;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;

    const g = sprite.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(168, 198, 168, 0.16)");
    grad.addColorStop(0.45, "rgba(150, 185, 155, 0.09)");
    grad.addColorStop(1, "rgba(150, 185, 155, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    return sprite;
  }

  function createMist() {
    const count = state.w < 700 ? 3 : 5;

    return Array.from({ length: count }, () => ({
      x: Math.random(),
      y: rand(0.3, 0.98),
      size: rand(360, 820),
      speed: rand(0.0025, 0.006),
      phase: rand(0, TAU),
      alpha: rand(0.055, 0.11),
    }));
  }

  function drawMist(t) {
    if (!state.mistSprite) return;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const mist of state.mist) {
      const x = (((mist.x + t * mist.speed) % 1.15) - 0.08) * state.w;
      const y = mist.y * state.h + Math.sin(t * 0.06 + mist.phase) * 24;

      ctx.globalAlpha = mist.alpha + Math.sin(t * 0.1 + mist.phase) * 0.015;
      ctx.drawImage(
        state.mistSprite,
        x - mist.size / 2,
        y - mist.size * 0.3,
        mist.size,
        mist.size * 0.6
      );
    }

    ctx.restore();
  }

  function createFireflies() {
    const count = Math.round(clamp((state.w * state.h) / 55000, 10, 30));

    return Array.from({ length: count }, () => ({
      bx: Math.random(),
      by: Math.random(),
      phase: rand(0, TAU),
      speed: rand(0.25, 0.7),
      drift: rand(10, 34),
      size: rand(14, 26),
    }));
  }

  function drawFireflies(t) {
    if (!state.glow) return;

    for (const fly of state.fireflies) {
      const x = fly.bx * state.w + Math.sin(t * fly.speed + fly.phase) * fly.drift;
      const y = fly.by * state.h + Math.cos(t * fly.speed * 0.8 + fly.phase * 1.6) * fly.drift * 0.55;
      const pulse = 0.5 + 0.5 * Math.sin(t * (0.8 + fly.speed) + fly.phase);

      ctx.globalAlpha = 0.16 + pulse * 0.62;
      ctx.drawImage(state.glow, x - fly.size / 2, y - fly.size / 2, fly.size, fly.size);
    }

    ctx.globalAlpha = 1;
  }

  function createCharacter() {
    const x = state.w * 0.16;
    const y = state.h * 0.7;

    return {
      x,
      y,
      tx: x,
      ty: y,
      speed: 46,
      walk: 0,
      moving: false,
      rotate: -Math.PI / 2,
      waitUntil: 1.5,
    };
  }

  function pickCharacterTarget(character, t) {
    for (let i = 0; i < 24; i += 1) {
      const left = Math.random() < 0.5;
      const nx = left ? rand(0.05, 0.23) : rand(0.77, 0.95);
      const ny = rand(0.2, 0.88);
      const x = nx * state.w;
      const y = ny * state.h;

      if (isWaterPoint(x, y)) continue;
      if (Math.hypot(x - character.x, y - character.y) < 80) continue;

      character.tx = x;
      character.ty = y;
      character.moving = true;
      return;
    }

    character.waitUntil = t + 2;
  }

  function updateCharacter(dt, t) {
    const character = state.character;
    if (!character) return;
    if (state.hideTraveler) return;

    if (REDUCED) {
      character.walk += dt * 1.5;
      return;
    }

    if (character.moving) {
      const dx = character.tx - character.x;
      const dy = character.ty - character.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 3) {
        character.moving = false;
        character.waitUntil = t + rand(2.4, 6);
        character.walk = 0;
        return;
      }

      const step = Math.min(dist, character.speed * dt);
      character.x += (dx / dist) * step;
      character.y += (dy / dist) * step;
      character.walk += dt * 8;

      const targetAngle = Math.atan2(dy, dx) - Math.PI / 2;
      character.rotate = lerpAngle(character.rotate, targetAngle, Math.min(1, dt * 9));
    } else {
      character.walk += dt * 1.8;
      if (t >= character.waitUntil) pickCharacterTarget(character, t);
    }
  }

  function drawCharacter(t) {
    const c = state.character;
    if (!c || state.hideTraveler) return;

    ctx.save();
    ctx.fillStyle = "rgba(1, 5, 3, 0.32)";
    ctx.beginPath();
    ctx.ellipse(c.x + 2, c.y + 9, 11, 5, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    const bob = c.moving ? Math.sin(c.walk * 2.4) * 1.1 : Math.sin(t * 1.9) * 0.5;
    const stride = c.moving ? Math.sin(c.walk * 2.4) * 3 : 0;

    if (state.glow) {
      ctx.save();
      ctx.globalAlpha = 0.44 + Math.sin(t * 1.7) * 0.05;
      ctx.drawImage(state.glow, c.x - 46, c.y - 46, 92, 92);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(c.x, c.y + bob);
    ctx.rotate(c.rotate);
    ctx.scale(1.5, 1.5);

    ctx.fillStyle = "#241a12";
    ctx.beginPath();
    ctx.ellipse(-4, 8 + stride * 0.35, 2.4, 3.2, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, 8 - stride * 0.35, 2.4, 3.2, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#3a5b41";
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 9, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#4d7352";
    ctx.beginPath();
    ctx.ellipse(-1.2, 0.6, 6.6, 7.4, -0.12, 0, TAU);
    ctx.fill();

    const flap = Math.sin(t * 4.2 + c.walk) * 2;
    ctx.fillStyle = "#b25345";
    ctx.beginPath();
    ctx.moveTo(-2.5, -7.5);
    ctx.quadraticCurveTo(-8 + flap, -13, -3.5, -14);
    ctx.quadraticCurveTo(0.5, -10, 2, -7.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#c99a6c";
    ctx.beginPath();
    ctx.ellipse(-7.6, 2.4, 2.3, 3, 0.35, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7.6, 2.4, 2.3, 3, -0.35, 0, TAU);
    ctx.fill();

    // Đèn lồng nhỏ trong tay phải
    if (state.glow) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.drawImage(state.glow, -3.4, -7.8, 24, 24);
      ctx.restore();
    }
    ctx.fillStyle = "#2a1d10";
    ctx.beginPath();
    ctx.arc(8.6, 4.2, 2.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#f6d67c";
    ctx.beginPath();
    ctx.arc(8.6, 4.2, 1.5, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#d7ad7e";
    ctx.beginPath();
    ctx.arc(0, -1.4, 5.4, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#66482a";
    ctx.beginPath();
    ctx.arc(0, -2.6, 8.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#8a633a";
    ctx.beginPath();
    ctx.arc(-0.8, -3.6, 6.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#a57845";
    ctx.beginPath();
    ctx.arc(0, -3.2, 4.5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(48, 31, 16, 0.8)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -3, 6.7, 0.15, Math.PI - 0.15);
    ctx.stroke();

    ctx.fillStyle = "rgba(245, 214, 152, 0.45)";
    ctx.beginPath();
    ctx.arc(-2.2, -5.8, 1.5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  /* ---------- nước động ---------- */

  function drawWater(t) {
    if (!state.waterPath || !state.pond) return;

    const p = state.pond;
    ctx.save();
    ctx.clip(state.waterPath);

    for (let i = 0; i < 4; i += 1) {
      const yy = p.cy + Math.sin(t * (0.05 + i * 0.012) + i * 1.7) * p.ry * 0.6;
      const grad = ctx.createLinearGradient(0, yy - 26, 0, yy + 26);
      grad.addColorStop(0, "rgba(150, 225, 205, 0)");
      grad.addColorStop(0.5, "rgba(150, 225, 205, 0.035)");
      grad.addColorStop(1, "rgba(150, 225, 205, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(p.cx - p.rx * 1.3, yy - 26, p.rx * 2.6, 52);
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i += 1) {
      const phase = (t * 0.18 + i * 0.16) % 1;
      const x = p.cx + Math.sin(i * 2.4 + 1.3) * p.rx * 0.55;
      const y = p.cy + Math.cos(i * 1.9) * p.ry * 0.5;
      ctx.strokeStyle = `rgba(160, 230, 205, ${(1 - phase) * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 5 + phase * 34, (5 + phase * 34) * 0.34, 0, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ---------- vòng lặp ---------- */

  function render(now) {
    const t = now / 1000;
    const rawDt = state.last ? t - state.last : 0.016;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    state.last = t;
    state.time = t;

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    if (state.terrain) {
      if (state.mapType === "day") {
        ctx.save();
        ctx.filter = "brightness(1.68) saturate(1.18) sepia(0.12)";
        ctx.drawImage(state.terrain, 0, 0, state.w, state.h);
        ctx.restore();
      } else if (state.mapType === "moon") {
        ctx.save();
        ctx.filter = "brightness(0.82) saturate(0.72) hue-rotate(-16deg)";
        ctx.drawImage(state.terrain, 0, 0, state.w, state.h);
        ctx.restore();
      } else {
        ctx.drawImage(state.terrain, 0, 0, state.w, state.h);
      }
    } else {
      if (state.mapType === "day") {
        ctx.fillStyle = "#2d5a3a";
      } else if (state.mapType === "moon") {
        ctx.fillStyle = "#081726";
      } else {
        ctx.fillStyle = "#07110c";
      }
      ctx.fillRect(0, 0, state.w, state.h);
    }

    if (state.mapType === "day") {
      const sun = ctx.createRadialGradient(
        state.w * 0.78, state.h * 0.08, 0,
        state.w * 0.78, state.h * 0.08, Math.max(state.w, state.h) * 0.85
      );
      sun.addColorStop(0, "rgba(255, 246, 196, 0.34)");
      sun.addColorStop(0.45, "rgba(255, 230, 150, 0.12)");
      sun.addColorStop(1, "rgba(255, 220, 140, 0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, state.w, state.h);
      ctx.fillStyle = "rgba(255, 236, 176, 0.06)";
      ctx.fillRect(0, 0, state.w, state.h);
    } else if (state.mapType === "moon") {
      const moon = ctx.createRadialGradient(
        state.w * 0.72, state.h * 0.12, 0,
        state.w * 0.72, state.h * 0.12, Math.max(state.w, state.h) * 0.8
      );
      moon.addColorStop(0, "rgba(198, 224, 255, 0.28)");
      moon.addColorStop(0.4, "rgba(108, 158, 236, 0.11)");
      moon.addColorStop(1, "rgba(46, 84, 168, 0)");
      ctx.fillStyle = moon;
      ctx.fillRect(0, 0, state.w, state.h);

      const tint = ctx.createLinearGradient(0, 0, 0, state.h);
      tint.addColorStop(0, "rgba(34, 74, 150, 0.26)");
      tint.addColorStop(0.55, "rgba(18, 46, 104, 0.18)");
      tint.addColorStop(1, "rgba(8, 22, 56, 0.3)");
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, state.w, state.h);
    }

    drawWater(t);
    if (state.mapType !== "day") {
      drawMist(t);
    }
    if (state.mapType === "night") {
      drawFireflies(t);
    }
    updateCharacter(dt, t);
    drawCharacter(t);

    requestAnimationFrame(render);
  }

  /* ---------- khởi tạo / resize ---------- */

  function resize() {
    state.w = window.innerWidth;
    state.h = window.innerHeight;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const maxPixels = 9000000;

    if (state.w * state.h * dpr * dpr > maxPixels) {
      dpr = Math.sqrt(maxPixels / (state.w * state.h));
    }
    dpr = clamp(dpr, 1, 2);
    state.dpr = dpr;

    canvas.width = Math.max(1, Math.round(state.w * dpr));
    canvas.height = Math.max(1, Math.round(state.h * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.pond = pondShape();
    buildTerrain();
    state.fireflies = createFireflies();
    state.mist = createMist();
    if (!state.glow) state.glow = makeGlow();
    if (!state.mistSprite) state.mistSprite = makeMistSprite();

    if (!state.character) {
      state.character = createCharacter();
    } else {
      const c = state.character;
      c.x = clamp(c.x, state.w * 0.04, state.w * 0.96);
      c.y = clamp(c.y, state.h * 0.15, state.h * 0.94);
      c.tx = c.x;
      c.ty = c.y;
      c.moving = false;
      c.waitUntil = state.time + 1;
    }

    state.last = 0;
  }

  function scheduleResize() {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(resize, 160);
  }

  function init() {
    resize();
    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    document.addEventListener("visibilitychange", () => {
      state.last = 0;
    });

    requestAnimationFrame(render);
  }

  return {
    init,
    setPlaying(playing) {
      state.hideTraveler = Boolean(playing);
    },
    setMapType(type) {
      state.mapType = type;
    },
    isWaterAt(x, y) {
      return isWaterPoint(x, y);
    },
  };
})();
