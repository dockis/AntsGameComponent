import { GAME_CONFIG, ANT_TYPES } from './config.js';
import * as svgAssets from './svgAssets.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Dnešní CSS scale typové varianty se přesunul do obsahu SVG assetů (viz feature 16),
// ale hitbox zůstává funkční prvek v JS — dopadová plocha agresivních/odolných
// mravenců se škáluje stejně jako dřív, jen přímo na circle.ant-hitbox.
const ANT_HITBOX_SCALE = {
  aggressive: [1.15, 1.3],
  armored: [1.15, 1.3],
};

function lerpAngle(from, to, t) {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * Math.min(t, 1);
}

function randomVariance(base, variance) {
  return base * (1 + (Math.random() * 2 - 1) * variance);
}

export class Ant {
  constructor(el) {
    this.el = el;
    this.type = 'normal';
    this.pos = { x: 0, y: 0 };
    this.heading = 0;
    this.wanderAngle = 0;
    this.speed = GAME_CONFIG.baseAntSpeed;
    this.wanderJitter = GAME_CONFIG.wanderJitter;
    this.turnSpeed = GAME_CONFIG.turnSpeed;
    this.damagePerSecond = 0;
    this.eating = false;
    this.active = false;
    this.removing = false;
    this.squishTimer = 0;

    this.el.ant = this;
    this._buildVisual();
  }

  _buildVisual() {
    this.visual = document.createElementNS(SVG_NS, 'g');
    this.visual.setAttribute('class', 'ant-visual');

    this.hitbox = document.createElementNS(SVG_NS, 'circle');
    this.hitbox.setAttribute('class', 'ant-hitbox');
    this.hitbox.setAttribute('r', String(GAME_CONFIG.antHitboxRadius));
    this.hitbox.setAttribute('fill', 'transparent');

    this.visual.appendChild(this.hitbox);
    this.el.appendChild(this.visual);
  }

  _setTypeVisual(type) {
    for (const node of Array.from(this.visual.children)) {
      if (node !== this.hitbox) this.visual.removeChild(node);
    }
    const assetName = 'ant' + type[0].toUpperCase() + type.slice(1);
    this.visual.appendChild(svgAssets.getFragment(assetName));

    const scale = ANT_HITBOX_SCALE[type];
    if (scale) {
      this.hitbox.setAttribute('transform', `scale(${scale[0]},${scale[1]})`);
    } else {
      this.hitbox.removeAttribute('transform');
    }
  }

  reset({ pos, heading, type = 'normal', speedMultiplier = 1 }) {
    const typeConfig = ANT_TYPES[type];
    this.type = type;
    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.heading = heading;
    this.wanderAngle = (Math.random() - 0.5) * Math.PI;
    this.levelSpeedMultiplier = speedMultiplier;
    this.speed = randomVariance(
      GAME_CONFIG.baseAntSpeed * typeConfig.speedMultiplier * speedMultiplier,
      GAME_CONFIG.antVariance
    );
    this.wanderJitter = randomVariance(GAME_CONFIG.wanderJitter, GAME_CONFIG.antVariance);
    this.turnSpeed = randomVariance(GAME_CONFIG.turnSpeed, GAME_CONFIG.antVariance);
    this.damagePerSecond = GAME_CONFIG.baseDamagePerSecond * typeConfig.damageMultiplier;
    this.hitsRemaining = typeConfig.hitsToKill;
    this.eating = false;
    this.active = true;

    this.visual.classList.remove('squish', 'hit-flash');
    this._setTypeVisual(type);
    this.el.style.display = 'block';
    this._applyTransform();
  }

  hide() {
    this.active = false;
    this.el.style.display = 'none';
  }

  playSquish() {
    this.visual.classList.add('squish');
  }

  // Zaznamená zásah. Vrací true, pokud mravenec má být odstraněn (despawn),
  // false pokud jen "odzbrojen" na afterFirstHit typ a zůstává aktivní.
  applyHit() {
    this.hitsRemaining -= 1;
    const typeConfig = ANT_TYPES[this.type];

    if (this.hitsRemaining > 0 && typeConfig.afterFirstHit) {
      this._downgradeTo(typeConfig.afterFirstHit);
      return false;
    }

    return true;
  }

  _downgradeTo(type) {
    const typeConfig = ANT_TYPES[type];
    this.type = type;
    this.speed = randomVariance(
      GAME_CONFIG.baseAntSpeed * typeConfig.speedMultiplier * this.levelSpeedMultiplier,
      GAME_CONFIG.antVariance
    );
    this.damagePerSecond = GAME_CONFIG.baseDamagePerSecond * typeConfig.damageMultiplier;

    this._setTypeVisual(type);
    this._playHitFlash();
  }

  _playHitFlash() {
    this.visual.classList.remove('hit-flash');
    this.visual.addEventListener('animationend', () => this.visual.classList.remove('hit-flash'), { once: true });
    this.visual.classList.add('hit-flash');
  }

  update(dt, targetPos) {
    if (this.eating) return;

    const toTargetX = targetPos.x - this.pos.x;
    const toTargetY = targetPos.y - this.pos.y;
    const desiredAngle = Math.atan2(toTargetY, toTargetX);

    this.wanderAngle += (Math.random() - 0.5) * this.wanderJitter * dt;

    const desiredHeading = desiredAngle + this.wanderAngle;
    this.heading = lerpAngle(this.heading, desiredHeading, this.turnSpeed * dt);

    this.pos.x += Math.cos(this.heading) * this.speed * dt;
    this.pos.y += Math.sin(this.heading) * this.speed * dt;

    this._applyTransform();

    if (this.distanceTo(targetPos) <= GAME_CONFIG.eatingRadius) {
      this.eating = true;
    }
  }

  distanceTo(pos) {
    return Math.hypot(pos.x - this.pos.x, pos.y - this.pos.y);
  }

  _applyTransform() {
    const degrees = (this.heading * 180) / Math.PI;
    this.el.setAttribute('transform', `translate(${this.pos.x},${this.pos.y}) rotate(${degrees})`);
  }
}
