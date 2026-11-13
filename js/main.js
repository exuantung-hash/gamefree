/* ============================================================
   DEEPWOOD — menu, settings, credits & play flow
   ============================================================ */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEY = "deepwood.settings.v1";
  const CHARACTER_KEY = "deepwood.character.v2";
  const CHARACTER_UNLOCKED_KEY = "deepwood.characters.v1";
  const MAP_KEY = "deepwood.map.v1";
  const GEAR_KEY = "deepwood.gear.v1";
  const DEFAULTS = {
    music: 35,
    sfx: 70,
    shake: true,
    autoAttack: true,
    muted: false,
  };

  const CHARACTER_PRICES = {
    doctor: 5000,
    warrior: 10000,
    thrower: 0,
    rebirth: 5000,
    electrician: 10000,
    vampire: 15000,
  };

  const CHARACTER_META = {
    doctor: { name: "Bác sĩ", sub: "Doctor · Máu 100 · Hồi máu" },
    warrior: { name: "Chiến binh", sub: "Warrior · Giáp 100 · Máu 120" },
    thrower: { name: "Người ném phi tiêu", sub: "Dart Thrower · Máu 100" },
    rebirth: { name: "Tái sinh", sub: "Rebirth · Máu 90 · Hồi sinh 1 lần" },
    electrician: { name: "Kỹ thuật viên điện", sub: "Electrician · Máu 100 · Không giáp · Tốc độ +5%" },
    vampire: { name: "Ma cà rồng", sub: "Vampire · Máu 100 · Không giáp · Tốc độ +10%" },
  };

  const GEAR_SLOTS = [
    { id: "weapon", name: "Vũ khí", tag: "Weapon" },
    { id: "armor", name: "Giáp", tag: "Armor" },
    { id: "charm", name: "Bùa", tag: "Charm" },
  ];

  // Tạm thời kho trang bị chưa có vật phẩm nào.
  const EMPTY_GEAR_BONUSES = Object.freeze({
    damage: 0,
    hp: 0,
    armor: 0,
    speed: 0,
    fireRate: 0,
    magnet: 0,
  });

  const HERO_ART = {
    thrower:
      '<svg viewBox="0 0 120 220" fill="none"><ellipse cx="60" cy="207" rx="33" ry="7" fill="rgba(0,0,0,0.38)"/><path d="M47 145l-5 56 11 2 8-52z" fill="#2d3d2a"/><path d="M73 145l5 56-11 2-8-52z" fill="#24331f"/><path d="M40 199h15v7H38c-2.2 0-3.1-2.2-1.8-4z" fill="#4a3520"/><path d="M65 199h15v7H63c-2.2 0-3.1-2.2-1.8-4z" fill="#4a3520"/><path d="M41 76h38l7 73H34z" fill="#3a5b41"/><path d="M41 76h38l-3 24H44z" fill="#4d7352"/><path d="M37 143h46l-2 11H39z" fill="#5a4025"/><rect x="56" y="143" width="8" height="11" rx="1" fill="#c9a23c"/><path d="M42 82c-8 9-10 24-8 40l9 2 6-35z" fill="#4d7352"/><path d="M78 82c8 9 10 24 8 40l-9 2-6-35z" fill="#4d7352"/><circle cx="34" cy="124" r="5.5" fill="#d7ad7e"/><path d="M84 118l12-8" stroke="#d7ad7e" stroke-width="7" stroke-linecap="round"/><circle cx="96" cy="110" r="5" fill="#d7ad7e"/><path d="M99 108l8-28 4 2-6 29z" fill="#f0d98e"/><path d="M98 112l9-3" stroke="#b98f24" stroke-width="4" stroke-linecap="round"/><path d="M38 73c5 8 12 12 22 12s17-4 22-12" stroke="#2c452f" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="52" r="19" fill="#d7ad7e"/><path d="M41 52c0-14 8-23 19-23s19 9 19 23c-3-6-8-9-13-9-3 3-9 3-12 0-5 0-10 3-13 9z" fill="#66482a"/><path d="M43 46c2-8 8-13 17-13" stroke="#a57845" stroke-width="4" stroke-linecap="round"/><circle cx="53" cy="53" r="2" fill="#2a1d10"/><circle cx="67" cy="53" r="2" fill="#2a1d10"/><path d="M55 62c3 2 7 2 10 0" stroke="#a86a58" stroke-width="2" stroke-linecap="round"/><path d="M74 94l10-6-2 8z" fill="#e8c547" opacity=".7"/></svg>',
    doctor:
      '<svg viewBox="0 0 120 220" fill="none"><ellipse cx="60" cy="207" rx="33" ry="7" fill="rgba(0,0,0,0.38)"/><path d="M48 148l-3 54h10l6-50z" fill="#dfe9e6"/><path d="M72 148l3 54H65l-6-50z" fill="#cfdcd8"/><path d="M42 199h14v7H40c-2 0-3-2-2-4z" fill="#22413f"/><path d="M64 199h14v7H62c-2 0-3-2-2-4z" fill="#22413f"/><path d="M39 78h42l6 88H33z" fill="#eef5f3"/><path d="M39 78h42l2 16H37z" fill="#f8fbfa"/><path d="M52 78h16l4 56H48z" fill="#2f7d78"/><path d="M45 166h30l1 10H44z" fill="#2f7d78" opacity=".4"/><rect x="56" y="98" width="8" height="20" rx="1.5" fill="#f7fbfa"/><rect x="50" y="104" width="20" height="8" rx="1.5" fill="#f7fbfa"/><path d="M39 84c-8 9-10 24-8 40l8 2 6-34z" fill="#eef5f3"/><path d="M81 84c8 9 10 24 8 40l-8 2-6-34z" fill="#eef5f3"/><circle cx="32" cy="126" r="5" fill="#e0b48a"/><circle cx="88" cy="126" r="5" fill="#e0b48a"/><rect x="24" y="120" width="12" height="15" rx="3" fill="#dff6f3" stroke="#789a9b" stroke-width="1.4"/><path d="M30 123v8M26.5 127h7" stroke="#2f7d78" stroke-width="1.4"/><circle cx="60" cy="52" r="19" fill="#e0b48a"/><path d="M41 52c0-14 8-23 19-23s19 9 19 23c-3-6-8-9-13-9-3 3-9 3-12 0-5 0-10 3-13 9z" fill="#5a4533"/><path d="M44 45c2-7 7-11 14-11" stroke="#7c6146" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="27" r="6" fill="#dff6f3" stroke="#789a9b" stroke-width="2"/><path d="M60 24v6M57 27h6" stroke="#2f7d78" stroke-width="1.4"/><circle cx="53" cy="53" r="2" fill="#2a1d10"/><circle cx="67" cy="53" r="2" fill="#2a1d10"/><path d="M55 62c3 2 7 2 10 0" stroke="#a86a58" stroke-width="2" stroke-linecap="round"/></svg>',
    warrior:
      '<svg viewBox="0 0 120 220" fill="none"><ellipse cx="60" cy="207" rx="36" ry="7" fill="rgba(0,0,0,0.4)"/><path d="M38 70h44l8 90H30z" fill="#6d2f2b"/><path d="M46 150l-3 52h11l5-48z" fill="#596b7f"/><path d="M74 150l3 52H66l-5-48z" fill="#4a5b6d"/><path d="M41 198h15v8H39c-2.2 0-3-2.2-1.6-4z" fill="#2f3a45"/><path d="M64 198h15v8H62c-2.2 0-3-2.2-1.6-4z" fill="#2f3a45"/><path d="M40 76h40l6 72H34z" fill="#7f93a8"/><path d="M40 76h40l-4 20H44z" fill="#93a8bd"/><path d="M36 145h48l-2 11H38z" fill="#5b4027"/><rect x="55" y="145" width="10" height="11" rx="1" fill="#c9a23c"/><path d="M40 80c-9 6-12 20-10 34l8 3 8-31z" fill="#6f8398"/><path d="M80 80c9 6 12 20 10 34l-8 3-8-31z" fill="#6f8398"/><circle cx="36" cy="118" r="12" fill="#93a8bd" stroke="#c9a23c" stroke-width="2"/><circle cx="36" cy="118" r="4" fill="#c9a23c"/><circle cx="86" cy="116" r="10" fill="#93a8bd" stroke="#c9a23c" stroke-width="2"/><path d="M86 108l4-20 4 20-4 5z" fill="#dce6ef"/><path d="M86 118h8" stroke="#c9a23c" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="52" r="19" fill="#d7ad7e"/><path d="M41 52c0-13 8-22 19-22s19 9 19 22c-3-5-8-8-13-8-3 3-9 3-12 0-5 0-10 3-13 8z" fill="#8fa0b2"/><path d="M45 46c2-6 7-10 15-10" stroke="#b8c8d8" stroke-width="4" stroke-linecap="round"/><path d="M43 54h34" stroke="#3e4a58" stroke-width="3"/><path d="M60 30v-8" stroke="#c9a23c" stroke-width="3" stroke-linecap="round"/><path d="M53 21c2-4 12-4 14 0" stroke="#b64634" stroke-width="5" stroke-linecap="round"/><circle cx="53" cy="54" r="2" fill="#2a1d10"/><circle cx="67" cy="54" r="2" fill="#2a1d10"/><path d="M55 63c3 2 7 2 10 0" stroke="#8d5f43" stroke-width="2" stroke-linecap="round"/></svg>',
    electrician:
      '<svg viewBox="0 0 120 220" fill="none"><ellipse cx="60" cy="207" rx="33" ry="7" fill="rgba(0,0,0,0.38)"/><path d="M47 146l-4 54h11l6-50z" fill="#1b2c3d"/><path d="M73 146l4 54H66l-6-50z" fill="#152434"/><path d="M40 199h15v7H38c-2.2 0-3.1-2.2-1.8-4z" fill="#0f1a24"/><path d="M65 199h15v7H63c-2.2 0-3.1-2.2-1.8-4z" fill="#0f1a24"/><path d="M41 76h38l6 73H35z" fill="#274a68"/><path d="M41 76h38l-3 20H44z" fill="#315b7f"/><path d="M36 142h48l-2 11H38z" fill="#1b2c3d"/><path d="M38 126h44v8H38z" fill="#f2c94c" opacity=".9"/><path d="M42 82c-8 9-10 23-8 38l8 2 6-33z" fill="#315b7f"/><path d="M78 82c7 8 9 20 8 33l-7 2-6-29z" fill="#315b7f"/><circle cx="33" cy="122" r="5" fill="#d9a97e"/><path d="M83 112l14 4" stroke="#d9a97e" stroke-width="7" stroke-linecap="round"/><path d="M98 108l4 18" stroke="#7a5c22" stroke-width="5" stroke-linecap="round"/><path d="M95 103l-2 8 6-4 1 8 6-10h-6l1-6z" fill="#ffd95e"/><circle cx="60" cy="52" r="19" fill="#e6b98d"/><path d="M41 52c0-13 8-22 19-22s19 9 19 22c-3-6-8-9-13-9-3 3-9 3-12 0-5 0-10 3-13 9z" fill="#3a2a1e"/><path d="M40 44c0-12 8-19 20-19s20 7 20 19z" fill="#f2c94c"/><path d="M35 44h50c1.8 0 2.8 1.1 2.8 2.8S86.8 49.6 85 49.6H35c-1.8 0-2.8-1.1-2.8-2.8S33.2 44 35 44z" fill="#e0ad2f"/><path d="M56 25h8v7h-8z" fill="#e0ad2f"/><rect x="45" y="50" width="12" height="9" rx="4" fill="#0e2233" stroke="#7fd4ff" stroke-width="1.5"/><rect x="63" y="50" width="12" height="9" rx="4" fill="#0e2233" stroke="#7fd4ff" stroke-width="1.5"/><path d="M57 54.5h6" stroke="#7fd4ff" stroke-width="1.5"/><circle cx="53" cy="64" r="2" fill="#2a1d10"/><circle cx="67" cy="64" r="2" fill="#2a1d10"/><path d="M56 70c2.5 1.6 5.5 1.6 8 0" stroke="#a86a58" stroke-width="2" stroke-linecap="round"/></svg>',
    vampire:
      '<svg viewBox="0 0 120 220" fill="none"><ellipse cx="60" cy="209" rx="30" ry="6" fill="rgba(0,0,0,0.4)"/><path d="M40 72c-14 22-22 56-16 90l16 14 8-52z" fill="#3a0d18"/><path d="M80 72c14 22 22 56 16 90l-16 14-8-52z" fill="#2c0912"/><path d="M48 148l-4 48h11l6-44z" fill="#1c1018"/><path d="M72 148l4 48H65l-6-44z" fill="#160b12"/><path d="M42 194h14v7H40c-2 0-3-2-2-4z" fill="#0d070b"/><path d="M64 194h14v7H62c-2 0-3-2-2-4z" fill="#0d070b"/><path d="M42 78h36l5 70H37z" fill="#24101a"/><path d="M50 78h20l4 28H46z" fill="#3a0d18"/><path d="M54 88l6 8 6-8-6-5z" fill="#c8304a"/><path d="M42 84c-7 8-9 20-7 34l7 2 5-30z" fill="#24101a"/><path d="M78 84c7 8 9 20 7 34l-7 2-5-30z" fill="#24101a"/><circle cx="35" cy="120" r="4.5" fill="#d8c3c6"/><circle cx="85" cy="120" r="4.5" fill="#d8c3c6"/><path d="M32 124l-4 6M38 124l2 7M82 124l-2 7M88 124l4 6" stroke="#d8c3c6" stroke-width="2" stroke-linecap="round"/><path d="M39 74c4 7 11 11 21 11s17-4 21-11" stroke="#17101a" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="52" r="19" fill="#e7d7da"/><path d="M41 52c0-14 8-23 19-23s19 9 19 23c-2-5-5-8-8-9l-5 4-6-4-6 4-5-4c-3 1-6 4-8 9z" fill="#17101a"/><path d="M48 48l6-1M72 48l-6-1" stroke="#2a1820" stroke-width="2" stroke-linecap="round"/><ellipse cx="53" cy="54" rx="2.6" ry="1.8" fill="#ff3b5c"/><ellipse cx="67" cy="54" rx="2.6" ry="1.8" fill="#ff3b5c"/><path d="M54 64c2 1.2 4 1.2 6 0" stroke="#8f3a4a" stroke-width="1.8" stroke-linecap="round"/><path d="M56 64l1 3 1-2.6M64 64l-1 3-1-2.6" fill="#fff5f6"/><circle cx="60" cy="88" r="3" fill="#c8304a" stroke="#f0c05a" stroke-width=".8"/></svg>',
    rebirth:
      '<svg viewBox="0 0 120 220" fill="none"><ellipse cx="60" cy="207" rx="33" ry="7" fill="rgba(0,0,0,0.38)"/><path d="M40 82h40l12 100H28z" fill="#4b3a1d"/><path d="M44 84h32l6 92H38z" fill="#7a5c22"/><path d="M52 84h16l4 70H48z" fill="#9b762c"/><path d="M38 174h44l2 12H36z" fill="#c9a23c"/><path d="M42 88c-8 8-10 22-8 36l8 2 6-32z" fill="#7a5c22"/><path d="M78 88c8 8 10 22 8 36l-8 2-6-32z" fill="#7a5c22"/><circle cx="34" cy="126" r="5" fill="#e2b98c"/><circle cx="86" cy="126" r="5" fill="#e2b98c"/><path d="M33 126l-6 4M87 126l6 4" stroke="#e2b98c" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="52" r="19" fill="#e2b98c"/><path d="M41 52c0-14 8-23 19-23s19 9 19 23c-3-6-8-9-13-9-3 3-9 3-12 0-5 0-10 3-13 9z" fill="#2f2415"/><path d="M45 48c2-7 7-11 15-11" stroke="#4a3a22" stroke-width="4" stroke-linecap="round"/><circle cx="53" cy="53" r="2" fill="#ffd35e"/><circle cx="67" cy="53" r="2" fill="#ffd35e"/><path d="M55 62c3 2 7 2 10 0" stroke="#a86a58" stroke-width="2" stroke-linecap="round"/><circle cx="60" cy="40" r="2" fill="#ffd35e"/><ellipse cx="60" cy="20" rx="17" ry="4.5" stroke="#ffd35e" stroke-width="2.4"/><path d="M32 96l4 8 8-2" stroke="#c9a23c" stroke-width="2" stroke-linecap="round"/><path d="M88 96l-4 8-8-2" stroke="#c9a23c" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  const els = {
    menu: $("#menu"),
    navButtons: $$(".menu-btn[data-action]"),
    soundToggle: $("#sound-toggle"),
    characterSlot: $("#character-slot"),
    characterSlotName: $("#character-slot-name"),
    characterSlotSub: $("#character-slot-sub"),
    characterPortraits: $$("#character-slot [data-portrait]"),
    characterOptions: $$(".character-option[data-character]"),
    characterModal: $("#character-modal"),
    modeModal: $("#mode-modal"),
    modeButtons: $$("[data-mode]"),
    customWaves: $("#custom-waves"),
    customWaveInput: $("#custom-wave-input"),
    customStart: $("#custom-start"),
    mapModal: $("#map-modal"),
    mapConfirm: $("#map-confirm"),
    mapOptions: $$(".map-option[data-map]"),
    menuMoney: $("#menu-money-count"),
    gearModal: $("#gear-modal"),
    gearMoney: $("#gear-money"),
    gearSlots: $$(".gear-slot[data-slot]"),
    gearStats: {
      damage: $("#gear-stat-damage"),
      hp: $("#gear-stat-hp"),
      armor: $("#gear-stat-armor"),
      speed: $("#gear-stat-speed"),
      fireRate: $("#gear-stat-fire-rate"),
      magnet: $("#gear-stat-magnet"),
    },
    loadoutHero: $("#loadout-hero"),
    loadoutHeroArt: $("#loadout-hero-art"),
    loadoutHeroName: $("#loadout-hero-name"),
    loadoutHeroTag: $("#loadout-hero-tag"),
    loadoutPower: $("#loadout-power"),
    openGearButtons: $$("[data-open-gear]"),
    settingsModal: $("#settings-modal"),
    creditsModal: $("#credits-modal"),
    music: $("#music-volume"),
    sfx: $("#sfx-volume"),
    musicValue: $("#music-value"),
    sfxValue: $("#sfx-value"),
    fullscreenToggle: $("#fullscreen-toggle"),
    shakeToggle: $("#shake-toggle"),
    autoAttackToggle: $("#auto-attack-toggle"),
    reset: $("#reset-settings"),
  };

  let settings = loadSettings();
  let selectedCharacter = loadCharacter();
  let selectedMap = loadMap();
  let pendingMode = "normal";
  let pendingWaves = 50;
  let activeModal = null;
  let lastFocus = null;
  let focusIndex = 0;
  let busy = false;
  let hoverCooldown = 0;

  /* ---------- settings ---------- */

  function loadSettings() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };

      const parsed = JSON.parse(raw);
      return {
        music: numberOr(parsed.music, DEFAULTS.music, 0, 100),
        sfx: numberOr(parsed.sfx, DEFAULTS.sfx, 0, 100),
        shake: typeof parsed.shake === "boolean" ? parsed.shake : DEFAULTS.shake,
        autoAttack:
          typeof parsed.autoAttack === "boolean" ? parsed.autoAttack : DEFAULTS.autoAttack,
        muted: typeof parsed.muted === "boolean" ? parsed.muted : DEFAULTS.muted,
      };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  function numberOr(value, fallback, min, max) {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      /* localStorage có thể bị chặn — bỏ qua */
    }
  }

  function loadCharacter() {
    try {
      const raw = window.localStorage.getItem(CHARACTER_KEY);
      const unlocked = loadCharacterUnlocked();
      if (
        raw &&
        (raw === "thrower" || unlocked.includes(raw)) &&
        (raw === "doctor" || raw === "warrior" || raw === "thrower" || raw === "rebirth" || raw === "electrician" || raw === "vampire")
      ) {
        return raw;
      }
    } catch (error) {
      /* bỏ qua */
    }
    return "thrower";
  }

  function loadCharacterUnlocked() {
    try {
      const raw = window.localStorage.getItem(CHARACTER_UNLOCKED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      /* bỏ qua */
    }
    // Mặc định đã mở khóa người ném phi tiêu
    return ["thrower"];
  }

  function saveCharacterUnlocked(list) {
    try {
      window.localStorage.setItem(CHARACTER_UNLOCKED_KEY, JSON.stringify(list));
    } catch (error) {
      /* bỏ qua */
    }
  }

  function unlockCharacter(id) {
    const unlocked = loadCharacterUnlocked();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      saveCharacterUnlocked(unlocked);
    }
  }

  function saveCharacter(id) {
    try {
      window.localStorage.setItem(CHARACTER_KEY, id);
    } catch (error) {
      /* bỏ qua */
    }
  }

  function loadMap() {
    try {
      const raw = window.localStorage.getItem(MAP_KEY);
      if (raw === "night" || raw === "day" || raw === "moon") return raw;
    } catch (error) {
      /* bỏ qua */
    }
    return "night";
  }

  function saveMap(id) {
    try {
      window.localStorage.setItem(MAP_KEY, id);
    } catch (error) {
      /* bỏ qua */
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function saveWalletValue(value) {
    try {
      window.localStorage.setItem("deepwood.money.v1", String(Math.max(0, Math.floor(value))));
    } catch (error) {
      /* bỏ qua */
    }
  }

  function getGearBonuses() {
    return { ...EMPTY_GEAR_BONUSES };
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function syncGearUI() {
    GEAR_SLOTS.forEach((slot) => {
      const button = document.querySelector(`.gear-slot[data-slot="${slot.id}"]`);
      if (!button) return;
      button.dataset.tier = "empty";
      button.dataset.item = "";
      const nameEl = button.querySelector(`[data-gear-name="${slot.id}"]`);
      const bonusEl = button.querySelector(`[data-gear-bonus="${slot.id}"]`);
      if (nameEl) nameEl.textContent = "Chưa có trang bị";
      if (bonusEl) bonusEl.textContent = "Kho tạm thời trống";
      button.setAttribute("aria-label", `${slot.name}: chưa có trang bị`);
    });

    setText(els.gearStats.damage, "+0%");
    setText(els.gearStats.hp, "+0");
    setText(els.gearStats.armor, "+0");
    setText(els.gearStats.speed, "+0%");
    setText(els.gearStats.fireRate, "+0%");
    setText(els.gearStats.magnet, "+0px");
    setText(els.loadoutPower, "0");
    setText(els.gearMoney, String(loadWallet()));
  }

  function syncLoadoutHero() {
    const id = CHARACTER_META[selectedCharacter] ? selectedCharacter : "thrower";
    const meta = CHARACTER_META[id];
    if (els.loadoutHero) els.loadoutHero.dataset.character = id;
    if (els.loadoutHeroArt) {
      els.loadoutHeroArt.innerHTML = HERO_ART[id] || HERO_ART.thrower;
    }
    setText(els.loadoutHeroName, meta.name);
    setText(els.loadoutHeroTag, meta.sub.split(" · ")[0]);
  }

  function refreshGearModal() {
    if (!els.gearModal) return;
    setText(els.gearMoney, String(loadWallet()));
  }

  function openGear() {
    refreshGearModal();
    openModal(els.gearModal);
  }

  function syncCustomHint(message) {
    const hint = document.querySelector(".custom-waves__hint");
    if (!hint) return;
    hint.textContent = message;
    window.setTimeout(() => {
      hint.textContent = "Tối thiểu 20 đợt, tối đa 500 đợt.";
    }, 1800);
  }

  function loadWallet() {
    try {
      const value = Number(window.localStorage.getItem("deepwood.money.v1"));
      if (Number.isFinite(value) && value > 0) return Math.floor(value);
    } catch (error) {
      /* bỏ qua */
    }
    return 0;
  }

  function syncMenuMoney(value) {
    if (!els.menuMoney) return;
    const amount = Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : loadWallet();
    els.menuMoney.textContent = String(amount);
  }

  function sortCharacterOptions() {
    const charGrid = document.querySelector(".character-grid");
    if (!charGrid) return;
    const sorted = els.characterOptions.slice().sort((a, b) => {
      const aSelected = a.dataset.character === selectedCharacter ? 0 : 1;
      const bSelected = b.dataset.character === selectedCharacter ? 0 : 1;
      if (aSelected !== bSelected) return aSelected - bSelected;
      const priceA = CHARACTER_PRICES[a.dataset.character] || 0;
      const priceB = CHARACTER_PRICES[b.dataset.character] || 0;
      return priceA - priceB;
    });
    sorted.forEach((btn) => charGrid.appendChild(btn));
  }

  function applyCharacter(id, persist) {
    const next = CHARACTER_META[id] ? id : "thrower";
    selectedCharacter = next;

    const meta = CHARACTER_META[next];
    if (els.characterSlotName) els.characterSlotName.textContent = meta.name;
    if (els.characterSlotSub) els.characterSlotSub.textContent = meta.sub;
    if (els.characterSlot) els.characterSlot.dataset.character = next;

    els.characterPortraits.forEach((portrait) => {
      portrait.hidden = portrait.dataset.portrait !== next;
    });

    els.characterOptions.forEach((button) => {
      const active = button.dataset.character === next;
      const unlocked = loadCharacterUnlocked().includes(button.dataset.character);
      button.classList.toggle("is-selected", active);
      button.classList.toggle("character-option--locked", !unlocked);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      const stateEl = button.querySelector(".character-option__state");
      if (stateEl) stateEl.textContent = active ? "Đang chọn" : unlocked ? "Chọn" : "Khóa";
    });

    // Thứ tự: nhân vật đang chọn trước, sau đó giá tăng dần.
    sortCharacterOptions();
    syncLoadoutHero();

    if (persist) saveCharacter(next);
  }

  function applySettingsToUI() {
    setSlider(els.music, els.musicValue, settings.music);
    setSlider(els.sfx, els.sfxValue, settings.sfx);
    setToggle(els.shakeToggle, settings.shake);
    setToggle(els.autoAttackToggle, settings.autoAttack);
    syncFullscreen();
    syncSoundUI();
  }

  function setSlider(input, output, value) {
    input.value = String(value);
    output.textContent = `${value}%`;
    input.style.setProperty("--fill", `${value}%`);
  }

  function setToggle(toggle, on) {
    if (!toggle) return;
    toggle.setAttribute("aria-checked", on ? "true" : "false");

    if (toggle === els.fullscreenToggle) {
      toggle.setAttribute(
        "aria-label",
        on ? "Thoát chế độ toàn màn hình" : "Bật chế độ toàn màn hình"
      );
    }

    if (toggle === els.shakeToggle) {
      toggle.setAttribute(
        "aria-label",
        on ? "Tắt rung màn hình" : "Bật rung màn hình"
      );
    }

    if (toggle === els.autoAttackToggle) {
      toggle.setAttribute(
        "aria-label",
        on ? "Tắt tự động tấn công" : "Bật tự động tấn công"
      );
    }
  }

  function syncSoundUI() {
    if (!els.soundToggle) return;
    els.soundToggle.classList.toggle("is-muted", settings.muted);
    els.soundToggle.setAttribute("aria-pressed", String(!settings.muted));
    els.soundToggle.setAttribute(
      "aria-label",
      settings.muted ? "Bật âm thanh" : "Tắt âm thanh"
    );
    els.soundToggle.title = settings.muted ? "Bật âm thanh (M)" : "Tắt âm thanh (M)";
  }

  /* ---------- audio ---------- */

  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    DeepwoodAudio.unlock();
  }

  function playHover() {
    const now = performance.now();
    if (now - hoverCooldown < 70) return;
    hoverCooldown = now;
    DeepwoodAudio.hover();
  }

  function toggleMute() {
    unlockAudio();
    settings.muted = !settings.muted;
    saveSettings();
    DeepwoodAudio.setMuted(settings.muted);
    syncSoundUI();

    if (!settings.muted) {
      DeepwoodAudio.toggleSound(true);
    }
  }

  /* ---------- modals ---------- */

  function openModal(layer) {
    if (activeModal || busy) return;

    if (layer === els.modeModal && els.customWaves) {
      els.customWaves.hidden = true;
    }

    activeModal = layer;
    lastFocus = document.activeElement;
    layer.hidden = false;

    const focusTarget = layer.querySelector("[data-autofocus]") || layer.querySelector("[data-close]");
    window.requestAnimationFrame(() => {
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    if (!activeModal) return;

    const wasMap = activeModal === els.mapModal;

    activeModal.hidden = true;
    activeModal = null;

    if (wasMap) {
      els.menu.removeAttribute("inert");
      els.menu.removeAttribute("aria-hidden");
    }

    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  function trapFocus(event, container) {
    const focusable = $$(
      "button, input, [href], select, textarea, [tabindex]:not([tabindex='-1'])",
      container
    ).filter((el) => !el.disabled && el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!container.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- play flow ---------- */

  function enterGame(mode, customWaves) {
    if (busy) return;

    pendingMode = mode || "normal";
    if (pendingMode === "custom") {
      pendingWaves = clamp(Math.round(Number(customWaves) || 50), 20, 500);
    }

    // Don't set busy yet — user may cancel map selection
    els.menu.setAttribute("inert", "");
    els.menu.setAttribute("aria-hidden", "true");

    // Highlight selected map option
    els.mapOptions.forEach((opt) => {
      opt.classList.toggle("is-selected", opt.dataset.map === selectedMap);
    });

    openModal(els.mapModal);
  }

  function exitGame() {
    busy = false;
    els.menu.classList.remove("is-hidden");
    els.menu.removeAttribute("inert");
    els.menu.removeAttribute("aria-hidden");
    syncMenuMoney(loadWallet());

    focusIndex = 0;
    window.setTimeout(() => {
      if (!activeModal && !busy) {
        els.navButtons[0].focus({ preventScroll: true });
      }
    }, 80);
  }

  /* ---------- fullscreen ---------- */

  function syncFullscreen() {
    const on = Boolean(document.fullscreenElement);
    setToggle(els.fullscreenToggle, on);

    if (!document.fullscreenEnabled) {
      els.fullscreenToggle.disabled = true;
      els.fullscreenToggle.setAttribute("aria-disabled", "true");
    }
  }

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      /* Trình duyệt có thể từ chối — bỏ qua */
    }

    syncFullscreen();
  }

  /* ---------- events ---------- */

  function bindEvents() {
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    els.navButtons.forEach((button, index) => {
      button.addEventListener("focus", () => {
        focusIndex = index;
        els.navButtons.forEach((other) => {
          other.classList.toggle("is-focused", other === button);
        });
      });

      button.addEventListener("blur", () => button.classList.remove("is-focused"));

      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        const action = button.dataset.action;

        if (action === "play") {
          openModal(els.modeModal);
        } else if (action === "shop") {
          openGear();
        } else if (action === "settings") {
          openModal(els.settingsModal);
        } else if (action === "credits") {
          openModal(els.creditsModal);
        }
      });
    });

    if (els.characterSlot) {
      els.characterSlot.addEventListener("click", () => {
        DeepwoodAudio.click();
        openModal(els.characterModal);
      });
    }

    els.gearSlots.forEach((button) => {
      button.addEventListener("pointerenter", playHover);
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        openGear();
      });
    });

    els.openGearButtons.forEach((button) => {
      button.addEventListener("pointerenter", playHover);
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        openGear();
      });
    });

    els.modeButtons.forEach((button) => {
      button.addEventListener("pointerenter", playHover);
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        const mode = button.dataset.mode;
        if (mode === "custom") {
          if (els.customWaves) {
            els.customWaves.hidden = false;
            if (els.customWaveInput) {
              els.customWaveInput.value = String(pendingWaves);
              window.requestAnimationFrame(() => {
                els.customWaveInput.focus({ preventScroll: true });
                els.customWaveInput.select();
              });
            }
          }
          return;
        }
        closeModal();
        enterGame(mode);
      });
    });

    if (els.customStart) {
      els.customStart.addEventListener("click", () => {
        DeepwoodAudio.click();
        const waves = Math.round(Number(els.customWaveInput?.value) || 50);
        if (!Number.isFinite(waves) || waves < 20) {
          syncCustomHint("Tối thiểu 20 đợt");
          els.customWaveInput?.focus({ preventScroll: true });
          return;
        }
        closeModal();
        enterGame("custom", waves);
      });
    }

    if (els.customWaveInput) {
      els.customWaveInput.addEventListener("input", () => {
        const value = Number(els.customWaveInput.value);
        if (Number.isFinite(value) && value >= 20 && value <= 500) {
          pendingWaves = Math.round(value);
        }
      });
    }

    els.mapOptions.forEach((button) => {
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        selectedMap = button.dataset.map;
        saveMap(selectedMap);
        Background.setMapType(selectedMap);
        els.mapOptions.forEach((opt) => {
          opt.classList.toggle("is-selected", opt.dataset.map === selectedMap);
        });
      });
    });

    els.mapConfirm.addEventListener("click", () => {
      DeepwoodAudio.click();
      closeModal();
      els.menu.classList.add("is-hidden");
      window.setTimeout(() => {
        busy = false;
        Background.setMapType(selectedMap);
        Game.start({
          mode: pendingMode,
          customWaves: pendingWaves,
          character: selectedCharacter,
          map: selectedMap,
          autoAttack: settings.autoAttack,
          equipment: getGearBonuses(),
          onQuit: exitGame,
        });
      }, 300);
    });

    els.characterOptions.forEach((button) => {
      button.addEventListener("pointerenter", playHover);
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        const id = button.dataset.character;
        const price = CHARACTER_PRICES[id] || 0;
        const unlocked = loadCharacterUnlocked();
        if (unlocked.includes(id)) {
          applyCharacter(id, true);
        } else if (price > 0) {
          const money = loadWallet();
          if (money >= price) {
            saveWalletValue(money - price);
            unlockCharacter(id);
            applyCharacter(id, true);
            syncMenuMoney(loadWallet());
            DeepwoodAudio.pickup();
          } else {
            DeepwoodAudio.back();
                        const hint = document.querySelector(".character-hint");
            if (hint) {
              hint.textContent = "Không đủ tiền";
              hint.style.color = "#ff6b6b";
              setTimeout(() => {
                hint.textContent = "Chọn nhân vật để bắt đầu";
                hint.style.color = "";
              }, 1500);
            }
          }
        } else {
          applyCharacter(id, true);
        }
      });
    });

    $$(".menu-btn").forEach((button) => {
      button.addEventListener("mouseenter", playHover);
      button.addEventListener("focus", () => button.classList.add("is-focused"));
      button.addEventListener("blur", () => button.classList.remove("is-focused"));
    });

    $$("[data-close]").forEach((button) => {
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        closeModal();
      });
    });

    [els.settingsModal, els.creditsModal, els.characterModal, els.modeModal, els.gearModal].forEach((layer) => {
      layer.addEventListener("pointerdown", (event) => {
        if (event.target === layer) {
          DeepwoodAudio.back();
          closeModal();
        }
      });
    });

    els.soundToggle.addEventListener("click", toggleMute);

    els.music.addEventListener("input", () => {
      settings.music = Number(els.music.value);
      setSlider(els.music, els.musicValue, settings.music);
      DeepwoodAudio.setMusic(settings.music / 100);
      saveSettings();
    });

    els.sfx.addEventListener("input", () => {
      settings.sfx = Number(els.sfx.value);
      setSlider(els.sfx, els.sfxValue, settings.sfx);
      DeepwoodAudio.setSfx(settings.sfx / 100);
      saveSettings();
    });

    els.sfx.addEventListener("change", () => {
      DeepwoodAudio.click();
    });

    els.fullscreenToggle.addEventListener("click", () => {
      DeepwoodAudio.click();
      toggleFullscreen();
    });

    els.shakeToggle.addEventListener("click", () => {
      settings.shake = !settings.shake;
      setToggle(els.shakeToggle, settings.shake);
      saveSettings();
      DeepwoodAudio.toggleSound(settings.shake);
    });

    els.autoAttackToggle.addEventListener("click", () => {
      settings.autoAttack = !settings.autoAttack;
      setToggle(els.autoAttackToggle, settings.autoAttack);
      saveSettings();
      DeepwoodAudio.toggleSound(settings.autoAttack);
      document.dispatchEvent(
        new CustomEvent("deepwood:set-auto-attack", { detail: settings.autoAttack })
      );
    });

    els.reset.addEventListener("click", () => {
      settings = { ...DEFAULTS };
      saveSettings();
      applySettingsToUI();
      DeepwoodAudio.init({
        music: settings.music / 100,
        sfx: settings.sfx / 100,
        muted: settings.muted,
      });
      DeepwoodAudio.click();
    });

    document.addEventListener("fullscreenchange", syncFullscreen);

    // ---------- Mobile controls: joystick 360° ----------
    const joystick = $("#joystick");
    const joystickBase = $("#joystick-base");
    const joystickKnob = $("#joystick-knob");
    const shootBtn = $("#mobile-shoot");
    let joystickPointerId = null;

    const setMoveVector = (x, y) => {
      if (window.Game && typeof window.Game.setMoveVector === "function") {
        window.Game.setMoveVector(x, y);
      }
    };

    const resetJoystick = () => {
      joystickPointerId = null;
      if (joystick) joystick.classList.remove("is-active");
      if (joystickKnob) joystickKnob.style.transform = "translate(-50%, -50%)";
      setMoveVector(0, 0);
    };

    const updateJoystick = (clientX, clientY) => {
      if (!joystickBase || !joystickKnob) return;
      const rect = joystickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const knobSize = joystickKnob.offsetWidth || 58;
      const maxTravel = Math.max(1, rect.width / 2 - knobSize / 2 - 6);
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      if (dist > maxTravel && dist > 0) {
        dx = (dx / dist) * maxTravel;
        dy = (dy / dist) * maxTravel;
      }
      joystickKnob.style.transform =
        "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";

      const nx = dx / maxTravel;
      const ny = dy / maxTravel;
      const mag = Math.hypot(nx, ny);
      const deadzone = 0.18;
      if (mag <= deadzone) {
        setMoveVector(0, 0);
        return;
      }
      const strength = Math.min(1, (mag - deadzone) / (1 - deadzone));
      setMoveVector((nx / mag) * strength, (ny / mag) * strength);
    };

    if (joystickBase) {
      joystickBase.addEventListener(
        "pointerdown",
        (event) => {
          if (joystickPointerId !== null) return;
          if (!document.body.classList.contains("is-playing")) return;
          event.preventDefault();
          joystickPointerId = event.pointerId;
          if (joystick) joystick.classList.add("is-active");
          try {
            joystickBase.setPointerCapture(event.pointerId);
          } catch (error) {
            /* no-op */
          }
          updateJoystick(event.clientX, event.clientY);
        },
        { passive: false }
      );

      joystickBase.addEventListener(
        "pointermove",
        (event) => {
          if (event.pointerId !== joystickPointerId) return;
          event.preventDefault();
          updateJoystick(event.clientX, event.clientY);
        },
        { passive: false }
      );

      const endJoystick = (event) => {
        if (event.pointerId !== joystickPointerId) return;
        resetJoystick();
      };
      joystickBase.addEventListener("pointerup", endJoystick);
      joystickBase.addEventListener("pointercancel", endJoystick);
      joystickBase.addEventListener("lostpointercapture", endJoystick);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) resetJoystick();
    });
    window.addEventListener("blur", resetJoystick);

    if (shootBtn && typeof Game.triggerManualShoot === "function") {
      const shootStart = (event) => {
        event.preventDefault();
        Game.triggerManualShoot();
        shootBtn.classList.add("is-pressed");
        window.setTimeout(() => shootBtn.classList.remove("is-pressed"), 120);
      };
      shootBtn.addEventListener("touchstart", shootStart, { passive: false });
      shootBtn.addEventListener("pointerdown", shootStart, { passive: false });
    }

    document.addEventListener("keydown", (event) => {
      const key = event.key;

      if (activeModal) {
        if (key === "Escape") {
          event.preventDefault();
          DeepwoodAudio.back();
          closeModal();
        } else if (key === "Tab") {
          trapFocus(event, activeModal);
        }
        return;
      }

      if ((key === "m" || key === "M") && !busy && els.menu.classList.contains("is-hidden") === false) {
        toggleMute();
        return;
      }

      if (busy || els.menu.classList.contains("is-hidden")) return;

      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "w" ||
        key === "W" ||
        key === "s" ||
        key === "S"
      ) {
        event.preventDefault();

        const down = key === "ArrowDown" || key === "s" || key === "S";
        const count = els.navButtons.length;
        focusIndex = (focusIndex + (down ? 1 : -1) + count) % count;

        els.navButtons[focusIndex].focus({ preventScroll: true });
        DeepwoodAudio.hover();
        return;
      }

      const active = document.activeElement;
      const onControl = Boolean(
        active && active.closest && active.closest("button, a, input, select, textarea")
      );

      if ((key === "Enter" || key === " ") && !onControl) {
        event.preventDefault();
        els.navButtons[focusIndex].focus({ preventScroll: true });
        els.navButtons[focusIndex].click();
      }
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    // Kho trang bị tạm thời chưa có vật phẩm: xóa dữ liệu trang bị cũ.
    try {
      window.localStorage.removeItem(GEAR_KEY);
    } catch (error) {
      /* bỏ qua */
    }

    settings = loadSettings();

    DeepwoodAudio.init({
      music: settings.music / 100,
      sfx: settings.sfx / 100,
      muted: settings.muted,
    });

    applySettingsToUI();
    applyCharacter(selectedCharacter, false);
    syncGearUI();
    syncMenuMoney(loadWallet());
    Background.setMapType(selectedMap);
    bindEvents();
    Background.init();

    document.addEventListener("deepwood:money", (event) => {
      syncMenuMoney(event.detail);
    });

    // Also apply character-hint visibility
    const hint = document.querySelector(".character-hint");
    if (hint) hint.textContent = "Chọn nhân vật để bắt đầu";
  }

  boot();
})();
