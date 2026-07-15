"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Upload, X, RefreshCw, Sliders, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { useGenieStore, GenieItem } from "../store/genieStore";
import {
  buildBodyMetrics,
  calculateSize,
  seedMeasurementsFromBiometrics,
  type BodyMetrics,
  type BodyProfile,
} from "../lib/bodyMetrics";

export interface DigitalTwinProps {
  activeOutfit: GenieItem[];
  activeCategory?: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null;
  initialHeight?: number;
  initialWeight?: number;
  onBiometricsChange?: (data: {
    height: number;
    weight: number;
    size: string;
  }) => void;
}

function findOutfitItem(
  outfit: GenieItem[],
  category: GenieItem["category"]
): GenieItem | undefined {
  return outfit.find((item) => item.category === category);
}

const SKIN_TONES = [
  { name: "Ivory", value: "#FAD7B2" },
  { name: "Medium", value: "#E6C280" },
  { name: "Tan", value: "#C68B59" },
  { name: "Bronze", value: "#8D5524" },
  { name: "Espresso", value: "#5C3826" },
];

/** Capsule length excludes hemispherical caps; Three's CapsuleGeometry uses cylinder length. */
function capsuleCylinderLength(totalSpan: number, radius: number): number {
  return Math.max(0.01, totalSpan - 2 * radius);
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  activeOutfit,
  activeCategory = null,
  initialHeight = 170,
  initialWeight = 65,
  onBiometricsChange,
}) => {
  const { dummySettings, updateDummy, setSwapCategory } = useGenieStore();

  const seeds = useMemo(
    () => seedMeasurementsFromBiometrics(initialHeight, initialWeight),
    [initialHeight, initialWeight]
  );

  const [height, setHeight] = useState(initialHeight);
  const [weight, setWeight] = useState(initialWeight);
  const [shoulderWidth, setShoulderWidth] = useState(
    dummySettings.shoulderWidth || seeds.shoulderWidth
  );
  const [bust, setBust] = useState(dummySettings.bust || seeds.bust);
  const [waist, setWaist] = useState(dummySettings.waist || seeds.waist);
  const [hips, setHips] = useState(dummySettings.hips || seeds.hips);
  /** Which of shoulder/bust/waist/hips the user has manually pinned */
  const [manualOverrides, setManualOverrides] = useState<
    Set<"shoulderWidth" | "bust" | "waist" | "hips">
  >(new Set());

  const [uploadedFace, setUploadedFace] = useState<string | null>(null);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile>("neutral");

  const skinColorHex = dummySettings?.skinTone || "#C68B59";

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onBiometricsChangeRef = useRef(onBiometricsChange);

  useEffect(() => {
    onBiometricsChangeRef.current = onBiometricsChange;
  }, [onBiometricsChange]);

  const recommendedSize = useMemo(
    () => calculateSize(height, weight),
    [height, weight]
  );

  // Auto-reseeds measurements when height/weight change (unless pinned)
  useEffect(() => {
    const next = seedMeasurementsFromBiometrics(height, weight);
    if (!manualOverrides.has("shoulderWidth")) setShoulderWidth(next.shoulderWidth);
    if (!manualOverrides.has("bust")) setBust(next.bust);
    if (!manualOverrides.has("waist")) setWaist(next.waist);
    if (!manualOverrides.has("hips")) setHips(next.hips);
  }, [height, weight, manualOverrides]);

  const metrics = useMemo(
    () =>
      buildBodyMetrics({
        height,
        weight,
        shoulderWidth,
        bust,
        waist,
        hips,
        bodyProfile,
      }),
    [height, weight, shoulderWidth, bust, waist, hips, bodyProfile]
  );

  const bottomItem = findOutfitItem(activeOutfit, "BOTTOM");
  const topItem = findOutfitItem(activeOutfit, "TOP");
  const footwearItem = findOutfitItem(activeOutfit, "FOOTWEAR");
  const accessoryItem = findOutfitItem(activeOutfit, "ACCESSORY");

  useEffect(() => {
    onBiometricsChangeRef.current?.({
      height,
      weight,
      size: recommendedSize,
    });
    updateDummy({
      height,
      weight,
      size: recommendedSize,
      shoulderWidth,
      bust,
      waist,
      hips,
    });
  }, [
    height,
    weight,
    recommendedSize,
    shoulderWidth,
    bust,
    waist,
    hips,
    updateDummy,
  ]);

  const paramsRef = useRef({
    metrics,
    bodyProfile,
    skinColorHex,
    activeCategory,
    topItem,
    bottomItem,
    footwearItem,
    accessoryItem,
    uploadedFace,
  });

  useEffect(() => {
    paramsRef.current = {
      metrics,
      bodyProfile,
      skinColorHex,
      activeCategory,
      topItem,
      bottomItem,
      footwearItem,
      accessoryItem,
      uploadedFace,
    };
  }, [
    metrics,
    bodyProfile,
    skinColorHex,
    activeCategory,
    topItem,
    bottomItem,
    footwearItem,
    accessoryItem,
    uploadedFace,
  ]);

  // Three.js WebGL engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f4f6");

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.05,
      50
    );
    camera.position.set(0, 0.9, 3.1);
    camera.lookAt(0, 0.85, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Soft studio lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2.2, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-2, 1, -1.5);
    scene.add(fill);
    const rim = new THREE.PointLight(0xffffff, 0.35);
    rim.position.set(0, 1.5, 1.2);
    scene.add(rim);

    // Ground shadow disc
    const groundGeo = new THREE.CircleGeometry(0.55, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.35,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.001;
    scene.add(ground);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    masterGroup.rotation.y = 0.22;

    const mannequinGroup = new THREE.Group();
    masterGroup.add(mannequinGroup);

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#C68B59"),
      roughness: 0.48,
      metalness: 0.0,
    });

    // --- Head ---
    const headGroup = new THREE.Group();
    mannequinGroup.add(headGroup);
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      skinMaterial
    );
    headGroup.add(headMesh);

    const facePlateMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.45,
      metalness: 0.0,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const facePlateMesh = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      facePlateMaterial
    );
    facePlateMesh.rotation.y = Math.PI;
    headGroup.add(facePlateMesh);

    // --- Neck ---
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 16),
      skinMaterial
    );
    mannequinGroup.add(neckMesh);

    // --- Lathe torso (rebuilt each metrics update via geometry swap) ---
    const torsoGroup = new THREE.Group();
    mannequinGroup.add(torsoGroup);
    let torsoMesh: THREE.Mesh = new THREE.Mesh(
      new THREE.LatheGeometry(
        [new THREE.Vector2(0.1, 0), new THREE.Vector2(0.15, 0.5)],
        32
      ),
      skinMaterial
    );
    torsoGroup.add(torsoMesh);

    // Profile overlays
    const leftBustMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 24),
      skinMaterial
    );
    const rightBustMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 24),
      skinMaterial
    );
    torsoGroup.add(leftBustMesh, rightBustMesh);

    const leftPecMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      skinMaterial
    );
    const rightPecMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      skinMaterial
    );
    torsoGroup.add(leftPecMesh, rightPecMesh);

    // --- Arms ---
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();
    mannequinGroup.add(leftArmGroup, rightArmGroup);

    const makeArm = (group: THREE.Group) => {
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        skinMaterial
      );
      const upper = new THREE.Mesh(
        new THREE.CapsuleGeometry(1, 1, 4, 12),
        skinMaterial
      );
      const elbow = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 12),
        skinMaterial
      );
      const fore = new THREE.Mesh(
        new THREE.CapsuleGeometry(1, 1, 4, 12),
        skinMaterial
      );
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        skinMaterial
      );
      group.add(shoulder, upper, elbow, fore, hand);
      return { shoulder, upper, elbow, fore, hand };
    };
    const leftArm = makeArm(leftArmGroup);
    const rightArm = makeArm(rightArmGroup);

    // --- Legs ---
    const leftLegGroup = new THREE.Group();
    const rightLegGroup = new THREE.Group();
    mannequinGroup.add(leftLegGroup, rightLegGroup);

    const makeLeg = (group: THREE.Group) => {
      const hip = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        skinMaterial
      );
      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(1, 1, 4, 12),
        skinMaterial
      );
      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 12),
        skinMaterial
      );
      const calf = new THREE.Mesh(
        new THREE.CapsuleGeometry(1, 1, 4, 12),
        skinMaterial
      );
      group.add(hip, thigh, knee, calf);
      return { hip, thigh, knee, calf };
    };
    const leftLeg = makeLeg(leftLegGroup);
    const rightLeg = makeLeg(rightLegGroup);

    const leftFootMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      skinMaterial
    );
    const rightFootMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      skinMaterial
    );
    mannequinGroup.add(leftFootMesh, rightFootMesh);

    // --- Garment materials ---
    const topGarmentMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.05,
    });
    const bottomGarmentMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.05,
    });
    const footwearGarmentMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.1,
    });
    const accessoryGarmentMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.35,
      metalness: 0.55,
    });

    // Top garment = slightly inflated lathe clone
    const topGarmentGroup = new THREE.Group();
    mannequinGroup.add(topGarmentGroup);
    let topTorsoMesh: THREE.Mesh = new THREE.Mesh(
      new THREE.LatheGeometry(
        [new THREE.Vector2(0.12, 0), new THREE.Vector2(0.16, 0.4)],
        32
      ),
      topGarmentMaterial
    );
    topGarmentGroup.add(topTorsoMesh);

    const leftSleeveMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 1, 4, 10),
      topGarmentMaterial
    );
    const rightSleeveMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 1, 4, 10),
      topGarmentMaterial
    );
    leftArmGroup.add(leftSleeveMesh);
    rightArmGroup.add(rightSleeveMesh);

    // Bottom garment
    const bottomGarmentGroup = new THREE.Group();
    mannequinGroup.add(bottomGarmentGroup);
    let bottomPelvisMesh: THREE.Mesh = new THREE.Mesh(
      new THREE.LatheGeometry(
        [new THREE.Vector2(0.12, 0), new THREE.Vector2(0.15, 0.2)],
        24
      ),
      bottomGarmentMaterial
    );
    bottomGarmentGroup.add(bottomPelvisMesh);

    const leftPantsLegMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 1, 4, 10),
      bottomGarmentMaterial
    );
    const rightPantsLegMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 1, 4, 10),
      bottomGarmentMaterial
    );
    leftLegGroup.add(leftPantsLegMesh);
    rightLegGroup.add(rightPantsLegMesh);

    const leftShoeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      footwearGarmentMaterial
    );
    const rightShoeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      footwearGarmentMaterial
    );
    mannequinGroup.add(leftShoeMesh, rightShoeMesh);

    const accessoryMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.25, 10, 24),
      accessoryGarmentMaterial
    );
    leftArmGroup.add(accessoryMesh);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const activeTextures: Record<string, THREE.Texture> = {};

    const applyTexture = (url: string, mat: THREE.MeshStandardMaterial) => {
      if (activeTextures[url]) {
        if (mat.map !== activeTextures[url]) {
          mat.map = activeTextures[url];
          mat.needsUpdate = true;
        }
        return;
      }
      textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          activeTextures[url] = texture;
          mat.map = texture;
          mat.needsUpdate = true;
        },
        undefined,
        () => {
          /* silent — catalog CORS / 404 should not crash loop */
        }
      );
    };

    /** Rebuild lathe geometry from metrics profile */
    const rebuildLathe = (
      current: THREE.Mesh,
      parent: THREE.Group,
      profile: Array<[number, number]>,
      material: THREE.Material,
      inflate = 1
    ): THREE.Mesh => {
      const points = profile.map(
        ([r, y]) => new THREE.Vector2(r * inflate, y)
      );
      const geo = new THREE.LatheGeometry(points, 48);
      parent.remove(current);
      current.geometry.dispose();
      const next = new THREE.Mesh(geo, material);
      parent.add(next);
      return next;
    };

    /** Apply anthropometric layout to all body parts */
    const applyMetrics = (m: BodyMetrics, profile: BodyProfile) => {
      const { landmarks: L, radii: R, limbs: Lim, segments: S } = m;

      // Head: ellipsoid sized to head unit
      const headR = m.headUnit * 0.48;
      headGroup.position.set(0, (L.chin + L.headTop) / 2, 0);
      headMesh.scale.set(headR * 0.92, headR * 1.12, headR * 0.95);
      facePlateMesh.scale.set(headR * 0.72, headR * 0.85, 1);
      facePlateMesh.position.set(0, -headR * 0.08, headR * 0.9);

      // Neck: between shoulder and chin
      const neckLen = L.chin - L.shoulder;
      neckMesh.position.set(0, (L.chin + L.shoulder) / 2, 0);
      neckMesh.scale.set(R.neck.width, neckLen, R.neck.depth);

      // Lathe torso — sole-relative Y already baked into profile
      torsoMesh = rebuildLathe(
        torsoMesh,
        torsoGroup,
        m.torsoProfile,
        skinMaterial,
        1
      );
      torsoMesh.scale.set(1, 1, m.torsoDepthRatio);

      // Bust / pec overlays at bust landmark
      const bustY = L.bust;
      if (profile === "feminine") {
        leftBustMesh.visible = true;
        rightBustMesh.visible = true;
        leftPecMesh.visible = false;
        rightPecMesh.visible = false;
        const br = R.bust.width * 0.38;
        leftBustMesh.position.set(-R.bust.width * 0.42, bustY, R.bust.depth * 0.85);
        rightBustMesh.position.set(R.bust.width * 0.42, bustY, R.bust.depth * 0.85);
        leftBustMesh.scale.set(br, br * 0.9, br * 1.1);
        rightBustMesh.scale.set(br, br * 0.9, br * 1.1);
      } else if (profile === "masculine") {
        leftBustMesh.visible = false;
        rightBustMesh.visible = false;
        leftPecMesh.visible = true;
        rightPecMesh.visible = true;
        const pw = R.bust.width * 0.55;
        const ph = S.torso * 0.14;
        leftPecMesh.position.set(-pw * 0.45, bustY, R.bust.depth * 0.7);
        rightPecMesh.position.set(pw * 0.45, bustY, R.bust.depth * 0.7);
        leftPecMesh.scale.set(pw, ph, R.bust.depth * 0.35);
        rightPecMesh.scale.set(pw, ph, R.bust.depth * 0.35);
      } else {
        leftBustMesh.visible = false;
        rightBustMesh.visible = false;
        leftPecMesh.visible = false;
        rightPecMesh.visible = false;
      }

      // Arms: shoulder → elbow → wrist (landmarks-derived)
      const shoulderY = L.shoulder;
      const elbowY = shoulderY - S.upperArm;
      const wristY = elbowY - S.forearm;
      const armOut = m.shoulderHalfWidth;

      const placeArm = (
        group: THREE.Group,
        parts: typeof leftArm,
        side: 1 | -1
      ) => {
        group.position.set(side * armOut, 0, 0);
        group.rotation.z = side * 0.12;

        parts.shoulder.position.set(0, shoulderY, 0);
        parts.shoulder.scale.setScalar(Lim.upperArm * 1.15);

        const upperLen = capsuleCylinderLength(S.upperArm, Lim.upperArm);
        parts.upper.geometry.dispose();
        parts.upper.geometry = new THREE.CapsuleGeometry(
          Lim.upperArm,
          upperLen,
          4,
          12
        );
        parts.upper.position.set(0, (shoulderY + elbowY) / 2, 0);

        parts.elbow.position.set(0, elbowY, 0);
        parts.elbow.scale.setScalar(Lim.upperArm * 0.95);

        const foreLen = capsuleCylinderLength(S.forearm, Lim.forearm);
        parts.fore.geometry.dispose();
        parts.fore.geometry = new THREE.CapsuleGeometry(
          Lim.forearm,
          foreLen,
          4,
          12
        );
        parts.fore.position.set(0, (elbowY + wristY) / 2, 0);

        parts.hand.position.set(0, wristY - Lim.wrist * 0.8, 0.01);
        parts.hand.scale.set(
          Lim.wrist * 1.4,
          Lim.wrist * 0.7,
          Lim.wrist * 2.2
        );
      };
      placeArm(leftArmGroup, leftArm, -1);
      placeArm(rightArmGroup, rightArm, 1);

      // Legs: crotch → knee → ankle
      const hipOffset = R.hips.width * 0.55;
      const placeLeg = (
        group: THREE.Group,
        parts: typeof leftLeg,
        side: 1 | -1
      ) => {
        group.position.set(side * hipOffset, 0, 0);

        parts.hip.position.set(0, L.crotch, 0);
        parts.hip.scale.setScalar(Lim.thigh * 1.05);

        const thighLen = capsuleCylinderLength(S.thigh, Lim.thigh);
        parts.thigh.geometry.dispose();
        parts.thigh.geometry = new THREE.CapsuleGeometry(
          Lim.thigh,
          thighLen,
          4,
          12
        );
        parts.thigh.position.set(0, (L.crotch + L.knee) / 2, 0);

        parts.knee.position.set(0, L.knee, 0);
        parts.knee.scale.setScalar(Lim.calf * 1.05);

        const calfLen = capsuleCylinderLength(S.calf, Lim.calf);
        parts.calf.geometry.dispose();
        parts.calf.geometry = new THREE.CapsuleGeometry(
          Lim.calf,
          calfLen,
          4,
          12
        );
        parts.calf.position.set(0, (L.knee + L.ankle) / 2, 0);
      };
      placeLeg(leftLegGroup, leftLeg, -1);
      placeLeg(rightLegGroup, rightLeg, 1);

      // Feet at soles
      const footLen = Math.max(0.12, S.foot * 3.2);
      const footW = Lim.ankle * 2.2;
      const footH = Math.max(0.03, S.foot * 0.9);
      leftFootMesh.position.set(-hipOffset, footH / 2, footLen * 0.22);
      rightFootMesh.position.set(hipOffset, footH / 2, footLen * 0.22);
      leftFootMesh.scale.set(footW, footH, footLen);
      rightFootMesh.scale.set(footW, footH, footLen);

      // --- Garment drapes from same radii ---
      // TOP: lathe from crotch-to-shoulder truncated to bust/waist region, inflated
      const topProfile: Array<[number, number]> = m.torsoProfile
        .filter(([, y]) => y >= L.waist - 0.02 && y <= L.shoulder + 0.01)
        .map(([r, y]) => [r, y]);
      if (topProfile.length >= 2) {
        topTorsoMesh = rebuildLathe(
          topTorsoMesh,
          topGarmentGroup,
          topProfile,
          topGarmentMaterial,
          1.06
        );
        topTorsoMesh.scale.set(1, 1, m.torsoDepthRatio);
      }

      // Sleeves
      const sleeveLen = capsuleCylinderLength(S.upperArm * 0.85, Lim.upperArm * 1.08);
      leftSleeveMesh.geometry.dispose();
      leftSleeveMesh.geometry = new THREE.CapsuleGeometry(
        Lim.upperArm * 1.08,
        sleeveLen,
        4,
        10
      );
      leftSleeveMesh.position.set(0, (shoulderY + elbowY) / 2 + 0.02, 0);
      rightSleeveMesh.geometry.dispose();
      rightSleeveMesh.geometry = new THREE.CapsuleGeometry(
        Lim.upperArm * 1.08,
        sleeveLen,
        4,
        10
      );
      rightSleeveMesh.position.set(0, (shoulderY + elbowY) / 2 + 0.02, 0);

      // BOTTOM pelvis + pants
      const bottomProfile: Array<[number, number]> = [
        [R.crotch.width * 0.9, L.crotch],
        [R.hips.width * 1.06, L.hipLine],
        [R.waist.width * 1.04, L.waist],
      ];
      bottomPelvisMesh = rebuildLathe(
        bottomPelvisMesh,
        bottomGarmentGroup,
        bottomProfile,
        bottomGarmentMaterial,
        1
      );
      bottomPelvisMesh.scale.set(1, 1, m.torsoDepthRatio);

      const pantLen = capsuleCylinderLength(
        L.crotch - L.ankle * 0.3,
        Lim.thigh * 1.06
      );
      const pantMidY = (L.crotch + L.ankle * 0.35) / 2;
      leftPantsLegMesh.geometry.dispose();
      leftPantsLegMesh.geometry = new THREE.CapsuleGeometry(
        Lim.thigh * 1.06,
        pantLen,
        4,
        10
      );
      leftPantsLegMesh.position.set(0, pantMidY, 0);
      rightPantsLegMesh.geometry.dispose();
      rightPantsLegMesh.geometry = new THREE.CapsuleGeometry(
        Lim.thigh * 1.06,
        pantLen,
        4,
        10
      );
      rightPantsLegMesh.position.set(0, pantMidY, 0);

      // Footwear
      leftShoeMesh.position.set(-hipOffset, footH * 0.55, footLen * 0.25);
      rightShoeMesh.position.set(hipOffset, footH * 0.55, footLen * 0.25);
      leftShoeMesh.scale.set(footW * 1.15, footH * 1.2, footLen * 1.12);
      rightShoeMesh.scale.set(footW * 1.15, footH * 1.2, footLen * 1.12);

      // Accessory at left wrist
      accessoryMesh.position.set(0, wristY + 0.02, 0);
      accessoryMesh.rotation.x = Math.PI / 2;
      accessoryMesh.scale.setScalar(Lim.wrist * 1.8);
    };

    // Initial layout
    applyMetrics(paramsRef.current.metrics, paramsRef.current.bodyProfile);

    // Drag rotate
    let isDragging = false;
    let prevMouseX = 0;
    const handleStart = (x: number) => {
      isDragging = true;
      prevMouseX = x;
    };
    const handleMove = (x: number) => {
      if (!isDragging) return;
      masterGroup.rotation.y += (x - prevMouseX) * 0.008;
      prevMouseX = x;
    };
    const handleEnd = () => {
      isDragging = false;
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) handleStart(e.touches[0].clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height: h } = entry.contentRect;
      if (width < 1 || h < 1) return;
      camera.aspect = width / h;
      camera.updateProjectionMatrix();
      renderer.setSize(width, h);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    let lastMetricsKey = "";
    let lastFace: string | null = null;

    const render = () => {
      const p = paramsRef.current;
      const time = clock.getElapsedTime();

      skinMaterial.color.set(p.skinColorHex);

      // Only rebuild geometry when metrics signature changes
      const key = JSON.stringify({
        h: p.metrics.heightM,
        b: p.metrics.radii.bust.width,
        w: p.metrics.radii.waist.width,
        hi: p.metrics.radii.hips.width,
        sh: p.metrics.shoulderHalfWidth,
        pr: p.bodyProfile,
      });
      if (key !== lastMetricsKey) {
        lastMetricsKey = key;
        applyMetrics(p.metrics, p.bodyProfile);
      }

      // Camera tracks figure center (approx mid-torso)
      const midY = p.metrics.heightM * 0.5;
      camera.position.set(0, midY + 0.05, 3.0 + p.metrics.heightM * 0.15);
      camera.lookAt(0, midY, 0);
      ground.position.y = 0.001;

      // Garment visibility + textures
      if (p.topItem) {
        topGarmentGroup.visible = true;
        leftSleeveMesh.visible = true;
        rightSleeveMesh.visible = true;
        applyTexture(p.topItem.image, topGarmentMaterial);
      } else {
        topGarmentGroup.visible = false;
        leftSleeveMesh.visible = false;
        rightSleeveMesh.visible = false;
      }

      if (p.bottomItem) {
        bottomGarmentGroup.visible = true;
        leftPantsLegMesh.visible = true;
        rightPantsLegMesh.visible = true;
        applyTexture(p.bottomItem.image, bottomGarmentMaterial);
      } else {
        bottomGarmentGroup.visible = false;
        leftPantsLegMesh.visible = false;
        rightPantsLegMesh.visible = false;
      }

      if (p.footwearItem) {
        leftShoeMesh.visible = true;
        rightShoeMesh.visible = true;
        applyTexture(p.footwearItem.image, footwearGarmentMaterial);
      } else {
        leftShoeMesh.visible = false;
        rightShoeMesh.visible = false;
      }

      if (p.accessoryItem) {
        accessoryMesh.visible = true;
        applyTexture(p.accessoryItem.image, accessoryGarmentMaterial);
      } else {
        accessoryMesh.visible = false;
      }

      // Face plate
      if (p.uploadedFace) {
        facePlateMesh.visible = true;
        if (p.uploadedFace !== lastFace) {
          lastFace = p.uploadedFace;
          const img = new Image();
          img.src = p.uploadedFace;
          img.onload = () => {
            if (facePlateMaterial.map) facePlateMaterial.map.dispose();
            const tex = new THREE.Texture(img);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;
            facePlateMaterial.map = tex;
            facePlateMaterial.needsUpdate = true;
          };
        }
      } else {
        facePlateMesh.visible = false;
        lastFace = null;
        if (facePlateMaterial.map) {
          facePlateMaterial.map.dispose();
          facePlateMaterial.map = null;
          facePlateMaterial.needsUpdate = true;
        }
      }

      // Selection glow
      const pulse = Math.sin(time * 5.5) * 0.18 + 0.18;
      const setGlow = (
        mat: THREE.MeshStandardMaterial,
        on: boolean
      ) => {
        if (on) {
          mat.emissive.setHex(0xff3e6c);
          mat.emissiveIntensity = pulse;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      };
      setGlow(topGarmentMaterial, p.activeCategory === "TOP" && !!p.topItem);
      setGlow(
        bottomGarmentMaterial,
        p.activeCategory === "BOTTOM" && !!p.bottomItem
      );
      setGlow(
        footwearGarmentMaterial,
        p.activeCategory === "FOOTWEAR" && !!p.footwearItem
      );
      setGlow(
        accessoryGarmentMaterial,
        p.activeCategory === "ACCESSORY" && !!p.accessoryItem
      );

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleEnd);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
        }
      });
      skinMaterial.dispose();
      facePlateMaterial.dispose();
      topGarmentMaterial.dispose();
      bottomGarmentMaterial.dispose();
      footwearGarmentMaterial.dispose();
      accessoryGarmentMaterial.dispose();
      groundMat.dispose();
      Object.values(activeTextures).forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, []);

  const handleFaceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUploadedFace(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFace = () => {
    setUploadedFace(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pinMeasure = (
    key: "shoulderWidth" | "bust" | "waist" | "hips",
    value: number
  ) => {
    setManualOverrides((prev) => new Set(prev).add(key));
    if (key === "shoulderWidth") setShoulderWidth(value);
    if (key === "bust") setBust(value);
    if (key === "waist") setWaist(value);
    if (key === "hips") setHips(value);
  };

  const resetAutoMeasurements = () => {
    setManualOverrides(new Set());
    const next = seedMeasurementsFromBiometrics(height, weight);
    setShoulderWidth(next.shoulderWidth);
    setBust(next.bust);
    setWaist(next.waist);
    setHips(next.hips);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Controls */}
      <div className="w-full space-y-4 rounded-xl border border-myntra-border bg-myntra-gray/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-myntra-border/50 pb-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-myntra-dark flex items-center gap-1.5">
            <Sliders size={14} className="text-myntra-pink" />
            Anthropometric Body
          </span>
          <span className="inline-flex items-center rounded-full border border-myntra-pink/30 bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-myntra-pink">
            Size: {recommendedSize}
          </span>
        </div>

        {/* Body profile */}
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-myntra-light mb-2">
            Body Shape Profile
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(["masculine", "feminine", "neutral"] as const).map((prof) => (
              <button
                key={prof}
                type="button"
                onClick={() => setBodyProfile(prof)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                  bodyProfile === prof
                    ? "bg-myntra-pink border-myntra-pink text-white"
                    : "bg-white border-myntra-border text-myntra-dark hover:border-myntra-pink/40"
                }`}
              >
                {prof}
              </button>
            ))}
          </div>
        </div>

        {/* Skin tone */}
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-myntra-light mb-2">
            Skin Tone
          </span>
          <div className="flex items-center gap-3">
            {SKIN_TONES.map((preset) => {
              const isSelected =
                skinColorHex.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateDummy({ skinTone: preset.value })}
                  className="relative w-8 h-8 rounded-full border shadow-xs transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: preset.value,
                    borderColor: isSelected ? "#ff3e6c" : "#e5e7eb",
                    borderWidth: isSelected ? 3 : 1,
                  }}
                  title={preset.name}
                  aria-label={`Skin tone ${preset.name}`}
                />
              );
            })}
          </div>
        </div>

        {/* Height / Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-bold text-myntra-dark">
              <span>Height</span>
              <span className="text-myntra-pink font-extrabold">{height} cm</span>
            </div>
            <input
              type="range"
              min={140}
              max={220}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-myntra-pink border border-myntra-border"
            />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-bold text-myntra-dark">
              <span>Weight</span>
              <span className="text-myntra-pink font-extrabold">{weight} kg</span>
            </div>
            <input
              type="range"
              min={40}
              max={120}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-myntra-pink border border-myntra-border"
            />
          </div>
        </div>

        {/* Body measurements */}
        <div className="border-t border-myntra-border/40 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-myntra-light">
              Body Measurements
            </span>
            <button
              type="button"
              onClick={resetAutoMeasurements}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-myntra-pink hover:underline cursor-pointer"
            >
              <RotateCcw size={11} />
              Auto from weight
            </button>
          </div>

          {(
            [
              {
                key: "shoulderWidth" as const,
                label: "Shoulders",
                value: shoulderWidth,
                min: 30,
                max: 55,
              },
              {
                key: "bust" as const,
                label: "Bust / Chest",
                value: bust,
                min: 70,
                max: 130,
              },
              {
                key: "waist" as const,
                label: "Waist",
                value: waist,
                min: 55,
                max: 120,
              },
              {
                key: "hips" as const,
                label: "Hips",
                value: hips,
                min: 70,
                max: 140,
              },
            ] as const
          ).map((row) => (
            <div key={row.key}>
              <div className="mb-1 flex justify-between text-[11px] font-bold text-myntra-dark">
                <span>
                  {row.label}
                  {manualOverrides.has(row.key) && (
                    <span className="ml-1 text-[9px] text-myntra-pink font-semibold">
                      (manual)
                    </span>
                  )}
                </span>
                <span className="text-myntra-pink font-extrabold">
                  {row.value} cm
                </span>
              </div>
              <input
                type="range"
                min={row.min}
                max={row.max}
                value={row.value}
                onChange={(e) => pinMeasure(row.key, Number(e.target.value))}
                className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-myntra-pink border border-myntra-border"
              />
            </div>
          ))}
        </div>

        {/* Face upload */}
        <div className="flex flex-wrap items-center gap-2 border-t border-myntra-border/40 pt-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFaceUpload}
            className="hidden"
            id="digital-twin-face-upload"
          />
          <label
            htmlFor="digital-twin-face-upload"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-myntra-pink bg-white px-3 py-2 text-xs font-bold text-myntra-pink hover:bg-pink-50"
          >
            <Upload size={14} />
            Upload Face / Portrait
          </label>
          {uploadedFace ? (
            <button
              type="button"
              onClick={clearFace}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-myntra-border px-2.5 py-2 text-[11px] font-bold text-myntra-light hover:text-myntra-dark"
            >
              <X size={12} />
              Clear face
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-myntra-light">
              <Camera size={12} />
              Maps onto head front
            </span>
          )}
        </div>
      </div>

      {/* WebGL canvas */}
      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-xl bg-gray-100 border border-myntra-border shadow-sm cursor-grab active:cursor-grabbing select-none"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        <div className="absolute top-3 right-3 pointer-events-none bg-white/85 backdrop-blur-sm border border-myntra-border rounded-lg px-2 py-1 text-[9px] font-bold text-myntra-light flex items-center gap-1 shadow-sm">
          <RefreshCw
            size={10}
            className="animate-spin"
            style={{ animationDuration: "12s" }}
          />
          <span>360° Drag to Rotate</span>
        </div>

        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 max-w-[42%]">
          {(["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"] as const).map((cat) => {
            const item = findOutfitItem(activeOutfit, cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSwapCategory(cat)}
                className={`flex items-center gap-1.5 rounded-lg border bg-white/95 px-1.5 py-1 text-left cursor-pointer transition-all ${
                  isActive
                    ? "border-myntra-pink ring-1 ring-myntra-pink font-bold"
                    : "border-myntra-border hover:border-myntra-pink/50 font-medium"
                }`}
              >
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-myntra-gray border border-myntra-border">
                  {item ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[7px] text-gray-400 font-bold bg-gray-100">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[7px] text-myntra-pink uppercase font-extrabold tracking-wider leading-none">
                    {cat}
                  </p>
                  <p className="text-[9px] text-myntra-dark truncate max-w-[90px] leading-tight">
                    {item ? item.name : "Select garment"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-myntra-border bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-myntra-dark shadow-sm backdrop-blur-sm pointer-events-none">
          <span className="h-2 w-2 rounded-full bg-[#34d399]" />
          <span>{height} cm</span>
          <span className="text-gray-300">•</span>
          <span>
            W{waist}/H{hips}
          </span>
          <span className="text-gray-300">•</span>
          <span>Size {recommendedSize}</span>
        </div>
      </div>
    </div>
  );
};

export { calculateSize };
