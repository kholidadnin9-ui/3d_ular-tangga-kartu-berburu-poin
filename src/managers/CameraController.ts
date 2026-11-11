import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraPreset } from '../types/game';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  private targetPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();
  private isTransitioning = false;
  private lastPreset: CameraPreset = 'ISOMETRIC';
  private lastFocus?: THREE.Vector3;
  private followTarget: THREE.Object3D | null = null;
  private followOffset = new THREE.Vector3(0, 11, 11);
  private followLookOffset = new THREE.Vector3(0, 0.75, 0);

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = true;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minPolarAngle = 0.02;
    this.controls.autoRotateSpeed = 1.6;
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    this.controls.addEventListener('start', () => {
      this.isTransitioning = false;
    });

    this.setPreset('ISOMETRIC', true);
  }

  // Pull the camera back on narrow/portrait screens so the whole board stays visible
  private distanceScale(): number {
    const aspect = this.camera.aspect || 1;
    if (aspect >= 1.5) return 1;
    if (aspect >= 1) return 1 + (1.5 - aspect) * 0.5;
    return 1.35 + (1 - aspect) * 1.45;
  }

  public setPreset(preset: CameraPreset, instant: boolean = false, focusPoint?: THREE.Vector3) {
    if (preset !== 'FOLLOW') this.followTarget = null;
    this.lastPreset = preset;
    this.lastFocus = focusPoint;
    const k = this.distanceScale();
    // Look slightly toward the front so the board sits above the bottom HUD
    this.targetLookAt.set(0, 0, 2.2);

    switch (preset) {
      case 'ISOMETRIC':
        this.targetPos.set(0, 26 * k, 22 * k);
        break;
      case 'TOP':
        this.targetPos.set(0, 36 * k, 2.3);
        this.targetLookAt.set(0, 0, 2);
        break;
      case 'FRONT':
        this.targetPos.set(0, 15 * k, 29 * k);
        break;
      case 'SIDE':
        this.targetPos.set(29 * k, 17 * k, 2);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'BACK':
        this.targetPos.set(0, 18 * k, -28 * k);
        this.targetLookAt.set(0, 0, -1);
        break;
      case 'FOLLOW':
        if (focusPoint) {
          this.targetLookAt.copy(focusPoint);
          this.targetPos.set(focusPoint.x + 4, focusPoint.y + 9, focusPoint.z + 10);
        } else {
          this.targetPos.set(0, 20, 22);
        }
        break;
    }

    if (instant) {
      this.camera.position.copy(this.targetPos);
      this.controls.target.copy(this.targetLookAt);
      this.controls.update();
      this.isTransitioning = false;
    } else {
      this.isTransitioning = true;
    }
  }

  // Keep both the camera and its orbit target centered on the selected robot.
  public followObject(target: THREE.Object3D) {
    this.followTarget = target;
    this.controls.autoRotate = false;
    this.lastPreset = 'FOLLOW';
    this.lastFocus = undefined;

    const direction = this.camera.position.clone().sub(this.controls.target);
    if (direction.lengthSq() < 0.01) direction.set(0, 1, 1);
    direction.normalize();
    if (direction.y < 0.28) direction.y = 0.38;
    this.followOffset.copy(direction.normalize().multiplyScalar(16));

    const focus = target.position.clone().add(this.followLookOffset);
    this.targetLookAt.copy(focus);
    this.targetPos.copy(focus).add(this.followOffset);
    this.isTransitioning = true;
  }

  public setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
    if (enabled) this.isTransitioning = false;
  }

  public onResize() {
    if (this.followTarget) {
      const focus = this.followTarget.position.clone().add(this.followLookOffset);
      this.targetLookAt.copy(focus);
      this.targetPos.copy(focus).add(this.followOffset);
      this.isTransitioning = true;
      return;
    }
    if (!this.controls.autoRotate) {
      this.setPreset(this.lastPreset, false, this.lastFocus);
    }
  }

  public update() {
    if (this.followTarget) {
      const focus = this.followTarget.position.clone().add(this.followLookOffset);
      if (this.isTransitioning) {
        this.targetLookAt.copy(focus);
        this.targetPos.copy(focus).add(this.followOffset);
        this.camera.position.lerp(this.targetPos, 0.08);
        this.controls.target.lerp(this.targetLookAt, 0.09);
        if (
          this.camera.position.distanceTo(this.targetPos) < 0.12 &&
          this.controls.target.distanceTo(this.targetLookAt) < 0.12
        ) {
          this.isTransitioning = false;
        }
      } else {
        const shift = focus.sub(this.controls.target).multiplyScalar(0.14);
        this.controls.target.add(shift);
        this.camera.position.add(shift);
      }
    } else if (this.isTransitioning) {
      this.camera.position.lerp(this.targetPos, 0.08);
      this.controls.target.lerp(this.targetLookAt, 0.09);
      if (
        this.camera.position.distanceTo(this.targetPos) < 0.12 &&
        this.controls.target.distanceTo(this.targetLookAt) < 0.12
      ) {
        this.isTransitioning = false;
      }
    }
    this.controls.update();
  }

  public dispose() {
    this.controls.dispose();
  }
}
