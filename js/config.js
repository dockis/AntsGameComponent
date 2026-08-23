export const GAME_CONFIG = {
  targetMaxHealth: 100,
  eatingRadius: 25,
  antPoolSize: 30, // >= max hodnota maxAnts napříč všemi levely
  retry: {
    mode: 'strict', // 'strict' | 'lenient'
    maxRestarts: 2,
  },
  damageStates: [0.81, 0.61, 0.41, 0.21, 0.0], // dolní hranice % zdraví pro každý vizuální stav (mimo 100% pristine)
  sceneWidth: 400, // musí odpovídat viewBoxu v index.html
  sceneHeight: 800,
  baseAntSpeed: 60, // jednotky viewBoxu/s, viz sekce 8 dokumentu 00
  baseDamagePerSecond: 3, // viz sekce 8 dokumentu 00
  wanderJitter: 2.0, // sekce 5
  turnSpeed: 4.0, // sekce 5
  antVariance: 0.15, // ±15 % per-instance odchylka speed/wanderJitter/turnSpeed, viz sekce 5
  antSpawnMargin: 20, // vzdálenost mimo viewBox, kde se mravenec spawne
  antHitboxRadius: 16, // neviditelný dotykový hitbox, ~1,5-2x vizuální velikosti mravence, sekce 9
  squishDurationMs: 150, // délka vizuální "squish" animace při zabití, sekce 9
};

export const ANT_TYPES = {
  normal: {
    speedMultiplier: 1.0,
    damageMultiplier: 1.0,
    hitsToKill: 1,
  },
  aggressive: {
    speedMultiplier: 1.4,
    damageMultiplier: 2.75,
    hitsToKill: 1,
  },
  armored: {
    speedMultiplier: 1.4,
    damageMultiplier: 2.75,
    hitsToKill: 2,
    afterFirstHit: 'normal', // po prvním zásahu přebírá vlastnosti tohoto typu
  },
};

export const LEVELS = [
  { level: 1,  killTarget: 8,  maxAnts: 3,  spawnInterval: [1500, 2200], speedMultiplier: 0.8,  ants: { normal: 100, aggressive: 0,  armored: 0  } },
  { level: 2,  killTarget: 12, maxAnts: 4,  spawnInterval: [1300, 2000], speedMultiplier: 0.9,  ants: { normal: 100, aggressive: 0,  armored: 0  } },
  { level: 3,  killTarget: 15, maxAnts: 5,  spawnInterval: [1100, 1800], speedMultiplier: 1.0,  ants: { normal: 100, aggressive: 0,  armored: 0  } },
  { level: 4,  killTarget: 15, maxAnts: 5,  spawnInterval: [900, 1500],  speedMultiplier: 1.1,  ants: { normal: 100, aggressive: 0,  armored: 0  } },
  { level: 5,  killTarget: 18, maxAnts: 6,  spawnInterval: [900, 1500],  speedMultiplier: 1.0,  ants: { normal: 80,  aggressive: 20, armored: 0  } },
  { level: 6,  killTarget: 20, maxAnts: 6,  spawnInterval: [850, 1400],  speedMultiplier: 1.05, ants: { normal: 70,  aggressive: 30, armored: 0  } },
  { level: 7,  killTarget: 20, maxAnts: 7,  spawnInterval: [800, 1300],  speedMultiplier: 1.15, ants: { normal: 65,  aggressive: 35, armored: 0  } },
  { level: 8,  killTarget: 22, maxAnts: 7,  spawnInterval: [800, 1300],  speedMultiplier: 1.1,  ants: { normal: 55,  aggressive: 30, armored: 15 } },
  { level: 9,  killTarget: 24, maxAnts: 8,  spawnInterval: [750, 1250],  speedMultiplier: 1.15, ants: { normal: 50,  aggressive: 30, armored: 20 } },
  { level: 10, killTarget: 26, maxAnts: 8,  spawnInterval: [700, 1150],  speedMultiplier: 1.2,  ants: { normal: 45,  aggressive: 30, armored: 25 } },
  { level: 11, killTarget: 28, maxAnts: 9,  spawnInterval: [650, 1100],  speedMultiplier: 1.25, ants: { normal: 40,  aggressive: 35, armored: 25 } },
  { level: 12, killTarget: 30, maxAnts: 10, spawnInterval: [600, 1000],  speedMultiplier: 1.3,  ants: { normal: 35,  aggressive: 35, armored: 30 } },
];
