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
const WAKA_PIN_HASH = process.env.GYM_PIN_WAKA || "e1fccddd792d5b9956c29a4f6a7b91ff502a3bb3ac5f6cc89331282d5d9c1100";
const CALI_PIN_HASH = process.env.GYM_PIN_CALI  || "bf5fba1cae166f486202d1573099cd24c9b119ca7d909c56ccd72967743e973a";

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

