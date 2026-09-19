import type { AntTypeKey, AntTypesConfig, GameConfig } from '../config/schema';
import type { SvgAssetLoader } from './svgAssets';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Dnešní CSS scale typové varianty se přesunul do obsahu SVG assetů (viz feature 16),
// ale hitbox zůstává funkční prvek v JS — dopadová plocha agresivních/odolných
// mravenců se škáluje stejně jako dřív, jen přímo na circle.ant-hitbox.
const ANT_HITBOX_SCALE: Partial<Record<AntTypeKey, [number, number]>> = {
  aggressive: [1.15, 1.3],
  armored: [1.15, 1.3],
};

export interface Point {
  x: number;
  y: number;
}

export interface AntElement extends SVGGElement {
  ant?: Ant;
}

export interface AntResetOptions {
  pos: Point;
  heading: number;
  type?: AntTypeKey;
  speedMultiplier?: number;
}

export interface AntDeps {
  config: GameConfig;
  antTypes: AntTypesConfig;
  svgAssets: SvgAssetLoader;
}

function lerpAngle(from: number, to: number, t: number): number {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * Math.min(t, 1);
}

function randomVariance(base: number, variance: number): number {
  return base * (1 + (Math.random() * 2 - 1) * variance);
}

export class Ant {
  readonly el: AntElement;
  visual!: SVGGElement;
  hitbox!: SVGCircleElement;

  type: AntTypeKey = 'normal';
  pos: Point = { x: 0, y: 0 };
  heading = 0;
  speed: number;
  turnSpeed: number;
  levelSpeedMultiplier = 1;

  noiseTime = 0;
  noisePhases: number[] = [];
  noiseFrequencies: number[] = [];

  burstIntervalMultiplier = 1;
  burstActive = false;
  burstElapsed = 0;
  burstAmplitude = 0;
  burstHoldDuration = 0;
  burstSign = 1;
  burstTimer = 0;

  damagePerSecond = 0;
  hitsRemaining = 1;
  eating = false;
  active = false;
  removing = false;
  squishTimer = 0;

  private readonly deps: AntDeps;

  constructor(el: AntElement, deps: AntDeps) {
    this.el = el;
    this.deps = deps;
    this.speed = deps.config.baseAntSpeed;
    this.turnSpeed = deps.config.turnSpeed;

    this.el.ant = this;
    this._buildVisual();
  }

  private _buildVisual(): void {
    this.visual = document.createElementNS(SVG_NS, 'g') as SVGGElement;
    this.visual.setAttribute('class', 'ant-visual');

    this.hitbox = document.createElementNS(SVG_NS, 'circle') as SVGCircleElement;
    this.hitbox.setAttribute('class', 'ant-hitbox');
    this.hitbox.setAttribute('r', String(this.deps.config.antHitboxRadius));
    this.hitbox.setAttribute('fill', 'transparent');

    this.visual.appendChild(this.hitbox);
    this.el.appendChild(this.visual);
  }

  private _setTypeVisual(type: AntTypeKey): void {
    for (const node of Array.from(this.visual.children)) {
      if (node !== this.hitbox) this.visual.removeChild(node);
    }
    const assetName = 'ant' + type[0].toUpperCase() + type.slice(1);
    this.visual.appendChild(this.deps.svgAssets.getFragment(assetName));

    const scale = ANT_HITBOX_SCALE[type];
    if (scale) {
      this.hitbox.setAttribute('transform', `scale(${scale[0]},${scale[1]})`);
    } else {
      this.hitbox.removeAttribute('transform');
    }
  }

  reset({ pos, heading, type = 'normal', speedMultiplier = 1 }: AntResetOptions): void {
    const { config, antTypes } = this.deps;
    const typeConfig = antTypes[type];
    this.type = type;
    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.heading = heading;
    this.levelSpeedMultiplier = speedMultiplier;
    this.speed = randomVariance(
      config.baseAntSpeed * typeConfig.speedMultiplier * speedMultiplier,
      config.antVariance
    );
    this.turnSpeed = randomVariance(config.turnSpeed, config.antVariance);

    // Per-instance rozptyl šumu (fázový posun + drobná odchylka frekvence), aby žádní
    // dva mravenci nešli vizuálně identickou "naklonovanou" trasou.
    this.noiseTime = 0;
    this.noisePhases = config.wanderNoise.layers.map(() => Math.random() * Math.PI * 2);
    this.noiseFrequencies = config.wanderNoise.layers.map((layer) =>
      randomVariance(layer.frequency, config.antVariance)
    );
    this.burstIntervalMultiplier = randomVariance(1, config.antVariance);
    this.burstActive = false;
    this.burstElapsed = 0;
    this.burstAmplitude = 0;
    this.burstHoldDuration = 0;
    this.burstSign = 1;
    this.burstTimer = this._randomBurstInterval();
    this.damagePerSecond = config.baseDamagePerSecond * typeConfig.damageMultiplier;
    this.hitsRemaining = typeConfig.hitsToKill;
    this.eating = false;
    this.active = true;

    this.visual.classList.remove('squish', 'hit-flash');
    this._setTypeVisual(type);
    this.el.style.display = 'block';
    this._applyTransform();
  }

  hide(): void {
    this.active = false;
    this.el.style.display = 'none';
  }

  playSquish(): void {
    this.visual.classList.add('squish');
  }

  // Zaznamená zásah. Vrací true, pokud mravenec má být odstraněn (despawn),
  // false pokud jen "odzbrojen" na afterFirstHit typ a zůstává aktivní.
  applyHit(): boolean {
    this.hitsRemaining -= 1;
    const typeConfig = this.deps.antTypes[this.type];

    if (this.hitsRemaining > 0 && typeConfig.afterFirstHit) {
      this._downgradeTo(typeConfig.afterFirstHit);
      return false;
    }

    return true;
  }

  private _downgradeTo(type: AntTypeKey): void {
    const { config, antTypes } = this.deps;
    const typeConfig = antTypes[type];
    this.type = type;
    this.speed = randomVariance(
      config.baseAntSpeed * typeConfig.speedMultiplier * this.levelSpeedMultiplier,
      config.antVariance
    );
    this.damagePerSecond = config.baseDamagePerSecond * typeConfig.damageMultiplier;

    this._setTypeVisual(type);
    this._playHitFlash();
  }

  private _playHitFlash(): void {
    this.visual.classList.remove('hit-flash');
    this.visual.addEventListener('animationend', () => this.visual.classList.remove('hit-flash'), { once: true });
    this.visual.classList.add('hit-flash');
  }

  update(dt: number, targetPos: Point): void {
    if (this.eating) return;

    const toTargetX = targetPos.x - this.pos.x;
    const toTargetY = targetPos.y - this.pos.y;
    const desiredAngle = Math.atan2(toTargetY, toTargetX);
    const distanceToTarget = Math.hypot(toTargetX, toTargetY);

    this.noiseTime += dt;
    const wanderOffset = this._noiseOffset() + this._updateBurst(dt);
    const desiredHeading = desiredAngle + wanderOffset * this._seekDamping(distanceToTarget);

    this.heading = lerpAngle(this.heading, desiredHeading, this.turnSpeed * dt);

    this.pos.x += Math.cos(this.heading) * this.speed * dt;
    this.pos.y += Math.sin(this.heading) * this.speed * dt;

    this._applyTransform();

    if (this.distanceTo(targetPos) <= this.deps.config.eatingRadius) {
      this.eating = true;
    }
  }

  // Plynulý základní vzor: součet sinusových vrstev s neslučitelnými frekvencemi
  // a per-instance fází/frekvencí (nastaveno v reset()), viz sekce 5 dokumentu 00 / feature 17.
  private _noiseOffset(): number {
    const layers = this.deps.config.wanderNoise.layers;
    let offset = 0;
    for (let i = 0; i < layers.length; i++) {
      offset += layers[i].amplitude * Math.sin(this.noiseFrequencies[i] * this.noiseTime + this.noisePhases[i]);
    }
    return offset;
  }

  // Občasná výraznější "odbočka": po náhodně dlouhé hold fázi na špičkové (per-výskyt
  // náhodné) amplitudě následuje exponenciální doznění zpět k základnímu šumu během
  // wanderBurst.decayDurationMs, poté nový náhodný interval do příště.
  private _updateBurst(dt: number): number {
    const { decayDurationMs, decayRate } = this.deps.config.wanderBurst;
    const decayDuration = decayDurationMs / 1000;

    if (this.burstActive) {
      this.burstElapsed += dt;
      const decayElapsed = this.burstElapsed - this.burstHoldDuration;

      if (decayElapsed >= decayDuration) {
        this.burstActive = false;
        this.burstTimer = this._randomBurstInterval();
        return 0;
      }
      if (decayElapsed <= 0) {
        return this.burstAmplitude * this.burstSign;
      }
      return this.burstAmplitude * this.burstSign * Math.exp(-decayRate * decayElapsed);
    }

    this.burstTimer -= dt;
    if (this.burstTimer <= 0) {
      this.burstActive = true;
      this.burstElapsed = 0;
      this.burstSign = Math.random() < 0.5 ? -1 : 1;
      this.burstAmplitude = this._randomBurstAmplitude();
      this.burstHoldDuration = this._randomBurstHoldDuration();
      return this.burstAmplitude * this.burstSign;
    }
    return 0;
  }

  private _randomBurstAmplitude(): number {
    const { amplitudeMin, amplitudeMax, sharpChance, sharpAmplitudeMin, sharpAmplitudeMax } =
      this.deps.config.wanderBurst;
    if (Math.random() < sharpChance) {
      return sharpAmplitudeMin + Math.random() * (sharpAmplitudeMax - sharpAmplitudeMin);
    }
    return amplitudeMin + Math.random() * (amplitudeMax - amplitudeMin);
  }

  private _randomBurstHoldDuration(): number {
    const { holdMsMin, holdMsMax } = this.deps.config.wanderBurst;
    return (holdMsMin + Math.random() * (holdMsMax - holdMsMin)) / 1000;
  }

  private _randomBurstInterval(): number {
    const { intervalMinMs, intervalMaxMs } = this.deps.config.wanderBurst;
    const ms = intervalMinMs + Math.random() * (intervalMaxMs - intervalMinMs);
    return (ms / 1000) * this.burstIntervalMultiplier;
  }

  // Tlumení amplitudy šumu/burstu blízko cíle: 1 mimo seekRadius, plynule k 0 na eatingRadius,
  // aby poslední úsek cesty byl vždy přímý a mravenec u cíle nekroužil (feature 17).
  private _seekDamping(distance: number): number {
    const { seekRadius, eatingRadius } = this.deps.config;
    if (distance >= seekRadius) return 1;
    return Math.max(0, (distance - eatingRadius) / (seekRadius - eatingRadius));
  }

  distanceTo(pos: Point): number {
    return Math.hypot(pos.x - this.pos.x, pos.y - this.pos.y);
  }

  private _applyTransform(): void {
    const degrees = (this.heading * 180) / Math.PI;
    this.el.setAttribute('transform', `translate(${this.pos.x},${this.pos.y}) rotate(${degrees})`);
  }
}
