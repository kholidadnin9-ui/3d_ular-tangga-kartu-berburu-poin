import * as THREE from 'three';
import { RobotAnimState, RobotColorId } from '../types/game';
import { ROBOT_THEMES } from '../managers/PlayerManager';

export class ChibiRobot3D {
  public root: THREE.Group;
  public bodyGroup: THREE.Group;
  public headGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftEye: THREE.Mesh;
  public rightEye: THREE.Mesh;
  public antennaOrb: THREE.Mesh;
  public coreMesh: THREE.Mesh;
  public jetpackFlameL: THREE.Mesh;
  public jetpackFlameR: THREE.Mesh;
  public baseRing: THREE.Mesh;
  public animState: RobotAnimState = 'IDLE';
  public colorId: RobotColorId;
  private accentColor: THREE.Color;
  private glowColor: THREE.Color;

  constructor(colorId: RobotColorId) {
    this.colorId = colorId;
    const theme = ROBOT_THEMES[colorId];
    this.accentColor = new THREE.Color(theme.accentHex);
    this.glowColor = new THREE.Color(theme.glowHex);

    this.root = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.root.add(this.bodyGroup);

    // Materials: Pearl White Armor + Metallic Accent + Dark Visor + Glowing LEDs
    const pearlArmorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.primaryHex),
      roughness: 0.22,
      metalness: 0.18,
    });

    const accentArmorMat = new THREE.MeshStandardMaterial({
      color: this.accentColor,
      roughness: 0.25,
      metalness: 0.65,
      emissive: this.accentColor,
      emissiveIntensity: 0.2,
    });

    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.5,
    });

    const visorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x090d1f,
      roughness: 0.1,
      metalness: 0.85,
    });

    const eyeGlowMat = new THREE.MeshStandardMaterial({
      color: this.glowColor,
      emissive: this.glowColor,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    // Base Holo Ring under robot feet
    const ringGeo = new THREE.RingGeometry(0.36, 0.48, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    this.baseRing = new THREE.Mesh(ringGeo, ringMat);
    this.baseRing.position.y = 0.03;
    this.root.add(this.baseRing);

    // --- TORSO (Chibi Rounded Body) ---
    const torsoGeo = new THREE.CapsuleGeometry(0.28, 0.22, 12, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, pearlArmorMat);
    torsoMesh.position.y = 0.58;
    torsoMesh.castShadow = true;
    this.bodyGroup.add(torsoMesh);

    // Chest Armor Collar & Belt in Accent Color
    const beltGeo = new THREE.CylinderGeometry(0.29, 0.28, 0.09, 24);
    const beltMesh = new THREE.Mesh(beltGeo, accentArmorMat);
    beltMesh.position.y = 0.44;
    this.bodyGroup.add(beltMesh);

    const chestPlateGeo = new THREE.BoxGeometry(0.36, 0.24, 0.16);
    const chestPlate = new THREE.Mesh(chestPlateGeo, accentArmorMat);
    chestPlate.position.set(0, 0.62, 0.2);
    this.bodyGroup.add(chestPlate);

    // Glowing Energy Core on Chest
    const coreGeo = new THREE.SphereGeometry(0.085, 16, 16);
    this.coreMesh = new THREE.Mesh(coreGeo, eyeGlowMat.clone());
    this.coreMesh.position.set(0, 0.62, 0.27);
    this.bodyGroup.add(this.coreMesh);

    // Back Jetpack
    const jetpackGeo = new THREE.BoxGeometry(0.34, 0.28, 0.18);
    const jetpack = new THREE.Mesh(jetpackGeo, pearlArmorMat);
    jetpack.position.set(0, 0.62, -0.24);
    this.bodyGroup.add(jetpack);

    const flameGeo = new THREE.ConeGeometry(0.06, 0.2, 12);
    flameGeo.rotateX(Math.PI);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.85,
    });
    this.jetpackFlameL = new THREE.Mesh(flameGeo, flameMat);
    this.jetpackFlameL.position.set(-0.09, 0.42, -0.25);
    this.bodyGroup.add(this.jetpackFlameL);

    this.jetpackFlameR = new THREE.Mesh(flameGeo, flameMat);
    this.jetpackFlameR.position.set(0.09, 0.42, -0.25);
    this.bodyGroup.add(this.jetpackFlameR);

    // --- OVERSIZED CHIBI HEAD ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.05, 0);
    this.bodyGroup.add(this.headGroup);

    // Main Pearl Helmet Sphere-Box
    const headGeo = new THREE.SphereGeometry(0.42, 28, 24);
    headGeo.scale(1.08, 0.96, 0.98);
    const headMesh = new THREE.Mesh(headGeo, pearlArmorMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Gold/Accent Forehead Crest
    const crestGeo = new THREE.BoxGeometry(0.24, 0.14, 0.18);
    const crestMesh = new THREE.Mesh(crestGeo, accentArmorMat);
    crestMesh.position.set(0, 0.28, 0.32);
    crestMesh.rotation.x = -0.25;
    this.headGroup.add(crestMesh);

    // Ear Pods (Left & Right)
    const earGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.12, 20);
    earGeo.rotateZ(Math.PI / 2);
    const leftEar = new THREE.Mesh(earGeo, accentArmorMat);
    leftEar.position.set(-0.44, 0, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, accentArmorMat);
    rightEar.position.set(0.44, 0, 0);
    this.headGroup.add(rightEar);

    // Antenna on top of head
    const stemGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.22, 12);
    const stemMesh = new THREE.Mesh(stemGeo, darkJointMat);
    stemMesh.position.set(0, 0.46, 0);
    this.headGroup.add(stemMesh);

    const orbGeo = new THREE.SphereGeometry(0.075, 16, 16);
    this.antennaOrb = new THREE.Mesh(orbGeo, eyeGlowMat.clone());
    this.antennaOrb.position.set(0, 0.59, 0);
    this.headGroup.add(this.antennaOrb);

    // Curved Visor Faceplate
    const visorGeo = new THREE.SphereGeometry(0.35, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    visorGeo.rotateX(Math.PI * 0.5);
    visorGeo.scale(1.12, 0.78, 0.5);
    const visorMesh = new THREE.Mesh(visorGeo, visorGlassMat);
    visorMesh.position.set(0, -0.02, 0.27);
    this.headGroup.add(visorMesh);

    // Expressive Glowing LED Eyes
    const eyeGeo = new THREE.CapsuleGeometry(0.055, 0.05, 8, 16);
    this.leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat.clone());
    this.leftEye.position.set(-0.14, 0.01, 0.43);
    this.headGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeGlowMat.clone());
    this.rightEye.position.set(0.14, 0.01, 0.43);
    this.headGroup.add(this.rightEye);

    // --- ARTICULATED ARMS ---
    this.leftArm = this.createArm(pearlArmorMat, accentArmorMat, darkJointMat, -1);
    this.leftArm.position.set(-0.36, 0.72, 0);
    this.bodyGroup.add(this.leftArm);

    this.rightArm = this.createArm(pearlArmorMat, accentArmorMat, darkJointMat, 1);
    this.rightArm.position.set(0.36, 0.72, 0);
    this.bodyGroup.add(this.rightArm);

    // --- ARTICULATED LEGS ---
    this.leftLeg = this.createLeg(pearlArmorMat, accentArmorMat, darkJointMat);
    this.leftLeg.position.set(-0.14, 0.34, 0);
    this.bodyGroup.add(this.leftLeg);

    this.rightLeg = this.createLeg(pearlArmorMat, accentArmorMat, darkJointMat);
    this.rightLeg.position.set(0.14, 0.34, 0);
    this.bodyGroup.add(this.rightLeg);
  }

  private createArm(
    pearlMat: THREE.Material,
    accentMat: THREE.Material,
    jointMat: THREE.Material,
    side: -1 | 1
  ): THREE.Group {
    const armGroup = new THREE.Group();

    const shoulderGeo = new THREE.SphereGeometry(0.1, 14, 14);
    const shoulder = new THREE.Mesh(shoulderGeo, accentMat);
    armGroup.add(shoulder);

    const upperArmGeo = new THREE.CapsuleGeometry(0.075, 0.18, 8, 12);
    const upperArm = new THREE.Mesh(upperArmGeo, pearlMat);
    upperArm.position.set(side * 0.03, -0.14, 0);
    upperArm.castShadow = true;
    armGroup.add(upperArm);

    const handGeo = new THREE.SphereGeometry(0.085, 12, 12);
    const hand = new THREE.Mesh(handGeo, jointMat);
    hand.position.set(side * 0.04, -0.28, 0);
    armGroup.add(hand);

    return armGroup;
  }

  private createLeg(
    pearlMat: THREE.Material,
    accentMat: THREE.Material,
    jointMat: THREE.Material
  ): THREE.Group {
    const legGroup = new THREE.Group();

    const hipGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const hip = new THREE.Mesh(hipGeo, jointMat);
    legGroup.add(hip);

    const shinGeo = new THREE.CylinderGeometry(0.085, 0.1, 0.2, 14);
    const shin = new THREE.Mesh(shinGeo, pearlMat);
    shin.position.y = -0.14;
    shin.castShadow = true;
    legGroup.add(shin);

    const bootGeo = new THREE.BoxGeometry(0.18, 0.1, 0.24);
    const boot = new THREE.Mesh(bootGeo, accentMat);
    boot.position.set(0, -0.26, 0.03);
    boot.castShadow = true;
    legGroup.add(boot);

    return legGroup;
  }

  public setAnimationState(state: RobotAnimState) {
    this.animState = state;
  }

  public updateAnimation(elapsedTime: number) {
    const t = elapsedTime;
    // Reset baseline transforms
    this.leftEye.scale.set(1, 1, 1);
    this.rightEye.scale.set(1, 1, 1);
    this.leftEye.rotation.z = 0;
    this.rightEye.rotation.z = 0;

    // Pulse base ring & antenna
    const ringScale = 1 + Math.sin(t * 4) * 0.06;
    this.baseRing.scale.set(ringScale, ringScale, 1);

    switch (this.animState) {
      case 'IDLE': {
        this.bodyGroup.position.y = Math.sin(t * 3.2) * 0.04;
        this.bodyGroup.rotation.z = 0;
        this.bodyGroup.rotation.x = 0;
        this.headGroup.rotation.y = Math.sin(t * 1.6) * 0.15;
        this.headGroup.rotation.z = Math.cos(t * 2.1) * 0.05;
        this.leftArm.rotation.x = Math.sin(t * 3.2) * 0.15;
        this.rightArm.rotation.x = -Math.sin(t * 3.2) * 0.15;
        this.leftArm.rotation.z = 0.1;
        this.rightArm.rotation.z = -0.1;
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.jetpackFlameL.scale.set(0.7, 0.5 + Math.sin(t * 18) * 0.2, 0.7);
        this.jetpackFlameR.scale.set(0.7, 0.5 + Math.cos(t * 18) * 0.2, 0.7);
        // Occasional blink
        if (Math.sin(t * 2.7) > 0.96) {
          this.leftEye.scale.y = 0.15;
          this.rightEye.scale.y = 0.15;
        }
        break;
      }

      case 'WALK':
      case 'RUN': {
        const speed = this.animState === 'RUN' ? 15 : 11;
        const swing = this.animState === 'RUN' ? 0.75 : 0.55;
        this.bodyGroup.position.y = Math.abs(Math.sin(t * speed)) * 0.12;
        this.bodyGroup.rotation.x = 0.12;
        this.headGroup.rotation.y = Math.sin(t * speed * 0.5) * 0.1;
        this.leftLeg.rotation.x = Math.sin(t * speed) * swing;
        this.rightLeg.rotation.x = -Math.sin(t * speed) * swing;
        this.leftArm.rotation.x = -Math.sin(t * speed) * swing;
        this.rightArm.rotation.x = Math.sin(t * speed) * swing;
        this.jetpackFlameL.scale.set(1, 1.1 + Math.sin(t * 25) * 0.3, 1);
        this.jetpackFlameR.scale.set(1, 1.1 + Math.cos(t * 25) * 0.3, 1);
        break;
      }

      case 'JUMP':
      case 'SPECIAL': {
        // Ascending energy ladder / star boost pose
        this.bodyGroup.position.y = 0.18 + Math.sin(t * 14) * 0.06;
        this.bodyGroup.rotation.x = -0.08;
        this.leftArm.rotation.x = -2.6;
        this.rightArm.rotation.x = -2.6;
        this.leftArm.rotation.z = 0.25;
        this.rightArm.rotation.z = -0.25;
        this.leftLeg.rotation.x = 0.3;
        this.rightLeg.rotation.x = -0.2;
        this.jetpackFlameL.scale.set(1.4, 2.0 + Math.sin(t * 30) * 0.5, 1.4);
        this.jetpackFlameR.scale.set(1.4, 2.0 + Math.cos(t * 30) * 0.5, 1.4);
        break;
      }

      case 'SLIDE': {
        // Sliding down cosmic serpent
        this.bodyGroup.position.y = 0.08;
        this.bodyGroup.rotation.z = Math.sin(t * 16) * 0.22;
        this.leftArm.rotation.z = 1.2 + Math.sin(t * 20) * 0.3;
        this.rightArm.rotation.z = -1.2 - Math.sin(t * 20) * 0.3;
        this.leftLeg.rotation.x = -0.5;
        this.rightLeg.rotation.x = -0.5;
        break;
      }

      case 'VICTORY': {
        // Happy cheering jump & raised arms
        this.bodyGroup.position.y = Math.abs(Math.sin(t * 8)) * 0.24;
        this.bodyGroup.rotation.y = Math.sin(t * 4) * 0.35;
        this.headGroup.rotation.z = Math.sin(t * 8) * 0.15;
        this.leftArm.rotation.x = -2.8 + Math.sin(t * 12) * 0.3;
        this.rightArm.rotation.x = -2.8 - Math.sin(t * 12) * 0.3;
        this.leftArm.rotation.z = 0.4;
        this.rightArm.rotation.z = -0.4;
        this.leftLeg.rotation.x = Math.sin(t * 8) * 0.35;
        this.rightLeg.rotation.x = -Math.sin(t * 8) * 0.35;
        break;
      }

      case 'DISAPPOINTED': {
        // Cute drooping head shake on Zonk or wrong answer
        this.bodyGroup.position.y = -0.02;
        this.headGroup.rotation.x = 0.32;
        this.headGroup.rotation.y = Math.sin(t * 9) * 0.28;
        this.leftArm.rotation.x = 0.25;
        this.rightArm.rotation.x = 0.25;
        this.leftArm.rotation.z = 0.05;
        this.rightArm.rotation.z = -0.05;
        // Sad slanted eyes
        this.leftEye.rotation.z = -0.35;
        this.rightEye.rotation.z = 0.35;
        this.leftEye.scale.y = 0.55;
        this.rightEye.scale.y = 0.55;
        break;
      }
    }
  }
}
