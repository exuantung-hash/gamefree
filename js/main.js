/* ============================================================
   DEEPWOOD — menu, settings, credits & play flow
   ============================================================ */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEY = "deepwood.settings.v1";
  const CHARACTER_KEY = "deepwood.character.v2";
  const MAP_KEY = "deepwood.map.v1";
  const SHOP_KEY = "deepwood.shop.v1";
  const DEFAULTS = {
    music: 35,
    sfx: 70,
    shake: true,
    autoAttack: true,
    muted: false,
  };

  const SHOP_DEFS = {
    hp: { max: 5, base: 80, step: 40 },
    speed: { max: 3, base: 120, step: 60 },
  };

  const CHARACTER_META = {
    doctor: { name: "Bác sĩ", sub: "Doctor · Máu 100 · Hồi máu" },
    warrior: { name: "Chiến binh", sub: "Warrior · Giáp 100 · Máu 120" },
    thrower: { name: "Người ném phi tiêu", sub: "Dart Thrower · Máu 100" },
    rebirth: { name: "Tái sinh", sub: "Rebirth · Máu 90 · Hồi sinh 1 lần" },
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
    shopModal: $("#shop-modal"),
    shopMoney: $("#shop-money"),
    shopItems: $$(".shop-item[data-upgrade]"),
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
  let shop = loadShop();
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
      if (raw === "doctor" || raw === "warrior" || raw === "thrower" || raw === "rebirth") {
        return raw;
      }
    } catch (error) {
      /* bỏ qua */
    }
    return "doctor";
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

  function loadShop() {
    try {
      const raw = window.localStorage.getItem(SHOP_KEY);
      if (!raw) return { hp: 0, speed: 0 };
      const parsed = JSON.parse(raw);
      return {
        hp: clamp(Number(parsed.hp) || 0, 0, SHOP_DEFS.hp.max),
        speed: clamp(Number(parsed.speed) || 0, 0, SHOP_DEFS.speed.max),
      };
    } catch (error) {
      return { hp: 0, speed: 0 };
    }
  }

  function saveShop() {
    try {
      window.localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
    } catch (error) {
      /* bỏ qua */
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shopPrice(id) {
    const def = SHOP_DEFS[id];
    if (!def) return Infinity;
    return def.base + (shop[id] || 0) * def.step;
  }

  function saveWalletValue(value) {
    try {
      window.localStorage.setItem("deepwood.money.v1", String(Math.max(0, Math.floor(value))));
    } catch (error) {
      /* bỏ qua */
    }
  }

  function refreshShop() {
    if (!els.shopMoney) return;
    const money = loadWallet();
    els.shopMoney.textContent = String(money);

    els.shopItems.forEach((button) => {
      const id = button.dataset.upgrade;
      const def = SHOP_DEFS[id];
      if (!def) return;
      const level = shop[id] || 0;
      const maxed = level >= def.max;
      const price = shopPrice(id);
      const levelEl = button.querySelector(`[data-level="${id}"]`);
      const priceEl = button.querySelector(`[data-price="${id}"]`);
      if (levelEl) levelEl.textContent = String(level);
      if (priceEl) priceEl.textContent = maxed ? "Tối đa" : `${price} ◆`;
      button.classList.toggle("is-maxed", maxed);
      button.classList.toggle("is-locked", !maxed && money < price);
      button.disabled = maxed;
      button.setAttribute(
        "aria-label",
        maxed
          ? `${button.querySelector(".shop-item__name")?.textContent || id} — đã tối đa`
          : `${button.querySelector(".shop-item__name")?.textContent || id} — ${price} tiền`
      );
    });
  }

  function buyUpgrade(id) {
    const def = SHOP_DEFS[id];
    if (!def) return;
    const level = shop[id] || 0;
    if (level >= def.max) return;

    const price = shopPrice(id);
    const money = loadWallet();
    if (money < price) {
      DeepwoodAudio.back();
      syncShopFeedback("Không đủ tiền");
      return;
    }

    saveWalletValue(money - price);
    shop[id] = level + 1;
    saveShop();
    DeepwoodAudio.pickup();
    syncMenuMoney(loadWallet());
    refreshShop();
    syncShopFeedback("Đã nâng cấp!");
  }

  let shopFeedbackTimer = 0;

  function syncShopFeedback(message) {
    const hint = document.querySelector(".shop-hint");
    if (!hint) return;
    window.clearTimeout(shopFeedbackTimer);
    hint.textContent = message;
    shopFeedbackTimer = window.setTimeout(() => {
      hint.textContent = "Tiền được lưu tự động";
    }, 1800);
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

  function applyCharacter(id, persist) {
    const next = CHARACTER_META[id] ? id : "doctor";
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
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      const stateEl = button.querySelector(".character-option__state");
      if (stateEl) stateEl.textContent = active ? "Đang chọn" : "Chọn";
    });

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
          refreshShop();
          openModal(els.shopModal);
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
          upgrades: { ...shop },
          onQuit: exitGame,
        });
      }, 300);
    });

    els.characterOptions.forEach((button) => {
      button.addEventListener("pointerenter", playHover);
      button.addEventListener("click", () => {
        DeepwoodAudio.click();
        applyCharacter(button.dataset.character, true);
      });
    });

    els.shopItems.forEach((button) => {
      button.addEventListener("pointerenter", playHover);
      button.addEventListener("click", () => buyUpgrade(button.dataset.upgrade));
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

    [els.settingsModal, els.creditsModal, els.characterModal, els.modeModal, els.shopModal].forEach((layer) => {
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
    settings = loadSettings();

    DeepwoodAudio.init({
      music: settings.music / 100,
      sfx: settings.sfx / 100,
      muted: settings.muted,
    });

    applySettingsToUI();
    applyCharacter(selectedCharacter, false);
    syncMenuMoney(loadWallet());
    Background.setMapType(selectedMap);
    bindEvents();
    Background.init();

    document.addEventListener("deepwood:money", (event) => {
      syncMenuMoney(event.detail);
    });
  }

  boot();
})();
