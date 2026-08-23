import { GAME_CONFIG, ANT_TYPES } from './config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

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

    const hitbox = document.createElementNS(SVG_NS, 'circle');
    hitbox.setAttribute('class', 'ant-hitbox');
    hitbox.setAttribute('r', String(GAME_CONFIG.antHitboxRadius));
    hitbox.setAttribute('fill', 'transparent');

    const body = document.createElementNS(SVG_NS, 'ellipse');
    body.setAttribute('class', 'ant-body');
    body.setAttribute('rx', '7');
    body.setAttribute('ry', '4');
    body.setAttribute('fill', '#3b2a1a');

    const head = document.createElementNS(SVG_NS, 'ellipse');
    head.setAttribute('class', 'ant-head');
    head.setAttribute('cx', '8');
    head.setAttribute('rx', '3.5');
    head.setAttribute('ry', '3');
    head.setAttribute('fill', '#241a10');

    this.visual.appendChild(hitbox);
    this.visual.appendChild(body);
    this.visual.appendChild(head);
    this.el.appendChild(this.visual);
  }

  reset({ pos, heading, type = 'normal', speedMultiplier = 1 }) {
    const typeConfig = ANT_TYPES[type];
    this.type = type;
    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.heading = heading;
    this.wanderAngle = (Math.random() - 0.5) * Math.PI;
    this.speed = randomVariance(
      GAME_CONFIG.baseAntSpeed * typeConfig.speedMultiplier * speedMultiplier,
      GAME_CONFIG.antVariance
    );
    this.wanderJitter = randomVariance(GAME_CONFIG.wanderJitter, GAME_CONFIG.antVariance);
    this.turnSpeed = randomVariance(GAME_CONFIG.turnSpeed, GAME_CONFIG.antVariance);
    this.damagePerSecond = GAME_CONFIG.baseDamagePerSecond * typeConfig.damageMultiplier;
    this.hitsToKill = typeConfig.hitsToKill;
    this.eating = false;
    this.active = true;

    this.visual.classList.remove('squish', 'type-aggressive', 'type-armored');
    if (type !== 'normal') this.visual.classList.add(`type-${type}`);
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
