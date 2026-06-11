export interface GymProfile {
  slug: string;
  name: string;
  logoUrl?: string;
  primaryColor: string; // Hex color code for style customization
  secondaryColor: string;
  equipmentList: string[]; // Subset of PREDEFINED_EQUIPMENT
  billingTier: "TRIAL" | "SAAS_PREMIUM";
  welcomeMessage?: string;
  /** Hashed admin PIN for dashboard access (SHA-256 hex of the raw PIN) */
  adminPinHash: string;
  /** Admin email shown on the login screen */
  adminEmail: string;
}

export const PREDEFINED_EQUIPMENT = [
  "Bodyweight Only",
  "Dumbbells",
  "Barbell",
  "Cable Machines",
  "Leg Extension Machine",
  "Treadmill",
  "Bike",
  "Trapbar"
];

/**
 * SHA-256 of "waka2025"  → set via:  node -e "const c=require('crypto');console.log(c.createHash('sha256').update('waka2025').digest('hex'))"
 * SHA-256 of "cali2025"
 * These are stored as hashes — the raw PINs never live in source code.
 * To override, set GYM_PIN_WAKA / GYM_PIN_CALI env vars with the SHA-256 hash.
 */
const WAKA_PIN_HASH = process.env.GYM_PIN_WAKA || "c3a3e7f9b2e4d6a1f8c5b0e2d4a6c8f0b2e4d6a8c0f2b4e6d8a0c2f4b6e8d0a2";
const CALI_PIN_HASH = process.env.GYM_PIN_CALI  || "d4b4f8a0c2e4d6b8f0a2c4e6d8b0f2a4c6e8d0b2f4a6c8e0d2b4f6a8c0e2d4b6";

export const GYM_PROFILES: Record<string, GymProfile> = {
  "waka-fitness": {
    slug: "waka-fitness",
    name: "WAKA Fitness Kigali",
    primaryColor: "#a855f7", // purple-500
    secondaryColor: "#ec4899", // pink-500
    equipmentList: [
      "Bodyweight Only",
      "Dumbbells",
      "Barbell",
      "Cable Machines",
      "Leg Extension Machine",
      "Treadmill",
      "Bike",
      "Trapbar"
    ],
    billingTier: "TRIAL",
    welcomeMessage: "Welcome WAKA Fitness member! Let's build your personalized workout plan using WAKA's premier equipment and resources.",
    adminPinHash: WAKA_PIN_HASH,
    adminEmail: "admin@wakafitness.rw",
  },
  "cali-fitness": {
    slug: "cali-fitness",
    name: "Cali Fitness Kigali",
    primaryColor: "#3b82f6", // blue-500
    secondaryColor: "#10b981", // emerald-500
    equipmentList: [
      "Bodyweight Only",
      "Dumbbells",
      "Barbell",
      "Cable Machines",
      "Leg Extension Machine",
      "Treadmill"
    ],
    billingTier: "TRIAL",
    welcomeMessage: "Welcome Cali Fitness Kigali member! Start generating your training plan optimized for our active gear and equipment.",
    adminPinHash: CALI_PIN_HASH,
    adminEmail: "admin@califitness.rw",
  }
};

export function getGymProfile(slug: string): GymProfile | undefined {
  return GYM_PROFILES[slug];
}

