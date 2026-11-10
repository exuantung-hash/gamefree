/* ============================================================
   DEEPWOOD — sinh tồn vô tận: máu, phi tiêu tự động, ngọc xanh
   ============================================================ */

const Game = (() => {
  "use strict";

  const canvas = document.getElementById("game-layer");
  const ctx = canvas ? canvas.getContext("2d") : null;
  if (!canvas || !ctx) return { start() {}, stop() {}, snapshot() { return null; } };

  const TAU = Math.PI * 2;
  const ENERGY_START = 8;
  const ENERGY_CAP = 128;
  const ENERGY_GROWTH = 1.5;
  const ENERGY_SEGMENTS = 8;
  const BASE_SPEED = 250;
  const BASE_COOLDOWN = 0.46;
  const DART_SPEED = 760;
  const DART_RANGE = 520;
  const BASE_DAMAGE = 1;
  const ZOMBIE_HP = 3;
  const ZOMBIE_HP_PER_WAVE = 0.5;
  const ZOMBIE_DAMAGE = 7;
  const WARRIOR_ZOMBIE_DAMAGE = 15;
  const HIT_INVULN = 0.55;
  const GEM_PICKUP = 30;
  const MAGNET_BASE = 64;
  const MAX_ZOMBIES = 64;
  const CELL = 260;
  const POISON_WAVE_START = 5;
  const POISON_WAVE_END = 100;
  const POISON_FIELD_LIFE = 12;
  const POISON_FIELD_RADIUS = 108;
  const POISON_TICK = 0.75;
  const POISON_DAMAGE = 3;
  const ARMOR_PER_HIT = 10;
  const ARMOR_MITIGATION = 0.7;
  const ARMOR_REGEN_TIME = 60;
  const WARRIOR_MELEE_RANGE = 120;
  const WARRIOR_MELEE_DAMAGE = 9;
  const ZOMBIE_ARCHER_DAMAGE = 20;
  const ZOMBIE_ARCHER_RANGE = 520;
  const ZOMBIE_ARCHER_MIN_RANGE = 180;
  const ZOMBIE_ARCHER_COOLDOWN = 1.6;
  const ZOMBIE_SPEAR_THROW_DAMAGE = 20;
  const ZOMBIE_SPEAR_STAB_DAMAGE = 15;
  const ZOMBIE_SPEAR_THROW_RANGE = 200;
  const ZOMBIE_SPEAR_STAB_RANGE = 60;
  const ZOMBIE_SPEAR_COOLDOWN = 1.8;
  const ZOMBIE_SHIELD_HP = 150;
  const ZOMBIE_SHIELD_FRONT_REDUCE = 0.7;
  const ZOMBIE_CRAWLER_HP = 120;
  const ZOMBIE_CRAWLER_SPEED_MULT = 1.5;
  const ZOMBIE_CRAWLER_LEAP_DAMAGE = 20;
  const ZOMBIE_CRAWLER_LEAP_COOLDOWN = 4;
  const ZOMBIE_CRAWLER_LEAP_RANGE = 260;
  const ZOMBIE_BERSERKER_HP = 500;
  const ZOMBIE_BERSERKER_HP_LOW = 0.3;
  const ZOMBIE_BERSERKER_SPEED_BOOST = 0.5;
  const ZOMBIE_BERSERKER_DAMAGE_BOOST = 0.4;
  const ZOMBIE_SUMMONER_HP = 400;
  const ZOMBIE_SUMMONER_SUMMON_INTERVAL = 12;
  const ZOMBIE_SUMMONER_SUMMON_COUNT = 3;
  const ZOMBIE_BURROWER_HP = 300;
  const ZOMBIE_BURROWER_BURROW_INTERVAL = 10;
  const ZOMBIE_BURROWER_BURROW_DAMAGE = 30;
  const ZOMBIE_BURROWER_WARN_TIME = 1.5;
  const ZOMBIE_HOWLER_HP = 600;
  const ZOMBIE_HOWLER_HOWL_INTERVAL = 15;
  const ZOMBIE_HOWLER_RADIUS = 300;
  const ZOMBIE_HOWLER_ZOMBIE_SPEED_BOOST = 0.25;
  const ZOMBIE_HOWLER_ZOMBIE_DAMAGE_BOOST = 0.2;
  const ZOMBIE_HOWLER_PLAYER_SLOW = 0.2;
  const ZOMBIE_HOWLER_PLAYER_SLOW_TIME = 3;
  const ZOMBIE_MUTANT_HP = 320;
  const ZOMBIE_MUTANT_REGEN = 0.02;
  const ZOMBIE_EXPLODER_HP = 180;
  const ZOMBIE_EXPLODER_RADIUS = 132;
  const ZOMBIE_EXPLODER_DAMAGE = 26;
  const BOSS_HP_BASE = 900;
  const BOSS_HP_PER_WAVE = 55;
  const BOSS_DAMAGE = 26;
  const BOSS_MONEY = 120;
  const TORNADO_INTERVAL = 5;
  const ENHANCED_SHIELD_DAMAGE_REDUCE = 0.3;
  const TORNADO_DAMAGE = 10;
  const TORNADO_RADIUS = 200;
  const MINE_INTERVAL = 10;
  const MINE_DAMAGE = 50;
  const MINE_RADIUS = 100;
  const MINE_GRACE_TIME = 1.5;
  const MINE_MAX_LEVELS = [10, 8.5, 7, 6, 5];
  const MINE_DAMAGE_LEVELS = [50, 65, 80, 95, 110];
  const PARALLEL_UNIVERSE_COOLDOWN = 180;
  const PARALLEL_UNIVERSE_DURATION = 10;
  const PARALLEL_UNIVERSE_DAMAGE_MULT = 5;
  const XRAY_DAMAGE_MULT = 3;
  const SHIELD_HP_THRESHOLD = 0.3;
  const FIRE_RATE_LEVELS = [1.5, 1.8, 2.1, 2.5, 3.0, 3.5, 4.0, 4.5, 4.8, 5.0];
  const DOCTOR_REGEN_INTERVAL = 5;
  const DOCTOR_REGEN_SAFE = 1;
  const DOCTOR_REGEN_HURT = 1;
  const HEALING_REGEN_INTERVAL = 5;
  const FIREBOMB_TTL = 5;
  const FIREBOMB_TICK = 0.5;
  const FIREBOMB_WARRIOR_DPS = 50;
  const FIREBOMB_LEVELS = [
    { cooldown: 10, count: 1, dps: 5, radius: 64 },
    { cooldown: 8.5, count: 2, dps: 7, radius: 79 },
    { cooldown: 7, count: 3, dps: 10, radius: 95 },
  ];
  const METEOR_LEVELS = [
    { cooldown: 11, count: 1, damage: 45, radius: 88, burnDps: 4, burnTime: 4 },
    { cooldown: 9.5, count: 1, damage: 60, radius: 98, burnDps: 6, burnTime: 4.5 },
    { cooldown: 8, count: 2, damage: 78, radius: 108, burnDps: 8, burnTime: 5 },
    { cooldown: 6.5, count: 3, damage: 96, radius: 118, burnDps: 10, burnTime: 5 },
  ];
  const SAW_DAMAGE = 8;
  const SAW_LEVELS = [
    { count: 1, speed: 3, radius: 60, size: 9.5 },
    { count: 2, speed: 3.8, radius: 64, size: 10 },
    { count: 3, speed: 4.7, radius: 68, size: 10.5 },
    { count: 4, speed: 5.8, radius: 72, size: 11 },
    { count: 5, speed: 8, radius: 76, size: 11.5 },
  ];

  const RARITY_TIERS = {
    common: { name: "Thường", color: "#ffffff", weight: 55 },
    rare: { name: "Hiếm", color: "#4a90d9", weight: 25 },
    epic: { name: "Sử thi", color: "#a64dff", weight: 15 },
    legendary: { name: "Huyền thoại", color: "#ffd700", weight: 5 },
  };

  const CRITICAL_LEVELS = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
  const BURN_LEVELS = [
    { dps: 3, duration: 3 },
    { dps: 4, duration: 3.5 },
    { dps: 5, duration: 4 },
    { dps: 7, duration: 4.5 },
    { dps: 10, duration: 5 },
  ];
  const FREEZE_LEVELS = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
  const FREEZE_DURATIONS = [2, 2.5, 3, 4, 5];
  const BOSS_HUNTER_LEVELS = [0.05, 0.1, 0.15, 0.18, 0.2];
  const PIERCE_LEVELS = [999];
  const LIGHTNING_LEVELS = [
    { interval: 10, count: 1, damage: 20, radius: 78, burnDps: 2, burnTime: 5 },
    { interval: 9, count: 1, damage: 22, radius: 82, burnDps: 3, burnTime: 5 },
    { interval: 8, count: 2, damage: 24, radius: 86, burnDps: 3, burnTime: 5 },
    { interval: 7, count: 2, damage: 26, radius: 90, burnDps: 4, burnTime: 5 },
    { interval: 6, count: 3, damage: 28, radius: 96, burnDps: 4, burnTime: 5 },
  ];
  const HEAL_LEVELS = [2, 3, 4, 6, 8];

  const SKILLS = [
    {
      id: "lifesteal",
      name: "Hút máu",
      tag: "Lifesteal",
      max: 5,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.2 4.2 6 7.2 6 10.4A6 6 0 0 1 6 13.4C6 10.2 8.8 7.2 12 3z"/><path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
      desc: (level) => `Cứ hạ gục 5 zombie, hồi ${level} máu.`,
    },
    {
      id: "health",
      name: "Sức khỏe",
      tag: "Vitality",
      max: 8,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.3-7-9.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 7 3.6C19 15.7 12 20 12 20z"/><path d="M12 9v5M9.5 11.5h5"/></svg>',
      desc: (level) => `Máu tối đa +10 (lên ${state.character.hp + level * 10}). Hồi ngay 10 máu.`,
    },
    {
      id: "magnet",
      name: "Nam châm",
      tag: "Gem Magnet",
      max: 6,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v8a7 7 0 0 0 14 0V4"/><path d="M5 9h4M15 9h4"/></svg>',
      desc: (level) => `Tăng tầm hút ngọc năng lượng lên ${MAGNET_BASE + level * 45}px.`,
    },
    {
      id: "agility",
      name: "Nhanh nhẹn",
      tag: "Agility",
      max: 10,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h10M3 12h13M3 17h8"/><path d="M14 10l5 2-5 2"/><path d="M17 4l3 3-3 3"/></svg>',
      desc: (level) => `Tăng ${level * 5}% tốc độ chạy.`,
    },
    {
      id: "wealth",
      name: "Giàu có",
      tag: "Wealth",
      max: 1,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>',
      desc: () => "Mỗi viên ngọc cho x5 năng lượng.",
    },
    {
      id: "triple",
      name: "Phi tiêu 3 hướng",
      tag: "Triple Dart",
      max: 1,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L18 6"/><path d="M8 20l10-10"/><path d="M14 20l6-6"/><path d="M14 4h6v6"/></svg>',
      desc: () => "Mỗi lần ném tỏa 3 phi tiêu ra phía trước.",
    },
    {
      id: "heavy",
      name: "Phi tiêu nặng",
      tag: "Heavy Dart",
      max: 5,
      rarity: "common",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h-6z"/><path d="M12 9v6"/><path d="M8 21h8"/></svg>',
      desc: () => "Tăng 2 sát thương cho mỗi phi tiêu.",
    },
    {
      id: "firebomb",
      name: "Bom xăng",
      tag: "Firebomb",
      max: 3,
      rarity: "rare",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v3.2c0 .8-.3 1.5-.9 2.1L7.4 10A6.6 6.6 0 0 0 12 21a6.6 6.6 0 0 0 4.6-11l-1.7-1.7a3 3 0 0 1-.9-2.1V3"/><path d="M12 12c1.5 1.8 2.5 3 2.5 4.2A2.5 2.5 0 0 1 12 18.7a2.5 2.5 0 0 1-2.5-2.5c0-1.2 1-2.4 2.5-4.2z"/></svg>',
      desc: (level) => {
        const cfg = FIREBOMB_LEVELS[Math.min(level, FIREBOMB_LEVELS.length) - 1];
        const extra = level >= 3 ? " Zombie chiến binh nhận 50 sát thương/giây và xuyên giáp." : "";
        return `Mỗi ${cfg.cooldown}s ném ${cfg.count} quả bom xăng, tạo vùng lửa gây ${cfg.dps} sát thương/giây trong ${FIREBOMB_TTL} giây.${extra}`;
      },
    },
    {
      id: "saw",
      name: "Lưỡi cưa",
      tag: "Saw",
      max: 5,
      rarity: "rare",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.4"/><path d="M12 2.5l1.7 3.3-3.4 0zM12 21.5l-1.7-3.3 3.4 0zM2.5 12l3.3-1.7 0 3.4zM21.5 12l-3.3 1.7 0-3.4zM5.3 5.3l3.6 1.2-2.4 2.4zM18.7 18.7l-3.6-1.2 2.4-2.4zM18.7 5.3l-1.2 3.6-2.4-2.4zM5.3 18.7l1.2-3.6 2.4 2.4z"/></svg>',
      desc: (level) => {
        const cfg = SAW_LEVELS[Math.min(level, SAW_LEVELS.length) - 1];
        const speed = level >= 5 ? "Tốc độ quay cực nhanh." : "Tốc độ quay tăng theo cấp.";
        return `Tạo ${cfg.count} lưỡi cưa quay quanh người, gây ${SAW_DAMAGE} sát thương và đẩy lùi zombie khi chạm. ${speed}`;
      },
    },
    {
      id: "critical",
      name: "Chí mạng",
      tag: "Critical",
      max: 6,
      rarity: "epic",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h-6z"/><path d="M12 9v6"/><circle cx="12" cy="12" r="3"/></svg>',
      desc: (level) => Math.round(CRITICAL_LEVELS[Math.min(level, CRITICAL_LEVELS.length) - 1] * 100) + "% cơ hội gây sát thương gấp đôi với mỗi phi tiêu.",
    },
    {
      id: "burn",
      name: "Thiêu đốt",
      tag: "Burn",
      max: 5,
      rarity: "epic",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M7 7l5 5M13 7l-5 5"/></svg>',
      desc: (level) => { const c = BURN_LEVELS[Math.min(level, BURN_LEVELS.length) - 1]; return "Phi tiêu gây cháy " + c.dps + " sát thương/giây trong " + c.duration + "s."; },
    },
    {
      id: "freeze",
      name: "Băng giá",
      tag: "Freeze",
      max: 5,
      rarity: "epic",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l-2 6h4l-2 6"/><path d="M5 16h14M12 2v20"/></svg>',
      desc: (level) => Math.round(FREEZE_LEVELS[Math.min(level, FREEZE_LEVELS.length) - 1] * 100) + "% cơ hội đóng băng zombie trong " + FREEZE_DURATIONS[Math.min(level, FREEZE_DURATIONS.length) - 1] + "s.",
    },
    {
      id: "bossHunter",
      name: "Thợ săn boss",
      tag: "Boss Hunter",
      max: 5,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7l9 9 9-9"/></svg>',
      desc: (level) => Math.round(BOSS_HUNTER_LEVELS[Math.min(level, BOSS_HUNTER_LEVELS.length) - 1] * 100) + "% sát thương đối với boss.",
    },
    {
      id: "pierce",
      name: "Xuyên thấu",
      tag: "Pierce",
      max: 1,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
      desc: () => "Phi tiêu xuyên qua mọi zombie không giới hạn.",
    },
    {
      id: "lightning",
      name: "Tia sét",
      tag: "Lightning",
      max: 5,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 7 10-14"/></svg>',
      desc: (level) => { const c = LIGHTNING_LEVELS[Math.min(level, LIGHTNING_LEVELS.length) - 1]; return "Mỗi " + c.interval + "s rơi " + c.count + " tia sét gây " + c.damage + " sát thương và cháy " + c.burnDps + "/giây trong " + c.burnTime + "s."; },
    },
    {
      id: "healing",
      name: "Hồi phục",
      tag: "Healing",
      max: 5,
      rarity: "rare",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.3-7-9.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 7 3.6C19 15.7 12 20 12 20z"/><path d="M12 9v5M9.5 11.5h5"/></svg>',
      desc: (level) => {
        const heal = HEAL_LEVELS[Math.min(level, HEAL_LEVELS.length) - 1];
        return `Hồi ${heal} máu mỗi ${HEALING_REGEN_INTERVAL} giây, cộng dồn với hồi máu của nhân vật.`;
      },
    },
    {
      id: "meteor",
      name: "Thiên thạch",
      tag: "Meteor",
      max: 4,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l-3.4 9.2L5 15l5 1.4L14 21l2.2-6L21 12l-5-2z"/><path d="M4 4l2 2M18 4l-2 2"/></svg>',
      desc: (level) => {
        const cfg = METEOR_LEVELS[Math.min(level, METEOR_LEVELS.length) - 1];
        return `Mỗi ${cfg.cooldown}s gọi ${cfg.count} thiên thạch rơi vào zombie, gây ${cfg.damage} sát thương diện rộng và cháy ${cfg.burnDps}/giây trong ${cfg.burnTime}s.`;
      },
    },
    {
      id: "enhancedShield",
      name: "Khiên tăng cường",
      tag: "Enhanced Shield",
      max: 1,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="M8 8l4 4 8-8"/></svg>',
      desc: function() { return "Khi dưới 50% máu, tạo khiên giảm 30% tất cả các loại sát thương."; },
    },
    {
      id: "energyShield",
      name: "Lá chắn năng lượng",
      tag: "Energy Shield",
      max: 1,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>',
      desc: () => "Khi dưới 50% máu, tạo khiên giảm 20% sát thương nhận được.",
    },
    {
      id: "chainLightning",
      name: "Điện lan truyền",
      tag: "Chain Lightning",
      max: 1,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 7 10-14"/><path d="M5 12l7 7M19 12l-7 7"/></svg>',
      desc: () => "15% cơ hội mỗi đòn phóng điện sang 3 zombie gần nhất.",
    },
    {
      id: "mine",
      name: "Đặt mìn",
      tag: "Mine",
      max: 5,
      rarity: "legendary",
      evolve: {
        name: "Mìn siêu cấp",
        desc: "Đặt mìn mỗi 5s, gây 30 sát thương.",
      },
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><path d="M9 9l3 3M15 15l-3-3"/></svg>',
      desc: function(level) {
        const interval = MINE_MAX_LEVELS[Math.min(level, MINE_MAX_LEVELS.length) - 1];
        const dmg = MINE_DAMAGE_LEVELS[Math.min(level, MINE_DAMAGE_LEVELS.length) - 1];
        return "Mỗi " + interval + "s đặt 1 quả mìn dưới chân, gây " + dmg + " sát thương diện rộng khi zombie chạm.";
      },
    },
    {
      id: "tornado",
      name: "Lốc xoáy",
      tag: "Tornado",
      max: 1,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M12 22l-4-4M12 22l4-4"/></svg>',
      desc: () => "Mỗi 5 giây tạo lốc xoáy đẩy lùi zombie xung quanh và gây 10 sát thương.",
    },
    {
      id: "parallelUniverse",
      name: "Vũ trụ song song",
      tag: "Parallel Universe",
      max: 1,
      rarity: "legendary",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="M5 5l14 14M19 5l-14 14"/></svg>',
      desc: () => "Khi dưới 30% máu, tạo Vũ trụ song song (màu tím): gây thêm x5 sát thương, hồi đầy máu ngay lập tức, kéo dài 10 giây. Hồi chiêu 3 phút.",
    },
    {
      id: "xRay",
      name: "X-quang",
      tag: "X-Ray",
      max: 5,
      rarity: "rare",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l4 16M2 12h16M8 8l8 8M16 8l-8 8"/></svg>',
      desc: (level) => "Tia laser xuyên qua mọi zombie, gây x3 sát thương zombie chiến binh.",
    },
    {
      id: "fireRate",
      name: "Tốc độ phóng",
      tag: "Fire Rate",
      max: 10,
      rarity: "rare",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/><path d="M8 8l4 4 8-8"/></svg>',
      desc: (level) => {
        const mult = FIRE_RATE_LEVELS[Math.min(level, FIRE_RATE_LEVELS.length) - 1];
        return "Tăng tốc độ phóng phi tiêu x" + mult + ".";
      },
    },
  ];

  const els = {
    hud: document.getElementById("hud"),
    hpCount: document.getElementById("hp-count"),
    hpMax: document.getElementById("hp-max"),
    hpFill: document.getElementById("hp-fill"),
    healthTrack: document.getElementById("health-track"),
    armorCount: document.getElementById("armor-count"),
    armorMax: document.getElementById("armor-max"),
    armorFill: document.getElementById("armor-fill"),
    armorTrack: document.getElementById("armor-track"),
    armorRow: document.querySelector(".armor-row"),
    waveCount: document.getElementById("wave-count"),
    waveTotal: document.getElementById("wave-total"),
    zombiesLeft: document.getElementById("zombies-left"),
    moneyCount: document.getElementById("money-count"),
    energy: document.getElementById("energy"),
    energyLabel: document.getElementById("energy-label"),
    energyCount: document.getElementById("energy-count"),
    energyMax: document.getElementById("energy-max"),
    energyTrack: document.getElementById("energy-track"),
    kills: document.getElementById("kills-count"),
    timer: document.getElementById("hud-timer"),
    pauseBtn: document.getElementById("pause-btn"),
    pauseLayer: document.getElementById("pause-layer"),
    resumeBtn: document.getElementById("resume-btn"),
    quitBtn: document.getElementById("quit-btn"),
    skillLayer: document.getElementById("skill-layer"),
    skillCards: document.getElementById("skill-cards"),
    skillReroll: document.getElementById("skill-reroll"),
    toast: document.getElementById("skill-toast"),
    gameoverLayer: document.getElementById("gameover-layer"),
    gameoverKills: document.getElementById("gameover-kills"),
    gameoverTime: document.getElementById("gameover-time"),
    gameoverSkills: document.getElementById("gameover-skills"),
    gameoverReplay: document.getElementById("gameover-replay"),
    gameoverMenu: document.getElementById("gameover-menu"),
    victoryLayer: document.getElementById("victory-layer"),
    victoryKills: document.getElementById("victory-kills"),
    victoryTime: document.getElementById("victory-time"),
    victorySkills: document.getElementById("victory-skills"),
    victoryReplay: document.getElementById("victory-replay"),
    victoryMenu: document.getElementById("victory-menu"),
  };

  const DEFAULT_CHARACTER = "thrower";

  const MODES = {
    easy: { id: "easy", name: "Dễ", tag: "Easy", waves: 30, density: 0.82, special: 0.7 },
    normal: { id: "normal", name: "Bình thường", tag: "Normal", waves: 70, density: 1, special: 1 },
    hard: { id: "hard", name: "Khó", tag: "Hard", waves: 100, density: 1.3, special: 1.35 },
    infinite: { id: "infinite", name: "Vô tận", tag: "Infinite", waves: Infinity, density: 1.05, special: 1.15 },
    custom: { id: "custom", name: "Tùy chỉnh", tag: "Custom", waves: 50, density: 1, special: 1 },
  };

  const CHARACTERS = {
    doctor: {
      id: "doctor",
      name: "Bác sĩ",
      tag: "Doctor",
      hp: 100,
      armor: 0,
      speed: 0.95,
      skin: "doctor",
      price: 5000,
      desc: "Máu 100 · Không giáp · Tốc độ -5%. Hồi 1 máu mỗi 5 giây, kể cả khi đang nhận sát thương.",
    },
    warrior: {
      id: "warrior",
      name: "Chiến binh",
      tag: "Warrior",
      hp: 120,
      armor: 100,
      speed: 0.9,
      skin: "warrior",
      price: 10000,
      desc: "Máu 120 · Giáp 100 · Tốc độ -10%. Khi còn giáp, giảm 70% sát thương và tiêu hao 10 giáp mỗi đòn. Giáp cạn sẽ hồi đầy trong 60 giây. Ở gần zombie, tự vung kiếm gây 9 sát thương.",
    },
    thrower: {
      id: "thrower",
      name: "Người ném phi tiêu",
      tag: "Dart Thrower",
      hp: 100,
      armor: 0,
      speed: 1,
      skin: "thrower",
      price: 0,
      desc: "Máu 100 · Không giáp · Tốc độ chuẩn. Phi tiêu tự động nhắm vào zombie gần nhất.",
    },
    rebirth: {
      id: "rebirth",
      name: "Tái sinh",
      tag: "Rebirth",
      hp: 90,
      armor: 0,
      speed: 1.1,
      skin: "rebirth",
      revives: 1,
      price: 5000,
      desc: "Máu 90 · Không giáp · Tốc độ +10%. Một lần mỗi trận: hồi sinh tại chỗ với 50% máu và 3 giây bất tử.",
    },
  };

  const DEBUG = new URLSearchParams(window.location.search).has("debug");

  const state = {
    active: false,
    paused: false,
    choosing: false,
    over: false,
    victory: false,
    w: 0,
    h: 0,
    dpr: 1,
    last: 0,
    raf: 0,
    elapsed: 0,
    timerText: "",
    keys: new Set(),
    pointer: { active: false, x: 0, y: 0 },
    player: { x: 0, y: 0, vx: 0, vy: 0, face: Math.PI / 2, walk: 0 },
    camera: { x: 0, y: 0 },
    characterId: DEFAULT_CHARACTER,
    character: CHARACTERS[DEFAULT_CHARACTER],
    hp: CHARACTERS[DEFAULT_CHARACTER].hp,
    maxHp: CHARACTERS[DEFAULT_CHARACTER].hp,
    armor: CHARACTERS[DEFAULT_CHARACTER].armor,
    maxArmor: CHARACTERS[DEFAULT_CHARACTER].armor,
    armorDisplay: -1,
    invuln: 0,
    hurtFlash: 0,
    shake: 0,
    zombies: [],
    darts: [],
    gems: [],
    poisonZones: [],
    fireZones: [],
    bombs: [],
    slashes: [],
    zombieProjectiles: [],
    particles: [],
    texts: [],
    blasts: [],
    skills: {},
    energy: 0,
    energyMax: ENERGY_START,
    modeId: "normal",
    mode: MODES.normal,
    customWaves: 50,
    wave: 1,
    wavesTotal: MODES.normal.waves,
    waveState: "fight",
    waveTimer: 0,
    waveQuota: 0,
    waveSpawned: 0,
    waveSpawnTimer: 0,
    kills: 0,
    killsSinceHeal: 0,
    totalSpawned: 0,
    bossCount: 0,
    levelUps: 0,
    money: 0,
    spawnTimer: 0,
    shootCooldown: 0,
    autoAttack: true,
    pointerShoot: false,
    revives: 0,
    upgrades: { hp: 0, speed: 0 },
    speedMult: 1,
    doctorTimer: 0,
    healingTimer: 0,
    damageTimer: 999,
    firebombTimer: 0,
    meteorTimer: 0,
    mineTimer: 0,
    parallelUniverseTimer: 0,
    parallelUniverseActive: false,
    xRayLaserTimer: 0,
    fireRateTimer: 0,
    evolved: {},
    tornadoTimer: 0,
    meteors: [],
    mines: [],
    sawAngle: 0,
    playerSlowTimer: 0,
    playerSlowMult: 1,
    lightningTimer: 0,
    lightningStrikes: [],
    lightningFlash: 0,
    mapType: "night",
    choiceDelay: -1,
    cards: [],
    onQuit: null,
  };

  SKILLS.forEach((skill) => {
    state.skills[skill.id] = 0;
  });

  let glowGold = null;
  let glowGreen = null;
  let glowRed = null;
  let groundPattern = null;
  let propSprites = null;
  let groundPatternNight = null;
  let groundPatternDay = null;
  let propSpritesNight = null;
  let propSpritesDay = null;
  let toastTimer = 0;
  let zombieId = 0;
  const propCache = new Map();

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function lerpAngle(a, b, t) {
    let d = ((b - a + Math.PI) % TAU) - Math.PI;
    if (d < -Math.PI) d += TAU;
    return a + d * t;
  }

  function hash2(x, y, salt) {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt || 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function makeGlow(inner, mid) {
    const size = 96;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const g = sprite.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, mid);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return sprite;
  }

  function circleIn(g, x, y, r) {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }

  function ellIn(g, x, y, rx, ry, rot) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
    g.fill();
  }

  function makeGroundPattern(day) {
    const size = 640;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const g = sprite.getContext("2d");

    if (day) {
      const base = g.createLinearGradient(0, 0, size, size);
      base.addColorStop(0, "#4a7440");
      base.addColorStop(0.5, "#3f6838");
      base.addColorStop(1, "#456f3d");
      g.fillStyle = base;
    } else {
      g.fillStyle = "#08150e";
    }
    g.fillRect(0, 0, size, size);

    const wrap = (fn) => {
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          fn(dx * size, dy * size);
        }
      }
    };

    for (let i = 0; i < 8; i += 1) {
      const x = rand(0, size);
      const y = rand(0, size);
      const radius = rand(180, 320);
      const hue = day ? rand(88, 116) : rand(126, 154);
      const sat = day ? rand(30, 44) : 26;
      const light = day ? rand(26, 38) : rand(9, 13);
      wrap((ox, oy) => {
        const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, radius);
        grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${day ? 0.24 : 0.16})`);
        grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x + ox, y + oy, radius, 0, TAU);
        g.fill();
      });
    }

    for (let i = 0; i < 34; i += 1) {
      const x = rand(0, size);
      const y = rand(0, size);
      const radius = rand(45, 150);
      const hue = day ? rand(84, 112) : rand(128, 158);
      const sat = day ? rand(32, 46) : 28;
      const light = day ? rand(22, 32) : rand(8, 14);
      wrap((ox, oy) => {
        const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, radius);
        grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${day ? rand(0.10, 0.20) : rand(0.08, 0.2)})`);
        grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
        g.fillStyle = grad;
        ellIn(g, x + ox, y + oy, radius, radius * rand(0.55, 0.9), rand(0, TAU));
      });
    }

    for (let i = 0; i < 520; i += 1) {
      const x = rand(0, size);
      const y = rand(0, size);
      const blades = 1 + Math.floor(Math.random() * 3);
      const alpha = day ? rand(0.18, 0.42) : rand(0.12, 0.34);
      const hue = day ? rand(84, 118) : rand(120, 150);
      const sat = day ? rand(36, 52) : 30;
      const light = day ? rand(26, 42) : rand(15, 25);
      wrap((ox, oy) => {
        for (let b = 0; b < blades; b += 1) {
          const bx = x + ox + rand(-4, 4);
          const by = y + oy + rand(-1, 1);
          g.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(bx, by);
          g.lineTo(bx + rand(-2.2, 2.2), by - rand(2, 5.5));
          g.stroke();
        }
      });
    }

    for (let i = 0; i < 130; i += 1) {
      const x = rand(0, size);
      const y = rand(0, size);
      const roll = Math.random();
      wrap((ox, oy) => {
        if (roll > 0.6) {
          g.fillStyle = day
            ? `rgba(255, 246, 198, ${rand(0.35, 0.65)})`
            : `rgba(222, 218, 176, ${rand(0.25, 0.5)})`;
          circleIn(g, x + ox, y + oy, rand(0.7, 1.4));
          if (day) {
            g.fillStyle = `rgba(255, 190, 96, ${rand(0.3, 0.5)})`;
            circleIn(g, x + ox, y + oy, rand(0.5, 0.9));
          }
        } else if (roll > 0.24) {
          g.fillStyle = day
            ? `rgba(116, 126, 92, ${rand(0.28, 0.5)})`
            : `rgba(70, 80, 66, ${rand(0.3, 0.55)})`;
          ellIn(g, x + ox, y + oy, rand(1.4, 3.6), rand(1.2, 2.6), rand(0, TAU));
        } else {
          g.fillStyle = day ? "rgba(152, 106, 62, 0.55)" : "rgba(146, 74, 56, 0.5)";
          ellIn(g, x + ox, y + oy, 2.3, 1.5, rand(0, TAU));
        }
      });
    }

    return ctx.createPattern(sprite, "repeat");
  }

  function makeTreeSprite(variant, day) {
    const w = 190;
    const h = 200;
    const ss = 2;
    const sprite = document.createElement("canvas");
    sprite.width = w * ss;
    sprite.height = h * ss;
    const g = sprite.getContext("2d");
    g.scale(ss, ss);

    const cx = w / 2;
    const baseY = 186;
    const dark = day
      ? (variant ? "#245a33" : "#1f502c")
      : (variant ? "#0b2318" : "#082015");
    const mid = day
      ? (variant ? "#4d8a49" : "#427c41")
      : (variant ? "#17452c" : "#123a24");
    const rim = day
      ? "rgba(206, 238, 150, 0.45)"
      : (variant ? "rgba(112, 176, 118, 0.34)" : "rgba(94, 158, 112, 0.28)");

    g.save();
    g.translate(cx + 7, baseY - 5);
    g.scale(1, 0.46);
    const shadow = g.createRadialGradient(0, 0, 8, 0, 0, 76);
    shadow.addColorStop(0, day ? "rgba(18, 38, 16, 0.42)" : "rgba(1, 5, 3, 0.6)");
    shadow.addColorStop(0.6, day ? "rgba(18, 38, 16, 0.22)" : "rgba(1, 5, 3, 0.34)");
    shadow.addColorStop(1, "rgba(1, 5, 3, 0)");
    g.fillStyle = shadow;
    g.beginPath();
    g.arc(0, 0, 76, 0, TAU);
    g.fill();
    g.restore();

    g.fillStyle = day ? "#4a3420" : "#23180e";
    g.beginPath();
    g.moveTo(cx - 7, baseY);
    g.quadraticCurveTo(cx - 3, baseY - 38, cx - 7, baseY - 76);
    g.lineTo(cx + 7, baseY - 76);
    g.quadraticCurveTo(cx + 4, baseY - 38, cx + 8, baseY);
    g.closePath();
    g.fill();

    const blobs = [
      [0, -96, 58],
      [-46, -78, 42],
      [45, -82, 40],
      [-24, -126, 38],
      [26, -122, 36],
      [-52, -46, 30],
      [50, -48, 28],
      [0, -58, 48],
    ];

    const canopy = new Path2D();
    blobs.forEach(([ox, oy, r]) => {
      canopy.moveTo(cx + ox + r, baseY + oy);
      canopy.arc(cx + ox, baseY + oy, r, 0, TAU);
    });

    g.fillStyle = dark;
    g.fill(canopy);

    const grad = g.createRadialGradient(cx - 30, baseY - 130, 8, cx, baseY - 90, 115);
    grad.addColorStop(0, mid);
    grad.addColorStop(0.6, dark);
    grad.addColorStop(1, dark);
    g.fillStyle = grad;
    g.fill(canopy);

    g.save();
    g.clip(canopy);
    g.strokeStyle = rim;
    g.lineWidth = 1.8;
    g.beginPath();
    g.arc(cx - 4, baseY - 98, 74, Math.PI * 1.04, Math.PI * 1.78);
    g.stroke();

    for (let i = 0; i < 26; i += 1) {
      const angle = rand(Math.PI * 0.9, Math.PI * 2.15);
      const radius = Math.sqrt(Math.random()) * 66;
      g.fillStyle = day
        ? `rgba(214, 244, 158, ${rand(0.08, 0.22)})`
        : `rgba(126, 182, 126, ${rand(0.04, 0.13)})`;
      circleIn(g, cx + Math.cos(angle) * radius, baseY - 96 + Math.sin(angle) * radius, rand(0.8, 2.2));
    }
    g.restore();

    return { sprite, w, h, ax: cx, ay: baseY };
  }

  function makeBushSprite(day) {
    const w = 96;
    const h = 80;
    const ss = 2;
    const sprite = document.createElement("canvas");
    sprite.width = w * ss;
    sprite.height = h * ss;
    const g = sprite.getContext("2d");
    g.scale(ss, ss);
    const cx = w / 2;
    const baseY = 66;

    g.fillStyle = day ? "rgba(18, 38, 16, 0.28)" : "rgba(1, 5, 3, 0.35)";
    ellIn(g, cx + 3, baseY - 2, 34, 12, 0);

    const blobs = [
      [-18, -12, 20],
      [16, -14, 21],
      [0, -24, 23],
      [-24, -26, 14],
      [24, -28, 14],
    ];
    blobs.forEach(([ox, oy, r], i) => {
      g.fillStyle = day
        ? (i % 2 ? "#3f7a40" : "#356c39")
        : (i % 2 ? "#153523" : "#102b1c");
      circleIn(g, cx + ox, baseY + oy, r);
    });
    blobs.slice(0, 3).forEach(([ox, oy, r]) => {
      g.fillStyle = day ? "rgba(164, 214, 104, 0.48)" : "rgba(58, 108, 70, 0.42)";
      circleIn(g, cx + ox - 3, baseY + oy - 4, r * 0.62);
    });

    return { sprite, w, h, ax: cx, ay: baseY };
  }

  function makeRockSprite(day) {
    const w = 70;
    const h = 56;
    const ss = 2;
    const sprite = document.createElement("canvas");
    sprite.width = w * ss;
    sprite.height = h * ss;
    const g = sprite.getContext("2d");
    g.scale(ss, ss);
    const cx = w / 2;
    const baseY = 46;

    g.fillStyle = day ? "rgba(18, 38, 16, 0.26)" : "rgba(1, 5, 3, 0.32)";
    ellIn(g, cx + 3, baseY, 25, 8, 0);

    const grad = g.createLinearGradient(0, baseY - 26, 0, baseY + 4);
    if (day) {
      grad.addColorStop(0, "#9aa48d");
      grad.addColorStop(0.55, "#74806c");
      grad.addColorStop(1, "#505a4c");
    } else {
      grad.addColorStop(0, "#45524a");
      grad.addColorStop(0.55, "#2c3832");
      grad.addColorStop(1, "#1b2620");
    }

    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(cx - 25, baseY);
    g.lineTo(cx - 19, baseY - 18);
    g.lineTo(cx - 7, baseY - 27);
    g.lineTo(cx + 12, baseY - 24);
    g.lineTo(cx + 24, baseY - 11);
    g.lineTo(cx + 25, baseY);
    g.closePath();
    g.fill();

    g.strokeStyle = day ? "rgba(222, 236, 200, 0.42)" : "rgba(148, 170, 150, 0.24)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx - 15, baseY - 17);
    g.lineTo(cx - 5, baseY - 22);
    g.lineTo(cx + 7, baseY - 20);
    g.stroke();

    return { sprite, w, h, ax: cx, ay: baseY };
  }

  function makeFlowerSprite(day) {
    const w = 70;
    const h = 50;
    const ss = 2;
    const sprite = document.createElement("canvas");
    sprite.width = w * ss;
    sprite.height = h * ss;
    const g = sprite.getContext("2d");
    g.scale(ss, ss);
    const cx = w / 2;
    const baseY = 42;

    for (let i = 0; i < 7; i += 1) {
      const x = cx + rand(-22, 22);
      const y = baseY + rand(-8, 2);
      g.strokeStyle = day ? "rgba(96, 148, 82, 0.78)" : "rgba(70, 104, 64, 0.65)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + rand(-2, 2), y - rand(6, 14));
      g.stroke();
    }

    for (let i = 0; i < 5; i += 1) {
      const x = cx + rand(-20, 20);
      const y = baseY - rand(6, 15);
      if (day) {
        g.fillStyle = i % 3 === 0
          ? "rgba(255, 246, 170, 0.92)"
          : i % 3 === 1
            ? "rgba(255, 184, 110, 0.9)"
            : "rgba(238, 150, 176, 0.88)";
      } else {
        g.fillStyle = i % 3 === 0 ? "rgba(206, 214, 164, 0.75)" : "rgba(168, 186, 126, 0.7)";
      }
      circleIn(g, x, y, day ? rand(1.6, 2.6) : rand(1.2, 2));
    }

    return { sprite, w, h, ax: cx, ay: baseY };
  }

  function ensureWorldSprites() {
    if (!glowGold) glowGold = makeGlow("rgba(255, 248, 205, 0.95)", "rgba(246, 218, 128, 0.5)");
    if (!glowGreen) glowGreen = makeGlow("rgba(225, 255, 235, 0.92)", "rgba(80, 220, 130, 0.45)");
    if (!glowRed) glowRed = makeGlow("rgba(255, 242, 226, 0.95)", "rgba(232, 72, 58, 0.52)");

    if (!groundPatternNight) groundPatternNight = makeGroundPattern(false);
    if (!groundPatternDay) groundPatternDay = makeGroundPattern(true);

    if (!propSpritesNight) {
      propSpritesNight = {
        trees: [makeTreeSprite(0, false), makeTreeSprite(1, false)],
        bush: makeBushSprite(false),
        rock: makeRockSprite(false),
        flower: makeFlowerSprite(false),
      };
    }

    if (!propSpritesDay) {
      propSpritesDay = {
        trees: [makeTreeSprite(0, true), makeTreeSprite(1, true)],
        bush: makeBushSprite(true),
        rock: makeRockSprite(true),
        flower: makeFlowerSprite(true),
      };
    }

    const day = state.mapType === "day";
    groundPattern = day ? groundPatternDay : groundPatternNight;
    propSprites = day ? propSpritesDay : propSpritesNight;
  }

  function getCellProps(cx, cy) {
    const key = `${cx}|${cy}`;
    const cached = propCache.get(key);
    if (cached) return cached;

    const list = [];
    const roll = hash2(cx, cy, 11);
    const count = roll < 0.45 ? 0 : roll < 0.85 ? 1 : 2;

    for (let i = 0; i < count; i += 1) {
      const salt = 20 + i * 9;
      const pick = hash2(cx, cy, salt);
      const px = (cx + 0.12 + hash2(cx, cy, salt + 1) * 0.76) * CELL;
      const py = (cy + 0.14 + hash2(cx, cy, salt + 2) * 0.72) * CELL;
      const scale = 0.78 + hash2(cx, cy, salt + 3) * 0.58;

      let type = "flower";
      if (pick < 0.18) type = "tree";
      else if (pick < 0.42) type = "bush";
      else if (pick < 0.62) type = "rock";

      list.push({
        type,
        x: px,
        y: py,
        scale,
        variant: hash2(cx, cy, salt + 4) > 0.5 ? 1 : 0,
      });
    }

    if (propCache.size > 900) propCache.clear();
    propCache.set(key, list);
    return list;
  }

  const MONEY_KEY = "deepwood.money.v1";

  function loadWallet() {
    try {
      const value = Number(window.localStorage.getItem(MONEY_KEY));
      if (Number.isFinite(value) && value > 0) return Math.floor(value);
    } catch (error) {
      /* localStorage có thể bị chặn — bỏ qua */
    }
    return 0;
  }

  function saveWallet() {
    try {
      window.localStorage.setItem(MONEY_KEY, String(Math.max(0, Math.floor(state.money))));
    } catch (error) {
      /* bỏ qua */
    }
  }

  function buildEnergyBar() {
    if (!els.energyTrack) return;
    els.energyTrack.innerHTML = "";
    for (let i = 0; i < ENERGY_SEGMENTS; i += 1) {
      const segment = document.createElement("span");
      segment.className = "energy__seg";
      segment.setAttribute("aria-hidden", "true");
      els.energyTrack.appendChild(segment);
    }
    if (els.energyMax) els.energyMax.textContent = String(state.energyMax);
  }

  function updateEnergyHud() {
    if (!els.energyTrack) return;
    const max = Math.max(1, state.energyMax);
    const full = state.energy >= max;
    const ratio = clamp(state.energy / max, 0, 1);
    const cells = ratio * ENERGY_SEGMENTS;

    if (els.energyCount) els.energyCount.textContent = String(state.energy);
    if (els.energyMax) els.energyMax.textContent = String(max);
    els.energyTrack.setAttribute("aria-valuenow", String(state.energy));
    els.energyTrack.setAttribute("aria-valuemax", String(max));

    Array.from(els.energyTrack.children).forEach((segment, index) => {
      const fill = clamp(cells - index, 0, 1);
      segment.classList.toggle("is-filled", fill >= 0.999);
      segment.classList.toggle("is-partial", fill > 0.001 && fill < 0.999);
      segment.style.setProperty("--seg-fill", String(fill));
    });

    if (els.energy) els.energy.classList.toggle("is-full", full);
    if (els.energyLabel) els.energyLabel.textContent = full ? "Năng lượng đầy" : "Năng lượng";
  }

  function updateArmorHud() {
    if (els.armorRow) els.armorRow.hidden = state.maxArmor <= 0;
    const shown = Math.max(0, Math.ceil(state.armor));
    state.armorDisplay = shown;
    if (els.armorCount) els.armorCount.textContent = String(shown);
    if (els.armorMax) els.armorMax.textContent = String(state.maxArmor);
    const ratio = state.maxArmor > 0 ? clamp(state.armor / state.maxArmor, 0, 1) : 0;
    if (els.armorFill) els.armorFill.style.width = `${ratio * 100}%`;
    if (els.armorTrack) {
      els.armorTrack.setAttribute("aria-valuenow", String(shown));
      els.armorTrack.setAttribute("aria-valuemax", String(state.maxArmor));
    }
  }

  function countZombiesRemaining() {
    if (state.waveState === "clear") return 0;
    const alive = state.zombies.reduce((total, zombie) => total + (zombie.dead ? 0 : 1), 0);
    const pending = Math.max(0, state.waveQuota - state.waveSpawned);
    return pending + alive;
  }

  function updateRemainingHud() {
    if (!els.zombiesLeft) return;
    const remaining = countZombiesRemaining();
    if (remaining === state.remainingDisplay) return;
    state.remainingDisplay = remaining;
    els.zombiesLeft.textContent = String(remaining);
  }

  function updateMoneyHud() {
    const shown = Math.max(0, Math.floor(state.money));
    if (els.moneyCount) els.moneyCount.textContent = String(shown);

    const menuMoney = document.getElementById("menu-money-count");
    if (menuMoney) menuMoney.textContent = String(shown);

    saveWallet();
    document.dispatchEvent(new CustomEvent("deepwood:money", { detail: shown }));
  }

  function addMoney(amount) {
    state.money = Math.floor(state.money + amount);
    updateMoneyHud();
  }

  function updateWaveHud() {
    if (els.waveCount) els.waveCount.textContent = String(state.wave);
    if (els.waveTotal) els.waveTotal.textContent = state.wavesTotal === Infinity ? "∞" : String(state.wavesTotal);
    updateRemainingHud();
  }

  function updateHealthHud() {
    if (els.hpCount) els.hpCount.textContent = String(Math.max(0, Math.ceil(state.hp)));
    if (els.hpMax) els.hpMax.textContent = String(state.maxHp);
    const ratio = state.maxHp > 0 ? clamp(state.hp / state.maxHp, 0, 1) : 0;
    if (els.hpFill) els.hpFill.style.width = `${ratio * 100}%`;
    if (els.healthTrack) {
      els.healthTrack.setAttribute("aria-valuenow", String(Math.max(0, Math.ceil(state.hp))));
      els.healthTrack.setAttribute("aria-valuemax", String(state.maxHp));
      els.healthTrack.classList.toggle("is-low", ratio <= 0.3);
    }
  }

  function updateStatsHud() {
    if (els.kills) els.kills.textContent = String(state.kills);
  }

  function floatText(x, y, text, tone) {
    state.texts.push({ x, y, text, tone, life: 0, ttl: 0.95 });
  }

  function burst(x, y, count, tone, minSpeed = 40, maxSpeed = 150) {
    for (let i = 0; i < count; i += 1) {
      const angle = rand(0, TAU);
      const speed = rand(minSpeed, maxSpeed);
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 18,
        life: 0,
        ttl: rand(0.4, 0.95),
        size: rand(1.2, 3),
        tone,
      });
    }
  }

  function showToast(message) {
    if (!els.toast) return;
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 2400);
  }

  function renderSkillCards() {
    if (!els.skillCards) return;
    els.skillCards.innerHTML = state.cards
      .map((skill, index) => {
        const current = state.skills[skill.id];
        const next = current + 1;
        const levelLabel = current === 0 ? "Kỹ năng mới" : `Nâng cấp · Cấp ${next}`;
        const tier = RARITY_TIERS[skill.rarity];
        return `
          <button class="skill-card skill-card--${skill.rarity}" type="button" data-skill="${skill.id}" aria-label="${skill.name} — ${levelLabel} — ${tier.name}">
            <span class="skill-card__key" aria-hidden="true">${index + 1}</span>
            <span class="skill-card__rarity" aria-hidden="true">${tier.name}</span>
            <span class="skill-card__icon" aria-hidden="true">${skill.icon}</span>
            <span class="skill-card__tag">${skill.tag}</span>
            <span class="skill-card__name">${skill.name}</span>
            <span class="skill-card__desc">${skill.desc(next)}</span>
            <span class="skill-card__level">${levelLabel}</span>
          </button>
        `;
      })
      .join("");
  }

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
  }

  function resetPlayer() {
    const p = state.player;
    p.x = 0;
    p.y = 0;
    p.vx = 0;
    p.vy = 0;
    p.face = Math.PI / 2;
    p.walk = 0;
    state.camera.x = p.x - state.w / 2;
    state.camera.y = p.y - state.h / 2;
  }

  function rollZombieType() {
    if (state.wave >= POISON_WAVE_START && state.wave <= POISON_WAVE_END) {
      const chance = Math.min(
        0.3,
        (0.06 + (state.wave - POISON_WAVE_START) * 0.003) * state.mode.special
      );
      if (Math.random() < chance) return "poison";
    }
    if (state.wave >= 12) {
      const chance = Math.min(0.16, (0.03 + (state.wave - 12) * 0.0015) * state.mode.special);
      if (Math.random() < chance) return "crawler";
    }
    if (state.wave >= 20) {
      const chance = Math.min(0.24, (0.05 + (state.wave - 20) * 0.0025) * state.mode.special);
      if (Math.random() < chance) return "warrior";
    }
    if (state.wave >= 15) {
      const chance = Math.min(0.18, (0.04 + (state.wave - 15) * 0.002) * state.mode.special);
      if (Math.random() < chance) return "archer";
    }
    if (state.wave >= 25) {
      const chance = Math.min(0.14, (0.03 + (state.wave - 25) * 0.0018) * state.mode.special);
      if (Math.random() < chance) return "spear";
    }
    if (state.wave >= 30) {
      const chance = Math.min(0.12, (0.025 + (state.wave - 30) * 0.0015) * state.mode.special);
      if (Math.random() < chance) return "shield";
    }
    if (state.wave >= 35) {
      const chance = Math.min(0.12, (0.02 + (state.wave - 35) * 0.0012) * state.mode.special);
      if (Math.random() < chance) return "berserker";
    }
    if (state.wave >= 30) {
      const chance = Math.min(0.10, (0.015 + (state.wave - 30) * 0.001) * state.mode.special);
      if (Math.random() < chance) return "burrower";
    }
    if (state.wave >= 40) {
      const chance = Math.min(0.09, (0.012 + (state.wave - 40) * 0.0009) * state.mode.special);
      if (Math.random() < chance) return "summoner";
    }
    if (state.wave >= 45) {
      const chance = Math.min(0.08, (0.01 + (state.wave - 45) * 0.0008) * state.mode.special);
      if (Math.random() < chance) return "howler";
    }
    if (state.wave >= 42) {
      const chance = Math.min(0.12, (0.028 + (state.wave - 42) * 0.0016) * state.mode.special);
      if (Math.random() < chance) return "exploder";
    }
    if (state.wave >= 50) {
      const chance = Math.min(0.11, (0.025 + (state.wave - 50) * 0.0015) * state.mode.special);
      if (Math.random() < chance) return "mutant";
    }
    if (state.wave >= 2) {
      const chance = Math.min(0.4, 0.1 + (state.wave - 2) * 0.004);
      if (Math.random() < chance) return "runner";
    }
    return "normal";
  }

  function createZombie(x, y, type) {
    const variant = type || "normal";
    let hp = ZOMBIE_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
    let speed = rand(66, 98) + Math.min(28, state.elapsed * 0.12);
    let radius = 17;

    if (variant === "runner") {
      hp = Math.max(2, Math.round(hp * 0.7));
      speed *= 1.55;
      radius = 15;
    } else if (variant === "warrior") {
      hp = state.maxHp * 3;
      speed *= 0.7;
      radius = 23;
    } else if (variant === "archer") {
      hp = Math.max(2, Math.round(hp * 1.4));
      speed *= 0.85;
      radius = 17;
    } else if (variant === "spear") {
      hp = Math.max(2, Math.round(hp * 1.8));
      speed *= 0.75;
      radius = 20;
    } else if (variant === "shield") {
      hp = ZOMBIE_SHIELD_HP;
      speed *= 0.7;
      radius = 20;
    } else if (variant === "berserker") {
      hp = ZOMBIE_BERSERKER_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= 0.9;
      radius = 24;
    } else if (variant === "burrower") {
      hp = ZOMBIE_BURROWER_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= 0.75;
      radius = 21;
    } else if (variant === "summoner") {
      hp = ZOMBIE_SUMMONER_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= 0.7;
      radius = 19;
    } else if (variant === "howler") {
      hp = ZOMBIE_HOWLER_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= 0.8;
      radius = 22;
    } else if (variant === "crawler") {
      hp = ZOMBIE_CRAWLER_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= ZOMBIE_CRAWLER_SPEED_MULT;
      radius = 15;
    } else if (variant === "poison") {
      hp = Math.max(2, Math.round(hp * 1.2));
      speed *= 0.92;
      radius = 18;
    } else if (variant === "exploder") {
      hp = ZOMBIE_EXPLODER_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= 0.95;
      radius = 19;
    } else if (variant === "mutant") {
      hp = ZOMBIE_MUTANT_HP + (state.wave - 1) * ZOMBIE_HP_PER_WAVE;
      speed *= 0.82;
      radius = 24;
    } else if (variant === "boss") {
      hp = BOSS_HP_BASE + (state.wave - 1) * BOSS_HP_PER_WAVE;
      speed *= 0.62;
      radius = 38;
    }

    return {
      id: (zombieId += 1),
      type: variant,
      x,
      y,
      hp,
      maxHp: hp,
      radius,
      speed,
      face: rand(0, TAU),
      phase: rand(0, TAU),
      spawn: 0,
      hitFlash: 0,
      attackCooldown: rand(0.2, 0.8),
      attackAnim: 0,
      sawCooldown: 0,
      shieldDir: 0,
      leapCooldown: 0,
      berserk: false,
      summonTimer: rand(4, ZOMBIE_SUMMONER_SUMMON_INTERVAL),
      burrowState: "idle",
      burrowTimer: 0,
      warnTimer: 0,
      howlTimer: rand(6, ZOMBIE_HOWLER_HOWL_INTERVAL),
      howlActive: 0,
      slowTimer: 0,
      howlSpeedMult: 1,
      howlDamageMult: 1,
      wanderAngle: rand(0, TAU),
      wanderTimer: rand(1, 3),
      burnTimer: 0,
      burnDamage: 0,
      burnDamageTimer: 0,
      burnFxTimer: 0,
      freezeTimer: 0,
      isBoss: variant === "boss",
      regenTimer: 0,
      fuse: 0,
      dead: false,
    };
  }

  function spawnZombie(initial, type) {
    if (state.zombies.length >= MAX_ZOMBIES) return null;
    const p = state.player;
    let radius;

    if (initial) {
      radius = Math.min(state.w, state.h) * 0.42 + rand(20, 100);
    } else {
      radius = Math.max(state.w, state.h) * 0.62 + rand(40, 180);
    }

    const angle = rand(0, TAU);
    const zombie = createZombie(
      p.x + Math.cos(angle) * radius,
      p.y + Math.sin(angle) * radius,
      type || rollZombieType()
    );
    state.zombies.push(zombie);
    state.totalSpawned += 1;
    return zombie;
  }

  function spawnZombieNear(distance, type) {
    const p = state.player;
    const angle = rand(0, TAU);
    const radius = Math.max(60, Number(distance) || 160);
    const zombie = createZombie(
      p.x + Math.cos(angle) * radius,
      p.y + Math.sin(angle) * radius,
      type || rollZombieType()
    );
    state.zombies.push(zombie);
    state.totalSpawned += 1;
    return zombie;
  }

  function spawnBoss(showAlert = true) {
    const p = state.player;
    const angle = rand(0, TAU);
    const radius = Math.max(state.w, state.h) * 0.5 + rand(60, 150);
    const boss = createZombie(
      p.x + Math.cos(angle) * radius,
      p.y + Math.sin(angle) * radius,
      "boss"
    );
    boss.spawn = 0.35;
    state.zombies.push(boss);
    state.totalSpawned += 1;
    state.bossCount += 1;
    state.shake = Math.max(state.shake, 0.55);
    if (showAlert) showToast(`Đợt ${state.wave} · Trùm xuất hiện!`);
    DeepwoodAudio.toxic();
    return boss;
  }

  function nearestZombie(maxDistance = Infinity) {
    const p = state.player;
    let best = null;
    let bestDistance = maxDistance;

    for (const zombie of state.zombies) {
      if (zombie.dead) continue;
      const d = dist(zombie.x, zombie.y, p.x, p.y);
      if (d < bestDistance) {
        bestDistance = d;
        best = zombie;
      }
    }
    return best;
  }

  function updateCamera(dt) {
    const p = state.player;
    const targetX = p.x - state.w / 2;
    const targetY = p.y - state.h / 2;
    const smooth = 1 - Math.exp(-7 * dt);
    state.camera.x += (targetX - state.camera.x) * smooth;
    state.camera.y += (targetY - state.camera.y) * smooth;
  }

  function segmentCircle(x1, y1, x2, y2, cx, cy, radius) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    let t = 0;
    if (lengthSq > 0) t = clamp(((cx - x1) * dx + (cy - y1) * dy) / lengthSq, 0, 1);
    return Math.hypot(cx - (x1 + dx * t), cy - (y1 + dy * t)) <= radius;
  }

  function applyBurn(zombie, dps, duration) {
    if (!zombie || zombie.dead || dps <= 0 || duration <= 0) return;
    zombie.burnDamage = Math.max(zombie.burnDamage || 0, dps);
    zombie.burnTimer = Math.max(zombie.burnTimer || 0, duration);
  }

  function damageZombie(zombie, amount, options = {}) {
    if (!zombie || zombie.dead || amount <= 0) return;
    zombie.hp -= amount;
    zombie.hitFlash = Math.max(zombie.hitFlash, options.quiet ? 0.45 : 1);
    if (!options.quiet) {
      burst(zombie.x, zombie.y, options.count || 5, options.tone || "190, 245, 200", 20, options.speed || 80);
      DeepwoodAudio.hit();
    }
    if (zombie.hp <= 0) killZombie(zombie);

    // Burn effect from Burn skill (không kích hoạt bởi chính damage cháy/thiên thạch)
    if (
      state.skills.burn > 0 &&
      !zombie.dead &&
      !options.noBurn &&
      !options.fireDamage
    ) {
      const cfg = BURN_LEVELS[Math.min(state.skills.burn, BURN_LEVELS.length) - 1];
      applyBurn(zombie, cfg.dps, cfg.duration);
    }
  }

  function warriorMelee() {
    const p = state.player;
    const target = nearestZombie(WARRIOR_MELEE_RANGE + 18);
    if (!target) return false;

    const swingAngle = Math.atan2(target.y - p.y, target.x - p.x);
    p.face = swingAngle;
    let hits = 0;

    for (const zombie of state.zombies) {
      if (zombie.dead) continue;
      const dx = zombie.x - p.x;
      const dy = zombie.y - p.y;
      const distance = Math.hypot(dx, dy);
      if (distance > WARRIOR_MELEE_RANGE + zombie.radius) continue;
      const angle = Math.atan2(dy, dx);
      const delta = Math.abs(Math.atan2(Math.sin(angle - swingAngle), Math.cos(angle - swingAngle)));
      if (delta > 1.05) continue;

      damageZombie(zombie, WARRIOR_MELEE_DAMAGE, { tone: "246, 236, 190", count: 6, speed: 105 });
      if (!zombie.dead) {
        zombie.x += (dx / (distance || 1)) * 7;
        zombie.y += (dy / (distance || 1)) * 7;
      }
      hits += 1;
    }

    state.shootCooldown = BASE_COOLDOWN;
    state.slashes.push({
      x: p.x,
      y: p.y,
      angle: swingAngle,
      life: 0,
      ttl: 0.24,
    });
    burst(
      p.x + Math.cos(swingAngle) * 42,
      p.y + Math.sin(swingAngle) * 42,
      4,
      "246, 236, 190",
      25,
      90
    );
    DeepwoodAudio.slash();
    return true;
  }

  function tryAttack() {
    if (state.character && state.character.skin === "warrior" && warriorMelee()) return true;
    return shoot();
  }

  function triggerManualShoot() {
    if (state.autoAttack) return;
    if (state.shootCooldown <= 0) {
      // Shoot toward mouse pointer position
      const p = state.player;
      if (state.pointer.active) {
        const worldX = state.camera.x + state.pointer.x;
        const worldY = state.camera.y + state.pointer.y;
        const angle = Math.atan2(worldY - p.y, worldX - p.x);
        shoot(angle);
      } else {
        tryAttack();
      }
    }
  }

  function shoot(targetAngle) {
    const p = state.player;
    let baseAngle;
    if (targetAngle != null) {
      baseAngle = targetAngle;
    } else {
      const target = nearestZombie(DART_RANGE);
      if (!target) return false;
      baseAngle = Math.atan2(target.y - p.y, target.x - p.x);
    }
    const angles = state.skills.triple > 0
      ? [baseAngle - 0.26, baseAngle, baseAngle + 0.26]
      : [baseAngle];
    const damage = BASE_DAMAGE + state.skills.heavy * 2;

    for (const angle of angles) {
      state.darts.push({
        x: p.x + Math.cos(angle) * 24,
        y: p.y + Math.sin(angle) * 24,
        vx: Math.cos(angle) * DART_SPEED,
        vy: Math.sin(angle) * DART_SPEED,
        traveled: 0,
        range: DART_RANGE,
        damage,
        angle,
        pierce: state.skills.pierce > 0
          ? PIERCE_LEVELS[Math.min(state.skills.pierce, PIERCE_LEVELS.length) - 1]
          : 0,
        hitIds: [],
      });
    }

    const fireRateMult = state.skills.fireRate > 0
      ? FIRE_RATE_LEVELS[Math.min(state.skills.fireRate, FIRE_RATE_LEVELS.length) - 1]
      : 1;
    state.shootCooldown = BASE_COOLDOWN / fireRateMult;
    DeepwoodAudio.shoot();
    burst(p.x + Math.cos(baseAngle) * 26, p.y + Math.sin(baseAngle) * 26, 3, "246, 222, 150", 8, 38);
    return true;
  }

  function updateXRay(dt) {
    try {
      if (!state.skills || state.skills.xRay <= 0) return;
      if (!state.player) return;

      state.xRayLaserTimer = Math.max(0, state.xRayLaserTimer - dt);
      if (state.xRayLaserTimer > 0) return;

      // X-ray fires every 1.5 seconds
      state.xRayLaserTimer = 1.5;

      const p = state.player;
      if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') return;

      const target = nearestZombie(500);
      if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') return;

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const angle = Math.atan2(dy, dx);
      if (!isFinite(angle)) return;

      const range = 500;
      const endX = p.x + Math.cos(angle) * range;
      const endY = p.y + Math.sin(angle) * range;

      const lineLen = Math.hypot(endY - p.y, endX - p.x);
      if (!isFinite(lineLen) || lineLen <= 0) return;

      // Laser beam visual - short lived blast
      state.blasts.push({
        x: p.x,
        y: p.y,
        life: 0,
        ttl: 0.2,
        radius: 6,
        tone: "180, 100, 255",
      });

      // Fire laser in a line - damage all zombies in path
      for (let i = 0; i < state.zombies.length; i++) {
        const zombie = state.zombies[i];
        if (!zombie || zombie.dead) continue;
        if (typeof zombie.x !== 'number' || typeof zombie.y !== 'number') continue;

        // Check if zombie is close to the laser line
        const distToLine = Math.abs(
          (endY - p.y) * zombie.x -
          (endX - p.x) * zombie.y +
          endX * p.y -
          endY * p.x
        ) / lineLen;

        if (!isFinite(distToLine)) continue;

        if (distToLine <= (zombie.radius || 10) + 8) {
          let dmg = Math.max(1, BASE_DAMAGE + (state.skills.heavy || 0) * 2);
          // X3 damage to warrior zombies
          if (zombie.type === "warrior") {
            dmg *= XRAY_DAMAGE_MULT;
          }
          damageZombie(zombie, Math.floor(dmg), {
            quiet: true,
            tone: "180, 100, 255",
            count: 4,
            speed: 60,
          });
        }
      }

      try { DeepwoodAudio.shoot(); } catch (e) { /* audio error, ignore */ }
    } catch (e) {
      // Prevent X-ray from freezing the game
      console.error("X-ray error:", e.message);
    }
  }

  function spawnPoisonZone(x, y) {
    state.poisonZones.push({
      x,
      y,
      radius: POISON_FIELD_RADIUS,
      life: 0,
      ttl: POISON_FIELD_LIFE,
      tick: 0.18,
      phase: rand(0, TAU),
    });
    if (state.poisonZones.length > 10) state.poisonZones.shift();
  }

  function spawnFireZone(x, y, dps, radius) {
    state.fireZones.push({
      x,
      y,
      radius,
      dps,
      life: 0,
      ttl: FIREBOMB_TTL,
      tick: rand(0, FIREBOMB_TICK),
      phase: rand(0, TAU),
    });
    if (state.fireZones.length > 10) state.fireZones.shift();
    burst(x, y, 12, "255, 158, 62", 30, 150);
    DeepwoodAudio.fireBurst();
  }

  function throwFirebombs(level) {
    const cfg = FIREBOMB_LEVELS[Math.min(level, FIREBOMB_LEVELS.length) - 1];
    const p = state.player;
    const target = nearestZombie(9999);

    for (let i = 0; i < cfg.count; i += 1) {
      let angle;
      const distance = rand(90, 245);
      if (target) {
        angle = Math.atan2(target.y - p.y, target.x - p.x) + rand(-0.35, 0.35);
      } else {
        angle = rand(0, TAU);
      }
      state.bombs.push({
        x: p.x,
        y: p.y - 8,
        sx: p.x,
        sy: p.y - 8,
        tx: p.x + Math.cos(angle) * distance,
        ty: p.y + Math.sin(angle) * distance,
        t: 0,
        duration: rand(0.48, 0.68),
        arc: rand(62, 102),
        dps: cfg.dps,
        radius: cfg.radius,
        spin: rand(7, 12),
      });
    }

    DeepwoodAudio.firebomb();
  }

  function spawnZombieProjectile(zombie, kind) {
    const p = state.player;
    const dx = p.x - zombie.x;
    const dy = p.y - zombie.y;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = kind === "arrow" ? 660 : 480;
    const damage =
      kind === "arrow"
        ? ZOMBIE_ARCHER_DAMAGE
        : kind === "spear-throw"
          ? ZOMBIE_SPEAR_THROW_DAMAGE
          : ZOMBIE_SPEAR_STAB_DAMAGE;
    const range = kind === "arrow" ? ZOMBIE_ARCHER_RANGE : 300;
    state.zombieProjectiles.push({
      x: zombie.x,
      y: zombie.y,
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
      traveled: 0,
      range,
      damage,
      kind,
      life: 0,
      ttl: 5,
      owner: zombie,
    });
    if (state.zombieProjectiles.length > 200) state.zombieProjectiles.shift();
  }

  function killZombie(zombie) {
    if (zombie.dead) return;
    zombie.dead = true;
    state.kills += 1;
    updateStatsHud();

    const isBoss = zombie.isBoss || zombie.type === "boss";
    const gemOptions =
      zombie.type === "warrior"
        ? { value: 10, kind: "red" }
        : isBoss
          ? { value: 18, kind: "red" }
          : zombie.type === "mutant"
            ? { value: 4, kind: "red" }
            : zombie.type === "exploder"
              ? { value: 2, kind: "red" }
              : undefined;
    spawnGem(zombie.x, zombie.y, gemOptions);

    const isPoison = zombie.type === "poison";
    burst(zombie.x, zombie.y, isBoss ? 44 : 20, isPoison ? "146, 226, 98" : "94, 184, 128", 30, isBoss ? 240 : 170);
    burst(zombie.x, zombie.y, isBoss ? 24 : 9, isPoison ? "210, 255, 126" : "246, 220, 140", 20, 110);
    DeepwoodAudio.slain();
    if (isPoison) {
      spawnPoisonZone(zombie.x, zombie.y);
      DeepwoodAudio.toxic();
    }

    if (isBoss) {
      addMoney(BOSS_MONEY);
      floatText(zombie.x, zombie.y - zombie.radius - 16, `+${BOSS_MONEY} ◆`, "255, 220, 118");
      state.shake = Math.max(state.shake, 0.65);
      showToast("Hạ gục trùm! +" + BOSS_MONEY + " tiền");
      DeepwoodAudio.win();
    }

    if (zombie.type === "exploder") {
      detonateExploder(zombie);
    }

    if (state.skills.lifesteal > 0) {
      state.killsSinceHeal += 1;
      if (state.killsSinceHeal >= 5) {
        state.killsSinceHeal -= 5;
        if (state.hp < state.maxHp) {
          const heal = Math.min(state.skills.lifesteal, state.maxHp - state.hp);
          state.hp += heal;
          updateHealthHud();
          floatText(state.player.x, state.player.y - 34, `+${heal} HP`, "126, 246, 164");
        }
      }
    }
  }

  function detonateExploder(zombie) {
    const radius = ZOMBIE_EXPLODER_RADIUS;
    state.blasts.push({
      x: zombie.x,
      y: zombie.y,
      life: 0,
      ttl: 0.48,
      radius,
      tone: "255, 146, 70",
    });
    burst(zombie.x, zombie.y, 34, "255, 150, 70", 40, 250);
    burst(zombie.x, zombie.y, 16, "255, 232, 160", 20, 130);
    state.shake = Math.max(state.shake, 0.42);
    DeepwoodAudio.fireBurst();

    const p = state.player;
    if (dist(p.x, p.y, zombie.x, zombie.y) <= radius && state.invuln <= 0) {
      damagePlayer(ZOMBIE_EXPLODER_DAMAGE, { playerX: p.x, playerY: p.y });
    }

    for (const other of state.zombies) {
      if (other === zombie || other.dead) continue;
      if (dist(other.x, other.y, zombie.x, zombie.y) <= radius + other.radius) {
        damageZombie(other, Math.round(ZOMBIE_EXPLODER_DAMAGE * 0.6), {
          quiet: true,
          tone: "255, 168, 96",
        });
      }
    }
  }

  function spendMoney(amount) {
    const cost = Math.max(0, Math.floor(Number(amount) || 0));
    if (cost <= 0) return true;
    if (state.money < cost) return false;
    state.money -= cost;
    updateMoneyHud();
    return true;
  }

  function spawnGem(x, y, options = {}) {
    const angle = rand(0, TAU);
    const speed = rand(18, 62);
    state.gems.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      bob: rand(0, TAU),
      phase: rand(0, TAU),
      value: Math.max(1, Math.round(Number(options.value) || 1)),
      kind: options.kind === "red" ? "red" : "green",
    });
    if (state.gems.length > 80) state.gems.shift();
  }

  function collectGem(gem) {
    const base = Math.max(1, Math.round(Number(gem.value) || 1));
    const gain = base * (state.skills.wealth > 0 ? 3 : 1);
    const before = state.energy;
    state.energy = Math.min(state.energyMax, state.energy + gain);
    const actual = state.energy - before;
    if (actual > 0) {
      updateEnergyHud();
      floatText(
        gem.x,
        gem.y - 10,
        `+${actual}`,
        gem.kind === "red" ? "255, 132, 108" : "132, 240, 170"
      );
    }

    burst(
      gem.x,
      gem.y,
      14,
      gem.kind === "red" ? "255, 116, 92" : "110, 230, 150",
      30,
      130
    );
    DeepwoodAudio.pickup();

    if (state.energy >= state.energyMax && !state.choosing && state.choiceDelay < 0) {
      state.choiceDelay = 0.55;
    }
  }

  function damagePlayer(amount, options = {}) {
    if (state.over || state.invuln > 0) return false;

    const base = Math.max(1, Number(amount) || 0);
    let hpLoss = base;
    let armorLoss = 0;

    // Lá chắn năng lượng: giảm 20% sát thương khi dưới 30% máu
    if (state.skills.energyShield > 0 && state.hp < state.maxHp * SHIELD_HP_THRESHOLD) {
      hpLoss = Math.max(1, Math.ceil(base * 0.8));
    }

    // Khiên tăng cường: giảm 30% tất cả sát thương khi dưới 30% máu
    if (state.skills.enhancedShield > 0 && state.hp < state.maxHp * SHIELD_HP_THRESHOLD) {
      hpLoss = Math.max(1, Math.ceil(hpLoss * (1 - ENHANCED_SHIELD_DAMAGE_REDUCE)));
    }

    // Vũ trụ song song: khi dưới 30% máu, kích hoạt tự động (có hồi chiêu 3 phút)
    if (
      state.skills.parallelUniverse > 0 &&
      !state.parallelUniverseActive &&
      state.parallelUniverseTimer <= 0 &&
      state.hp - hpLoss <= state.maxHp * 0.3
    ) {
      const healAmount = state.maxHp - state.hp + hpLoss;
      state.parallelUniverseActive = true;
      state.parallelUniverseTimer = PARALLEL_UNIVERSE_DURATION;
      state.hp = state.maxHp; // Hồi đầy máu ngay lập tức
      updateHealthHud();
      floatText(state.player.x, state.player.y - 40, "VŨ TRỰ SONG SONG!", "180, 100, 255");
      showToast("Vũ trụ song song kích hoạt! +" + Math.round(healAmount) + " máu, x5 sát thương trong 10 giây");
      DeepwoodAudio.win();
      state.shake = Math.max(state.shake, 0.6);
    }

    if (
      options.shieldZombie &&
      options.shieldZombie.type === "shield" &&
      options.playerX != null &&
      options.playerY != null
    ) {
      const toPlayer = Math.atan2(
        options.playerY - options.shieldZombie.y,
        options.playerX - options.shieldZombie.x
      );
      const diff = Math.abs(
        Math.atan2(
          Math.sin(toPlayer - options.shieldZombie.shieldDir),
          Math.cos(toPlayer - options.shieldZombie.shieldDir)
        )
      );
      if (diff < Math.PI / 2) {
        base = Math.max(1, Math.ceil(base * (1 - ZOMBIE_SHIELD_FRONT_REDUCE)));
      }
    }

    if (!options.ignoreArmor && state.maxArmor > 0 && state.armor > 0) {
      hpLoss = Math.max(1, Math.ceil(base * (1 - ARMOR_MITIGATION)));
      armorLoss = Math.min(ARMOR_PER_HIT, state.armor);
      state.armor = Math.max(0, state.armor - armorLoss);
      state.armorDisplay = -1;
      updateArmorHud();
      if (state.armor <= 0) {
        floatText(state.player.x, state.player.y - 34, "Giáp cạn", "255, 118, 104");
      }
    } else {
      // Không có giáp hoặc hết giáp: nhận full damage, không trừ giáp
      hpLoss = base;
    }

    state.hp = Math.max(0, state.hp - hpLoss);
    state.invuln = HIT_INVULN;
    state.damageTimer = 0;

    if (options.poison) {
      state.hurtFlash = Math.max(state.hurtFlash, 0.28);
      state.shake = Math.max(state.shake, 0.16);
    } else {
      state.hurtFlash = 0.62;
      state.shake = 0.5;
    }

    updateHealthHud();

    if (hpLoss > 0) {
      floatText(
        state.player.x,
        state.player.y - 34,
        `-${hpLoss} HP`,
        options.poison ? "156, 240, 132" : "255, 118, 104"
      );
    }
    if (armorLoss > 0) {
      floatText(state.player.x + 20, state.player.y - 47, `-${armorLoss} giáp`, "146, 196, 255");
    }

    burst(
      state.player.x,
      state.player.y,
      options.poison ? 10 : 12,
      options.poison ? "120, 220, 90" : "220, 74, 62",
      30,
      140
    );

    if (options.poison) DeepwoodAudio.poisonTick();
    else DeepwoodAudio.hurt();

    if (state.hp <= 0) {
      if (state.revives > 0) {
        state.revives -= 1;
        state.hp = Math.max(1, Math.round(state.maxHp * 0.5));
        state.invuln = 3;
        state.hurtFlash = 0;
        state.shake = Math.max(state.shake, 0.4);
        updateHealthHud();
        state.blasts.push({
          x: state.player.x,
          y: state.player.y,
          life: 0,
          ttl: 0.7,
          radius: 96,
          tone: "255, 220, 120",
        });
        burst(state.player.x, state.player.y, 44, "255, 222, 128", 40, 240);
        floatText(state.player.x, state.player.y - 52, "TÁI SINH!", "255, 228, 140");
        showToast("Tái sinh! Bạn được bất tử 3 giây.");
        DeepwoodAudio.win();
        return true;
      }
      gameOver();
    }
    return true;
  }

  function gameOver() {
    if (state.over || state.victory) return;
    state.over = true;
    state.paused = false;
    state.keys.clear();
    state.pointer.active = false;
    state.hurtFlash = 0;

    if (els.gameoverKills) els.gameoverKills.textContent = String(state.kills);
    if (els.gameoverTime) els.gameoverTime.textContent = formatTime(state.elapsed);
    if (els.gameoverSkills) els.gameoverSkills.textContent = String(state.levelUps);
    if (els.gameoverLayer) els.gameoverLayer.hidden = false;
    DeepwoodAudio.death();

    window.requestAnimationFrame(() => {
      if (els.gameoverReplay) els.gameoverReplay.focus({ preventScroll: true });
    });
  }

  function victory() {
    if (state.victory || state.over) return;
    state.victory = true;
    state.paused = false;
    state.keys.clear();
    state.pointer.active = false;

    if (els.victoryKills) els.victoryKills.textContent = String(state.kills);
    if (els.victoryTime) els.victoryTime.textContent = formatTime(state.elapsed);
    if (els.victorySkills) els.victorySkills.textContent = String(state.levelUps);
    if (els.victoryLayer) els.victoryLayer.hidden = false;
    DeepwoodAudio.win();

    window.requestAnimationFrame(() => {
      if (els.victoryReplay) els.victoryReplay.focus({ preventScroll: true });
    });
  }

  function updatePlayer(dt) {
    const p = state.player;
    let dx = 0;
    let dy = 0;
    const keys = state.keys;

    if (state.playerSlowTimer > 0) {
      state.playerSlowTimer = Math.max(0, state.playerSlowTimer - dt);
      if (state.playerSlowTimer <= 0) state.playerSlowMult = 1;
    }

    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;
    if (keys.has("w") || keys.has("arrowup")) dy -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dy += 1;

    if (state.pointer.active) {
      const targetX = state.camera.x + state.pointer.x;
      const targetY = state.camera.y + state.pointer.y;
      const px = targetX - p.x;
      const py = targetY - p.y;
      if (Math.hypot(px, py) > 26) {
        dx = px;
        dy = py;
      }
    }

    const length = Math.hypot(dx, dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    const speed = BASE_SPEED * 0.85 * state.character.speed * state.speedMult * (1 + state.skills.agility * 0.05) * state.playerSlowMult;
    const smooth = 1 - Math.exp(-13 * dt);
    p.vx += (dx * speed - p.vx) * smooth;
    p.vy += (dy * speed - p.vy) * smooth;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const moving = Math.hypot(p.vx, p.vy) > 14;
    p.walk += dt * (moving ? 9 : 1.6);

    const target = nearestZombie(DART_RANGE);
    let faceTarget = null;
    if (moving) faceTarget = Math.atan2(p.vy, p.vx);
    else if (target) faceTarget = Math.atan2(target.y - p.y, target.x - p.x);

    if (faceTarget !== null) {
      p.face = lerpAngle(p.face, faceTarget, Math.min(1, dt * 12));
    }
  }

  function updateZombies(dt) {
    const p = state.player;

    for (const zombie of state.zombies) {
      if (zombie.dead) continue;
      zombie.spawn = Math.min(1, zombie.spawn + dt * 2.6);
      zombie.hitFlash = Math.max(0, zombie.hitFlash - dt * 4.5);
      zombie.attackCooldown = Math.max(0, zombie.attackCooldown - dt);
      zombie.attackAnim = Math.max(0, zombie.attackAnim - dt * 3.4);
      zombie.sawCooldown = Math.max(0, zombie.sawCooldown - dt);
      zombie.phase += dt * 2;
      zombie.freezeTimer = Math.max(0, (zombie.freezeTimer || 0) - dt);

      if (zombie.howlSpeedMult > 1) {
        zombie.howlSpeedMult = Math.max(1, zombie.howlSpeedMult - dt * 0.5);
      }
      if (zombie.howlDamageMult > 1) {
        zombie.howlDamageMult = Math.max(1, zombie.howlDamageMult - dt * 0.5);
      }

      if (zombie.type === "berserker" && !zombie.berserk && zombie.hp <= zombie.maxHp * ZOMBIE_BERSERKER_HP_LOW) {
        zombie.berserk = true;
        zombie.speed *= 1 + ZOMBIE_BERSERKER_SPEED_BOOST;
      }

      if (zombie.type === "mutant" && zombie.hp > 0 && zombie.hp < zombie.maxHp) {
        zombie.hp = Math.min(zombie.maxHp, zombie.hp + zombie.maxHp * ZOMBIE_MUTANT_REGEN * dt);
        zombie.regenTimer = (zombie.regenTimer || 0) + dt;
        if (zombie.regenTimer >= 0.55) {
          zombie.regenTimer = 0;
          if (state.particles.length < 480) {
            burst(zombie.x + rand(-8, 8), zombie.y - rand(0, 12), 2, "150, 255, 128", 8, 34);
          }
        }
      }

      const dx = p.x - zombie.x;
      const dy = p.y - zombie.y;
      const distance = Math.hypot(dx, dy) || 1;
      zombie.face = Math.atan2(dy, dx);
      if (zombie.type === "shield") zombie.shieldDir = zombie.face;

      let sepX = 0;
      let sepY = 0;
      let sepChecked = 0;
      for (const other of state.zombies) {
        if (sepChecked >= 20) break;
        if (other === zombie || other.dead) continue;
        sepChecked += 1;
        const ox = zombie.x - other.x;
        const oy = zombie.y - other.y;
        const od = Math.hypot(ox, oy);
        if (od > 0 && od < zombie.radius * 2.3) {
          sepX += ox / od;
          sepY += oy / od;
        }
      }

      const speedMult = zombie.howlSpeedMult || 1;
      const freezeMult = zombie.freezeTimer > 0 ? 0.25 : 1;
      const finalSpeed = zombie.speed * speedMult * freezeMult;
      if (zombie.burrowState !== "burrowed") {
        let tx = dx / distance + sepX * 1.1;
        let ty = dy / distance + sepY * 1.1;
        const moveLength = Math.hypot(tx, ty) || 1;
        const approach = distance > 760 ? 2.4 : distance > 560 ? 1.4 : 1;
        zombie.x += (tx / moveLength) * finalSpeed * approach * dt;
        zombie.y += (ty / moveLength) * finalSpeed * approach * dt;
      }

      if (distance < 30) {
        zombie.x -= (dx / distance) * Math.min(10, 30 - distance);
        zombie.y -= (dy / distance) * Math.min(10, 30 - distance);
      }

      if (zombie.type === "archer") {
        if (
          distance <= ZOMBIE_ARCHER_RANGE &&
          distance >= ZOMBIE_ARCHER_MIN_RANGE &&
          zombie.attackCooldown <= 0
        ) {
          zombie.attackCooldown = ZOMBIE_ARCHER_COOLDOWN;
          spawnZombieProjectile(zombie, "arrow");
          DeepwoodAudio.hit();
        }
        if (distance < ZOMBIE_ARCHER_MIN_RANGE) {
          zombie.x -= (dx / distance) * zombie.speed * 0.6 * dt;
          zombie.y -= (dy / distance) * zombie.speed * 0.6 * dt;
        }
      } else if (zombie.type === "spear") {
        if (
          distance <= ZOMBIE_SPEAR_THROW_RANGE &&
          distance > ZOMBIE_SPEAR_STAB_RANGE &&
          zombie.attackCooldown <= 0
        ) {
          zombie.attackCooldown = ZOMBIE_SPEAR_COOLDOWN;
          spawnZombieProjectile(zombie, "spear-throw");
          DeepwoodAudio.hit();
        } else if (
          distance <= ZOMBIE_SPEAR_STAB_RANGE &&
          zombie.attackCooldown <= 0 &&
          state.invuln <= 0
        ) {
          zombie.attackCooldown = ZOMBIE_SPEAR_COOLDOWN;
          zombie.attackAnim = 1;
          if (damagePlayer(ZOMBIE_SPEAR_STAB_DAMAGE, { playerX: p.x, playerY: p.y, shieldZombie: zombie })) {
            p.x += (dx / distance) * 14;
            p.y += (dy / distance) * 14;
          }
        }
      } else if (zombie.type === "crawler") {
        if (distance <= ZOMBIE_CRAWLER_LEAP_RANGE && zombie.leapCooldown <= 0 && state.invuln <= 0) {
          zombie.leapCooldown = ZOMBIE_CRAWLER_LEAP_COOLDOWN;
          zombie.attackAnim = 1;
          if (damagePlayer(ZOMBIE_CRAWLER_LEAP_DAMAGE, { playerX: p.x, playerY: p.y })) {
            p.x += (dx / distance) * 20;
            p.y += (dy / distance) * 20;
          }
        }
      } else if (zombie.type === "summoner") {
        zombie.summonTimer = Math.max(0, zombie.summonTimer - dt);
        if (zombie.summonTimer <= 0 && zombie.attackCooldown <= 0) {
          zombie.summonTimer = ZOMBIE_SUMMONER_SUMMON_INTERVAL;
          zombie.attackCooldown = ZOMBIE_SUMMONER_SUMMON_INTERVAL;
          zombie.attackAnim = 1;
          for (let s = 0; s < ZOMBIE_SUMMONER_SUMMON_COUNT; s += 1) {
            const angle = rand(0, TAU);
            const r = rand(40, 90);
            const sz = spawnZombie(false);
            if (sz) {
              sz.x = zombie.x + Math.cos(angle) * r;
              sz.y = zombie.y + Math.sin(angle) * r;
              sz.spawn = 0;
            }
          }
          DeepwoodAudio.hit();
        }
      } else if (zombie.type === "burrower") {
        if (zombie.burrowState === "burrowed") {
          zombie.burrowTimer = Math.max(0, zombie.burrowTimer - dt);
          if (zombie.burrowTimer <= 0) {
            zombie.burrowState = "emerging";
            zombie.burrowTimer = ZOMBIE_BURROWER_WARN_TIME;
            zombie.x = p.x + (dx / distance) * rand(30, 80);
            zombie.y = p.y + (dy / distance) * rand(30, 80);
          }
        } else if (zombie.burrowState === "warning") {
          zombie.warnTimer = Math.max(0, zombie.warnTimer - dt);
          if (zombie.warnTimer <= 0) {
            zombie.burrowState = "burrowed";
            zombie.burrowTimer = 1.2;
          }
        } else if (zombie.burrowState === "emerging") {
          zombie.burrowTimer = Math.max(0, zombie.burrowTimer - dt);
          if (zombie.burrowTimer <= 0) {
            zombie.burrowState = "idle";
            if (distance < 40 && state.invuln <= 0) {
              damagePlayer(ZOMBIE_BURROWER_BURROW_DAMAGE, { playerX: p.x, playerY: p.y });
            }
          }
        } else {
          if (distance < 220 && zombie.warnTimer <= 0) {
            zombie.burrowState = "warning";
            zombie.warnTimer = ZOMBIE_BURROWER_WARN_TIME;
          }
        }
      } else if (zombie.type === "howler") {
        zombie.howlTimer = Math.max(0, zombie.howlTimer - dt);
        if (zombie.howlTimer <= 0 && zombie.attackCooldown <= 0) {
          zombie.howlTimer = ZOMBIE_HOWLER_HOWL_INTERVAL;
          zombie.attackCooldown = ZOMBIE_HOWLER_HOWL_INTERVAL;
          zombie.howlActive = 6;
          zombie.attackAnim = 1;
          for (const other of state.zombies) {
            if (other === zombie || other.dead) continue;
            if (dist(zombie.x, zombie.y, other.x, other.y) <= ZOMBIE_HOWLER_RADIUS) {
              other.howlSpeedMult = 1 + ZOMBIE_HOWLER_ZOMBIE_SPEED_BOOST;
              other.howlDamageMult = 1 + ZOMBIE_HOWLER_ZOMBIE_DAMAGE_BOOST;
            }
          }
          state.playerSlowTimer = ZOMBIE_HOWLER_PLAYER_SLOW_TIME;
          state.playerSlowMult = 1 - ZOMBIE_HOWLER_PLAYER_SLOW;
          DeepwoodAudio.hit();
        }
        if (zombie.howlActive > 0) {
          zombie.howlActive = Math.max(0, zombie.howlActive - dt);
        }
      } else if (distance < 40 && zombie.attackCooldown <= 0 && state.invuln <= 0) {
        zombie.attackCooldown = 1.05;
        zombie.attackAnim = 1;
        let attackDamage = zombie.type === "warrior" ? WARRIOR_ZOMBIE_DAMAGE : ZOMBIE_DAMAGE;
        if (zombie.type === "boss") attackDamage = BOSS_DAMAGE;
        if (zombie.type === "berserker" && zombie.berserk) {
          attackDamage *= 1 + ZOMBIE_BERSERKER_DAMAGE_BOOST;
        }
        if (damagePlayer(attackDamage, { playerX: p.x, playerY: p.y, shieldZombie: zombie })) {
          p.x += (dx / distance) * 14;
          p.y += (dy / distance) * 14;
        }
      }
    }
  }

  function updatePoisonZones(dt) {
    const p = state.player;

    for (let i = state.poisonZones.length - 1; i >= 0; i -= 1) {
      const zone = state.poisonZones[i];
      zone.life += dt;

      if (zone.life >= zone.ttl) {
        state.poisonZones.splice(i, 1);
        continue;
      }

      zone.tick -= dt;
      if (zone.tick <= 0 && dist(p.x, p.y, zone.x, zone.y) < zone.radius - 6) {
        zone.tick = POISON_TICK;
        damagePlayer(POISON_DAMAGE, { ignoreArmor: true, poison: true });
      }
    }
  }

  function updateDoctorRegen(dt) {
    if (!state.character || state.character.skin !== "doctor") return;

    state.damageTimer = Math.min(999, state.damageTimer + dt);
    state.doctorTimer += dt;

    while (state.doctorTimer >= DOCTOR_REGEN_INTERVAL) {
      state.doctorTimer -= DOCTOR_REGEN_INTERVAL;
      if (state.hp <= 0 || state.hp >= state.maxHp) continue;

      const safe = state.damageTimer >= DOCTOR_REGEN_INTERVAL;
      const heal = Math.min(
        safe ? DOCTOR_REGEN_SAFE : DOCTOR_REGEN_HURT,
        state.maxHp - state.hp
      );
      if (heal <= 0) continue;

      state.hp += heal;
      updateHealthHud();
      floatText(
        state.player.x,
        state.player.y - 38,
        `+${heal} HP`,
        safe ? "126, 246, 164" : "146, 232, 208"
      );
    }
  }

  function updateFirebombs(dt) {
    for (let i = state.bombs.length - 1; i >= 0; i -= 1) {
      const bomb = state.bombs[i];
      bomb.t += dt;
      const k = clamp(bomb.t / bomb.duration, 0, 1);
      const ease = k;

      bomb.x = bomb.sx + (bomb.tx - bomb.sx) * ease;
      bomb.y = bomb.sy + (bomb.ty - bomb.sy) * ease - Math.sin(k * Math.PI) * bomb.arc;

      if (k >= 1) {
        spawnFireZone(bomb.tx, bomb.ty, bomb.dps, bomb.radius);
        state.bombs.splice(i, 1);
      }
    }
  }

  function updateFireZones(dt) {
    for (let i = state.fireZones.length - 1; i >= 0; i -= 1) {
      const zone = state.fireZones[i];
      zone.life += dt;

      if (zone.life >= zone.ttl) {
        state.fireZones.splice(i, 1);
        continue;
      }

      zone.tick -= dt;
      if (zone.tick > 0) continue;
      zone.tick = FIREBOMB_TICK;

      for (const zombie of state.zombies) {
        if (zombie.dead) continue;
        if (dist(zombie.x, zombie.y, zone.x, zone.y) > zone.radius + zombie.radius * 0.35) {
          continue;
        }
        const dps = zombie.type === "warrior" ? FIREBOMB_WARRIOR_DPS : zone.dps;
        damageZombie(zombie, dps * FIREBOMB_TICK, { quiet: true });
      }
    }
  }

  function updateSaws(dt) {
    const level = state.skills.saw;
    if (!level) return;

    const cfg = SAW_LEVELS[Math.min(level, SAW_LEVELS.length) - 1];
    const p = state.player;
    state.sawAngle = (state.sawAngle + cfg.speed * sawSpeedMult * dt) % TAU;

    for (let i = 0; i < cfg.count; i += 1) {
      const angle = state.sawAngle + (i / cfg.count) * TAU;
      const sx = p.x + Math.cos(angle) * cfg.radius * sawSizeMult;
      const sy = p.y + Math.sin(angle) * cfg.radius * sawSizeMult;

      for (const zombie of state.zombies) {
        if (zombie.dead || zombie.sawCooldown > 0) continue;
        if (dist(sx, sy, zombie.x, zombie.y) > cfg.size * sawSizeMult + zombie.radius + 5) continue;

        damageZombie(zombie, SAW_DAMAGE, { quiet: true });
        zombie.sawCooldown = 0.42;

        const dx = zombie.x - p.x;
        const dy = zombie.y - p.y;
        const distance = Math.hypot(dx, dy) || 1;
        zombie.x += (dx / distance) * 17;
        zombie.y += (dy / distance) * 17;

        burst(zombie.x, zombie.y, 7, "222, 236, 246", 30, 110);
        DeepwoodAudio.sawHit();
        break;
      }
    }
  }

  function updateSlashes(dt) {
    for (let i = state.slashes.length - 1; i >= 0; i -= 1) {
      const slash = state.slashes[i];
      slash.life += dt;
      if (slash.life >= slash.ttl) state.slashes.splice(i, 1);
    }
  }

  function updateBurnEffects(dt) {
    for (let i = state.zombies.length - 1; i >= 0; i -= 1) {
      const z = state.zombies[i];
      if (z.dead || z.burnTimer <= 0) continue;

      z.burnTimer = Math.max(0, z.burnTimer - dt);
      z.burnDamageTimer = (z.burnDamageTimer || 0) + dt;
      z.burnFxTimer = (z.burnFxTimer || 0) - dt;

      if (z.burnFxTimer <= 0 && state.particles.length < 520) {
        z.burnFxTimer = 0.12 + Math.random() * 0.08;
        burst(
          z.x + rand(-7, 7) * (z.radius / 17),
          z.y - rand(2, 14) * (z.radius / 17),
          1,
          Math.random() < 0.35 ? "255, 216, 120" : "255, 122, 40",
          8,
          30
        );
      }

      if (z.burnDamageTimer >= 1) {
        z.burnDamageTimer -= 1;
        const dmg = Math.max(1, Math.round(z.burnDamage || 1));
        damageZombie(z, dmg, { quiet: true, noBurn: true, fireDamage: true });
        if (!z.dead && state.texts.length < 90) {
          floatText(z.x, z.y - z.radius - 8, `-${dmg}`, "255, 156, 64");
        }
      }
    }
  }

  function updateLightning(dt) {
    state.lightningFlash = Math.max(0, state.lightningFlash - dt * 3.4);

    const level = state.skills.lightning;
    if (level > 0) {
      const cfg = LIGHTNING_LEVELS[Math.min(level, LIGHTNING_LEVELS.length) - 1];
      state.lightningTimer = Math.max(0, state.lightningTimer - dt);

      if (state.lightningTimer <= 0) {
        const alive = state.zombies.filter((z) => !z.dead);
        if (alive.length === 0) {
          state.lightningTimer = 0.6;
        } else {
          state.lightningTimer = cfg.interval;

          for (let s = 0; s < cfg.count; s += 1) {
            const target = alive[Math.floor(Math.random() * alive.length)];
            const x = target.x + rand(-18, 18);
            const y = target.y + rand(-12, 12);

            state.lightningStrikes.push({
              x,
              y,
              life: 0,
              ttl: 0.72,
              radius: cfg.radius,
              damage: cfg.damage,
              seed: rand(0, 1000),
            });

            // Sát thương tức thời một lần cho mọi zombie trong bán kính
            for (const z of state.zombies) {
              if (z.dead) continue;
              if (dist(z.x, z.y, x, y) <= cfg.radius + z.radius) {
                applyBurn(z, cfg.burnDps, cfg.burnTime);
                damageZombie(z, cfg.damage, {
                  quiet: true,
                  noBurn: true,
                  tone: "196, 228, 255",
                });
              }
            }

            burst(x, y, 18, "186, 224, 255", 40, 190);
            burst(x, y, 9, "255, 252, 220", 20, 110);
            if (state.texts.length < 90) {
              floatText(x, y - 28, `-${cfg.damage}`, "204, 236, 255");
            }
          }

          state.lightningFlash = Math.max(state.lightningFlash, 0.62);
          state.shake = Math.max(state.shake, 0.24);
          DeepwoodAudio.hit();
        }
      }
    }

    for (let i = state.lightningStrikes.length - 1; i >= 0; i -= 1) {
      const strike = state.lightningStrikes[i];
      strike.life += dt;
      if (strike.life >= strike.ttl) state.lightningStrikes.splice(i, 1);
    }
  }

  function updateZombieProjectiles(dt) {
    const p = state.player;
    for (let i = state.zombieProjectiles.length - 1; i >= 0; i -= 1) {
      const pr = state.zombieProjectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.traveled += Math.hypot(pr.vx, pr.vy) * dt;
      pr.life += dt;
      if (pr.life >= pr.ttl || pr.traveled >= pr.range) {
        state.zombieProjectiles.splice(i, 1);
        continue;
      }
      if (dist(p.x, p.y, pr.x, pr.y) < 22) {
        const ok = damagePlayer(pr.damage, { playerX: p.x, playerY: p.y });
        if (ok) {
          const spd = Math.hypot(pr.vx, pr.vy) || 1;
          p.x -= (pr.vx / spd) * 10;
          p.y -= (pr.vy / spd) * 10;
        }
        state.zombieProjectiles.splice(i, 1);
        continue;
      }
    }
  }

  function updateArmorRegen(dt) {
    if (state.maxArmor <= 0 || state.armor >= state.maxArmor) return;

    state.armor = Math.min(
      state.maxArmor,
      state.armor + (state.maxArmor / ARMOR_REGEN_TIME) * dt
    );

    const shown = Math.ceil(state.armor);
    if (shown !== state.armorDisplay) {
      state.armorDisplay = shown;
      updateArmorHud();
    }
  }

  function updateTornado(dt) {
    if (state.skills.tornado <= 0) return;
    state.tornadoTimer = Math.max(0, state.tornadoTimer - dt);
    if (state.tornadoTimer > 0) return;
    state.tornadoTimer = TORNADO_INTERVAL;

    const p = state.player;
    let hitAny = false;
    for (const zombie of state.zombies) {
      if (zombie.dead) continue;
      if (dist(p.x, p.y, zombie.x, zombie.y) > TORNADO_RADIUS + zombie.radius) continue;
      damageZombie(zombie, TORNADO_DAMAGE, { quiet: true, tone: "200, 220, 255", count: 4, speed: 60 });
      const dx = zombie.x - p.x;
      const dy = zombie.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      zombie.x += (dx / d) * 60;
      zombie.y += (dy / d) * 60;
      hitAny = true;
    }
    if (hitAny && state.particles.length < 520) {
      burst(p.x, p.y, 14, "200, 220, 255", 30, 140);
      DeepwoodAudio.sawHit();
    }
  }


  function updateMines(dt) {
    if (state.skills.mine <= 0) return;
    state.mineTimer = Math.max(0, state.mineTimer - dt);
    if (state.mineTimer > 0) return;

    const level = Math.min(state.skills.mine, MINE_MAX_LEVELS.length);
    const interval = MINE_MAX_LEVELS[level - 1];
    const damage = MINE_DAMAGE_LEVELS[level - 1];
    state.mineTimer = interval;

    const p = state.player;
    state.mines.push({
      x: p.x,
      y: p.y,
      life: 0,
      ttl: 999,
      damage,
      radius: MINE_RADIUS,
      armed: false,
      armTime: 1,
    });
    DeepwoodAudio.pickup();

    if (state.mines.length > 40) state.mines.shift();
  }

  function updateMineCollisions(dt) {
    for (let i = state.mines.length - 1; i >= 0; i -= 1) {
      const mine = state.mines[i];
      mine.life += dt;
      if (!mine.armed) {
        mine.armTime = Math.max(0, mine.armTime - dt);
        if (mine.armTime <= 0) mine.armed = true;
      }

      for (const zombie of state.zombies) {
        if (zombie.dead) continue;
        if (!mine.armed) continue;
        if (dist(zombie.x, zombie.y, mine.x, mine.y) <= mine.radius + zombie.radius) {
          damageZombie(zombie, mine.damage, {
            quiet: true,
            tone: "255, 146, 70",
            count: 6,
            speed: 70,
          });
          state.blasts.push({
            x: mine.x,
            y: mine.y,
            life: 0,
            ttl: 0.5,
            radius: mine.radius,
            tone: "255, 146, 70",
          });
          burst(mine.x, mine.y, 30, "255, 146, 70", 40, 250);
          burst(mine.x, mine.y, 14, "255, 232, 160", 20, 130);
          state.shake = Math.max(state.shake, 0.4);
          DeepwoodAudio.fireBurst();
          state.mines.splice(i, 1);
          break;
        }
      }
    }
  }

  function updateDarts(dt) {
    for (let i = state.darts.length - 1; i >= 0; i -= 1) {
      const dart = state.darts[i];
      const step = Math.hypot(dart.vx, dart.vy) * dt;
      dart.traveled += step;
      if (dart.traveled >= dart.range) {
        state.darts.splice(i, 1);
        continue;
      }

      const nextX = dart.x + dart.vx * dt;
      const nextY = dart.y + dart.vy * dt;
      let spent = false;

      for (const zombie of state.zombies) {
        if (zombie.dead) continue;
        if (dart.hitIds.includes(zombie.id)) continue;
        if (!segmentCircle(dart.x, dart.y, nextX, nextY, zombie.x, zombie.y, zombie.radius + 4)) continue;

        dart.hitIds.push(zombie.id);

        let hitDamage = dart.damage;
        let critical = false;
        const critLevel = state.skills.critical;
        if (critLevel > 0) {
          const chance = CRITICAL_LEVELS[Math.min(critLevel, CRITICAL_LEVELS.length) - 1];
          if (Math.random() < chance) {
            critical = true;
            hitDamage *= 2;
          }
        }

        const hunterLevel = state.skills.bossHunter;
        if (hunterLevel > 0 && (zombie.isBoss || zombie.type === "boss")) {
          const bonus = BOSS_HUNTER_LEVELS[Math.min(hunterLevel, BOSS_HUNTER_LEVELS.length) - 1];
          hitDamage *= 1 + bonus;
        }

        // Nửa hỏa (thiêu đốt / bom xăng / thiên thạch) gây x2 sát thương zombie chiến binh
        const fireActive = state.skills.burn > 0 || state.skills.firebomb > 0 || state.skills.meteor > 0;
        if (fireActive && zombie.type === "warrior") {
          hitDamage *= 2;
        }

        // Vũ trụ song song: gây x5 sát thương tất cả các loại zombie
        if (state.parallelUniverseActive && state.skills.parallelUniverse > 0) {
          hitDamage *= PARALLEL_UNIVERSE_DAMAGE_MULT;
        }

        damageZombie(zombie, hitDamage, {
          tone: critical ? "255, 232, 130" : "190, 245, 200",
          count: critical ? 9 : 5,
          speed: critical ? 115 : 80,
        });

        if (critical && !zombie.dead) {
          floatText(zombie.x, zombie.y - zombie.radius - 10, "CHÍ MẠNG!", "255, 224, 112");
        }

        const freezeLevel = state.skills.freeze;
        if (freezeLevel > 0 && !zombie.dead) {
          const chance = FREEZE_LEVELS[Math.min(freezeLevel, FREEZE_LEVELS.length) - 1];
          if (Math.random() < chance) {
            const duration = FREEZE_DURATIONS[Math.min(freezeLevel, FREEZE_DURATIONS.length) - 1];
            zombie.freezeTimer = Math.max(zombie.freezeTimer || 0, duration);
            burst(zombie.x, zombie.y, 6, "170, 226, 255", 14, 60);
          }
        }

        // Điện lan truyền: 15% cơ hội chập chập điện sang 3 zombie gần nhất
        if (state.skills.chainLightning > 0 && !zombie.dead && Math.random() < 0.15) {
          const others = state.zombies
            .filter((z) => !z.dead && z.id !== zombie.id)
            .sort((a, b) => dist(a.x, a.y, zombie.x, zombie.y) - dist(b.x, b.y, zombie.x, zombie.y))
            .slice(0, 3);
          for (const target of others) {
            damageZombie(target, hitDamage * 0.7, { quiet: true, tone: "160, 220, 255", count: 5, speed: 70 });
            burst(target.x, target.y, 5, "160, 220, 255", 12, 50);
          }
        }

        dart.hits = (dart.hits || 0) + 1;
        if (dart.hits > (dart.pierce || 0)) {
          spent = true;
          break;
        }
      }

      if (spent) {
        state.darts.splice(i, 1);
        continue;
      }

      dart.x = nextX;
      dart.y = nextY;
    }

    state.zombies = state.zombies.filter((zombie) => !zombie.dead);
  }

  function updateGems(dt) {
    const p = state.player;
    const magnetRadius = MAGNET_BASE + state.skills.magnet * 45;

    for (let i = state.gems.length - 1; i >= 0; i -= 1) {
      const gem = state.gems[i];
      gem.life += dt;
      gem.phase += dt;

      const dx = p.x - gem.x;
      const dy = p.y - gem.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance < magnetRadius) {
        const pull = 260 + (magnetRadius - distance) * 4;
        gem.x += (dx / distance) * pull * dt;
        gem.y += (dy / distance) * pull * dt;
        gem.vx *= Math.pow(0.02, dt);
        gem.vy *= Math.pow(0.02, dt);
      } else {
        gem.x += gem.vx * dt;
        gem.y += gem.vy * dt;
        gem.vx *= Math.pow(0.16, dt);
        gem.vy *= Math.pow(0.16, dt);
      }

      if (Math.hypot(p.x - gem.x, p.y - gem.y) < GEM_PICKUP) {
        collectGem(gem);
        state.gems.splice(i, 1);
      }
    }
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const particle = state.particles[i];
      particle.life += dt;
      if (particle.life >= particle.ttl) {
        state.particles.splice(i, 1);
        continue;
      }
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(0.24, dt);
      particle.vy = particle.vy * Math.pow(0.24, dt) - 14 * dt;
    }
  }

  function updateTexts(dt) {
    for (let i = state.texts.length - 1; i >= 0; i -= 1) {
      const item = state.texts[i];
      item.life += dt;
      item.y -= 24 * dt;
      if (item.life >= item.ttl) state.texts.splice(i, 1);
    }
  }

  function startWave(n) {
    state.wave = n;
    state.waveState = "fight";
    state.waveTimer = 0;
    state.waveQuota = Math.round(
      (4 + n * 1.6 + n * n * 0.086) * state.mode.density
    );
    state.waveSpawned = 0;
    state.waveSpawnTimer = 0.45;
    updateWaveHud();

    const totalLabel = state.wavesTotal === Infinity ? "∞" : state.wavesTotal;
    let message = `Đợt ${n} / ${totalLabel}`;
    if (n === 2) message += " · Zombie chạy nhanh xuất hiện!";
    if (n === 5) message += " · Zombie độc xuất hiện!";
    if (n === 20) message += " · Zombie chiến binh xuất hiện!";
    if (n === 42) message += " · Zombie nổ xuất hiện!";
    if (n === 50) message += " · Zombie đột biến xuất hiện!";

    const bossWave = n % 10 === 0;
    if (bossWave) {
      message += " · TRÙM XUẤT HIỆN!";
      spawnBoss(false);
    }

    showToast(message);
  }

  function updateWaves(dt) {
    if (state.waveState === "clear") {
      state.waveTimer -= dt;
      if (state.waveTimer <= 0) {
        if (state.wave >= state.wavesTotal) victory();
        else startWave(state.wave + 1);
      }
      return;
    }

    if (state.waveState !== "fight") return;

    if (state.waveSpawned < state.waveQuota) {
      const cap = Math.min(MAX_ZOMBIES, 28 + Math.round(state.wave * 0.68));
      state.waveSpawnTimer -= dt;

      if (state.waveSpawnTimer <= 0 && state.zombies.length < cap) {
        const batch = Math.max(
          1,
          Math.min(
            state.waveQuota - state.waveSpawned,
            cap - state.zombies.length,
            1 + Math.floor(state.wave / 24) + (Math.random() < 0.35 ? 1 : 0)
          )
        );

        for (let i = 0; i < batch; i += 1) {
          const zombie = spawnZombie(false);
          if (!zombie) break;
          zombie.x += rand(-24, 24);
          zombie.y += rand(-24, 24);
          state.waveSpawned += 1;
        }

        const base =
          (0.98 -
            state.wave * 0.006 -
            state.energyMax * 0.004 -
            state.energy * 0.01) /
          state.mode.density;
        state.waveSpawnTimer = Math.max(0.28, base) * rand(0.82, 1.18);
      }
    }

    if (state.waveSpawned >= state.waveQuota && state.zombies.length === 0) {
      state.waveState = "clear";
      state.waveTimer = 1.8;
      addMoney(Math.floor(500 + Math.random() * 501));
      showToast(`Đợt ${state.wave} hoàn thành`);
      DeepwoodAudio.pickup();
    }
  }

  function updateMeteors(dt) {
    const level = state.skills.meteor;
    if (level > 0) {
      const cfg = METEOR_LEVELS[Math.min(level, METEOR_LEVELS.length) - 1];
      state.meteorTimer = Math.max(0, state.meteorTimer - dt);
      if (state.meteorTimer <= 0) {
        state.meteorTimer = cfg.cooldown;
        const alive = state.zombies.filter((zombie) => !zombie.dead);
        const p = state.player;

        for (let i = 0; i < cfg.count; i += 1) {
          let tx;
          let ty;
          if (alive.length > 0) {
            const target = alive[Math.floor(Math.random() * alive.length)];
            tx = target.x + rand(-24, 24);
            ty = target.y + rand(-18, 18);
          } else {
            const angle = rand(0, TAU);
            const radius = rand(140, 340);
            tx = p.x + Math.cos(angle) * radius;
            ty = p.y + Math.sin(angle) * radius;
          }

          state.meteors.push({
            startX: tx + rand(-150, 150),
            startY: ty - rand(430, 560),
            x: tx,
            y: ty,
            tx,
            ty,
            fall: 0,
            delay: rand(0.48, 0.72),
            radius: cfg.radius,
            damage: cfg.damage,
            burnDps: cfg.burnDps,
            burnTime: cfg.burnTime,
            impacted: false,
            impactLife: 0,
            seed: rand(0, 1000),
          });
        }
        DeepwoodAudio.firebomb();
      }
    }

    for (let i = state.meteors.length - 1; i >= 0; i -= 1) {
      const meteor = state.meteors[i];

      if (!meteor.impacted) {
        meteor.fall = Math.min(1, meteor.fall + dt / meteor.delay);
        meteor.x = meteor.startX + (meteor.tx - meteor.startX) * meteor.fall;
        meteor.y = meteor.startY + (meteor.ty - meteor.startY) * meteor.fall;

        if (meteor.fall >= 1) {
          meteor.impacted = true;
          meteor.x = meteor.tx;
          meteor.y = meteor.ty;
          state.blasts.push({
            x: meteor.tx,
            y: meteor.ty,
            life: 0,
            ttl: 0.55,
            radius: meteor.radius,
            tone: "255, 160, 70",
          });
          burst(meteor.tx, meteor.ty, 36, "255, 148, 62", 40, 260);
          burst(meteor.tx, meteor.ty, 18, "255, 232, 158", 20, 150);
          state.shake = Math.max(state.shake, 0.5);
          DeepwoodAudio.fireBurst();

          for (const zombie of state.zombies) {
            if (zombie.dead) continue;
            if (dist(zombie.x, zombie.y, meteor.tx, meteor.ty) <= meteor.radius + zombie.radius) {
              applyBurn(zombie, meteor.burnDps, meteor.burnTime);
              damageZombie(zombie, meteor.damage, {
                quiet: true,
                noBurn: true,
                tone: "255, 176, 90",
              });
            }
          }
          if (state.texts.length < 90) {
            floatText(meteor.tx, meteor.ty - 32, `-${meteor.damage}`, "255, 186, 110");
          }
        }
      } else {
        meteor.impactLife += dt;
        if (meteor.impactLife >= 0.6) state.meteors.splice(i, 1);
      }
    }
  }

  function updateHealing(dt) {
    if (state.skills.healing <= 0) {
      state.healingTimer = 0;
      return;
    }

    state.healingTimer += dt;
    while (state.healingTimer >= HEALING_REGEN_INTERVAL) {
      state.healingTimer -= HEALING_REGEN_INTERVAL;
      if (state.hp <= 0 || state.hp >= state.maxHp) continue;

      const level = Math.min(state.skills.healing, HEAL_LEVELS.length);
      const heal = Math.min(HEAL_LEVELS[level - 1], state.maxHp - state.hp);
      if (heal <= 0) continue;

      state.hp += heal;
      updateHealthHud();
      floatText(state.player.x, state.player.y - 42, `+${heal} HP`, "138, 255, 178");
      burst(state.player.x, state.player.y - 8, 8, "140, 255, 170", 20, 70);
    }
  }

  function updateBlasts(dt) {
    for (let i = state.blasts.length - 1; i >= 0; i -= 1) {
      const blast = state.blasts[i];
      blast.life += dt;
      if (blast.life >= blast.ttl) state.blasts.splice(i, 1);
    }
  }

  function update(dt) {
    state.elapsed += dt;

    const timeText = formatTime(state.elapsed);
    if (timeText !== state.timerText) {
      state.timerText = timeText;
      if (els.timer) els.timer.textContent = timeText;
    }

    state.invuln = Math.max(0, state.invuln - dt);
    state.hurtFlash = Math.max(0, state.hurtFlash - dt * 1.7);
    state.shake = Math.max(0, state.shake - dt * 1.8);

    state.shootCooldown -= dt;
    updatePlayer(dt);
    updateCamera(dt);
    updateZombies(dt);
    updatePoisonZones(dt);
    updateFirebombs(dt);
    updateFireZones(dt);
    updateSaws(dt);
    updateArmorRegen(dt);
    updateDoctorRegen(dt);
    updateHealing(dt);
    updateSlashes(dt);
    updateBurnEffects(dt);
    updateLightning(dt);
    updateMeteors(dt);
    updateBlasts(dt);
    updateTornado(dt);
    updateZombieProjectiles(dt);

    if (state.skills.firebomb > 0) {
      state.firebombTimer -= dt;
      if (state.firebombTimer <= 0) {
        const level = Math.min(state.skills.firebomb, FIREBOMB_LEVELS.length);
        throwFirebombs(level);
        state.firebombTimer = FIREBOMB_LEVELS[level - 1].cooldown;
      }
    }

    updateMines(dt);
    updateMineCollisions(dt);

    // Vũ trụ song song: đếm ngược thời gian tồn tại
    if (state.parallelUniverseActive) {
      state.parallelUniverseTimer = Math.max(0, state.parallelUniverseTimer - dt);
      if (state.parallelUniverseTimer <= 0) {
        state.parallelUniverseActive = false;
        state.parallelUniverseTimer = PARALLEL_UNIVERSE_COOLDOWN; // Hồi chiêu 3 phút
        showToast("Vũ trụ song song kết thúc");
      }
    } else if (state.parallelUniverseTimer > 0) {
      state.parallelUniverseTimer = Math.max(0, state.parallelUniverseTimer - dt);
    }

    updateXRay(dt);

    if (state.shootCooldown <= 0 && (state.autoAttack || state.pointerShoot)) {
        state.pointerShoot = false;
        tryAttack();
    }

    updateDarts(dt);
    updateGems(dt);
    updateParticles(dt);
    updateTexts(dt);

    updateWaves(dt);
    updateRemainingHud();

    if (state.choiceDelay > 0) {
      state.choiceDelay -= dt;
      if (state.choiceDelay <= 0) openSkillChoice();
    }
  }

  function pickSkillChoices() {
    const available = SKILLS.filter((skill) => state.skills[skill.id] < skill.max);
    const evolveable = SKILLS.filter(
      (skill) =>
        skill.evolve &&
        state.skills[skill.id] >= skill.max &&
        !state.evolved[skill.id]
    );
    const allAvailable = [...available, ...evolveable];
    if (allAvailable.length <= 3) return shuffle(allAvailable);

    const picked = [];
    let pool = allAvailable.slice();
    while (picked.length < 3 && pool.length > 0) {
      let totalWeight = 0;
      for (const skill of pool) {
        totalWeight += RARITY_TIERS[skill.rarity].weight;
      }
      let r = Math.random() * totalWeight;
      let selected = null;
      for (let i = 0; i < pool.length; i += 1) {
        r -= RARITY_TIERS[pool[i].rarity].weight;
        if (r <= 0) {
          selected = pool.splice(i, 1)[0];
          break;
        }
      }
      if (!selected) selected = pool.pop();
      picked.push(selected);
    }
    return picked;
  }

  function openSkillChoice() {
    if (state.choosing || state.over) return;
    state.choosing = true;
    state.choiceDelay = -1;
    state.keys.clear();
    state.pointer.active = false;
    state.cards = pickSkillChoices();

    if (state.cards.length === 0) {
      state.choosing = false;
      state.energy = 0;
      updateEnergyHud();
      showToast("Mọi kỹ năng đã đạt cấp tối đa");
      return;
    }

    renderSkillCards();
    updateEnergyHud();
    refreshRerollButton();
    if (els.skillLayer) els.skillLayer.hidden = false;
    DeepwoodAudio.reveal();
    window.requestAnimationFrame(() => {
      const first = els.skillCards ? els.skillCards.querySelector(".skill-card") : null;
      if (first) first.focus({ preventScroll: true });
    });
  }

  function refreshRerollButton() {
    if (!els.skillReroll) return;
    els.skillReroll.disabled = !state.choosing || state.money < REROLL_COST;
    els.skillReroll.setAttribute(
      "aria-label",
      `Đổi kỹ năng — tốn ${REROLL_COST} tiền`
    );
  }

  function rerollSkills() {
    if (!state.choosing || state.over) return;

    if (!spendMoney(REROLL_COST)) {
      DeepwoodAudio.back();
      showToast("Không đủ tiền để đổi kỹ năng");
      refreshRerollButton();
      return;
    }

    state.cards = pickSkillChoices();
    if (state.cards.length === 0) {
      state.choosing = false;
      state.energy = 0;
      if (els.skillLayer) els.skillLayer.hidden = true;
      updateEnergyHud();
      showToast("Mọi kỹ năng đã đạt cấp tối đa");
      return;
    }

    renderSkillCards();
    refreshRerollButton();
    DeepwoodAudio.pickup();
    showToast(`Đã đổi kỹ năng · -${REROLL_COST} tiền`);
  }

  function chooseSkill(id) {
    const definition = SKILLS.find((skill) => skill.id === id);
    if (!definition) return;
    if (!state.choosing) return;

    if (
      definition.evolve &&
      state.skills[definition.id] >= definition.max &&
      !state.evolved[definition.id]
    ) {
      state.evolved[definition.id] = true;
      state.levelUps += 1;
      state.energy = 0;
      state.energyMax = Math.min(
        ENERGY_CAP,
        Math.round(state.energyMax * ENERGY_GROWTH)
      );
      state.choosing = false;
      state.cards = [];
      if (els.skillLayer) els.skillLayer.hidden = true;
      refreshRerollButton();
      updateEnergyHud();
      showToast("Da tien hoa: " + definition.evolve.name);
      DeepwoodAudio.click();
      focusGame();
      return;
    }

    if (state.skills[definition.id] >= definition.max) return;

    if (definition.id === "health") {
      state.maxHp += 10;
      state.hp = Math.min(state.maxHp, state.hp + 10);
      updateHealthHud();
    }

    state.skills[definition.id] += 1;
    if (definition.id === "lifesteal") state.killsSinceHeal = 0;
    if (definition.id === "firebomb") {
      state.firebombTimer = Math.min(state.firebombTimer, 1.2);
    }
    if (definition.id === "healing") {
      state.healingTimer = 0;
    }
    if (definition.id === "meteor") {
      state.meteorTimer = Math.min(state.meteorTimer, 1.2);
    }
    state.levelUps += 1;
    state.energy = 0;
    state.energyMax = Math.min(
      ENERGY_CAP,
      Math.round(state.energyMax * ENERGY_GROWTH)
    );
    state.choosing = false;
    state.cards = [];
    if (els.skillLayer) els.skillLayer.hidden = true;
    refreshRerollButton();
    updateEnergyHud();
    showToast(`Đã học: ${definition.name} · Năng lượng tối đa ${state.energyMax}`);
    DeepwoodAudio.click();
    focusGame();
  }

  function loop(now) {
    if (!state.active) return;
    const t = now / 1000;
    const dt = state.last ? Math.min(0.05, Math.max(0.001, t - state.last)) : 0.016;
    state.last = t;

    if (!state.paused && !state.choosing && !state.over && !state.victory) {
      update(dt);
    }
    render(t);

    state.raf = window.requestAnimationFrame(loop);
  }

  const REROLL_COST = 10;

  if (els.skillReroll) {
    els.skillReroll.addEventListener("click", (event) => {
      event.preventDefault();
      rerollSkills();
    });
  }

  function drawGround(camX, camY) {
    if (!groundPattern) return;
    const tile = 640;
    const ox = -(((camX % tile) + tile) % tile);
    const oy = -(((camY % tile) + tile) % tile);

    ctx.save();
    ctx.translate(ox, oy);
    ctx.fillStyle = groundPattern;
    ctx.fillRect(0, 0, state.w + tile, state.h + tile);
    ctx.restore();
  }

  function drawProps(camX, camY) {
    if (!propSprites) return;
    const margin = 180;
    const startX = Math.floor((camX - margin) / CELL);
    const endX = Math.floor((camX + state.w + margin) / CELL);
    const startY = Math.floor((camY - margin) / CELL);
    const endY = Math.floor((camY + state.h + margin) / CELL);

    const visible = [];
    for (let cy = startY; cy <= endY; cy += 1) {
      for (let cx = startX; cx <= endX; cx += 1) {
        const props = getCellProps(cx, cy);
        for (const prop of props) visible.push(prop);
      }
    }
    visible.sort((a, b) => a.y - b.y);

    for (const prop of visible) {
      let sprite;
      if (prop.type === "tree") sprite = propSprites.trees[prop.variant];
      else if (prop.type === "bush") sprite = propSprites.bush;
      else if (prop.type === "rock") sprite = propSprites.rock;
      else sprite = propSprites.flower;

      const scale = prop.scale;
      ctx.drawImage(
        sprite.sprite,
        prop.x - sprite.ax * scale,
        prop.y - sprite.ay * scale,
        sprite.w * scale,
        sprite.h * scale
      );
    }
  }

  function drawRangeRing(t) {
    const p = state.player;
    ctx.save();
    ctx.strokeStyle = "rgba(232, 197, 71, 0.07)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 12]);
    ctx.lineDashOffset = -t * 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, DART_RANGE, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawReticle(t) {
    const target = nearestZombie(DART_RANGE);
    if (!target) return;

    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(t * 1.1);
    ctx.strokeStyle = "rgba(246, 218, 128, 0.65)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * TAU;
      ctx.beginPath();
      ctx.arc(0, 0, 27, angle, angle + 0.55);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(246, 218, 128, 0.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    for (const particle of state.particles) {
      const alpha = Math.max(0, 1 - particle.life / particle.ttl);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (0.4 + alpha), 0, TAU);
      ctx.fill();
    }
  }

  function drawTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 13px Inter, system-ui, sans-serif";
    for (const item of state.texts) {
      const alpha = Math.max(0, 1 - item.life / item.ttl);
      ctx.fillStyle = `rgba(${item.tone}, ${alpha})`;
      ctx.fillText(item.text, item.x, item.y);
    }
    ctx.restore();
  }

  function drawHurtOverlay(t) {
    const low = state.maxHp > 0 ? state.hp / state.maxHp : 0;
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);

    if (state.hurtFlash > 0 || (low <= 0.3 && !state.over)) {
      const strength = state.hurtFlash > 0
        ? Math.min(0.6, state.hurtFlash) * 0.55
        : 0.1 + pulse * 0.09;
      const cx = state.w / 2;
      const cy = state.h / 2;
      const grad = ctx.createRadialGradient(
        cx, cy, Math.min(state.w, state.h) * 0.22,
        cx, cy, Math.max(state.w, state.h) * 0.72
      );
      grad.addColorStop(0, `rgba(150, 20, 16, ${strength * 0.22})`);
      grad.addColorStop(1, `rgba(160, 18, 14, ${strength})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, state.w, state.h);
    }
  }

  function drawDayLight(t) {
    ctx.save();
    const haze = ctx.createLinearGradient(0, 0, 0, state.h);
    haze.addColorStop(0, "rgba(255, 238, 176, 0.13)");
    haze.addColorStop(0.45, "rgba(255, 226, 140, 0.045)");
    haze.addColorStop(1, "rgba(70, 118, 58, 0.10)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i += 1) {
      const x = state.w * (0.2 + i * 0.31) + Math.sin(t * 0.12 + i * 2.1) * 90;
      const y = state.h * (0.18 + i * 0.16) + Math.cos(t * 0.09 + i) * 50;
      const radius = Math.max(state.w, state.h) * (0.24 + i * 0.035);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, "rgba(255, 242, 180, 0.075)");
      glow.addColorStop(1, "rgba(255, 242, 180, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMoonLight(t) {
    ctx.save();
    const tint = ctx.createLinearGradient(0, 0, 0, state.h);
    tint.addColorStop(0, "rgba(38, 82, 156, 0.34)");
    tint.addColorStop(0.55, "rgba(24, 56, 116, 0.24)");
    tint.addColorStop(1, "rgba(12, 30, 70, 0.34)");
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.globalCompositeOperation = "lighter";
    const x = state.w * 0.72;
    const y = state.h * 0.12;
    const radius = Math.max(state.w, state.h) * 0.62;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, "rgba(148, 196, 255, 0.16)");
    glow.addColorStop(0.45, "rgba(110, 160, 235, 0.07)");
    glow.addColorStop(1, "rgba(90, 130, 210, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 3; i += 1) {
      const mx = state.w * (0.18 + i * 0.31) + Math.sin(t * 0.09 + i * 2.4) * 110;
      const my = state.h * (0.2 + i * 0.19) + Math.cos(t * 0.07 + i) * 60;
      const mistRadius = Math.max(state.w, state.h) * (0.2 + i * 0.04);
      const mist = ctx.createRadialGradient(mx, my, 0, mx, my, mistRadius);
      mist.addColorStop(0, "rgba(176, 212, 255, 0.05)");
      mist.addColorStop(1, "rgba(176, 212, 255, 0)");
      ctx.fillStyle = mist;
      ctx.beginPath();
      ctx.arc(mx, my, mistRadius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function render(t) {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.clearRect(0, 0, state.w, state.h);

    const shakeAmp = state.shake * 10;
    const shakeX = (Math.random() * 2 - 1) * shakeAmp;
    const shakeY = (Math.random() * 2 - 1) * shakeAmp;
    const camX = state.camera.x + shakeX;
    const camY = state.camera.y + shakeY;

    drawGround(camX, camY);

    ctx.save();
    ctx.translate(-camX, -camY);

    drawRangeRing(t);
    drawProps(camX, camY);
    drawPoisonZones(t);
    drawFireZones(t);
    drawBombs(t);
    drawBlasts();
    drawMines(t);
    drawXRay();

    for (const gem of state.gems) drawGem(gem, t);

    const actors = state.zombies.filter((zombie) => !zombie.dead);
    actors.push({ isPlayer: true, y: state.player.y });
    actors.sort((a, b) => a.y - b.y);
    for (const actor of actors) {
      if (actor.isPlayer) drawPlayer(t);
      else drawZombie(actor, t);
    }

    drawSaws(t);
    for (const dart of state.darts) drawDart(dart);
    drawSlashes(t);
    drawLightning(t);
    drawMeteors(t);
    drawZombieProjectiles(t);
    drawParticles();
    drawTexts();
    drawReticle(t);

    ctx.restore();

    if (state.mapType === "day") drawDayLight(t);
    else if (state.mapType === "moon") drawMoonLight(t);
    drawHurtOverlay(t);

    if (state.lightningFlash > 0) {
      ctx.fillStyle = `rgba(176, 214, 255, ${state.lightningFlash * 0.30})`;
      ctx.fillRect(0, 0, state.w, state.h);
    }
  }

  function drawPoisonZones(t) {
    for (const zone of state.poisonZones) {
      const fadeIn = clamp(zone.life / 0.4, 0, 1);
      const fadeOut = clamp((zone.ttl - zone.life) / 1.1, 0, 1);
      const alpha = Math.min(fadeIn, fadeOut);
      if (alpha <= 0) continue;

      const pulse = 0.5 + 0.5 * Math.sin(t * 3.1 + zone.phase);
      const radius = zone.radius;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(zone.x, zone.y);

      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
      grad.addColorStop(0, `rgba(142, 235, 82, ${0.28 + pulse * 0.08})`);
      grad.addColorStop(0.52, "rgba(98, 184, 54, 0.16)");
      grad.addColorStop(0.84, "rgba(154, 220, 60, 0.08)");
      grad.addColorStop(1, "rgba(42, 92, 32, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.72, 0, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = `rgba(186, 255, 102, ${0.22 + pulse * 0.2})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 9]);
      ctx.lineDashOffset = -t * 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.94, radius * 0.68, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 7; i += 1) {
        const seed = i * 1.7 + zone.phase;
        const bx = Math.sin(seed * 3.7) * radius * 0.6;
        const by = Math.cos(seed * 2.3) * radius * 0.4;
        const rise = (t * 0.32 + i * 0.17) % 1;
        const size = 1.2 + (i % 3) * 0.7;
        ctx.globalAlpha = alpha * (0.12 + (1 - rise) * 0.42);
        ctx.fillStyle = i % 2 ? "rgba(198, 255, 112, 0.62)" : "rgba(102, 212, 82, 0.54)";
        circleIn(ctx, bx, by - rise * 10, size * (1 - rise * 0.4));
      }

      ctx.restore();
    }
  }

  function drawFireZones(t) {
    for (const zone of state.fireZones) {
      const fadeIn = clamp(zone.life / 0.35, 0, 1);
      const fadeOut = clamp((zone.ttl - zone.life) / 0.9, 0, 1);
      const alpha = Math.min(fadeIn, fadeOut);
      if (alpha <= 0) continue;

      const pulse = 0.5 + 0.5 * Math.sin(t * 5.2 + zone.phase);
      const radius = zone.radius;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(zone.x, zone.y);

      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
      grad.addColorStop(0, `rgba(255, 196, 82, ${0.34 + pulse * 0.1})`);
      grad.addColorStop(0.42, "rgba(255, 122, 42, 0.2)");
      grad.addColorStop(0.78, "rgba(208, 58, 24, 0.1)");
      grad.addColorStop(1, "rgba(90, 22, 12, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.72, 0, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 176, 76, ${0.3 + pulse * 0.24})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 8]);
      ctx.lineDashOffset = t * 22;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.96, radius * 0.69, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 11; i += 1) {
        const seed = i * 1.93 + zone.phase;
        const bx = Math.sin(seed * 3.1) * radius * 0.62;
        const by = Math.cos(seed * 2.7) * radius * 0.42;
        const rise = (t * 0.52 + i * 0.13) % 1;
        const size = 1.2 + (i % 4) * 0.65;
        ctx.globalAlpha = alpha * (0.12 + (1 - rise) * 0.5);
        ctx.fillStyle = i % 3 === 0
          ? "rgba(255, 232, 150, 0.85)"
          : i % 2
            ? "rgba(255, 142, 54, 0.8)"
            : "rgba(232, 74, 38, 0.7)";
        circleIn(ctx, bx, by - rise * 13, size * (1 - rise * 0.35));
      }

      ctx.restore();
    }
  }

  function drawBombs(t) {
    for (const bomb of state.bombs) {
      const k = clamp(bomb.t / bomb.duration, 0, 1);
      const spin = t * bomb.spin;
      const glow = 0.65 + 0.35 * Math.sin(t * 12 + bomb.spin);

      ctx.save();
      ctx.globalAlpha = 0.9;

      const aura = ctx.createRadialGradient(bomb.x, bomb.y, 1, bomb.x, bomb.y, 17);
      aura.addColorStop(0, `rgba(255, 190, 92, ${0.42 * glow})`);
      aura.addColorStop(1, "rgba(255, 96, 36, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(bomb.x, bomb.y, 17, 0, TAU);
      ctx.fill();

      ctx.translate(bomb.x, bomb.y);
      ctx.rotate(spin);

      const body = ctx.createLinearGradient(-7, -8, 7, 8);
      body.addColorStop(0, "#5d665e");
      body.addColorStop(0.55, "#2c352f");
      body.addColorStop(1, "#141b16");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, 0, 7.2, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(210, 226, 208, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 7.2, Math.PI * 1.05, Math.PI * 1.85);
      ctx.stroke();

      ctx.fillStyle = "#6f4b2a";
      ctx.fillRect(-1.4, -11.4, 2.8, 4.2);
      ctx.fillStyle = "#ffd27a";
      circleIn(ctx, 0, -12.2, 2.1);
      ctx.fillStyle = "#fff3c8";
      circleIn(ctx, 0, -12.8, 1);

      ctx.rotate(-spin);

      if (k > 0.12) {
        for (let i = 1; i <= 3; i += 1) {
          const trail = Math.max(0, k - i * 0.06);
          const tx = bomb.sx + (bomb.tx - bomb.sx) * trail;
          const ty = bomb.sy + (bomb.ty - bomb.sy) * trail - Math.sin(trail * Math.PI) * bomb.arc;
          ctx.globalAlpha = 0.24 * (1 - i / 4);
          ctx.fillStyle = "#ff9a46";
          circleIn(ctx, tx - bomb.x, ty - bomb.y, 2.4 - i * 0.5);
        }
      }

      ctx.restore();
    }
  }

  function drawSaws(t) {
    const level = state.skills.saw;
    if (!level) return;

    const cfg = SAW_LEVELS[Math.min(level, SAW_LEVELS.length) - 1];
    const p = state.player;

    for (let i = 0; i < cfg.count; i += 1) {
      const angle = state.sawAngle + (i / cfg.count) * TAU;
      const sx = p.x + Math.cos(angle) * cfg.radius;
      const sy = p.y + Math.sin(angle) * cfg.radius;
      const size = cfg.size;

      ctx.save();
      ctx.translate(sx, sy);

      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 2.1);
      aura.addColorStop(0, "rgba(224, 244, 255, 0.2)");
      aura.addColorStop(1, "rgba(130, 190, 220, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2.1, 0, TAU);
      ctx.fill();

      ctx.rotate(t * (8.5 + level * 1.8) + i * 1.37);

      ctx.fillStyle = "#b9c8d2";
      for (let j = 0; j < 8; j += 1) {
        const tooth = (j / 8) * TAU;
        ctx.save();
        ctx.rotate(tooth);
        ctx.beginPath();
        ctx.moveTo(size * 0.72, -size * 0.2);
        ctx.lineTo(size * 1.24, 0);
        ctx.lineTo(size * 0.72, size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      const blade = ctx.createLinearGradient(-size, -size, size, size);
      blade.addColorStop(0, "#eef5f8");
      blade.addColorStop(0.5, "#9cacb8");
      blade.addColorStop(1, "#596871");
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.82, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(245, 251, 255, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.58, 0, TAU);
      ctx.stroke();

      ctx.fillStyle = "#33424a";
      circleIn(ctx, 0, 0, size * 0.3);
      ctx.fillStyle = "#d7a63f";
      circleIn(ctx, 0, 0, size * 0.13);

      ctx.restore();
    }
  }

  function drawSlashes(t) {
    for (const slash of state.slashes) {
      const k = clamp(slash.life / slash.ttl, 0, 1);
      const alpha = 1 - k;

      ctx.save();
      ctx.translate(slash.x, slash.y);
      ctx.rotate(slash.angle);
      ctx.strokeStyle = `rgba(255, 246, 206, ${alpha * 0.92})`;
      ctx.lineWidth = 4.6 * (1 - k * 0.45);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, 54, -0.98, 0.98);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.48})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 46, -0.88, 0.88);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawLightning(t) {
    for (const strike of state.lightningStrikes) {
      const k = clamp(strike.life / strike.ttl, 0, 1);
      const alpha = Math.pow(Math.max(0, Math.sin(k * Math.PI)), 0.62);
      if (alpha <= 0.01) continue;

      const seed = strike.seed || 0;
      const H = 620;

      ctx.save();
      ctx.translate(strike.x, strike.y);
      ctx.globalCompositeOperation = "lighter";

      // Cột sáng mờ từ trời xuống
      const beam = ctx.createLinearGradient(0, -H, 0, 10);
      beam.addColorStop(0, "rgba(140, 190, 255, 0)");
      beam.addColorStop(0.55, `rgba(160, 205, 255, ${alpha * 0.10})`);
      beam.addColorStop(1, `rgba(210, 236, 255, ${alpha * 0.20})`);
      ctx.fillStyle = beam;
      ctx.fillRect(-22, -H, 44, H + 16);

      // Quầng sáng va chạm mặt đất
      const impact = ctx.createRadialGradient(0, 6, 2, 0, 6, 74);
      impact.addColorStop(0, `rgba(235, 248, 255, ${alpha * 0.72})`);
      impact.addColorStop(0.28, `rgba(150, 205, 255, ${alpha * 0.34})`);
      impact.addColorStop(1, "rgba(90, 150, 255, 0)");
      ctx.fillStyle = impact;
      ctx.beginPath();
      ctx.ellipse(0, 6, 74, 28, 0, 0, TAU);
      ctx.fill();

      // Tia sét chính, giật zic-zac từ trên trời xuống
      const points = [];
      const segments = 18;
      for (let i = 0; i <= segments; i += 1) {
        const p = i / segments;
        const y = -H + p * H;
        const wiggle = Math.sin(seed * 0.013 + i * 2.37 + t * 26) * (9 + p * 10);
        const jitter = (Math.random() - 0.5) * (4 + p * 9);
        const x = i === 0 || i === segments ? 0 : wiggle + jitter;
        points.push({ x, y });
      }

      // Viền xanh
      ctx.strokeStyle = `rgba(120, 186, 255, ${alpha * 0.75})`;
      ctx.lineWidth = 9 * (1 - k * 0.45);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      // Lõi trắng
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.96})`;
      ctx.lineWidth = 3.2 * (1 - k * 0.4);
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      // Nhánh sét phụ
      for (let b = 0; b < 3; b += 1) {
        const start = 4 + Math.floor(Math.random() * 9);
        const origin = points[start];
        if (!origin) continue;
        const dir = Math.random() < 0.5 ? -1 : 1;
        let bx = origin.x;
        let by = origin.y;
        ctx.strokeStyle = `rgba(198, 230, 255, ${alpha * 0.55})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        for (let s = 0; s < 4; s += 1) {
          bx += dir * (6 + Math.random() * 14);
          by += 24 + Math.random() * 22;
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }

      // Vòng xung kích mặt đất
      const ring = 10 + k * 58;
      ctx.strokeStyle = `rgba(190, 226, 255, ${alpha * 0.55})`;
      ctx.lineWidth = 2.4 * (1 - k);
      ctx.beginPath();
      ctx.ellipse(0, 6, ring, ring * 0.36, 0, 0, TAU);
      ctx.stroke();

      // Đốm lửa điện nhỏ
      for (let s = 0; s < 6; s += 1) {
        const angle = Math.random() * TAU;
        const distance = 14 + Math.random() * 38;
        ctx.fillStyle = `rgba(235, 248, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * distance, 4 + Math.sin(angle) * distance * 0.4, 1.4, 0, TAU);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawMeteors(t) {
    for (const meteor of state.meteors) {
      const k = clamp(meteor.fall || 0, 0, 1);

      if (!meteor.impacted) {
        ctx.save();
        ctx.translate(meteor.tx, meteor.ty);
        ctx.strokeStyle = `rgba(255, 168, 80, ${0.2 + k * 0.5})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([9, 9]);
        ctx.lineDashOffset = -t * 26;
        ctx.beginPath();
        ctx.ellipse(0, 0, meteor.radius * 0.82, meteor.radius * 0.34, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255, 120, 40, ${0.05 + k * 0.12})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, meteor.radius * 0.82, meteor.radius * 0.34, 0, 0, TAU);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(meteor.x, meteor.y);
        ctx.globalCompositeOperation = "lighter";

        const trail = ctx.createLinearGradient(0, -130, 0, 12);
        trail.addColorStop(0, "rgba(255, 120, 32, 0)");
        trail.addColorStop(0.55, "rgba(255, 138, 44, 0.28)");
        trail.addColorStop(1, "rgba(255, 220, 150, 0.72)");
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.moveTo(-15, 2);
        ctx.quadraticCurveTo(-6, -70, -2, -132);
        ctx.lineTo(4, -132);
        ctx.quadraticCurveTo(9, -68, 15, 2);
        ctx.closePath();
        ctx.fill();

        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
        glow.addColorStop(0, "rgba(255, 246, 200, 0.95)");
        glow.addColorStop(0.32, "rgba(255, 164, 62, 0.65)");
        glow.addColorStop(1, "rgba(255, 90, 20, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, TAU);
        ctx.fill();

        ctx.fillStyle = "#4a2c1e";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#ffb35a";
        ctx.beginPath();
        ctx.arc(-2.4, -2.2, 4.2, 0, TAU);
        ctx.fill();

        ctx.restore();
      }
    }
  }

  function drawBlasts() {
    for (const blast of state.blasts) {
      const k = clamp(blast.life / blast.ttl, 0, 1);
      const alpha = Math.max(0, 1 - k);
      const radius = blast.radius * (0.3 + k * 0.82);
      if (alpha <= 0.01) continue;

      ctx.save();
      ctx.translate(blast.x, blast.y);

      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
      glow.addColorStop(0, `rgba(${blast.tone}, ${alpha * 0.42})`);
      glow.addColorStop(0.6, `rgba(${blast.tone}, ${alpha * 0.18})`);
      glow.addColorStop(1, `rgba(${blast.tone}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.58, 0, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = `rgba(${blast.tone}, ${alpha * 0.8})`;
      ctx.lineWidth = 2.6 * alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.58, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawMines(t) {
    for (const mine of state.mines) {
      const armed = mine.armed;
      const pulse = 0.5 + 0.5 * Math.sin(t * (armed ? 8 : 3));
      const flash = armed ? 1 : 0.4 + pulse * 0.3;

      ctx.save();
      ctx.translate(mine.x, mine.y);

      // Mine body (dark sphere)
      ctx.fillStyle = armed ? "#2d2d2d" : "#1a1a1a";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, TAU);
      ctx.fill();

      // Trigger button (red when armed, gray when not)
      ctx.fillStyle = armed ? "#ff4444" : "#666666";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, TAU);
      ctx.fill();

      // Warning pulse ring when armed
      if (armed) {
        const ringRadius = 8 + pulse * 10;
        const ringAlpha = Math.max(0, 1 - pulse) * 0.5;
        ctx.strokeStyle = `rgba(255, 68, 68, ${ringAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, TAU);
        ctx.stroke();

        // Inner glow
        ctx.fillStyle = `rgba(255, 100, 50, ${0.3 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, 4 + pulse * 2, 0, TAU);
        ctx.fill();
      }

      // Armed indicator (blinking red light)
      if (armed && Math.sin(t * 10) > 0) {
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(0, -2, 1.5, 0, TAU);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawXRay() {
    try {
      if (!ctx || !state.skills || state.skills.xRay <= 0) return;
      if (state.xRayLaserTimer > 1.4 || state.xRayLaserTimer <= 0) return;
      if (!state.player || typeof state.player.x !== 'number' || typeof state.player.y !== 'number') return;

      const p = state.player;
      const target = nearestZombie(500);
      if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') return;

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const angle = Math.atan2(dy, dx);
      if (!isFinite(angle)) return;

      const range = 500;
      const k = 1 - (state.xRayLaserTimer / 1.5);
      const alpha = Math.max(0, Math.min(1, 1 - k * 2));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);

      // Laser beam
      const grad = ctx.createLinearGradient(0, 0, range, 0);
      grad.addColorStop(0, "rgba(180, 100, 255, " + alpha * 0.9 + ")");
      grad.addColorStop(0.5, "rgba(220, 140, 255, " + alpha * 0.6 + ")");
      grad.addColorStop(1, "rgba(180, 100, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.lineTo(range, 8);
      ctx.lineTo(range, -8);
      ctx.lineTo(-4, -2);
      ctx.closePath();
      ctx.fill();

      // Core beam
      ctx.fillStyle = "rgba(255, 255, 255, " + alpha * 0.5 + ")";
      ctx.beginPath();
      ctx.moveTo(-1.5, 1);
      ctx.lineTo(range * 0.9, 1.5);
      ctx.lineTo(range * 0.9, -1.5);
      ctx.lineTo(-1.5, -1);
      ctx.closePath();
      ctx.fill();

      // End flash
      const pulse = typeof t === 'number' ? Math.sin(t * 20) : 0;
      ctx.fillStyle = "rgba(220, 140, 255, " + alpha * 0.8 + ")";
      ctx.beginPath();
      ctx.arc(range, 0, 8 + pulse * 2, 0, TAU);
      ctx.fill();

      ctx.restore();
    } catch (e) {
      // Prevent X-ray draw from freezing the game
      try { ctx.restore(); } catch (e2) { /* ignore */ }
    }
  }

  function drawZombieProjectiles(t) {
    for (const pr of state.zombieProjectiles) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      ctx.rotate(Math.atan2(pr.vy, pr.vx));
      ctx.strokeStyle = pr.kind === "arrow" ? "#d8f7ff" : "#e3c282";
      ctx.lineWidth = pr.kind === "arrow" ? 1.7 : 2.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(pr.kind === "arrow" ? -9 : -13, 0);
      ctx.stroke();
      if (pr.kind === "arrow") {
        ctx.fillStyle = "#d8f7ff";
        ctx.beginPath();
        ctx.moveTo(-9, -1.6);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-9, 1.6);
        ctx.fill();
      } else {
        ctx.fillStyle = "#a4723c";
        ctx.beginPath();
        ctx.moveTo(-13, -2);
        ctx.lineTo(-19, 0);
        ctx.lineTo(-13, 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawZombie(zombie, t) {
    if (zombie.dead) return;
    const spawn = Math.min(1, zombie.spawn);
    if (spawn <= 0) return;

    const bob = Math.sin(t * 2.4 + zombie.phase) * 1.3;
    const flash = zombie.hitFlash;
    const lunge = zombie.attackAnim * 6;
    const isWarrior = zombie.type === "warrior";
    const isRunner = zombie.type === "runner";
    const isPoison = zombie.type === "poison";
    const isArcher = zombie.type === "archer";
    const isSpear = zombie.type === "spear";
    const isShield = zombie.type === "shield";
    const isCrawler = zombie.type === "crawler";
    const isBerserker = zombie.type === "berserker";
    const isSummoner = zombie.type === "summoner";
    const isBurrower = zombie.type === "burrower";
    const isHowler = zombie.type === "howler";
    const isBoss = zombie.type === "boss";
    const isMutant = zombie.type === "mutant";
    const isExploder = zombie.type === "exploder";
    const bodySize = zombie.radius / 17;
    const faceX = Math.cos(zombie.face);
    const faceY = Math.sin(zombie.face);
    const away = faceY < -0.42;
    const stride = Math.sin(t * 5.2 + zombie.phase) * 2.6;
    const lean = faceX * 1.4;

    ctx.save();
    ctx.globalAlpha = spawn;
    ctx.translate(zombie.x, zombie.y + bob);

    ctx.fillStyle = "rgba(1, 5, 3, 0.42)";
    ctx.beginPath();
    ctx.ellipse(2, 16 * bodySize, 15 * bodySize, 5.5 * bodySize, 0, 0, TAU);
    ctx.fill();

    const scale = (0.55 + 0.45 * spawn) * bodySize;
    ctx.scale(scale, scale);

    if (isPoison) {
      const aura = ctx.createRadialGradient(0, -2, 2, 0, -2, 27);
      aura.addColorStop(0, "rgba(166, 244, 82, 0.17)");
      aura.addColorStop(1, "rgba(92, 160, 40, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -2, 27, 0, TAU);
      ctx.fill();
    }

    if (isBerserker && zombie.berserk) {
      const rage = 0.15 + 0.1 * Math.sin(t * 7);
      const aura = ctx.createRadialGradient(0, -2, 2, 0, -2, 32 + rage * 8);
      aura.addColorStop(0, "rgba(255, 60, 40, 0.4)");
      aura.addColorStop(1, "rgba(130, 20, 20, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -2, 32 + rage * 8, 0, TAU);
      ctx.fill();
    }

    if (isSummoner) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      const aura = ctx.createRadialGradient(0, 2, 2, 0, 2, 22 + pulse * 4);
      aura.addColorStop(0, "rgba(216, 138, 255, 0.25)");
      aura.addColorStop(1, "rgba(120, 60, 180, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 2, 22 + pulse * 4, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(216, 138, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -t * 20;
      ctx.beginPath();
      ctx.arc(0, 2, 20 + pulse * 3, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isBurrower && zombie.burrowState === "warning") {
      const pulse = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.strokeStyle = `rgba(255, 80, 60, ${0.5 + pulse * 0.3})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isBoss) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2 + zombie.phase);
      const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 44 + pulse * 8);
      aura.addColorStop(0, "rgba(255, 82, 58, 0.34)");
      aura.addColorStop(0.55, "rgba(180, 30, 24, 0.18)");
      aura.addColorStop(1, "rgba(120, 12, 10, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 44 + pulse * 8, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 118, 82, ${0.26 + pulse * 0.18})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -t * 18;
      ctx.beginPath();
      ctx.arc(0, 2, 34 + pulse * 4, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isMutant) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4.4 + zombie.phase);
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 27 + pulse * 5);
      aura.addColorStop(0, "rgba(150, 255, 110, 0.24)");
      aura.addColorStop(0.6, "rgba(90, 210, 80, 0.12)");
      aura.addColorStop(1, "rgba(50, 140, 50, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 27 + pulse * 5, 0, TAU);
      ctx.fill();
    }

    if (isExploder) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 7 + zombie.phase);
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 23 + pulse * 4);
      aura.addColorStop(0, `rgba(255, 168, 64, ${0.24 + pulse * 0.18})`);
      aura.addColorStop(1, "rgba(220, 70, 20, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 23 + pulse * 4, 0, TAU);
      ctx.fill();
    }

    if (isBurrower && zombie.burrowState === "burrowed") {
      ctx.fillStyle = "rgba(100, 90, 70, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 6, 14, 6, 0, 0, TAU);
      ctx.fill();
    }

    if (isHowler && zombie.howlActive > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);
      const rings = 3;
      for (let r = 1; r <= rings; r += 1) {
        const radius = 40 + r * 25 + pulse * 20;
        const alpha = Math.max(0, 1 - zombie.howlActive / 6) * (0.3 - r * 0.08);
        if (alpha <= 0) continue;
        ctx.strokeStyle = `rgba(255, 106, 138, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.stroke();
      }
    }

    let bodyColor = "#2f5b3d";
    let patchColor = "#24432e";
    let armColor = "#4d7654";
    let headColor = "#739d75";
    let eyeColor = "#ffc06b";
    let legColor = "#172a1c";
    let clawColor = "#8fb98e";

    if (isRunner) {
      bodyColor = "#326b58";
      patchColor = "#204a3d";
      armColor = "#5c9a80";
      headColor = "#8fc4a9";
      eyeColor = "#d8ff9a";
      legColor = "#153028";
      clawColor = "#b6f0d6";
    } else if (isWarrior) {
      bodyColor = "#465341";
      patchColor = "#2c382b";
      armColor = "#6d7a63";
      headColor = "#93a184";
      eyeColor = "#ff7b5e";
      legColor = "#1c241c";
      clawColor = "#b8c4ab";
    } else if (isPoison) {
      bodyColor = "#4c5f2b";
      patchColor = "#37471f";
      armColor = "#789347";
      headColor = "#9db064";
      eyeColor = "#c9ff66";
      legColor = "#23301a";
      clawColor = "#c2e87e";
    } else if (isArcher) {
      bodyColor = "#5d4a3a";
      patchColor = "#3e2f26";
      armColor = "#8b6f60";
      headColor = "#a88b7a";
      eyeColor = "#ffd58a";
      legColor = "#2b1d18";
      clawColor = "#e3c282";
    } else if (isSpear) {
      bodyColor = "#5a453a";
      patchColor = "#3c2c24";
      armColor = "#7d6555";
      headColor = "#9a7e6e";
      eyeColor = "#ffa372";
      legColor = "#271814";
      clawColor = "#c9a23c";
    } else if (isShield) {
      bodyColor = "#44544c";
      patchColor = "#2d3d34";
      armColor = "#6a806e";
      headColor = "#8aa094";
      eyeColor = "#8fd8c8";
      legColor = "#1f2b24";
      clawColor = "#78b39d";
    } else if (isCrawler) {
      bodyColor = "#3d3d3d";
      patchColor = "#2a2a2a";
      armColor = "#5a5a5a";
      headColor = "#7a7a7a";
      eyeColor = "#ff5a5a";
      legColor = "#1a1a1a";
      clawColor = "#c9a23c";
    } else if (isSummoner) {
      bodyColor = "#4a3d4a";
      patchColor = "#2d252d";
      armColor = "#6a5a6a";
      headColor = "#8a7a8a";
      eyeColor = "#d88aff";
      legColor = "#1a141a";
      clawColor = "#c9a23c";
    } else if (isBurrower) {
      bodyColor = "#4a443a";
      patchColor = "#2d2a20";
      armColor = "#6a6252";
      headColor = "#8a806a";
      eyeColor = "#d8c88a";
      legColor = "#1a1814";
      clawColor = "#c9b36a";
    } else if (isHowler) {
      bodyColor = "#4a3a4a";
      patchColor = "#2d252d";
      armColor = "#6a5a6a";
      headColor = "#8a7a8a";
      eyeColor = "#ff6a8a";
      legColor = "#1a141a";
      clawColor = "#ff8aa2";
    } else if (isBoss) {
      bodyColor = "#5c2f28";
      patchColor = "#3c1c18";
      armColor = "#8a4a3e";
      headColor = "#a76a58";
      eyeColor = "#ffdc6a";
      legColor = "#2a1210";
      clawColor = "#e0b36a";
    } else if (isMutant) {
      bodyColor = "#405f34";
      patchColor = "#2c4526";
      armColor = "#6d8f4e";
      headColor = "#9ab86a";
      eyeColor = "#c8ff62";
      legColor = "#20301c";
      clawColor = "#d2f08a";
    } else if (isExploder) {
      bodyColor = "#5d4436";
      patchColor = "#402c22";
      armColor = "#8a6448";
      headColor = "#a3805e";
      eyeColor = "#ff9a4a";
      legColor = "#2b1c14";
      clawColor = "#ffc27a";
    }

    ctx.strokeStyle = legColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    const crawlerLegY = isCrawler ? 9 : 6;
    const crawlerLegEndY = isCrawler ? 12 : 14;
    ctx.moveTo(-3.8, crawlerLegY);
    ctx.lineTo(-3.8 + stride * (isCrawler ? 0.8 : 0.55), crawlerLegEndY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3.8, crawlerLegY);
    ctx.lineTo(3.8 - stride * (isCrawler ? 0.8 : 0.55), crawlerLegEndY);
    ctx.stroke();

    ctx.fillStyle = legColor;
    ctx.beginPath();
    ctx.ellipse(-3.8 + stride * (isCrawler ? 0.8 : 0.55), crawlerLegEndY + 1, 3, 1.8, 0.1, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3.8 - stride * (isCrawler ? 0.8 : 0.55), crawlerLegEndY + 1, 3, 1.8, -0.1, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(lean, 0);

    ctx.fillStyle = flash > 0.2 ? "#e6ffe9" : bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, isCrawler ? -0.4 : 1, isCrawler ? 11 : 8.6, isCrawler ? 6 : 11.2, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = flash > 0.2 ? "#a9d7b1" : patchColor;
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.lineTo(8, -3);
    ctx.lineTo(6.5, 7);
    ctx.lineTo(-6.5, 6);
    ctx.closePath();
    ctx.fill();

    // Hiệu ứng đóng băng khi bị băng giá
    if (zombie.freezeTimer > 0) {
      const frostPulse = 0.5 + 0.5 * Math.sin(t * 10);
      ctx.save();
      ctx.globalAlpha = 0.5 + frostPulse * 0.3;
      ctx.strokeStyle = "rgba(170, 226, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 9, 0, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(170, 226, 255, 0.15)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 9, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(220, 245, 255, 0.7)";
      circleIn(ctx, -3, -2.5, 1.4);
      circleIn(ctx, 2.5, -1.5, 1.1);
      circleIn(ctx, 0, 2, 1);
      ctx.restore();
    }

    if (isWarrior) {
      ctx.fillStyle = flash > 0.2 ? "#d8e0d2" : "#5c665a";
      circleIn(ctx, -7.4, -4.2, 3.8);
      circleIn(ctx, 7.4, -4.2, 3.8);
      ctx.fillStyle = "#39443a";
      circleIn(ctx, -7.4, -4.2, 1.4);
      circleIn(ctx, 7.4, -4.2, 1.4);
      ctx.strokeStyle = "rgba(190, 200, 180, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();
    }

    if (isRunner) {
      ctx.strokeStyle = "rgba(150, 230, 195, 0.28)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-13 - i * 3, 4 + i * 4);
        ctx.lineTo(-22 - i * 4, 8 + i * 4);
        ctx.stroke();
      }
    }

    if (isPoison) {
      ctx.fillStyle = "rgba(198, 255, 110, 0.4)";
      circleIn(ctx, -4.4, -3.2, 1.3);
      circleIn(ctx, 3.8, 2.4, 1);
      circleIn(ctx, -1.6, 5.4, 0.9);
      ctx.strokeStyle = "rgba(202, 255, 126, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 1, 6.2, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
    }

    if (isMutant) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 5 + zombie.phase);
      ctx.fillStyle = `rgba(176, 255, 116, ${0.34 + pulse * 0.26})`;
      circleIn(ctx, -4.6, -3.6, 1.8);
      circleIn(ctx, 4.2, 1.6, 2.2);
      circleIn(ctx, -1.4, 5.8, 1.4);
      circleIn(ctx, 5.8, -5.2, 1.3);
      ctx.strokeStyle = "rgba(132, 220, 92, 0.42)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-6.6, 0.5);
      ctx.quadraticCurveTo(-2, 3.4, 2.6, 0.9);
      ctx.stroke();
    }

    if (isExploder) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 7.5 + zombie.phase);
      ctx.strokeStyle = `rgba(255, 154, 62, ${0.4 + pulse * 0.35})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-6.8, -3.4);
      ctx.lineTo(-2.4, -1);
      ctx.lineTo(-4.2, 2.8);
      ctx.moveTo(3.2, -4.6);
      ctx.lineTo(5.8, -0.6);
      ctx.lineTo(2.4, 2.6);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 198, 102, ${0.5 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(0.6, 0.8, 3.4 + pulse * 1.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 246, 206, ${0.6 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(0.6, 0.8, 1.4, 0, TAU);
      ctx.fill();
    }

    if (isBoss) {
      ctx.fillStyle = flash > 0.2 ? "#f0d8c4" : "#3f201b";
      ctx.beginPath();
      ctx.moveTo(-9, -6);
      ctx.lineTo(-4, -2);
      ctx.lineTo(0, -6.5);
      ctx.lineTo(4, -2);
      ctx.lineTo(9, -6);
      ctx.lineTo(7, 5);
      ctx.lineTo(0, 8);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 198, 120, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5.4, 1.2);
      ctx.lineTo(5.4, 1.2);
      ctx.moveTo(-3.6, 4);
      ctx.lineTo(3.6, 4);
      ctx.stroke();
    }

    const armSwing = Math.sin(t * 5.2 + zombie.phase + 1.2) * 1.6;
    const reachX = faceX * 2.6;
    const reachY = faceY * 2.4;
    const handLX = -9 + reachX;
    const handLY = -4 + reachY + armSwing - lunge;
    const handRX = 9 + reachX;
    const handRY = -4 + reachY - armSwing - lunge;

    ctx.strokeStyle = flash > 0.2 ? "#c4edc9" : armColor;
    ctx.lineWidth = 3.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.lineTo(handLX, handLY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, -4);
    ctx.lineTo(handRX, handRY);
    ctx.stroke();

    ctx.fillStyle = clawColor;
    circleIn(ctx, handLX, handLY, 2.7);
    circleIn(ctx, handRX, handRY, 2.7);

    if (isWarrior) {
      ctx.strokeStyle = "#5b4229";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(handRX, handRY);
      ctx.lineTo(handRX + 7, handRY - 9);
      ctx.stroke();
      ctx.fillStyle = "#6f5637";
      circleIn(ctx, handRX + 7.6, handRY - 10, 3.4);
      ctx.fillStyle = "#8b7650";
      circleIn(ctx, handRX + 6.6, handRY - 11.4, 1.4);
    }

    if (isShield) {
      ctx.save();
      ctx.translate(0, -1);
      ctx.rotate(zombie.shieldDir);
      ctx.strokeStyle = "#6b7a70";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(2, 0, 11, Math.PI * -0.6, Math.PI * 0.6);
      ctx.stroke();
      ctx.fillStyle = "#4a5a50";
      ctx.beginPath();
      ctx.arc(2, 0, 10, Math.PI * -0.6, Math.PI * 0.6);
      ctx.lineTo(2 + Math.cos(Math.PI * 0.6) * 10, Math.sin(Math.PI * 0.6) * 10);
      ctx.lineTo(2 + Math.cos(Math.PI * -0.6) * 10, Math.sin(Math.PI * -0.6) * 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (isArcher || isSpear) {
      const bowAngle = zombie.face;
      const bowX = handRX + Math.cos(bowAngle) * 3;
      const bowY = handRY + Math.sin(bowAngle) * 3;
      ctx.save();
      ctx.translate(bowX, bowY);
      ctx.rotate(bowAngle + Math.PI / 2);
      ctx.strokeStyle = isSpear ? "#8b6f55" : "#7a5a3f";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 14, 0, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#5d442b";
      ctx.fillRect(-1, -16, 2, 32);
      ctx.restore();
    }

    if (isPoison) {
      ctx.fillStyle = "rgba(190, 255, 90, 0.62)";
      circleIn(ctx, handLX, handLY + 3.4, 1.5);
      circleIn(ctx, handRX - 1.2, handRY + 3, 1.1);
    }

    const headX = lean * 0.4 + faceX * 1.1;
    const headY = -13 + faceY * 0.7;

    ctx.fillStyle = flash > 0.2 ? "#e6ffe9" : headColor;
    ctx.beginPath();
    ctx.arc(headX, headY, 6.5, 0, TAU);
    ctx.fill();

    if (isWarrior) {
      ctx.strokeStyle = "#8a9382";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(headX, headY, 7.2, Math.PI * 0.98, Math.PI * 2.02);
      ctx.stroke();
      ctx.fillStyle = "#aab39f";
      ctx.beginPath();
      ctx.moveTo(headX, headY - 10.4);
      ctx.lineTo(headX + 2.6, headY - 6);
      ctx.lineTo(headX - 2.6, headY - 6);
      ctx.closePath();
      ctx.fill();
    } else if (isRunner) {
      ctx.strokeStyle = "rgba(110, 190, 160, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(headX, headY, 7.1, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
    } else if (isPoison) {
      ctx.fillStyle = "rgba(202, 255, 112, 0.55)";
      circleIn(ctx, headX - 5.6, headY - 4.4, 1.1);
      circleIn(ctx, headX + 5.2, headY - 5.2, 0.8);
      circleIn(ctx, headX + 4.6, headY - 7.6, 0.6);
    } else if (isMutant) {
      ctx.fillStyle = "#2a2a20";
      ctx.beginPath();
      ctx.moveTo(headX - 6.2, headY - 3.4);
      ctx.lineTo(headX - 8.8, headY - 9.4);
      ctx.lineTo(headX - 4.4, headY - 5.8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(headX + 6.2, headY - 3.4);
      ctx.lineTo(headX + 8.8, headY - 9.4);
      ctx.lineTo(headX + 4.4, headY - 5.8);
      ctx.closePath();
      ctx.fill();
    } else if (isExploder) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 8 + zombie.phase);
      ctx.fillStyle = `rgba(255, 196, 92, ${0.55 + pulse * 0.35})`;
      circleIn(ctx, headX - 4.8, headY - 4.2, 1.2);
      circleIn(ctx, headX + 4.4, headY - 4.8, 0.9);
    } else if (isBoss) {
      ctx.fillStyle = "#ffd35e";
      ctx.beginPath();
      ctx.moveTo(headX - 6.4, headY - 5.4);
      ctx.lineTo(headX - 7.4, headY - 11.6);
      ctx.lineTo(headX - 3.2, headY - 7.6);
      ctx.lineTo(headX, headY - 13);
      ctx.lineTo(headX + 3.2, headY - 7.6);
      ctx.lineTo(headX + 7.4, headY - 11.6);
      ctx.lineTo(headX + 6.4, headY - 5.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#b0242a";
      circleIn(ctx, headX, headY - 8.2, 1.3);
    }

    if (!away) {
      const eyeOffsetX = faceX * 0.8;
      const eyeY = headY - 0.4 + faceY * 0.4;
      ctx.shadowColor = isWarrior
        ? "rgba(255, 96, 72, 0.95)"
        : isPoison || isMutant
          ? "rgba(190, 255, 90, 0.95)"
          : isBoss
            ? "rgba(255, 210, 90, 0.95)"
            : isExploder
              ? "rgba(255, 150, 60, 0.95)"
              : "rgba(255, 176, 84, 0.95)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = eyeColor;
      if (Math.abs(faceX) > 0.65) {
        circleIn(ctx, headX + eyeOffsetX + (faceX > 0 ? 0.9 : -0.9), eyeY, 1.5);
      } else {
        circleIn(ctx, headX - 2.4 + eyeOffsetX, eyeY, 1.5);
        circleIn(ctx, headX + 2.4 + eyeOffsetX, eyeY, 1.5);
      }
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(28, 18, 12, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX - 2.2 + faceX * 0.4, headY + 4);
      ctx.lineTo(headX + 2.2 + faceX * 0.4, headY + 4);
      ctx.stroke();

      if (isPoison) {
        ctx.fillStyle = "rgba(190, 255, 90, 0.78)";
        circleIn(ctx, headX + 2.4 + faceX * 0.4, headY + 5.2, 1.1);
      }
    } else {
      ctx.strokeStyle = isRunner
        ? "rgba(120, 200, 165, 0.4)"
        : "rgba(40, 60, 35, 0.55)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(headX, headY - 1, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();

    if (zombie.burnTimer > 0) {
      const bz = zombie.radius / 17;
      const flicker = 0.72 + 0.28 * Math.sin(t * 15 + zombie.phase);
      ctx.save();
      ctx.translate(zombie.x, zombie.y + bob);
      ctx.scale(bz, bz);
      ctx.globalCompositeOperation = "lighter";

      // Quầng lửa dưới chân
      const groundGlow = ctx.createRadialGradient(0, 9, 2, 0, 9, 26);
      groundGlow.addColorStop(0, `rgba(255, 128, 36, ${0.28 * flicker})`);
      groundGlow.addColorStop(1, "rgba(255, 60, 0, 0)");
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(0, 9, 26, 11, 0, 0, TAU);
      ctx.fill();

      // Các lưỡi lửa bốc lên từ thân
      const flames = [
        { x: -8, base: 2, sway: 2.8, h: 15 },
        { x: 0, base: 0, sway: 3.6, h: 22 },
        { x: 8, base: 2, sway: 2.4, h: 14 },
        { x: -3, base: 4, sway: 3.1, h: 18 },
        { x: 4, base: 5, sway: 2.6, h: 12 },
      ];

      for (let f = 0; f < flames.length; f += 1) {
        const flame = flames[f];
        const phase = t * (6.5 + f * 0.7) + zombie.phase + f * 1.7;
        const sway = Math.sin(phase) * flame.sway;
        const height = flame.h * (0.72 + 0.34 * Math.sin(phase * 1.35));
        const tipX = flame.x + sway;
        const tipY = flame.base - height;

        const grad = ctx.createLinearGradient(flame.x, flame.base, tipX, tipY);
        grad.addColorStop(0, `rgba(255, 238, 150, ${0.82 * flicker})`);
        grad.addColorStop(0.35, `rgba(255, 142, 40, ${0.72 * flicker})`);
        grad.addColorStop(0.78, `rgba(214, 46, 8, ${0.36 * flicker})`);
        grad.addColorStop(1, "rgba(160, 20, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(flame.x - 4.2, flame.base);
        ctx.quadraticCurveTo(flame.x - 5.5 + sway * 0.4, flame.base - height * 0.55, tipX, tipY);
        ctx.quadraticCurveTo(flame.x + 5.5 + sway * 0.4, flame.base - height * 0.5, flame.x + 4.2, flame.base);
        ctx.closePath();
        ctx.fill();
      }

      // Tàn lửa bay lên
      for (let e = 0; e < 4; e += 1) {
        const rise = (t * (34 + e * 7) + e * 23 + zombie.phase * 9) % 46;
        const ex = Math.sin(t * 6 + e * 2.2 + zombie.phase) * (7 + e * 1.6);
        const ey = 4 - rise;
        ctx.fillStyle = `rgba(255, ${150 + e * 18}, 76, ${(1 - rise / 46) * 0.75})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.2, 0, TAU);
        ctx.fill();
      }

      ctx.restore();
    }

    if (zombie.hp < zombie.maxHp) {
      const width = isBoss ? 76 : zombie.type === "warrior" ? 44 : 30;
      const ratio = Math.max(0, zombie.hp / zombie.maxHp);
      const barY = zombie.y - (isBoss ? 58 : zombie.type === "warrior" ? 41 : 33);
      ctx.save();
      ctx.globalAlpha = spawn;
      ctx.fillStyle = "rgba(1, 5, 3, 0.65)";
      ctx.fillRect(zombie.x - width / 2, barY, width, 3.4);
      ctx.fillStyle = isBoss
        ? "#ffd35e"
        : zombie.type === "warrior"
          ? "#ffb36b"
          : zombie.type === "poison" || zombie.type === "mutant"
            ? "#b7ff6a"
            : zombie.type === "exploder"
              ? "#ff9a4a"
              : "#79e29c";
      ctx.fillRect(zombie.x - width / 2, barY, width * ratio, 3.4);
      ctx.restore();
    }
  }

  function drawGem(gem, t) {
    const bob = Math.sin(t * 2.2 + gem.bob) * 2.4;
    const pulse = 0.5 + 0.5 * Math.sin(t * 3 + gem.phase);
    const pop = Math.min(1, gem.life * 5);
    const isRed = gem.kind === "red";
    const glow = isRed ? glowRed : glowGreen;

    ctx.save();
    ctx.globalAlpha = pop;
    ctx.translate(gem.x, gem.y + bob);

    if (glow) {
      ctx.save();
      ctx.globalAlpha = (0.45 + pulse * 0.3) * pop;
      ctx.drawImage(glow, -36, -36, 72, 72);
      ctx.restore();
    }

    ctx.rotate(Math.sin(t * 1.4 + gem.phase) * 0.12);
    if (isRed) ctx.scale(1.16, 1.16);
    const grad = ctx.createLinearGradient(-7, -8, 7, 8);
    if (isRed) {
      grad.addColorStop(0, "#fff2e6");
      grad.addColorStop(0.4, "#ff8a6f");
      grad.addColorStop(1, "#b0242a");
    } else {
      grad.addColorStop(0, "#efffe9");
      grad.addColorStop(0.4, "#7df0a8");
      grad.addColorStop(1, "#1f9a58");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6.4, -2);
    ctx.lineTo(3.8, 8);
    ctx.lineTo(-3.8, 8);
    ctx.lineTo(-6.4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isRed
      ? "rgba(255, 224, 210, 0.85)"
      : "rgba(224, 255, 232, 0.75)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.moveTo(-2, -5.5);
    ctx.lineTo(2.4, -2.8);
    ctx.lineTo(-0.6, 0.2);
    ctx.lineTo(-4.4, -2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawDart(dart) {
    const fade = clamp((dart.range - dart.traveled) / 70, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.25 + fade * 0.75;
    ctx.translate(dart.x, dart.y);
    ctx.rotate(dart.angle);

    ctx.strokeStyle = "rgba(246, 222, 150, 0.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-5, 0);
    ctx.stroke();

    ctx.fillStyle = "#f0d98e";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-2, 2.6);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-2, -2.6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawPlayer(t) {
    const p = state.player;
    const skin = state.character ? state.character.skin : "thrower";
    const isWarrior = skin === "warrior";
    const isDoctor = skin === "doctor";
    const isRebirth = skin === "rebirth";
    const fx = Math.cos(p.face);
    const fy = Math.sin(p.face);
    const moving = Math.hypot(p.vx, p.vy) > 14;
    const walk = p.walk;
    const stride = Math.sin(walk * 2.15) * (moving ? 3.1 : 0.6);
    const bob = moving
      ? Math.abs(Math.sin(walk * 2.15)) * 0.9
      : Math.sin(t * 1.8) * 0.35;
    const away = fy < -0.42;
    const lean = fx * 1.3;

    ctx.save();
    ctx.fillStyle = "rgba(1, 5, 3, 0.34)";
    ctx.beginPath();
    ctx.ellipse(p.x + 2, p.y + 20, 13.5, 5.4, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (glowGold) {
      ctx.save();
      ctx.globalAlpha = 0.48 + Math.sin(t * 1.7) * 0.05;
      ctx.drawImage(glowGold, p.x - 50, p.y - 50, 100, 100);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(p.x, p.y + bob - 2);
    ctx.scale(1.45, 1.45);
    if (state.invuln > 0 && Math.floor(t * 22) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    const sway = Math.sin(walk * 2.15) * 1.6;

    if (isWarrior) {
      ctx.fillStyle = "#6d2f2b";
      ctx.beginPath();
      ctx.moveTo(-5.6, -8);
      ctx.quadraticCurveTo(-9 - sway, 1, -5 + sway * 0.3, 10.5);
      ctx.lineTo(-1.5, 6.5);
      ctx.lineTo(0, 9.5);
      ctx.lineTo(2.5, 5.5);
      ctx.quadraticCurveTo(8 + sway, 1, 5.6, -8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(232, 197, 71, 0.28)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-4.4, -6.5);
      ctx.lineTo(-3.6, 5.8);
      ctx.stroke();
    } else if (isRebirth) {
      ctx.fillStyle = "#8a6a22";
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(-10 - sway, 1, -6 + sway * 0.3, 11);
      ctx.lineTo(-2, 7);
      ctx.lineTo(0, 10);
      ctx.lineTo(3, 6);
      ctx.quadraticCurveTo(9 + sway, 1, 6, -8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 226, 138, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4.6, -6);
      ctx.lineTo(-3.8, 6.4);
      ctx.stroke();
    } else if (!isDoctor) {
      ctx.fillStyle = "#a14b3f";
      ctx.beginPath();
      ctx.moveTo(-3.5, -7.5);
      ctx.quadraticCurveTo(-8 - sway, -2, -4.5 + sway * 0.3, 5.5);
      ctx.lineTo(-1.2, 1.5);
      ctx.quadraticCurveTo(-1.8, -3, 1.5, -7.5);
      ctx.closePath();
      ctx.fill();
    }

    const legColor = isWarrior ? "#394252" : isDoctor ? "#2e4d4f" : isRebirth ? "#3a2c14" : "#2b3f30";
    ctx.strokeStyle = legColor;
    ctx.lineWidth = 4.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-3.2, 6);
    ctx.lineTo(-3.4 + stride * 0.5, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3.2, 6);
    ctx.lineTo(3.4 - stride * 0.5, 14);
    ctx.stroke();

    ctx.fillStyle = isWarrior ? "#242c38" : isDoctor ? "#1d2f31" : isRebirth ? "#2a2010" : "#241a12";
    ctx.beginPath();
    ctx.ellipse(-3.4 + stride * 0.5, 15, 2.9, 1.8, 0.1, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3.4 - stride * 0.5, 15, 2.9, 1.8, -0.1, 0, TAU);
    ctx.fill();

    if (isWarrior) {
      const armor = ctx.createLinearGradient(-8, -8, 8, 8);
      armor.addColorStop(0, "#8fa3b8");
      armor.addColorStop(0.55, "#5c7085");
      armor.addColorStop(1, "#3c4a5b");
      ctx.fillStyle = armor;
      ctx.beginPath();
      ctx.ellipse(lean * 0.35, 1, 8.6, 10.2, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#8a6a32";
      ctx.fillRect(-7 + lean * 0.35, 4.2, 14, 2.4);

      ctx.strokeStyle = "rgba(222, 235, 246, 0.4)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-5 + lean * 0.35, -4.5);
      ctx.lineTo(0 + lean * 0.35, 1.5);
      ctx.lineTo(5 + lean * 0.35, -4.5);
      ctx.stroke();

      ctx.strokeStyle = "rgba(232, 197, 71, 0.45)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(lean * 0.35, 1, 7.6, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    } else if (isDoctor) {
      const coat = ctx.createLinearGradient(-8, -8, 8, 8);
      coat.addColorStop(0, "#f5f8f6");
      coat.addColorStop(0.55, "#dbe7e6");
      coat.addColorStop(1, "#b6c9c9");
      ctx.fillStyle = coat;
      ctx.beginPath();
      ctx.ellipse(lean * 0.35, 1, 8.4, 10.2, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#2f7d78";
      ctx.beginPath();
      ctx.moveTo(lean * 0.35 - 4, -6.2);
      ctx.lineTo(lean * 0.35 + 4, -6.2);
      ctx.lineTo(lean * 0.35, 2.4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(118, 152, 152, 0.55)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(lean * 0.35 - 5.2, -7.8);
      ctx.lineTo(lean * 0.35 - 1.2, 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lean * 0.35 + 5.2, -7.8);
      ctx.lineTo(lean * 0.35 + 1.2, 0.8);
      ctx.stroke();

      ctx.fillStyle = "rgba(96, 134, 134, 0.55)";
      ctx.fillRect(lean * 0.35 - 6.2, 4.2, 12.4, 1.6);
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(lean * 0.35 + 3.2, 5.1, 3, 2.6);

      ctx.strokeStyle = "#35494b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(lean * 0.35, -3.6, 4.6, Math.PI * 0.12, Math.PI * 0.88);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lean * 0.35 - 4.4, -1.2);
      ctx.lineTo(lean * 0.35 - 4.8, 3.6);
      ctx.stroke();
      ctx.fillStyle = "#7fd8ce";
      circleIn(ctx, lean * 0.35 - 4.8, 4.2, 1.3);

      ctx.fillStyle = "#f6faf8";
      ctx.fillRect(lean * 0.35 - 7.2, -7.9, 4.6, 4.6);
      ctx.fillStyle = "#d9534f";
      ctx.fillRect(lean * 0.35 - 5.6, -7.3, 1.4, 3.4);
      ctx.fillRect(lean * 0.35 - 6.6, -6.3, 3.4, 1.4);
    } else if (isRebirth) {
      const robe = ctx.createLinearGradient(-8, -8, 8, 8);
      robe.addColorStop(0, "#7a6328");
      robe.addColorStop(0.5, "#5a471c");
      robe.addColorStop(1, "#382b10");
      ctx.fillStyle = robe;
      ctx.beginPath();
      ctx.ellipse(lean * 0.35, 1, 8.3, 10.1, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#2f2415";
      ctx.beginPath();
      ctx.moveTo(lean * 0.35 - 4.6, -6.4);
      ctx.lineTo(lean * 0.35 + 4.6, -6.4);
      ctx.lineTo(lean * 0.35, 2.8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 220, 120, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lean * 0.35 - 5.4, -5);
      ctx.lineTo(lean * 0.35, 1.6);
      ctx.lineTo(lean * 0.35 + 5.4, -5);
      ctx.stroke();

      ctx.fillStyle = "#ffd35e";
      circleIn(ctx, lean * 0.35, 3.4, 2.2);
      ctx.fillStyle = "#fff3c0";
      circleIn(ctx, lean * 0.35, 3.4, 1);
    } else {
      ctx.fillStyle = "#3a5b41";
      ctx.beginPath();
      ctx.ellipse(lean * 0.35, 1, 8.2, 10, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#4d7352";
      ctx.beginPath();
      ctx.ellipse(-1.2 + lean * 0.35, 0.6, 6.4, 8.2, -0.12, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#6b4a2b";
      ctx.fillRect(-6.6 + lean * 0.35, 4.2, 13.2, 2.2);

      ctx.strokeStyle = "rgba(232, 197, 71, 0.45)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-5 + lean * 0.35, -6);
      ctx.lineTo(4 + lean * 0.35, 3);
      ctx.stroke();
    }

    if (isWarrior) {
      ctx.fillStyle = "#71869b";
      circleIn(ctx, -7.2, -5.2, 3.4);
      circleIn(ctx, 7.2, -5.2, 3.4);
      ctx.strokeStyle = "#c9a23c";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(-7.2, -5.2, 3.1, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7.2, -5.2, 3.1, 0, TAU);
      ctx.stroke();
    }

    const armSwing = Math.sin(walk * 2.15 + Math.PI) * (moving ? 1.5 : 0.4);
    const handBaseY = 2.4 + fy * 1.6;
    const handLX = -9.4 + fx * 1.2;
    const handLY = handBaseY + armSwing;
    const handRX = 9.4 + fx * 1.2;
    const handRY = handBaseY - armSwing;

    ctx.strokeStyle = isWarrior ? "#687d92" : isDoctor ? "#e8f0ef" : "#c99a6c";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6.8 + lean * 0.35, -5);
    ctx.lineTo(handLX, handLY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6.8 + lean * 0.35, -5);
    ctx.lineTo(handRX, handRY);
    ctx.stroke();

    ctx.fillStyle = isWarrior ? "#8499ad" : isDoctor ? "#e0b48a" : "#c99a6c";
    circleIn(ctx, handLX, handLY, 2.2);
    circleIn(ctx, handRX, handRY, 2.2);

    if (isWarrior) {
      const sx = handLX - 2.2;
      const sy = handLY + 0.8;
      ctx.fillStyle = "#465a6f";
      circleIn(ctx, sx, sy, 5.4);
      ctx.strokeStyle = "#c9a23c";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(sx, sy, 5.3, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#c9a23c";
      circleIn(ctx, sx, sy, 1.8);
      ctx.strokeStyle = "rgba(220, 235, 250, 0.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(sx - 3, sy - 2);
      ctx.lineTo(sx + 2, sy + 2);
      ctx.stroke();

      ctx.strokeStyle = "#dce6ef";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(handRX, handRY);
      ctx.lineTo(handRX + 2.6, handRY - 11);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(handRX + 0.5, handRY - 2);
      ctx.lineTo(handRX + 2.2, handRY - 9.5);
      ctx.stroke();
      ctx.strokeStyle = "#c9a23c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(handRX - 2.4, handRY - 1.2);
      ctx.lineTo(handRX + 2.4, handRY - 1.2);
      ctx.stroke();
      ctx.fillStyle = "#c9a23c";
      circleIn(ctx, handRX, handRY + 1.4, 1.1);
    } else {
      ctx.strokeStyle = "#f0d98e";
      ctx.lineWidth = 1.3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(handRX, handRY);
      ctx.lineTo(handRX + 1.2, handRY - 5.5);
      ctx.stroke();
      ctx.fillStyle = "#f0d98e";
      ctx.beginPath();
      ctx.moveTo(handRX + 1.2, handRY - 6.4);
      ctx.lineTo(handRX + 2.4, handRY - 4.4);
      ctx.lineTo(handRX + 0.2, handRY - 4.6);
      ctx.closePath();
      ctx.fill();
    }

    const headX = lean * 0.55 + fx * 1.4;
    const headY = -13.2 + fy * 0.6;

    ctx.fillStyle = "#c99a6c";
    ctx.fillRect(headX - 1.7, headY + 4.2, 3.4, 2.6);

    if (isWarrior) {
      ctx.fillStyle = "#5b6c80";
      circleIn(ctx, headX, headY - 0.4, 7.1);

      if (!away) {
        ctx.fillStyle = "#d7ad7e";
        ctx.beginPath();
        ctx.ellipse(headX + fx * 0.5, headY + 1.7, 4.2, 4, 0, 0, TAU);
        ctx.fill();
      }

      ctx.strokeStyle = "#3e4a58";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - 6.2, headY - 2.4);
      ctx.lineTo(headX + 6.2, headY - 2.4);
      ctx.stroke();

      ctx.strokeStyle = "#8fa3b8";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(headX + fx * 0.5, headY - 2.8);
      ctx.lineTo(headX + fx * 0.5, headY + 3.4);
      ctx.stroke();

      ctx.strokeStyle = "#c9a23c";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(headX, headY - 4.5, 5.8, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.strokeStyle = "#b64634";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(headX, headY - 5.6, 4.8, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      ctx.fillStyle = "#c9a23c";
      circleIn(ctx, -5, -7.3, 1.2);
      circleIn(ctx, 5, -7.3, 1.2);
    } else if (isDoctor) {
      ctx.fillStyle = "#4a372b";
      circleIn(ctx, headX, headY + 0.4, 7.1);

      ctx.fillStyle = "#e0b48a";
      ctx.beginPath();
      ctx.ellipse(headX + fx * 0.35, headY + 1.2, 5.4, 5.1, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#5a4533";
      ctx.beginPath();
      ctx.arc(headX, headY - 2.1, 5.5, Math.PI * 1.06, Math.PI * 1.94);
      ctx.fill();

      ctx.strokeStyle = "#738a8c";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(headX, headY - 4.4, 6, Math.PI * 1.04, Math.PI * 1.96);
      ctx.stroke();

      ctx.fillStyle = "rgba(226, 248, 245, 0.95)";
      circleIn(ctx, headX, headY - 6.3, 3);
      ctx.strokeStyle = "#9fb4b5";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(headX, headY - 6.3, 3, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      circleIn(ctx, headX - 1, headY - 7.1, 0.9);

      ctx.fillStyle = "#d5e8e4";
      ctx.beginPath();
      ctx.ellipse(headX, headY + 4.4, 4.3, 2.2, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(130, 170, 164, 0.7)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(headX, headY + 4.4, 4.3, 2.2, 0, 0, TAU);
      ctx.stroke();
    } else if (isRebirth) {
      ctx.fillStyle = "#2f2415";
      circleIn(ctx, headX, headY + 0.2, 7.2);

      ctx.fillStyle = "#e2b98c";
      ctx.beginPath();
      ctx.ellipse(headX + fx * 0.4, headY + 1.4, 5.2, 4.9, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#3a2c14";
      ctx.beginPath();
      ctx.arc(headX, headY - 2.2, 5.6, Math.PI * 1.04, Math.PI * 1.96);
      ctx.fill();

      ctx.strokeStyle = "#ffd35e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(headX, headY - 3.6, 5.9, Math.PI * 1.06, Math.PI * 1.94);
      ctx.stroke();

      ctx.fillStyle = "#ffd35e";
      ctx.beginPath();
      ctx.moveTo(headX, headY - 12.4);
      ctx.quadraticCurveTo(headX + 3.4, headY - 8.6, headX, headY - 6.4);
      ctx.quadraticCurveTo(headX - 3.4, headY - 8.6, headX, headY - 12.4);
      ctx.fill();
      ctx.fillStyle = "#fff6cf";
      circleIn(ctx, headX, headY - 8.6, 1.2);

      ctx.fillStyle = "#b25345";
      ctx.beginPath();
      ctx.ellipse(headX, headY + 5.4, 4.2, 1.5, 0, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = "#66482a";
      circleIn(ctx, headX, headY + 0.2, 7);
      ctx.fillStyle = "#d7ad7e";
      ctx.beginPath();
      ctx.ellipse(headX + fx * 0.4, headY + 1.2, 5.4, 5.1, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#8a633a";
      ctx.beginPath();
      ctx.arc(headX, headY - 2.1, 5.4, Math.PI * 1.08, Math.PI * 1.92);
      ctx.fill();

      ctx.fillStyle = "#b25345";
      ctx.beginPath();
      ctx.ellipse(headX, headY + 5.3, 4.4, 1.6, 0, 0, TAU);
      ctx.fill();
    }

    if (!away) {
      const eyeY = headY + (isWarrior ? 1.4 : isDoctor ? 0.9 : 0.7) + fy * 0.3;
      const eyeX = headX + fx * 0.6;
      const oneEye = Math.abs(fx) > 0.65;
      ctx.fillStyle = "#2a1d10";
      if (oneEye) {
        circleIn(ctx, eyeX + (fx > 0 ? 1.2 : -1.2), eyeY, 1);
      } else {
        circleIn(ctx, eyeX - 2, eyeY, 1);
        circleIn(ctx, eyeX + 2, eyeY, 1);
      }

      ctx.strokeStyle = isDoctor ? "rgba(74, 108, 104, 0.85)" : "rgba(90, 50, 30, 0.6)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(eyeX - 1.2, eyeY + 3);
      ctx.lineTo(eyeX + 1.2, eyeY + 3);
      ctx.stroke();
    } else {
      ctx.strokeStyle = isWarrior
        ? "rgba(40, 50, 62, 0.6)"
        : isDoctor
          ? "rgba(74, 108, 104, 0.7)"
          : "rgba(48, 31, 16, 0.7)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(headX, headY - 2, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // Enhanced shield visual when below 50% HP
    if (state.skills.enhancedShield > 0 && state.hp < state.maxHp * 0.5) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);
      const shieldAlpha = 0.3 + pulse * 0.2;

      ctx.save();
      ctx.globalAlpha = shieldAlpha;
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, TAU);
      ctx.stroke();

      ctx.fillStyle = "rgba(0, 170, 255, 0.1)";
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, TAU);
      ctx.fill();

      // Shield segments
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
        ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Vũ trụ song song: hiệu ứng màu tím xung quanh người chơi
    if (state.parallelUniverseActive) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 8);
      const auraAlpha = 0.4 + pulse * 0.3;

      ctx.save();
      ctx.globalAlpha = auraAlpha;
      ctx.strokeStyle = "#1800ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22 + pulse * 6, 0, TAU);
      ctx.stroke();

      ctx.fillStyle = "rgba(24, 0, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(0, 0, 22 + pulse * 6, 0, TAU);
      ctx.fill();

      // Purple rings rotating
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + t * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
        ctx.lineTo(Math.cos(angle) * 26, Math.sin(angle) * 26);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  const MOVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

  window.addEventListener("keydown", (event) => {
    if (!state.active) return;
    const key = event.key.toLowerCase();

    if (state.over || state.victory) {
      if (key === "enter") {
        event.preventDefault();
        start({ mode: state.modeId, character: state.characterId });
      }
      return;
    }

    if (state.choosing) {
      if (key === "1" || key === "2" || key === "3") {
        const card = state.cards[Number(key) - 1];
        if (card) {
          event.preventDefault();
          chooseSkill(card.id);
        }
      }
      return;
    }

    if (key === "escape") {
      event.preventDefault();
      DeepwoodAudio.back();
      togglePause();
      return;
    }

    if (key === " " || key === "spacebar") {
      event.preventDefault();
      return;
    }

    if (MOVE_KEYS.has(key) && !state.paused) {
      event.preventDefault();
      state.keys.add(key);
    }
  });

  window.addEventListener("keyup", (event) => {
    state.keys.delete(event.key.toLowerCase());
  });

  window.addEventListener("blur", () => {
    state.keys.clear();
    state.pointer.active = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.active && !state.paused && !state.choosing && !state.over) {
      togglePause(true);
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.active || state.paused || state.choosing || state.over || state.victory) return;
    if (event.pointerType === "mouse") {
      if (!state.autoAttack && typeof window.Game.triggerManualShoot === "function") {
        window.Game.triggerManualShoot();
      }
      return;
    }
    event.preventDefault();
    state.pointer.active = true;
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      /* no-op */
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.pointer.active || event.pointerType === "mouse") return;
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
  });

  ["pointerup", "pointercancel"].forEach((name) => {
    canvas.addEventListener(name, () => {
      state.pointer.active = false;
    });
  });

  window.addEventListener("pointerup", () => {
    state.pointer.active = false;
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  if (els.pauseBtn) {
    els.pauseBtn.addEventListener("click", () => {
      if (!state.active || state.choosing || state.over || state.victory) return;
      DeepwoodAudio.click();
      togglePause(true);
    });
  }

  if (els.resumeBtn) {
    els.resumeBtn.addEventListener("click", () => {
      DeepwoodAudio.click();
      togglePause(false);
    });
  }

  if (els.quitBtn) {
    els.quitBtn.addEventListener("click", () => {
      DeepwoodAudio.back();
      stop(true);
    });
  }

  if (els.skillCards) {
    els.skillCards.addEventListener("click", (event) => {
      const card = event.target.closest(".skill-card");
      if (!card) return;
      chooseSkill(card.dataset.skill);
    });
  }

  if (els.gameoverReplay) {
    els.gameoverReplay.addEventListener("click", () => {
      DeepwoodAudio.click();
      start({ mode: state.modeId, character: state.characterId });
    });
  }

  if (els.gameoverMenu) {
    els.gameoverMenu.addEventListener("click", () => {
      DeepwoodAudio.back();
      stop(true);
    });
  }

  if (els.victoryReplay) {
    els.victoryReplay.addEventListener("click", () => {
      DeepwoodAudio.click();
      start({ mode: state.modeId, character: state.characterId });
    });
  }

  if (els.victoryMenu) {
    els.victoryMenu.addEventListener("click", () => {
      DeepwoodAudio.back();
      stop(true);
    });
  }

  window.addEventListener("resize", () => {
    if (!state.active) return;
    resize();
  });

  function start(options = {}) {
    if (typeof options.onQuit === "function") {
      state.onQuit = options.onQuit;
    }
    const modeId = MODES[options.mode] ? options.mode : state.modeId || "normal";
    state.modeId = modeId;
    state.mode = MODES[modeId];
    state.customWaves =
      modeId === "custom"
        ? clamp(Math.round(Number(options.customWaves) || 50), 20, 500)
        : 50;
    state.wavesTotal = modeId === "custom" ? state.customWaves : state.mode.waves;

    const characterId = CHARACTERS[options.character]
      ? options.character
      : CHARACTERS[state.characterId]
        ? state.characterId
        : DEFAULT_CHARACTER;
    state.characterId = characterId;
    state.character = CHARACTERS[characterId];
    state.mapType = options.map === "day" || options.map === "moon" ? options.map : "night";

    const upgradeInput = options.upgrades && typeof options.upgrades === "object" ? options.upgrades : {};
    state.upgrades = {
      hp: clamp(Math.floor(Number(upgradeInput.hp) || 0), 0, 5),
      speed: clamp(Math.floor(Number(upgradeInput.speed) || 0), 0, 3),
    };
    state.speedMult = 1 + state.upgrades.speed * 0.04;
    state.autoAttack = options.autoAttack !== false;
    state.revives = state.character.revives || 0;

    if (state.active) stop(false);

    resize();
    ensureWorldSprites();
    resetPlayer();
    buildEnergyBar();

    state.active = true;
    state.paused = false;
    state.choosing = false;
    state.over = false;
    state.victory = false;
    state.elapsed = 0;
    state.timerText = "";
    state.keys.clear();
    state.pointer.active = false;
    state.hp = state.character.hp + state.upgrades.hp * 10;
    state.maxHp = state.hp;
    state.armor = state.character.armor;
    state.maxArmor = state.character.armor;
    state.armorDisplay = -1;
    state.invuln = 0;
    state.hurtFlash = 0;
    state.shake = 0;
    state.zombies = [];
    state.darts = [];
    state.gems = [];
    state.poisonZones = [];
    state.fireZones = [];
    state.bombs = [];
    state.slashes = [];
    state.zombieProjectiles = [];
    state.particles = [];
    state.texts = [];
    state.blasts = [];
    state.meteors = [];
    state.energy = 0;
    state.energyMax = ENERGY_START;
    state.kills = 0;
    state.killsSinceHeal = 0;
    state.totalSpawned = 0;
    state.bossCount = 0;
    state.levelUps = 0;
    state.wave = 1;
    state.waveState = "fight";
    state.waveTimer = 0;
    state.waveQuota = 0;
    state.waveSpawned = 0;
    state.waveSpawnTimer = 0;
    state.shootCooldown = 0;
    state.doctorTimer = 0;
    state.healingTimer = 0;
    state.damageTimer = 999;
    state.firebombTimer = 0;
    state.meteorTimer = 0;
    state.sawAngle = 0;
    state.remainingDisplay = -1;
    state.lightningTimer = 0;
    state.lightningStrikes = [];
    state.lightningFlash = 0;
    state.money = loadWallet();
    state.choiceDelay = -1;
    state.cards = [];
    state.last = 0;
    SKILLS.forEach((skill) => {
      state.skills[skill.id] = 0;
    });

    updateHealthHud();
    updateArmorHud();
    updateEnergyHud();
    updateStatsHud();
    updateMoneyHud();
    updateWaveHud();
    if (els.timer) els.timer.textContent = "00:00";
    if (els.hud) els.hud.hidden = false;
    if (els.pauseLayer) els.pauseLayer.hidden = true;
    if (els.skillLayer) els.skillLayer.hidden = true;
    if (els.gameoverLayer) els.gameoverLayer.hidden = true;
    if (els.victoryLayer) els.victoryLayer.hidden = true;
    if (els.toast) els.toast.hidden = true;
    canvas.hidden = false;
    document.body.classList.add("is-playing");
    Background.setPlaying(true);

    startWave(1);
    for (let i = 0; i < 3; i += 1) spawnZombie(true);

    DeepwoodAudio.reveal();
    focusGame();
    state.raf = window.requestAnimationFrame(loop);
  }

  function stop(returnToMenu) {
    state.active = false;
    state.paused = false;
    state.choosing = false;
    state.over = false;
    state.victory = false;
    state.keys.clear();
    state.pointer.active = false;

    if (state.raf) {
      window.cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    window.clearTimeout(toastTimer);
    canvas.hidden = true;
    if (els.hud) els.hud.hidden = true;
    if (els.pauseLayer) els.pauseLayer.hidden = true;
    if (els.skillLayer) els.skillLayer.hidden = true;
    if (els.gameoverLayer) els.gameoverLayer.hidden = true;
    if (els.victoryLayer) els.victoryLayer.hidden = true;
    if (els.toast) els.toast.hidden = true;
    document.body.classList.remove("is-playing");
    Background.setPlaying(false);

    const callback = state.onQuit;
    if (!returnToMenu) return;

    state.onQuit = null;
    if (typeof callback === "function") callback();
  }

  function togglePause(force) {
    if (!state.active || state.choosing || state.over || state.victory) return;
    const next = typeof force === "boolean" ? force : !state.paused;
    if (next === state.paused) return;

    state.paused = next;
    if (els.pauseLayer) els.pauseLayer.hidden = !next;
    state.keys.clear();
    state.pointer.active = false;

    if (next) {
      if (els.resumeBtn) els.resumeBtn.focus({ preventScroll: true });
    } else {
      focusGame();
    }
  }

  function focusGame() {
    try {
      canvas.focus({ preventScroll: true });
    } catch (error) {
      /* no-op */
    }
  }

  const api = {
    start,
    stop,
    triggerManualShoot() {
      state.pointerShoot = true;
    },
    snapshot() {
      return {
        active: state.active,
        paused: state.paused,
        choosing: state.choosing,
        over: state.over,
        victory: state.victory,
        hp: state.hp,
        maxHp: state.maxHp,
        armor: state.armor,
        maxArmor: state.maxArmor,
        character: state.characterId,
        characterName: state.character.name,
        speed: BASE_SPEED * state.character.speed * state.speedMult,
        mitigation: state.character.skin === "warrior" ? ARMOR_MITIGATION : 0,
        meleeRange: WARRIOR_MELEE_RANGE,
        meleeDamage: WARRIOR_MELEE_DAMAGE,
        energy: state.energy,
        energyMax: state.energyMax,
        mode: state.modeId,
        customWaves: state.customWaves,
        mapType: state.mapType,
        money: state.money,
        wave: state.wave,
        wavesTotal: state.wavesTotal,
        waveState: state.waveState,
        waveQuota: state.waveQuota,
        waveSpawned: state.waveSpawned,
        zombiesRemaining: countZombiesRemaining(),
        kills: state.kills,
        totalSpawned: state.totalSpawned,
        bossCount: state.bossCount,
        levelUps: state.levelUps,
        elapsed: state.elapsed,
        autoAttack: state.autoAttack,
        revives: state.revives,
        upgrades: { ...state.upgrades },
        speedMult: state.speedMult,
        healingTimer: state.healingTimer,
        meteorTimer: state.meteorTimer,
        doctorTimer: state.doctorTimer,
        damageTimer: state.damageTimer,
        firebombTimer: state.firebombTimer,
        sawAngle: state.sawAngle,
        player: { x: state.player.x, y: state.player.y, face: state.player.face },
        camera: { x: state.camera.x, y: state.camera.y },
        dartRange: DART_RANGE,
        zombies: state.zombies.map((zombie) => ({
          id: zombie.id,
          type: zombie.type,
          x: zombie.x,
          y: zombie.y,
          hp: zombie.hp,
          maxHp: zombie.maxHp,
          speed: zombie.speed,
          sawCooldown: zombie.sawCooldown,
          shieldDir: zombie.shieldDir,
          leapCooldown: zombie.leapCooldown,
          berserk: zombie.berserk,
          summonTimer: zombie.summonTimer,
          burrowState: zombie.burrowState,
          burrowTimer: zombie.burrowTimer,
          warnTimer: zombie.warnTimer,
          howlTimer: zombie.howlTimer,
          howlActive: zombie.howlActive,
          howlSpeedMult: zombie.howlSpeedMult,
          howlDamageMult: zombie.howlDamageMult,
          burnTimer: zombie.burnTimer,
          burnDamage: zombie.burnDamage,
        })),
        poisonZones: state.poisonZones.map((zone) => ({
          x: zone.x,
          y: zone.y,
          life: zone.life,
          ttl: zone.ttl,
          radius: zone.radius,
        })),
        fireZones: state.fireZones.map((zone) => ({
          x: zone.x,
          y: zone.y,
          life: zone.life,
          ttl: zone.ttl,
          radius: zone.radius,
          dps: zone.dps,
        })),
        bombs: state.bombs.map((bomb) => ({
          x: bomb.x,
          y: bomb.y,
          tx: bomb.tx,
          ty: bomb.ty,
          dps: bomb.dps,
          radius: bomb.radius,
        })),
        meteors: state.meteors.map((meteor) => ({
          x: meteor.x,
          y: meteor.y,
          tx: meteor.tx,
          ty: meteor.ty,
          fall: meteor.fall,
          radius: meteor.radius,
          impacted: meteor.impacted,
        })),
        blasts: state.blasts.map((blast) => ({
          x: blast.x,
          y: blast.y,
          life: blast.life,
          ttl: blast.ttl,
          radius: blast.radius,
        })),
        mineTimer: state.mineTimer,
        mines: state.mines.map((mine) => ({
          x: mine.x,
          y: mine.y,
          damage: mine.damage,
          radius: mine.radius,
          armed: mine.armed,
        })),
        parallelUniverseTimer: state.parallelUniverseTimer,
        parallelUniverseActive: state.parallelUniverseActive,
        xRayLaserTimer: state.xRayLaserTimer,
        fireRateTimer: state.fireRateTimer,
        saws: state.skills.saw > 0
          ? (() => {
              const cfg = SAW_LEVELS[Math.min(state.skills.saw, SAW_LEVELS.length) - 1];
              return Array.from({ length: cfg.count }, (_, index) => {
                const angle = state.sawAngle + (index / cfg.count) * TAU;
                return {
                  x: state.player.x + Math.cos(angle) * cfg.radius,
                  y: state.player.y + Math.sin(angle) * cfg.radius,
                  speed: cfg.speed,
                  radius: cfg.radius,
                  size: cfg.size,
                };
              });
            })()
          : [],
        gems: state.gems.map((gem) => ({
          x: gem.x,
          y: gem.y,
          value: gem.value,
          kind: gem.kind,
        })),
        darts: state.darts.length,
        slashes: state.slashes.length,
        lightningStrikes: state.lightningStrikes.length,
        skills: { ...state.skills },
        firebombConfig: state.skills.firebomb > 0
          ? FIREBOMB_LEVELS[Math.min(state.skills.firebomb, FIREBOMB_LEVELS.length) - 1]
          : null,
        sawConfig: state.skills.saw > 0
          ? SAW_LEVELS[Math.min(state.skills.saw, SAW_LEVELS.length) - 1]
          : null,
        cards: state.cards.map((skill) => skill.id),
      };
    },
  };

  if (DEBUG) {
    const debugState = document.createElement("pre");
    debugState.id = "debug-state";
    debugState.hidden = true;
    document.body.appendChild(debugState);

    const writeSnapshot = () => {
      debugState.textContent = JSON.stringify(api.snapshot());
    };

    const setEnergy = (value) => {
      state.energy = clamp(Math.floor(Number(value) || 0), 0, state.energyMax);
      updateEnergyHud();
      if (state.energy >= state.energyMax && !state.choosing) state.choiceDelay = 0.4;
      writeSnapshot();
    };

    const spawn = (distance) => {
      const zombie = spawnZombieNear(Number(distance) || 160);
      writeSnapshot();
      return zombie;
    };

    const spawnType = (type, distance) => {
      const zombie = spawnZombieNear(Number(distance) || 160, type);
      writeSnapshot();
      return zombie;
    };

    const jumpToWave = (value) => {
      const wave = clamp(Math.floor(Number(value) || 1), 1, state.wavesTotal);
      state.zombies = [];
      state.waveState = "fight";
      startWave(wave);
      writeSnapshot();
    };

    const hurt = (amount) => {
      damagePlayer(clamp(Math.floor(Number(amount) || ZOMBIE_DAMAGE), 1, 1000));
      writeSnapshot();
    };

    const killAll = () => {
      for (const zombie of state.zombies) killZombie(zombie);
      state.zombies = state.zombies.filter((zombie) => !zombie.dead);
      writeSnapshot();
    };

    const setArmor = (value) => {
      state.armor = clamp(Number(value) || 0, 0, state.maxArmor);
      state.armorDisplay = -1;
      updateArmorHud();
      writeSnapshot();
    };

    const setHp = (value) => {
      state.hp = clamp(Number(value) || 1, 1, state.maxHp);
      updateHealthHud();
      writeSnapshot();
    };

    const setEnergyMax = (value) => {
      state.energyMax = clamp(Math.floor(Number(value) || ENERGY_START), ENERGY_START, ENERGY_CAP);
      state.energy = Math.min(state.energy, state.energyMax);
      updateEnergyHud();
      writeSnapshot();
    };

    const setSkill = (payload) => {
      const detail = payload && typeof payload === "object" ? payload : { id: payload, level: 1 };
      const definition = SKILLS.find((skill) => skill.id === detail.id);
      if (!definition) return;
      const level = clamp(Math.floor(Number(detail.level) || 1), 0, definition.max);
      state.skills[definition.id] = level;

      if (definition.id === "health") {
        state.maxHp = state.character.hp + level * 10;
        state.hp = state.maxHp;
        updateHealthHud();
      }
      if (definition.id === "firebomb" && level > 0) state.firebombTimer = 0;

      writeSnapshot();
    };

    const setDoctorTimer = (value) => {
      state.doctorTimer = clamp(Number(value) || 0, 0, DOCTOR_REGEN_INTERVAL);
      writeSnapshot();
    };

    const setAutoAttack = (value) => {
      state.autoAttack = Boolean(value);
      writeSnapshot();
    };

    const setMap = (value) => {
      state.mapType = value === "day" ? "day" : value === "moon" ? "moon" : "night";
      ensureWorldSprites();
      writeSnapshot();
    };

    const spawnBossDebug = () => {
      const boss = spawnBoss(false);
      writeSnapshot();
      return boss;
    };

    const setMoney = (value) => {
      state.money = clamp(Math.floor(Number(value) || 0), 0, 999999);
      updateMoneyHud();
      writeSnapshot();
    };

    const rerollDebug = () => {
      rerollSkills();
      writeSnapshot();
    };

    const spawnFireZoneDebug = (payload) => {
      const detail = payload && typeof payload === "object" ? payload : {};
      const level = clamp(Math.floor(Number(detail.level) || 1), 1, FIREBOMB_LEVELS.length);
      const cfg = FIREBOMB_LEVELS[level - 1];
      const x = Number.isFinite(Number(detail.x)) ? Number(detail.x) : state.player.x;
      const y = Number.isFinite(Number(detail.y)) ? Number(detail.y) : state.player.y;
      spawnFireZone(x, y, cfg.dps, cfg.radius);
      writeSnapshot();
    };

    const collectGems = () => {
      for (const gem of state.gems.slice()) collectGem(gem);
      state.gems = [];
      writeSnapshot();
    };

    window.__deepwood = {
      setEnergy,
      setArmor,
      setHp,
      setEnergyMax,
      setSkill,
      setDoctorTimer,
      setAutoAttack,
      setMap,
      spawnFireZone: spawnFireZoneDebug,
      spawnBoss: spawnBossDebug,
      setMoney,
      reroll: rerollDebug,
      collectGems,
      spawnMonster: spawn,
      spawnZombieType: spawnType,
      startWave: jumpToWave,
      damagePlayer: hurt,
      killAll,
      snapshot() {
        writeSnapshot();
        return api.snapshot();
      },
    };

    document.addEventListener("deepwood:snapshot", writeSnapshot);
    document.addEventListener("deepwood:set-energy", (event) => setEnergy(event.detail));
    document.addEventListener("deepwood:set-armor", (event) => setArmor(event.detail));
    document.addEventListener("deepwood:set-hp", (event) => setHp(event.detail));
    document.addEventListener("deepwood:set-energy-max", (event) => setEnergyMax(event.detail));
    document.addEventListener("deepwood:set-skill", (event) => setSkill(event.detail));
    document.addEventListener("deepwood:set-doctor-timer", (event) => setDoctorTimer(event.detail));
    document.addEventListener("deepwood:set-auto-attack", (event) => setAutoAttack(event.detail));
    document.addEventListener("deepwood:set-map", (event) => setMap(event.detail));
    document.addEventListener("deepwood:set-money", (event) => setMoney(event.detail));
    document.addEventListener("deepwood:spawn-boss", spawnBossDebug);
    document.addEventListener("deepwood:reroll", rerollDebug);
    document.addEventListener("deepwood:spawn-fire-zone", (event) => spawnFireZoneDebug(event.detail));
    document.addEventListener("deepwood:collect-gems", collectGems);
    document.addEventListener("deepwood:spawn-monster", (event) => spawn(event.detail));
    document.addEventListener("deepwood:spawn-type", (event) => {
      const detail = event.detail || {};
      spawnType(detail.type || "normal", detail.distance);
      writeSnapshot();
    });
    document.addEventListener("deepwood:start-wave", (event) => jumpToWave(event.detail));
    document.addEventListener("deepwood:damage-player", (event) => hurt(event.detail));
    document.addEventListener("deepwood:kill-all", killAll);
    document.addEventListener("deepwood:victory", () => {
      victory();
      writeSnapshot();
    });
  }

  try { buildEnergyBar(); } catch (e) { console.error("buildEnergyBar error:", e); }
  window.Game = api;

  return api;
})();
