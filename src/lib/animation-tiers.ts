/**
 * Animation tier system for terrarium-scene.
 *
 * Three tiers:
 *   "full"    – all animations (default desktop)
 *   "reduced" – no particles, no star twinkle, simplified creature anim
 *   "minimal" – static scene, no SVG animations at all
 *
 * Tier is determined by:
 *   1. prefers-reduced-motion → "minimal"
 *   2. Low memory/cores → "reduced"
 *   3. Otherwise → "full"
 */

export type AnimationTier = "full" | "reduced" | "minimal";

export function getAnimationTier(prefersReducedMotion: boolean): AnimationTier {
  if (prefersReducedMotion) return "minimal";

  if (typeof navigator !== "undefined") {
    // Check for low-end device signals
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
    const lowCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2;
    if (lowMemory || lowCores) return "reduced";
  }

  return "full";
}

/** Configuration for what to render at each tier */
export interface TierConfig {
  /** Show twinkling star animations */
  starTwinkle: boolean;
  /** Max number of background stars */
  maxStars: number;
  /** Show nebula effects */
  showNebula: boolean;
  /** Show shooting stars on all-done */
  showShootingStars: boolean;
  /** Show cloud drift animations */
  showClouds: boolean;
  /** Show seasonal particles (snow, petals, leaves, fireflies) */
  showSeasonalParticles: boolean;
  /** Max seasonal particles */
  maxSeasonalParticles: number;
  /** Show aurora on all-done */
  showAurora: boolean;
  /** Show orbital ring animation */
  showOrbitalRing: boolean;
  /** Show creature mood animations (blink, sleep zzz, sparkles) */
  showCreatureMoodFx: boolean;
  /** Show bounce sparkles on completion */
  showBounceSparkles: boolean;
  /** Use animated creature bob/float */
  animateCreatures: boolean;
}

const FULL_CONFIG: TierConfig = {
  starTwinkle: true,
  maxStars: 70,
  showNebula: true,
  showShootingStars: true,
  showClouds: true,
  showSeasonalParticles: true,
  maxSeasonalParticles: 25,
  showAurora: true,
  showOrbitalRing: true,
  showCreatureMoodFx: true,
  showBounceSparkles: true,
  animateCreatures: true,
};

const REDUCED_CONFIG: TierConfig = {
  starTwinkle: false,
  maxStars: 20,
  showNebula: false,
  showShootingStars: false,
  showClouds: false,
  showSeasonalParticles: true,
  maxSeasonalParticles: 8,
  showAurora: false,
  showOrbitalRing: false,
  showCreatureMoodFx: false,
  showBounceSparkles: true,
  animateCreatures: true,
};

const MINIMAL_CONFIG: TierConfig = {
  starTwinkle: false,
  maxStars: 15,
  showNebula: false,
  showShootingStars: false,
  showClouds: false,
  showSeasonalParticles: false,
  maxSeasonalParticles: 0,
  showAurora: false,
  showOrbitalRing: false,
  showCreatureMoodFx: false,
  showBounceSparkles: false,
  animateCreatures: false,
};

export function getTierConfig(tier: AnimationTier): TierConfig {
  switch (tier) {
    case "full": return FULL_CONFIG;
    case "reduced": return REDUCED_CONFIG;
    case "minimal": return MINIMAL_CONFIG;
  }
}
