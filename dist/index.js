import './index.css';var le = Object.defineProperty;
var he = (i, e, t) => e in i ? le(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var n = (i, e, t) => he(i, typeof e != "symbol" ? e + "" : e, t);
import { jsxs as A, jsx as c, Fragment as Z } from "react/jsx-runtime";
import { useRef as M, useLayoutEffect as te, useState as C, useEffect as ce, forwardRef as ue, useImperativeHandle as de } from "react";
const ge = "_hud_pgtgk_1", me = "_visible_pgtgk_16", pe = "_levelRow_pgtgk_20", ve = "_killsRow_pgtgk_21", fe = "_healthTrack_pgtgk_25", _e = "_healthBar_pgtgk_33", P = {
  hud: ge,
  visible: me,
  levelRow: pe,
  killsRow: ve,
  healthTrack: fe,
  healthBar: _e
};
function Me({ visible: i, subscribeHud: e }) {
  const t = M(null), s = M(null), a = M(null);
  te(
    () => e((l) => {
      t.current && (t.current.textContent = String(l.level)), s.current && (s.current.textContent = `${l.killedCount} / ${l.killTarget}`), a.current && (a.current.style.width = `${Math.max(0, l.healthRatio) * 100}%`);
    }),
    [e]
  );
  const r = `${P.hud} ${i ? P.visible : ""}`;
  return /* @__PURE__ */ A("div", { className: r, children: [
    /* @__PURE__ */ A("div", { className: P.levelRow, children: [
      "Level ",
      /* @__PURE__ */ c("span", { ref: t, children: "1" })
    ] }),
    /* @__PURE__ */ A("div", { className: P.killsRow, children: [
      "Zneškodněno: ",
      /* @__PURE__ */ c("span", { ref: s, children: "0 / 0" })
    ] }),
    /* @__PURE__ */ c("div", { className: P.healthTrack, children: /* @__PURE__ */ c("div", { ref: a, className: P.healthBar }) })
  ] });
}
const ye = "_screen_1hvre_1", be = "_screenVisible_1hvre_14", Ae = "_intro_1hvre_19", Te = "_introImage_1hvre_24", we = "_menuScreen_1hvre_31", Ce = "_menuBackground_1hvre_29", Se = "_gameOverImage_1hvre_45", Le = "_gameCompleteImage_1hvre_51", ke = "_screenContent_1hvre_57", Ee = "_hiddenButton_1hvre_110", _ = {
  screen: ye,
  screenVisible: be,
  intro: Ae,
  introImage: Te,
  menuScreen: we,
  menuBackground: Ce,
  gameOverImage: Se,
  gameCompleteImage: Le,
  screenContent: ke,
  hiddenButton: Ee
};
function xe(i) {
  return i.gameComplete ? { message: `Hra dokončena! Zvládl jsi všech ${i.totalLevels} levelů.`, buttonLabel: "Zpět do menu" } : { message: `Level ${i.level} splněn!`, buttonLabel: "Pokračovat" };
}
function Ie(i) {
  if (i.action === "reset")
    return {
      message: `Vráceno na level 1 (level ${i.level} se nepodařilo dokončit).`,
      buttonLabel: "Zpět na start"
    };
  const e = i.maxAttempts != null ? ` z ${i.maxAttempts}` : "";
  return {
    message: `Level ${i.level} — pokus ${i.attemptNumber}${e}`,
    buttonLabel: "Zkusit znovu"
  };
}
function Ne({
  gameState: i,
  levelCompleteInfo: e,
  gameOverInfo: t,
  introVisible: s,
  introImageUrl: a,
  menuBackgroundImageUrl: r,
  gameOverImageUrl: l,
  gameCompleteImageUrl: d,
  muted: p,
  subscribeHud: v,
  onStartNewGame: x,
  onContinueFromMenu: I,
  onRetry: h,
  onContinueLevel: N,
  onResume: U,
  onToggleMute: H
}) {
  const y = M(null), T = M(null);
  te(
    () => v((E) => {
      y.current && (y.current.classList.toggle(_.hiddenButton, !E.hasProgress), y.current.textContent = `Pokračovat (level ${E.level})`), T.current && (T.current.textContent = E.hasProgress ? "Nová hra" : "Start");
    }),
    [v]
  );
  const f = e ? xe(e) : null, S = t ? Ie(t) : null, L = (E) => `${_.screen} ${i === E ? _.screenVisible : ""}`;
  return /* @__PURE__ */ A(Z, { children: [
    /* @__PURE__ */ c(
      "div",
      {
        className: `${_.screen} ${_.intro} ${s ? _.screenVisible : ""}`,
        children: /* @__PURE__ */ c(
          "img",
          {
            className: _.introImage,
            src: a,
            alt: "",
            onError: () => console.error(`[Overlay] nepodařilo se načíst úvodní grafiku: ${a}`)
          }
        )
      }
    ),
    /* @__PURE__ */ A("div", { className: `${L("MENU")} ${_.menuScreen}`, children: [
      /* @__PURE__ */ c(
        "img",
        {
          className: _.menuBackground,
          src: r,
          alt: "",
          onError: () => console.error(`[Overlay] nepodařilo se načíst pozadí MENU obrazovky: ${r}`)
        }
      ),
      /* @__PURE__ */ A("div", { className: _.screenContent, children: [
        /* @__PURE__ */ c("button", { ref: y, type: "button", onClick: I, children: "Pokračovat" }),
        /* @__PURE__ */ c("button", { ref: T, type: "button", onClick: x, children: "Start" }),
        /* @__PURE__ */ c("button", { type: "button", onClick: H, "aria-pressed": p, children: p ? "Zvuk: vypnutý" : "Zvuk: zapnutý" })
      ] })
    ] }),
    /* @__PURE__ */ c("div", { className: L("LEVEL_COMPLETE"), children: /* @__PURE__ */ A("div", { className: _.screenContent, children: [
      e != null && e.gameComplete ? /* @__PURE__ */ A(Z, { children: [
        /* @__PURE__ */ c(
          "img",
          {
            className: _.gameCompleteImage,
            src: d,
            alt: "",
            onError: () => console.error(`[Overlay] nepodařilo se načíst grafiku "Hra dokončena": ${d}`)
          }
        ),
        /* @__PURE__ */ c("p", { children: f == null ? void 0 : f.message })
      ] }) : /* @__PURE__ */ c("h2", { children: (f == null ? void 0 : f.message) ?? "Level splněn!" }),
      /* @__PURE__ */ c("button", { type: "button", onClick: N, children: (f == null ? void 0 : f.buttonLabel) ?? "Pokračovat" })
    ] }) }),
    /* @__PURE__ */ c("div", { className: L("GAME_OVER"), children: /* @__PURE__ */ A("div", { className: _.screenContent, children: [
      /* @__PURE__ */ c(
        "img",
        {
          className: _.gameOverImage,
          src: l,
          alt: "",
          onError: () => console.error(`[Overlay] nepodařilo se načíst grafiku "Cíl zničen": ${l}`)
        }
      ),
      /* @__PURE__ */ c("p", { children: (S == null ? void 0 : S.message) ?? "" }),
      /* @__PURE__ */ c("button", { type: "button", onClick: h, children: (S == null ? void 0 : S.buttonLabel) ?? "Zkusit znovu" })
    ] }) }),
    /* @__PURE__ */ c("div", { className: L("PAUSED"), children: /* @__PURE__ */ A("div", { className: _.screenContent, children: [
      /* @__PURE__ */ c("h2", { children: "Pauza" }),
      /* @__PURE__ */ c("button", { type: "button", onClick: U, children: "Pokračovat" })
    ] }) })
  ] });
}
const Ue = {
  targetMaxHealth: 100,
  eatingRadius: 25,
  antPoolSize: 30,
  retry: {
    mode: "strict",
    maxRestarts: 2
  },
  damageStates: [
    0.81,
    0.61,
    0.41,
    0.21,
    0
  ],
  sceneWidth: 400,
  sceneHeight: 800,
  baseAntSpeed: 60,
  baseDamagePerSecond: 3,
  turnSpeed: 4,
  antVariance: 0.15,
  seekRadius: 90,
  wanderNoise: {
    layers: [
      {
        frequency: 0.9,
        amplitude: 0.35
      },
      {
        frequency: 1.7,
        amplitude: 0.18
      },
      {
        frequency: 3.1,
        amplitude: 0.09
      }
    ]
  },
  wanderBurst: {
    intervalMinMs: 1800,
    intervalMaxMs: 4e3,
    amplitudeMin: 0.6,
    amplitudeMax: 1,
    sharpChance: 0.15,
    sharpAmplitudeMin: 1.3,
    sharpAmplitudeMax: 2.2,
    holdMsMin: 150,
    holdMsMax: 1500,
    decayDurationMs: 700,
    decayRate: 6
  },
  antSpawnMargin: 20,
  antHitboxRadius: 16,
  squishDurationMs: 150,
  criticalHealthThreshold: 0.25,
  stainPoolSize: 12,
  stainDurationMs: 2500,
  stainFadeMs: 350,
  introDurationMs: 3e3
}, Pe = {
  normal: {
    speedMultiplier: 1,
    damageMultiplier: 1,
    hitsToKill: 1
  },
  aggressive: {
    speedMultiplier: 1.4,
    damageMultiplier: 2.75,
    hitsToKill: 1
  },
  armored: {
    speedMultiplier: 1.4,
    damageMultiplier: 2.75,
    hitsToKill: 2,
    afterFirstHit: "normal"
  }
}, He = [
  {
    level: 1,
    killTarget: 8,
    maxAnts: 3,
    spawnInterval: [
      1500,
      2200
    ],
    speedMultiplier: 0.8,
    ants: {
      normal: 100,
      aggressive: 0,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 2,
    killTarget: 12,
    maxAnts: 4,
    spawnInterval: [
      1300,
      2e3
    ],
    speedMultiplier: 0.9,
    ants: {
      normal: 100,
      aggressive: 0,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 3,
    killTarget: 15,
    maxAnts: 5,
    spawnInterval: [
      1100,
      1800
    ],
    speedMultiplier: 1,
    ants: {
      normal: 100,
      aggressive: 0,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 4,
    killTarget: 15,
    maxAnts: 5,
    spawnInterval: [
      900,
      1500
    ],
    speedMultiplier: 1.1,
    ants: {
      normal: 100,
      aggressive: 0,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 5,
    killTarget: 18,
    maxAnts: 6,
    spawnInterval: [
      900,
      1500
    ],
    speedMultiplier: 1,
    ants: {
      normal: 80,
      aggressive: 20,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 6,
    killTarget: 20,
    maxAnts: 6,
    spawnInterval: [
      850,
      1400
    ],
    speedMultiplier: 1.05,
    ants: {
      normal: 70,
      aggressive: 30,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 7,
    killTarget: 20,
    maxAnts: 7,
    spawnInterval: [
      800,
      1300
    ],
    speedMultiplier: 1.15,
    ants: {
      normal: 65,
      aggressive: 35,
      armored: 0
    },
    backgroundColor: "#000000"
  },
  {
    level: 8,
    killTarget: 22,
    maxAnts: 7,
    spawnInterval: [
      800,
      1300
    ],
    speedMultiplier: 1.1,
    ants: {
      normal: 55,
      aggressive: 30,
      armored: 15
    },
    backgroundColor: "#000000"
  },
  {
    level: 9,
    killTarget: 24,
    maxAnts: 8,
    spawnInterval: [
      750,
      1250
    ],
    speedMultiplier: 1.15,
    ants: {
      normal: 50,
      aggressive: 30,
      armored: 20
    },
    backgroundColor: "#000000"
  },
  {
    level: 10,
    killTarget: 26,
    maxAnts: 8,
    spawnInterval: [
      700,
      1150
    ],
    speedMultiplier: 1.2,
    ants: {
      normal: 45,
      aggressive: 30,
      armored: 25
    },
    backgroundColor: "#000000"
  },
  {
    level: 11,
    killTarget: 28,
    maxAnts: 9,
    spawnInterval: [
      650,
      1100
    ],
    speedMultiplier: 1.25,
    ants: {
      normal: 40,
      aggressive: 35,
      armored: 25
    },
    backgroundColor: "#000000"
  },
  {
    level: 12,
    killTarget: 30,
    maxAnts: 10,
    spawnInterval: [
      600,
      1e3
    ],
    speedMultiplier: 1.3,
    ants: {
      normal: 35,
      aggressive: 35,
      armored: 30
    },
    backgroundColor: "#000000"
  }
], Oe = {
  game: Ue,
  antTypes: Pe,
  levels: He
}, $ = Oe;
function $e(i) {
  return !(!i.game || typeof i.game.sceneWidth != "number" || typeof i.game.sceneHeight != "number" || !i.antTypes || typeof i.antTypes != "object" || !Array.isArray(i.levels) || i.levels.length === 0);
}
function Re(i, e) {
  if (!e) return i;
  const t = { ...i };
  for (const s of Object.keys(e)) {
    const a = e[s];
    a && (t[s] = { ...i[s], ...a });
  }
  return t;
}
function se(i) {
  if (!i) return $;
  const e = {
    game: { ...$.game, ...i.game ?? {} },
    antTypes: Re($.antTypes, i.antTypes),
    levels: i.levels ?? $.levels
  };
  return $e(e) ? e : (console.warn("[AntsGameComponent] neplatný config override, používám výchozí hodnoty"), $);
}
const m = {
  ant: "agc-ant",
  antVisual: "agc-ant-visual",
  antHitbox: "agc-ant-hitbox",
  squish: "agc-squish",
  hitFlash: "agc-hit-flash",
  antStain: "agc-ant-stain",
  fading: "agc-fading",
  rotateCw: "agc-rotate-cw",
  rotateCcw: "agc-rotate-ccw"
}, J = "http://www.w3.org/2000/svg", De = {
  aggressive: [1.15, 1.3],
  armored: [1.15, 1.3]
};
function Ge(i, e, t) {
  let s = (e - i + Math.PI) % (Math.PI * 2) - Math.PI;
  return s < -Math.PI && (s += Math.PI * 2), i + s * Math.min(t, 1);
}
function R(i, e) {
  return i * (1 + (Math.random() * 2 - 1) * e);
}
class Be {
  constructor(e, t) {
    n(this, "el");
    n(this, "visual");
    n(this, "hitbox");
    n(this, "type", "normal");
    n(this, "pos", { x: 0, y: 0 });
    n(this, "heading", 0);
    n(this, "speed");
    n(this, "turnSpeed");
    n(this, "levelSpeedMultiplier", 1);
    n(this, "noiseTime", 0);
    n(this, "noisePhases", []);
    n(this, "noiseFrequencies", []);
    n(this, "burstIntervalMultiplier", 1);
    n(this, "burstActive", !1);
    n(this, "burstElapsed", 0);
    n(this, "burstAmplitude", 0);
    n(this, "burstHoldDuration", 0);
    n(this, "burstSign", 1);
    n(this, "burstTimer", 0);
    n(this, "damagePerSecond", 0);
    n(this, "hitsRemaining", 1);
    n(this, "eating", !1);
    n(this, "active", !1);
    n(this, "removing", !1);
    n(this, "squishTimer", 0);
    n(this, "deps");
    this.el = e, this.deps = t, this.speed = t.config.baseAntSpeed, this.turnSpeed = t.config.turnSpeed, this.el.ant = this, this._buildVisual();
  }
  _buildVisual() {
    this.visual = document.createElementNS(J, "g"), this.visual.setAttribute("class", m.antVisual), this.hitbox = document.createElementNS(J, "circle"), this.hitbox.setAttribute("class", m.antHitbox), this.hitbox.setAttribute("r", String(this.deps.config.antHitboxRadius)), this.hitbox.setAttribute("fill", "transparent"), this.visual.appendChild(this.hitbox), this.el.appendChild(this.visual);
  }
  _setTypeVisual(e) {
    for (const a of Array.from(this.visual.children))
      a !== this.hitbox && this.visual.removeChild(a);
    const t = "ant" + e[0].toUpperCase() + e.slice(1);
    this.visual.appendChild(this.deps.svgAssets.getFragment(t));
    const s = De[e];
    s ? this.hitbox.setAttribute("transform", `scale(${s[0]},${s[1]})`) : this.hitbox.removeAttribute("transform");
  }
  reset({ pos: e, heading: t, type: s = "normal", speedMultiplier: a = 1 }) {
    const { config: r, antTypes: l } = this.deps, d = l[s];
    this.type = s, this.pos.x = e.x, this.pos.y = e.y, this.heading = t, this.levelSpeedMultiplier = a, this.speed = R(
      r.baseAntSpeed * d.speedMultiplier * a,
      r.antVariance
    ), this.turnSpeed = R(r.turnSpeed, r.antVariance), this.noiseTime = 0, this.noisePhases = r.wanderNoise.layers.map(() => Math.random() * Math.PI * 2), this.noiseFrequencies = r.wanderNoise.layers.map(
      (p) => R(p.frequency, r.antVariance)
    ), this.burstIntervalMultiplier = R(1, r.antVariance), this.burstActive = !1, this.burstElapsed = 0, this.burstAmplitude = 0, this.burstHoldDuration = 0, this.burstSign = 1, this.burstTimer = this._randomBurstInterval(), this.damagePerSecond = r.baseDamagePerSecond * d.damageMultiplier, this.hitsRemaining = d.hitsToKill, this.eating = !1, this.active = !0, this.visual.classList.remove(m.squish, m.hitFlash), this._setTypeVisual(s), this.el.style.display = "block", this._applyTransform();
  }
  hide() {
    this.active = !1, this.el.style.display = "none";
  }
  playSquish() {
    this.visual.classList.add(m.squish);
  }
  // Zaznamená zásah. Vrací true, pokud mravenec má být odstraněn (despawn),
  // false pokud jen "odzbrojen" na afterFirstHit typ a zůstává aktivní.
  applyHit() {
    this.hitsRemaining -= 1;
    const e = this.deps.antTypes[this.type];
    return this.hitsRemaining > 0 && e.afterFirstHit ? (this._downgradeTo(e.afterFirstHit), !1) : !0;
  }
  _downgradeTo(e) {
    const { config: t, antTypes: s } = this.deps, a = s[e];
    this.type = e, this.speed = R(
      t.baseAntSpeed * a.speedMultiplier * this.levelSpeedMultiplier,
      t.antVariance
    ), this.damagePerSecond = t.baseDamagePerSecond * a.damageMultiplier, this._setTypeVisual(e), this._playHitFlash();
  }
  _playHitFlash() {
    this.visual.classList.remove(m.hitFlash), this.visual.addEventListener("animationend", () => this.visual.classList.remove(m.hitFlash), {
      once: !0
    }), this.visual.classList.add(m.hitFlash);
  }
  update(e, t) {
    if (this.eating) return;
    const s = t.x - this.pos.x, a = t.y - this.pos.y, r = Math.atan2(a, s), l = Math.hypot(s, a);
    this.noiseTime += e;
    const d = this._noiseOffset() + this._updateBurst(e), p = r + d * this._seekDamping(l);
    this.heading = Ge(this.heading, p, this.turnSpeed * e), this.pos.x += Math.cos(this.heading) * this.speed * e, this.pos.y += Math.sin(this.heading) * this.speed * e, this._applyTransform(), this.distanceTo(t) <= this.deps.config.eatingRadius && (this.eating = !0);
  }
  // Plynulý základní vzor: součet sinusových vrstev s neslučitelnými frekvencemi
  // a per-instance fází/frekvencí (nastaveno v reset()), viz sekce 5 dokumentu 00 / feature 17.
  _noiseOffset() {
    const e = this.deps.config.wanderNoise.layers;
    let t = 0;
    for (let s = 0; s < e.length; s++)
      t += e[s].amplitude * Math.sin(this.noiseFrequencies[s] * this.noiseTime + this.noisePhases[s]);
    return t;
  }
  // Občasná výraznější "odbočka": po náhodně dlouhé hold fázi na špičkové (per-výskyt
  // náhodné) amplitudě následuje exponenciální doznění zpět k základnímu šumu během
  // wanderBurst.decayDurationMs, poté nový náhodný interval do příště.
  _updateBurst(e) {
    const { decayDurationMs: t, decayRate: s } = this.deps.config.wanderBurst, a = t / 1e3;
    if (this.burstActive) {
      this.burstElapsed += e;
      const r = this.burstElapsed - this.burstHoldDuration;
      return r >= a ? (this.burstActive = !1, this.burstTimer = this._randomBurstInterval(), 0) : r <= 0 ? this.burstAmplitude * this.burstSign : this.burstAmplitude * this.burstSign * Math.exp(-s * r);
    }
    return this.burstTimer -= e, this.burstTimer <= 0 ? (this.burstActive = !0, this.burstElapsed = 0, this.burstSign = Math.random() < 0.5 ? -1 : 1, this.burstAmplitude = this._randomBurstAmplitude(), this.burstHoldDuration = this._randomBurstHoldDuration(), this.burstAmplitude * this.burstSign) : 0;
  }
  _randomBurstAmplitude() {
    const { amplitudeMin: e, amplitudeMax: t, sharpChance: s, sharpAmplitudeMin: a, sharpAmplitudeMax: r } = this.deps.config.wanderBurst;
    return Math.random() < s ? a + Math.random() * (r - a) : e + Math.random() * (t - e);
  }
  _randomBurstHoldDuration() {
    const { holdMsMin: e, holdMsMax: t } = this.deps.config.wanderBurst;
    return (e + Math.random() * (t - e)) / 1e3;
  }
  _randomBurstInterval() {
    const { intervalMinMs: e, intervalMaxMs: t } = this.deps.config.wanderBurst;
    return (e + Math.random() * (t - e)) / 1e3 * this.burstIntervalMultiplier;
  }
  // Tlumení amplitudy šumu/burstu blízko cíle: 1 mimo seekRadius, plynule k 0 na eatingRadius,
  // aby poslední úsek cesty byl vždy přímý a mravenec u cíle nekroužil (feature 17).
  _seekDamping(e) {
    const { seekRadius: t, eatingRadius: s } = this.deps.config;
    return e >= t ? 1 : Math.max(0, (e - s) / (t - s));
  }
  distanceTo(e) {
    return Math.hypot(e.x - this.pos.x, e.y - this.pos.y);
  }
  _applyTransform() {
    const e = this.heading * 180 / Math.PI;
    this.el.setAttribute("transform", `translate(${this.pos.x},${this.pos.y}) rotate(${e})`);
  }
}
const Ve = "http://www.w3.org/2000/svg";
class Fe {
  constructor(e, t, s) {
    n(this, "pool");
    n(this, "config");
    n(this, "_cursor", 0);
    this.config = t, this.pool = Array.from({ length: t.stainPoolSize }, () => {
      const a = document.createElementNS(Ve, "g");
      return a.setAttribute("class", m.antStain), a.style.display = "none", a.appendChild(s.getFragment("antStain")), e.appendChild(a), { el: a, active: !1, remainingMs: 0 };
    });
  }
  spawn(e, t) {
    const s = this.pool[this._cursor];
    this._cursor = (this._cursor + 1) % this.pool.length;
    const a = t * 180 / Math.PI;
    s.el.setAttribute("transform", `translate(${e.x},${e.y}) rotate(${a})`), s.el.classList.remove(m.fading), s.el.style.display = "block", s.active = !0, s.remainingMs = this.config.stainDurationMs;
  }
  update(e) {
    const t = e * 1e3;
    for (const s of this.pool)
      s.active && (s.remainingMs -= t, s.remainingMs <= this.config.stainFadeMs && s.el.classList.add(m.fading), s.remainingMs <= 0 && (s.el.style.display = "none", s.active = !1));
  }
  reset() {
    for (const e of this.pool)
      e.el.style.display = "none", e.el.classList.remove(m.fading), e.active = !1;
    this._cursor = 0;
  }
}
const qe = "http://www.w3.org/2000/svg";
function ze(i) {
  const e = i.normal ?? 0, t = i.aggressive ?? 0, s = i.armored ?? 0, a = e + t + s;
  if (a <= 0) return "normal";
  let r = Math.random() * a;
  return r < e ? "normal" : (r -= e, r < t ? "aggressive" : "armored");
}
class Ye {
  constructor(e, t, s, a) {
    n(this, "layerElement");
    n(this, "target");
    n(this, "stainManager");
    n(this, "pool");
    n(this, "levelConfig");
    n(this, "activeCount", 0);
    n(this, "deps");
    n(this, "_spawnTimer", 0);
    this.layerElement = e, this.target = t, this.levelConfig = s, this.deps = a, this.stainManager = new Fe(a.stainsLayerElement, a.config, a.svgAssets), this.pool = Array.from({ length: a.config.antPoolSize }, () => {
      const r = document.createElementNS(qe, "g");
      return r.setAttribute("class", m.ant), r.style.display = "none", e.appendChild(r), new Be(r, { config: a.config, antTypes: a.antTypes, svgAssets: a.svgAssets });
    }), this._scheduleNextSpawn();
  }
  setLevelConfig(e) {
    this.levelConfig = e;
  }
  _scheduleNextSpawn() {
    const [e, t] = this.levelConfig.spawnInterval;
    this._spawnTimer = e + Math.random() * (t - e);
  }
  spawn(e = "normal") {
    const t = this.pool.find((r) => !r.active && !r.removing);
    if (!t)
      return console.warn("[AntManager] pool vyčerpán, spawn ignorován"), null;
    const { pos: s, heading: a } = this._randomEdgeSpawn();
    return t.reset({ pos: s, heading: a, type: e, speedMultiplier: this.levelConfig.speedMultiplier }), this.activeCount++, t;
  }
  reset() {
    for (const e of this.pool)
      e.hide(), e.removing = !1, e.visual.classList.remove(m.squish);
    this.activeCount = 0, this._scheduleNextSpawn(), this.stainManager.reset();
  }
  despawn(e) {
    e.hide(), e.removing = !1, this.activeCount--;
  }
  // Zásah mravence dotykem. Odolný typ (armored) po prvním zásahu jen přejde
  // na vlastnosti afterFirstHit typu a zůstává aktivní — despawn proběhne
  // teprve při dosažení hitsRemaining === 0 (viz Ant.applyHit).
  registerHit(e) {
    var s, a, r, l, d, p;
    if (!e.active) return;
    if ((a = (s = this.deps).onHit) == null || a.call(s), !e.applyHit()) {
      (l = (r = this.deps).onArmoredFirstHit) == null || l.call(r);
      return;
    }
    this.stainManager.spawn(e.pos, e.heading), e.active = !1, e.removing = !0, e.squishTimer = this.deps.config.squishDurationMs, e.playSquish(), (p = (d = this.deps).onKill) == null || p.call(d);
  }
  update(e) {
    var s, a;
    this.stainManager.update(e), this._spawnTimer -= e * 1e3, this._spawnTimer <= 0 && (this.activeCount < this.levelConfig.maxAnts ? (this.spawn(ze(this.levelConfig.ants)), this._scheduleNextSpawn()) : this._spawnTimer = 0);
    let t = !1;
    for (const r of this.pool) {
      if (r.removing) {
        r.squishTimer -= e * 1e3, r.squishTimer <= 0 && this.despawn(r);
        continue;
      }
      r.active && (r.update(e, this.target.pos), r.eating && (this.target.applyDamage(r.damagePerSecond * e), t = !0));
    }
    t && ((a = (s = this.deps).onConsumeTick) == null || a.call(s));
  }
  _randomEdgeSpawn() {
    const e = this.target.pos, { sceneWidth: t, sceneHeight: s, antSpawnMargin: a } = this.deps.config, r = Math.floor(Math.random() * 4);
    let l;
    switch (r) {
      case 0:
        l = { x: Math.random() * t, y: -a };
        break;
      case 1:
        l = { x: t + a, y: Math.random() * s };
        break;
      case 2:
        l = { x: Math.random() * t, y: s + a };
        break;
      default:
        l = { x: -a, y: Math.random() * s };
        break;
    }
    const d = Math.atan2(e.y - l.y, e.x - l.x);
    return { pos: l, heading: d };
  }
}
const We = [
  "hit",
  "kill",
  "armoredFirstHit",
  "consumeTick",
  "criticalHealth",
  "levelComplete",
  "gameOver",
  "uiTap"
], Ke = 400, je = {
  hit: 15,
  kill: 30
};
class Ze {
  constructor(e) {
    n(this, "baseUrl");
    n(this, "overrides");
    n(this, "storage");
    n(this, "_muted");
    n(this, "_buffers", {});
    n(this, "_lastConsumeTickAt", -1 / 0);
    n(this, "_context", null);
    this.baseUrl = e.baseUrl.endsWith("/") ? e.baseUrl : `${e.baseUrl}/`, this.overrides = e.overrides ?? {}, this.storage = e.storage, this._muted = this.storage.get("soundMuted", !1);
    try {
      const t = typeof AudioContext < "u" ? AudioContext : window.webkitAudioContext;
      this._context = t ? new t() : null;
    } catch (t) {
      console.warn("[AudioManager] AudioContext nedostupný, hra poběží bez zvuku:", t);
    }
    this._context && this._preloadAll();
  }
  async _preloadAll() {
    await Promise.all(We.map((e) => this._loadSound(e)));
  }
  _resolveUrl(e) {
    return this.overrides[e] ?? `${this.baseUrl}${e}.mp3`;
  }
  async _loadSound(e) {
    if (this._context)
      try {
        const t = await fetch(this._resolveUrl(e));
        if (!t.ok) throw new Error(`HTTP ${t.status}`);
        const s = await t.arrayBuffer();
        this._buffers[e] = await this._context.decodeAudioData(s);
      } catch (t) {
        console.warn(`[AudioManager] nepodařilo se načíst zvuk "${e}", event zůstane tichý:`, t);
      }
  }
  // Autoplay unlock pro iOS Safari a další prohlížeče vyžadující gesto uživatele.
  unlock() {
    this._context && this._context.state === "suspended" && this._context.resume().catch(() => {
    });
  }
  setMuted(e) {
    this._muted = e, this.storage.set("soundMuted", e);
  }
  isMuted() {
    return this._muted;
  }
  play(e) {
    if (this._muted || (this._maybeVibrate(e), !this._context)) return;
    if (e === "consumeTick") {
      const a = this._context.currentTime * 1e3;
      if (a - this._lastConsumeTickAt < Ke) return;
      this._lastConsumeTickAt = a;
    }
    const t = this._buffers[e];
    if (!t) return;
    const s = this._context.createBufferSource();
    s.buffer = t, s.connect(this._context.destination), s.start(0);
  }
  _maybeVibrate(e) {
    const t = je[e];
    !t || !("vibrate" in navigator) || navigator.vibrate(t);
  }
  // Nutné doplnění oproti js/audio.js — v React komponentě se na rozdíl od statické
  // stránky AudioManager běžně unmountuje, viz riziko "Game.destroy()" v plánu.
  destroy() {
    var e;
    (e = this._context) == null || e.close().catch(() => {
    });
  }
}
class Je {
  constructor(e, t) {
    n(this, "sceneElement");
    n(this, "antManager");
    n(this, "onPointerDown");
    this.sceneElement = e, this.antManager = t, this.onPointerDown = this._onPointerDown.bind(this), e.addEventListener("pointerdown", this.onPointerDown);
  }
  _onPointerDown(e) {
    var a;
    const t = e.target, s = t == null ? void 0 : t.closest(`.${m.ant}`);
    (a = s == null ? void 0 : s.ant) != null && a.active && this.antManager.registerHit(s.ant);
  }
  destroy() {
    this.sceneElement.removeEventListener("pointerdown", this.onPointerDown);
  }
}
class Xe {
  constructor(e, t, s) {
    n(this, "currentLevel");
    n(this, "highestUnlocked");
    n(this, "failedAttemptsTotal");
    n(this, "attemptsUsed", 0);
    n(this, "levels");
    n(this, "retry");
    n(this, "storage");
    this.levels = e, this.retry = t, this.storage = s, this.currentLevel = s.get("currentLevel", 1), this.highestUnlocked = s.get("highestUnlockedLevel", 1), this.failedAttemptsTotal = s.get("failedAttemptsTotal", 0);
  }
  get config() {
    return this.levels[this.currentLevel - 1];
  }
  resetToLevel1() {
    this.currentLevel = 1, this.attemptsUsed = 0, this._persist();
  }
  registerFailure() {
    this.attemptsUsed += 1, this.failedAttemptsTotal += 1;
    const { mode: e, maxRestarts: t } = this.retry;
    if (e === "lenient" || this.attemptsUsed <= t)
      return this._persist(), {
        action: "retry",
        attemptNumber: this.attemptsUsed + 1,
        maxAttempts: e === "lenient" ? null : t + 1
      };
    const s = this.currentLevel;
    return console.log(
      `[LevelManager] Pokusy na levelu ${s} vyčerpány, návrat na level 1. highestUnlocked zůstává ${this.highestUnlocked}.`
    ), this.currentLevel = 1, this.attemptsUsed = 0, this._persist(), { action: "reset", levelBeforeReset: s };
  }
  registerSuccess() {
    return this.attemptsUsed = 0, this.currentLevel >= this.levels.length ? (this.highestUnlocked = Math.max(this.highestUnlocked, this.currentLevel), this._persist(), { gameComplete: !0 }) : (this.highestUnlocked = Math.max(this.highestUnlocked, this.currentLevel + 1), this.currentLevel += 1, this._persist(), { gameComplete: !1 });
  }
  _persist() {
    this.storage.set("currentLevel", this.currentLevel), this.storage.set("highestUnlockedLevel", this.highestUnlocked), this.storage.set("failedAttemptsTotal", this.failedAttemptsTotal);
  }
}
const Qe = "(orientation: landscape)", X = "cw";
class et {
  constructor(e) {
    n(this, "container");
    n(this, "mql");
    n(this, "onMqlChange");
    n(this, "onScreenOrientationChange", null);
    n(this, "onWindowOrientationChange", null);
    n(this, "_lastDirection", X);
    this.container = e, this.onMqlChange = () => this._applyDirection(), this.mql = window.matchMedia(Qe), this.mql.addEventListener("change", this.onMqlChange), screen.orientation ? (this.onScreenOrientationChange = () => this._applyDirection(), screen.orientation.addEventListener("change", this.onScreenOrientationChange)) : (this.onWindowOrientationChange = () => this._applyDirection(), window.addEventListener("orientationchange", this.onWindowOrientationChange)), this._applyDirection();
  }
  // Mapování landscape-primary/-secondary (resp. window.orientation 90/-90) na cw/ccw
  // je ověřené jen odhadem — směr rotace se mezi výrobci/OS historicky liší. Pokud
  // ruční test na reálném zařízení (viz akceptační kritéria feature 15) ukáže obrácený
  // směr, prohoďte zde 'cw' <-> 'ccw'.
  _detectDirection() {
    if (screen.orientation)
      return screen.orientation.type === "landscape-primary" ? "cw" : screen.orientation.type === "landscape-secondary" ? "ccw" : this._lastDirection;
    const e = window.orientation;
    return typeof e == "number" ? e === 90 ? "cw" : e === -90 || e === 270 ? "ccw" : this._lastDirection : X;
  }
  _applyDirection() {
    this._lastDirection = this._detectDirection(), this.container.classList.toggle(m.rotateCw, this._lastDirection === "cw"), this.container.classList.toggle(m.rotateCcw, this._lastDirection === "ccw");
  }
  destroy() {
    this.mql.removeEventListener("change", this.onMqlChange), screen.orientation && this.onScreenOrientationChange && screen.orientation.removeEventListener("change", this.onScreenOrientationChange), this.onWindowOrientationChange && window.removeEventListener("orientationchange", this.onWindowOrientationChange);
  }
}
class tt {
  constructor(e, t, s) {
    n(this, "el");
    n(this, "maxHealth");
    n(this, "health");
    n(this, "pos");
    n(this, "deps");
    n(this, "onDestroyed");
    n(this, "onCriticalHealth");
    n(this, "stateElements");
    n(this, "_criticalHealthTriggered", !1);
    n(this, "_currentStateIndex", -1);
    this.el = e, this.deps = t, this.maxHealth = s.maxHealth ?? t.config.targetMaxHealth, this.health = this.maxHealth, this.onDestroyed = s.onDestroyed, this.onCriticalHealth = s.onCriticalHealth, this.pos = this._parsePos(e.getAttribute("transform")), this.stateElements = Array.from(
      { length: 6 },
      (a, r) => this.el.querySelector(`[data-target-state="${r}"]`)
    ).filter((a) => a !== null), this.setType(s.typeKey), this._currentStateIndex = -1, this._applyVisualState();
  }
  setType(e) {
    this.stateElements.forEach((t, s) => {
      t.replaceChildren(), t.appendChild(this.deps.svgAssets.getFragment(`${e}State${s}`));
    });
  }
  _parsePos(e) {
    const t = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/.exec(e || "");
    return t ? { x: parseFloat(t[1]), y: parseFloat(t[2]) } : (console.warn("[Target] nepodařilo se přečíst pozici z transform, používám {0,0}:", e), { x: 0, y: 0 });
  }
  reset() {
    this.health = this.maxHealth, this._currentStateIndex = -1, this._criticalHealthTriggered = !1, this._applyVisualState();
  }
  applyDamage(e) {
    var t, s;
    this.health <= 0 || (this.health = Math.max(0, this.health - e), this._applyVisualState(), !this._criticalHealthTriggered && this.health / this.maxHealth <= this.deps.config.criticalHealthThreshold && (this._criticalHealthTriggered = !0, (t = this.onCriticalHealth) == null || t.call(this)), this.health === 0 && (console.log("[Target] zničen (health dosáhlo 0)"), (s = this.onDestroyed) == null || s.call(this)));
  }
  _computeStateIndex() {
    const e = this.health / this.maxHealth;
    let t = 0;
    for (const s of this.deps.config.damageStates)
      if (e <= s)
        t++;
      else
        break;
    return t;
  }
  _applyVisualState() {
    const e = this._computeStateIndex();
    e !== this._currentStateIndex && (this.stateElements.forEach((t, s) => {
      t.style.display = s === e ? "block" : "none";
    }), this._currentStateIndex = e);
  }
}
const st = 0.1, u = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  LEVEL_COMPLETE: "LEVEL_COMPLETE",
  GAME_OVER: "GAME_OVER",
  PAUSED: "PAUSED"
}, nt = {
  MENU: [u.PLAYING],
  PLAYING: [u.LEVEL_COMPLETE, u.GAME_OVER, u.PAUSED],
  LEVEL_COMPLETE: [u.PLAYING, u.MENU],
  GAME_OVER: [u.PLAYING, u.MENU],
  PAUSED: [u.PLAYING]
};
class at {
  constructor(e, t) {
    n(this, "state", u.MENU);
    n(this, "levelManager");
    n(this, "audioManager");
    n(this, "target");
    n(this, "antManager");
    n(this, "inputManager");
    n(this, "orientationManager");
    n(this, "refs");
    n(this, "deps");
    n(this, "lastTimestamp", null);
    n(this, "_rafId", null);
    n(this, "_introTimeoutId", null);
    n(this, "_started", !1);
    n(this, "killedCount", 0);
    n(this, "_lastFailureAction", null);
    n(this, "_lastLevelResult", null);
    n(this, "_onVisibilityChange");
    n(this, "_onBlur");
    n(this, "_tick");
    n(this, "_unlockAudioOnce");
    this.refs = e, this.deps = t, this._onVisibilityChange = this._handleVisibilityChange.bind(this), this._onBlur = this._handleBlur.bind(this), this._tick = this._handleTick.bind(this), this._unlockAudioOnce = () => this.audioManager.unlock(), this.levelManager = new Xe(t.config.levels, t.config.game.retry, t.storage), this.audioManager = new Ze({
      baseUrl: t.audioBaseUrl,
      overrides: t.audioOverrides,
      storage: t.storage
    }), e.root.addEventListener("pointerdown", this._unlockAudioOnce, { once: !0 }), this.target = new tt(
      e.targetGroup,
      { config: t.config.game, svgAssets: t.svgAssets },
      {
        typeKey: `level${this.levelManager.config.level}`,
        onDestroyed: () => this.gameOver(),
        onCriticalHealth: () => this.audioManager.play("criticalHealth")
      }
    ), this.antManager = new Ye(e.antsLayer, this.target, this.levelManager.config, {
      stainsLayerElement: e.stainsLayer,
      config: t.config.game,
      antTypes: t.config.antTypes,
      svgAssets: t.svgAssets,
      onKill: () => {
        this._onAntKilled(), this.audioManager.play("kill");
      },
      onHit: () => this.audioManager.play("hit"),
      onArmoredFirstHit: () => this.audioManager.play("armoredFirstHit"),
      onConsumeTick: () => this.audioManager.play("consumeTick")
    }), this.inputManager = new Je(e.scene, this.antManager), this.orientationManager = t.fullscreen ? new et(e.root) : null, this._emitStateChange(), this._emitHud();
  }
  start() {
    this._started || (this._started = !0, document.addEventListener("visibilitychange", this._onVisibilityChange), window.addEventListener("blur", this._onBlur), this.lastTimestamp = performance.now(), this._rafId = requestAnimationFrame(this._tick));
  }
  // Nutné doplnění oproti js/game.js (dnes neexistuje — stránka se nikdy needitovala).
  // V React komponentě se AntsGameComponent běžně unmountuje, viz plán, sekce "Rizika".
  destroy() {
    var e;
    this._rafId !== null && cancelAnimationFrame(this._rafId), this._introTimeoutId !== null && clearTimeout(this._introTimeoutId), document.removeEventListener("visibilitychange", this._onVisibilityChange), window.removeEventListener("blur", this._onBlur), this.refs.root.removeEventListener("pointerdown", this._unlockAudioOnce), this.inputManager.destroy(), (e = this.orientationManager) == null || e.destroy(), this.audioManager.destroy();
  }
  update(e) {
    this.antManager.update(e), this._emitHud();
  }
  startGame() {
    this._startLevel(), this._transitionTo(u.PLAYING);
  }
  startNewGame() {
    var e, t;
    this.levelManager.resetToLevel1(), this._introTimeoutId !== null && clearTimeout(this._introTimeoutId), (t = (e = this.deps).onShowIntro) == null || t.call(e), this._introTimeoutId = setTimeout(() => {
      var s, a;
      this._introTimeoutId = null, this.startGame(), (a = (s = this.deps).onHideIntro) == null || a.call(s);
    }, this.deps.config.game.introDurationMs);
  }
  retryLevel() {
    if (this._lastFailureAction === "reset") {
      this._transitionTo(u.MENU);
      return;
    }
    this._startLevel(), this._transitionTo(u.PLAYING);
  }
  continueLevel() {
    var e;
    if ((e = this._lastLevelResult) != null && e.gameComplete) {
      this._transitionTo(u.MENU);
      return;
    }
    this._startLevel(), this._transitionTo(u.PLAYING);
  }
  resumeGame() {
    this._transitionTo(u.PLAYING);
  }
  pause() {
    this.state === u.PLAYING && this._transitionTo(u.PAUSED);
  }
  gameOver() {
    var a, r;
    if (this.state !== u.PLAYING) return;
    const e = this.levelManager.currentLevel, t = this.levelManager.registerFailure();
    this._lastFailureAction = t.action, this._transitionTo(u.GAME_OVER), this.audioManager.play("gameOver");
    const s = this.deps.config.game.retry.maxRestarts + 1;
    (r = (a = this.deps).onGameOver) == null || r.call(a, {
      level: e,
      action: t.action,
      attemptNumber: t.action === "retry" ? t.attemptNumber : s,
      maxAttempts: t.action === "retry" ? t.maxAttempts : s
    });
  }
  levelComplete() {
    var s, a;
    if (this.state !== u.PLAYING) return;
    const e = this.levelManager.currentLevel, t = this.levelManager.registerSuccess();
    this._lastLevelResult = t, this._transitionTo(u.LEVEL_COMPLETE), this.audioManager.play("levelComplete"), (a = (s = this.deps).onLevelComplete) == null || a.call(s, {
      level: e,
      gameComplete: t.gameComplete,
      totalLevels: this.deps.config.levels.length
    });
  }
  setMuted(e) {
    this.audioManager.setMuted(e);
  }
  isMuted() {
    return this.audioManager.isMuted();
  }
  _startLevel() {
    this.target.setType(`level${this.levelManager.config.level}`), this.refs.root.style.background = this.levelManager.config.backgroundColor, this._resetScene(), this.antManager.setLevelConfig(this.levelManager.config), this._emitHud();
  }
  _transitionTo(e) {
    if (!(nt[this.state] ?? []).includes(e)) {
      console.warn(`[Game] neplatný přechod ${this.state} -> ${e}, ignoruji`);
      return;
    }
    this.state = e, this._emitStateChange(), console.log(`[Game] -> ${e}`);
  }
  _resetScene() {
    this.antManager.reset(), this.target.reset(), this.killedCount = 0, this._emitHud();
  }
  _onAntKilled() {
    var e, t;
    this.state === u.PLAYING && (this.killedCount++, (t = (e = this.deps).onAntKilled) == null || t.call(e, { killedCount: this.killedCount, killTarget: this.levelManager.config.killTarget }), this.killedCount >= this.levelManager.config.killTarget && this.levelComplete());
  }
  _emitStateChange() {
    var e, t;
    (t = (e = this.deps).onStateChange) == null || t.call(e, this.state);
  }
  _emitHud() {
    var e, t;
    (t = (e = this.deps).onHudUpdate) == null || t.call(e, {
      state: this.state,
      level: this.levelManager.currentLevel,
      highestUnlocked: this.levelManager.highestUnlocked,
      hasProgress: this.levelManager.currentLevel > 1 || this.levelManager.highestUnlocked > 1,
      killedCount: this.killedCount,
      killTarget: this.levelManager.config.killTarget,
      healthRatio: this.target.health / this.target.maxHealth
    });
  }
  _handleVisibilityChange() {
    document.hidden ? this.pause() : (this.lastTimestamp = performance.now(), console.log("[Game] visible again, lastTimestamp reset"));
  }
  _handleBlur() {
    this.pause();
  }
  _handleTick(e) {
    const t = Math.min((e - (this.lastTimestamp ?? e)) / 1e3, st);
    this.lastTimestamp = e, this.state === u.PLAYING && this.update(t), this._rafId = requestAnimationFrame(this._tick);
  }
}
class it {
  constructor(e = "mravenci:") {
    n(this, "prefix");
    this.prefix = e;
  }
  get(e, t) {
    try {
      const s = localStorage.getItem(this.prefix + e);
      return s === null ? t : JSON.parse(s);
    } catch {
      return t;
    }
  }
  set(e, t) {
    try {
      localStorage.setItem(this.prefix + e, JSON.stringify(t));
    } catch {
    }
  }
}
class rt {
  constructor(e) {
    n(this, "baseUrl");
    n(this, "overrides");
    n(this, "templates", {});
    this.baseUrl = e.baseUrl.endsWith("/") ? e.baseUrl : `${e.baseUrl}/`, this.overrides = e.overrides ?? {};
  }
  async preloadAll(e) {
    await Promise.all(e.map((t) => this._loadSvg(t)));
  }
  _resolveUrl(e) {
    return this.overrides[e] ?? `${this.baseUrl}${e}.svg`;
  }
  async _loadSvg(e) {
    try {
      const t = await fetch(this._resolveUrl(e));
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      const s = await t.text(), a = new DOMParser().parseFromString(s, "image/svg+xml");
      if (a.querySelector("parsererror")) throw new Error("neplatný SVG obsah");
      this.templates[e] = Array.from(a.documentElement.children);
    } catch (t) {
      throw console.error(`[svgAssets] nepodařilo se načíst SVG asset "${e}":`, t), t;
    }
  }
  getFragment(e) {
    const t = this.templates[e];
    if (!t) throw new Error(`[svgAssets] asset "${e}" není v cache, proběhl preloadAll?`);
    const s = document.createDocumentFragment();
    for (const a of t)
      s.appendChild(a.cloneNode(!0));
    return s;
  }
}
function ot(i) {
  return [
    "antNormal",
    "antAggressive",
    "antArmored",
    "antStain",
    ...i.flatMap((e) => Array.from({ length: 6 }, (t, s) => `level${e.level}State${s}`))
  ];
}
const Q = new URL(
  /* @vite-ignore */
  "./assets/",
  import.meta.url
).href;
function ee(i) {
  return i.endsWith("/") ? i : `${i}/`;
}
function lt({
  rootRef: i,
  sceneRef: e,
  targetRef: t,
  stainsLayerRef: s,
  antsLayerRef: a,
  props: r
}) {
  const l = M(null), d = M(null), p = M(/* @__PURE__ */ new Set()), v = M(r);
  v.current = r;
  const [x, I] = C("MENU"), [h, N] = C(null), [U, H] = C(null), [y, T] = C(!1), [f, S] = C(!1), [L] = C(() => ee(r.assetsBaseUrl ?? Q)), [E] = C(
    () => {
      var o;
      return ((o = r.assetOverrides) == null ? void 0 : o.gameIntro) ?? `${L}svg/gameIntro.svg`;
    }
  ), [ne] = C(
    () => {
      var o;
      return ((o = r.assetOverrides) == null ? void 0 : o.menuBackground) ?? `${L}svg/menuBackground.svg`;
    }
  ), [ae] = C(
    () => {
      var o;
      return ((o = r.assetOverrides) == null ? void 0 : o.gameOver) ?? `${L}svg/gameOver.svg`;
    }
  ), [ie] = C(
    () => {
      var o;
      return ((o = r.assetOverrides) == null ? void 0 : o.gameComplete) ?? `${L}svg/gameComplete.svg`;
    }
  );
  ce(() => {
    const o = i.current, O = e.current, V = t.current, F = s.current, q = a.current;
    if (!o || !O || !V || !F || !q) {
      console.error("[AntsGameComponent] chybí DOM refs při mountu, engine se neinicializuje");
      return;
    }
    const G = v.current, z = se(G.config), Y = ee(G.assetsBaseUrl ?? Q), W = G.assetOverrides, K = new rt({
      baseUrl: `${Y}svg/`,
      overrides: W
    }), re = new it(G.storageNamespace), oe = {
      root: o,
      scene: O,
      targetGroup: V,
      stainsLayer: F,
      antsLayer: q
    };
    let j = !1, k = null;
    return K.preloadAll(ot(z.levels)).then(() => {
      j || (k = new at(oe, {
        config: z,
        svgAssets: K,
        storage: re,
        audioBaseUrl: `${Y}sounds/`,
        audioOverrides: W,
        fullscreen: v.current.fullscreen ?? !1,
        onStateChange: (g) => {
          var b, w;
          I(g), (w = (b = v.current).onStateChange) == null || w.call(b, g);
        },
        onHudUpdate: (g) => {
          d.current = g, p.current.forEach((b) => b(g));
        },
        onLevelComplete: (g) => {
          var b, w;
          N(g), (w = (b = v.current).onLevelComplete) == null || w.call(b, { level: g.level, gameComplete: g.gameComplete });
        },
        onGameOver: (g) => {
          var b, w;
          H(g), (w = (b = v.current).onGameOver) == null || w.call(b, { level: g.level, attempt: g.attemptNumber ?? 0 });
        },
        onAntKilled: (g) => {
          var b, w;
          return (w = (b = v.current).onAntKilled) == null ? void 0 : w.call(b, g);
        },
        onShowIntro: () => T(!0),
        onHideIntro: () => T(!1)
      }), typeof v.current.muted == "boolean" && k.setMuted(v.current.muted), S(k.isMuted()), l.current = k, k.start());
    }).catch((g) => {
      console.error("[AntsGameComponent] preload assetů selhal, engine se nespustí:", g);
    }), () => {
      j = !0, k == null || k.destroy(), l.current = null;
    };
  }, []);
  const B = M(null);
  return B.current || (B.current = {
    pause: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.pause();
    },
    resume: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.resumeGame();
    },
    reset: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.startNewGame();
    },
    mute: (o) => {
      var O;
      (O = l.current) == null || O.setMuted(o), S(o);
    },
    getState: () => {
      var o;
      return ((o = l.current) == null ? void 0 : o.state) ?? "MENU";
    },
    subscribeHud: (o) => (p.current.add(o), d.current && o(d.current), () => p.current.delete(o)),
    startNewGame: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.startNewGame();
    },
    continueFromMenu: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.startGame();
    },
    retryLevel: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.retryLevel();
    },
    continueLevel: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.continueLevel();
    },
    playUiTap: () => {
      var o;
      return (o = l.current) == null ? void 0 : o.audioManager.play("uiTap");
    }
  }), {
    ...B.current,
    gameState: x,
    levelCompleteInfo: h,
    gameOverInfo: U,
    introVisible: y,
    introImageUrl: E,
    menuBackgroundImageUrl: ne,
    gameOverImageUrl: ae,
    gameCompleteImageUrl: ie,
    muted: f
  };
}
const ht = "_root_eatm9_6", ct = "_fullscreen_eatm9_31", ut = "_scene_eatm9_60", dt = "_targetState_eatm9_66", gt = "_antsLayer_eatm9_70", D = {
  root: ht,
  fullscreen: ct,
  scene: ut,
  targetState: dt,
  antsLayer: gt
}, mt = 6, _t = ue(
  function(e, t) {
    const { className: s, style: a, fullscreen: r = !1, config: l } = e, d = M(null), p = M(null), v = M(null), x = M(null), I = M(null), h = lt({ rootRef: d, sceneRef: p, targetRef: v, stainsLayerRef: x, antsLayerRef: I, props: e });
    de(
      t,
      () => ({
        pause: () => h.pause(),
        resume: () => h.resume(),
        reset: () => h.reset(),
        mute: (T) => h.mute(T),
        getState: () => h.getState()
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    const { sceneWidth: N, sceneHeight: U } = se(l).game, H = [D.root, r ? D.fullscreen : "", s].filter(Boolean).join(" "), y = (T) => () => {
      h.playUiTap(), T();
    };
    return /* @__PURE__ */ A("div", { ref: d, className: H, style: a, children: [
      /* @__PURE__ */ A(
        "svg",
        {
          ref: p,
          className: D.scene,
          viewBox: `0 0 ${N} ${U}`,
          preserveAspectRatio: "xMidYMid slice",
          children: [
            /* @__PURE__ */ c("g", { ref: v, transform: `translate(${N / 2},${U / 2})`, children: Array.from({ length: mt }, (T, f) => /* @__PURE__ */ c(
              "g",
              {
                "data-target-state": f,
                className: D.targetState,
                style: f === 0 ? void 0 : { display: "none" }
              },
              f
            )) }),
            /* @__PURE__ */ c("g", { ref: x }),
            /* @__PURE__ */ c("g", { ref: I, className: D.antsLayer })
          ]
        }
      ),
      /* @__PURE__ */ c(
        Me,
        {
          visible: h.gameState === "PLAYING" || h.gameState === "PAUSED",
          subscribeHud: h.subscribeHud
        }
      ),
      /* @__PURE__ */ c(
        Ne,
        {
          gameState: h.gameState,
          levelCompleteInfo: h.levelCompleteInfo,
          gameOverInfo: h.gameOverInfo,
          introVisible: h.introVisible,
          introImageUrl: h.introImageUrl,
          menuBackgroundImageUrl: h.menuBackgroundImageUrl,
          gameOverImageUrl: h.gameOverImageUrl,
          gameCompleteImageUrl: h.gameCompleteImageUrl,
          muted: h.muted,
          subscribeHud: h.subscribeHud,
          onStartNewGame: y(h.startNewGame),
          onContinueFromMenu: y(h.continueFromMenu),
          onRetry: y(h.retryLevel),
          onContinueLevel: y(h.continueLevel),
          onResume: y(h.resume),
          onToggleMute: y(() => h.mute(!h.muted))
        }
      )
    ] });
  }
);
export {
  _t as AntsGameComponent
};
