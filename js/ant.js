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
    this.active = false;

    this._buildVisual();
  }

  _buildVisual() {
    const body = document.createElementNS(SVG_NS, 'ellipse');
    body.setAttribute('rx', '7');
    body.setAttribute('ry', '4');
    body.setAttribute('fill', '#3b2a1a');

    const head = document.createElementNS(SVG_NS, 'ellipse');
    head.setAttribute('cx', '8');
    head.setAttribute('rx', '3.5');
    head.setAttribute('ry', '3');
    head.setAttribute('fill', '#241a10');

    this.el.appendChild(body);
    this.el.appendChild(head);
  }

  reset({ pos, heading, type = 'normal' }) {
    const typeConfig = ANT_TYPES[type];
    this.type = type;
    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.heading = heading;
    this.wanderAngle = (Math.random() - 0.5) * Math.PI;
    this.speed = randomVariance(GAME_CONFIG.baseAntSpeed * typeConfig.speedMultiplier, GAME_CONFIG.antVariance);
    this.wanderJitter = randomVariance(GAME_CONFIG.wanderJitter, GAME_CONFIG.antVariance);
    this.turnSpeed = randomVariance(GAME_CONFIG.turnSpeed, GAME_CONFIG.antVariance);
    this.active = true;

    this.el.style.display = 'block';
    this._applyTransform();
  }

  hide() {
    this.active = false;
    this.el.style.display = 'none';
  }

  update(dt, targetPos) {
    const toTargetX = targetPos.x - this.pos.x;
    const toTargetY = targetPos.y - this.pos.y;
    const desiredAngle = Math.atan2(toTargetY, toTargetX);

    this.wanderAngle += (Math.random() - 0.5) * this.wanderJitter * dt;

    const desiredHeading = desiredAngle + this.wanderAngle;
    this.heading = lerpAngle(this.heading, desiredHeading, this.turnSpeed * dt);

    this.pos.x += Math.cos(this.heading) * this.speed * dt;
    this.pos.y += Math.sin(this.heading) * this.speed * dt;

    this._applyTransform();
  }

  distanceTo(pos) {
    return Math.hypot(pos.x - this.pos.x, pos.y - this.pos.y);
  }

  _applyTransform() {
    const degrees = (this.heading * 180) / Math.PI;
    this.el.setAttribute('transform', `translate(${this.pos.x},${this.pos.y}) rotate(${degrees})`);
  }
}
