/**
 * Anthropometric body metrics — pure math, no Three.js.
 * Grounded in the classic 7.5-head figure canon.
 */

export type BodyProfile = "feminine" | "masculine" | "neutral";

export interface BodyParams {
  height: number; // cm
  weight: number; // kg
  shoulderWidth: number; // cm (biacromial breadth)
  bust: number; // cm circumference
  waist: number; // cm circumference
  hips: number; // cm circumference
  bodyProfile: BodyProfile;
}

export interface EllipseRadii {
  width: number; // meters (half-width / lateral)
  depth: number; // meters (half-depth / anteroposterior)
}

export interface BodyLandmarks {
  sole: number;
  ankle: number;
  knee: number;
  crotch: number;
  hipLine: number;
  waist: number;
  bust: number;
  shoulder: number;
  chin: number;
  headTop: number;
}

export interface BodyMetrics {
  /** World-space height of the full figure in meters */
  heightM: number;
  /** Head unit in meters */
  headUnit: number;
  /** Landmark Y positions in meters, sole at y=0 */
  landmarks: BodyLandmarks;
  /** Cross-section radii at key levels */
  radii: {
    neck: EllipseRadii;
    shoulder: EllipseRadii;
    bust: EllipseRadii;
    waist: EllipseRadii;
    hips: EllipseRadii;
    crotch: EllipseRadii;
  };
  /** Half biacromial shoulder width in meters (arm anchor offset) */
  shoulderHalfWidth: number;
  /** Limb segment radii in meters */
  limbs: {
    upperArm: number;
    forearm: number;
    thigh: number;
    calf: number;
    wrist: number;
    ankle: number;
  };
  /** Exact segment lengths spanning adjacent landmarks (meters) */
  segments: {
    head: number;
    neck: number;
    torso: number;
    upperArm: number;
    forearm: number;
    thigh: number;
    calf: number;
    foot: number;
  };
  /** Lathe profile points [radiusX, y] in meters, bottom → top */
  torsoProfile: Array<[number, number]>;
  /** Depth/width ratio for elliptical torso Z-scale */
  torsoDepthRatio: number;
}

/** Landmark Y as fraction of height (sole = 0) */
const LANDMARK_FRAC = {
  sole: 0.0,
  ankle: 0.04,
  knee: 0.28,
  crotch: 0.48,
  hipLine: 0.52,
  waist: 0.62,
  bust: 0.72,
  shoulder: 0.82,
  chin: 0.87,
  headTop: 1.0,
} as const;

const DEPTH_RATIO = 0.72;

/** BMI-seeded default circumferences / widths (cm). */
export function seedMeasurementsFromBiometrics(
  height: number,
  weight: number
): Pick<BodyParams, "shoulderWidth" | "bust" | "waist" | "hips"> {
  const hM = height / 100;
  const bmi = weight / (hM * hM);
  const f = Math.sqrt(Math.max(bmi, 14) / 22);

  return {
    bust: Math.round(0.52 * height * f),
    waist: Math.round(0.42 * height * f),
    hips: Math.round(0.54 * height * f),
    shoulderWidth: Math.round(0.245 * height),
  };
}

/** Profile biases applied to measurements before geometry calc. */
function applyProfileBias(
  params: Omit<BodyParams, "bodyProfile">,
  profile: BodyProfile
): Omit<BodyParams, "bodyProfile"> {
  if (profile === "feminine") {
    return {
      ...params,
      shoulderWidth: params.shoulderWidth * 0.9,
      bust: params.bust * 1.04,
      waist: params.waist * 0.88,
      hips: params.hips * 1.12,
    };
  }
  if (profile === "masculine") {
    return {
      ...params,
      shoulderWidth: params.shoulderWidth * 1.15,
      bust: params.bust * 1.06,
      waist: params.waist * 1.02,
      hips: params.hips * 0.95,
    };
  }
  return params;
}

function circToEllipse(circumferenceCm: number): EllipseRadii {
  const rWidth = circumferenceCm / 100 / (2 * Math.PI);
  return { width: rWidth, depth: rWidth * DEPTH_RATIO };
}

export function buildBodyMetrics(raw: BodyParams): BodyMetrics {
  const params = applyProfileBias(raw, raw.bodyProfile);
  const heightM = params.height / 100;
  const headUnit = heightM / 7.5;

  const landmarks: BodyLandmarks = {
    sole: LANDMARK_FRAC.sole * heightM,
    ankle: LANDMARK_FRAC.ankle * heightM,
    knee: LANDMARK_FRAC.knee * heightM,
    crotch: LANDMARK_FRAC.crotch * heightM,
    hipLine: LANDMARK_FRAC.hipLine * heightM,
    waist: LANDMARK_FRAC.waist * heightM,
    bust: LANDMARK_FRAC.bust * heightM,
    shoulder: LANDMARK_FRAC.shoulder * heightM,
    chin: LANDMARK_FRAC.chin * heightM,
    headTop: LANDMARK_FRAC.headTop * heightM,
  };

  const bustR = circToEllipse(params.bust);
  const waistR = circToEllipse(params.waist);
  const hipsR = circToEllipse(params.hips);
  const shoulderR: EllipseRadii = {
    width: (params.shoulderWidth / 100) * 0.42,
    depth: (params.shoulderWidth / 100) * 0.42 * DEPTH_RATIO,
  };
  const neckR: EllipseRadii = {
    width: Math.max(bustR.width * 0.38, 0.045),
    depth: Math.max(bustR.depth * 0.38, 0.04),
  };
  const crotchR: EllipseRadii = {
    width: hipsR.width * 0.72,
    depth: hipsR.depth * 0.72,
  };

  const shoulderHalfWidth = params.shoulderWidth / 100 / 2;
  const limbScale = Math.sqrt(params.weight / 65);

  const limbs = {
    upperArm: Math.max(0.028, hipsR.width * 0.38 * limbScale),
    forearm: Math.max(0.022, hipsR.width * 0.3 * limbScale),
    thigh: Math.max(0.045, hipsR.width * 0.55 * limbScale),
    calf: Math.max(0.032, hipsR.width * 0.4 * limbScale),
    wrist: Math.max(0.018, hipsR.width * 0.22 * limbScale),
    ankle: Math.max(0.022, hipsR.width * 0.28 * limbScale),
  };

  const segments = {
    head: landmarks.headTop - landmarks.chin,
    neck: landmarks.chin - landmarks.shoulder,
    torso: landmarks.shoulder - landmarks.crotch,
    upperArm: (landmarks.shoulder - landmarks.waist) * 0.95,
    forearm: (landmarks.waist - landmarks.hipLine) * 1.15,
    thigh: landmarks.crotch - landmarks.knee,
    calf: landmarks.knee - landmarks.ankle,
    foot: landmarks.ankle - landmarks.sole,
  };

  // Lathe profile: bottom → top (y ascending)
  const torsoProfile: Array<[number, number]> = [
    [crotchR.width * 0.85, landmarks.crotch],
    [hipsR.width, landmarks.hipLine],
    [hipsR.width * 0.96, (landmarks.hipLine + landmarks.waist) / 2],
    [waistR.width, landmarks.waist],
    [(waistR.width + bustR.width) / 2, (landmarks.waist + landmarks.bust) / 2],
    [bustR.width, landmarks.bust],
    [shoulderR.width, landmarks.shoulder],
    [neckR.width * 1.15, landmarks.shoulder + segments.neck * 0.35],
    [neckR.width, landmarks.chin],
  ];

  const avgDepth =
    (bustR.depth + waistR.depth + hipsR.depth) /
    (bustR.width + waistR.width + hipsR.width);

  return {
    heightM,
    headUnit,
    landmarks,
    radii: {
      neck: neckR,
      shoulder: shoulderR,
      bust: bustR,
      waist: waistR,
      hips: hipsR,
      crotch: crotchR,
    },
    shoulderHalfWidth,
    limbs,
    segments,
    torsoProfile,
    torsoDepthRatio: avgDepth || DEPTH_RATIO,
  };
}

/** Clothing size heuristic from height + weight. */
export function calculateSize(height: number, weight: number): string {
  if (height < 165 && weight < 60) return "S";
  if (height < 178 && weight < 75) return "M";
  if (height < 188 && weight < 90) return "L";
  return "XL";
}
