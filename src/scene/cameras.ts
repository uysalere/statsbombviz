import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HALF_LENGTH } from '../core/coordinateUtils';
import { CameraMode } from '../types/statsbomb';

export class MatchCameraController {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public mode: CameraMode = 'broadcast';

  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private targetCamPos: THREE.Vector3 = new THREE.Vector3(0, 45, 65);
  private isShaking: boolean = false;
  private shakeEndTime: number = 0;
  private shakeIntensity: number = 0.5;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 250;

    this.setMode('broadcast');
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;

    if (mode === 'orbit') {
      this.controls.enabled = true;
    } else {
      this.controls.enabled = false;
    }

    switch (mode) {
      case 'broadcast':
        this.targetCamPos.set(0, 48, 68);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'tactical':
        this.targetCamPos.set(0, 95, 0.1);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'goal':
        this.targetCamPos.set(-HALF_LENGTH - 18, 12, 0);
        this.targetLookAt.set(0, 2, 0);
        break;
      case 'ball':
        // Dynamically follows ball in update()
        break;
      case 'orbit':
        // Left to OrbitControls
        break;
    }
  }

  public triggerGoalShake(durationMs: number = 700, intensity: number = 0.7) {
    this.isShaking = true;
    this.shakeIntensity = intensity;
    this.shakeEndTime = performance.now() + durationMs;
  }

  public update(_deltaSeconds: number, ballPos: THREE.Vector3) {
    const now = performance.now();

    if (this.mode === 'broadcast') {
      // Smoothly pan with the ball along X axis
      const targetX = THREE.MathUtils.clamp(ballPos.x * 0.75, -35, 35);
      this.targetCamPos.set(targetX, 48, 68);
      this.targetLookAt.set(targetX * 0.9, 0, ballPos.z * 0.3);

      this.camera.position.lerp(this.targetCamPos, 0.05);
      this.currentLookAt.lerp(this.targetLookAt, 0.06);
      this.camera.lookAt(this.currentLookAt);
    } else if (this.mode === 'tactical') {
      this.camera.position.lerp(this.targetCamPos, 0.08);
      this.currentLookAt.lerp(this.targetLookAt, 0.08);
      this.camera.lookAt(this.currentLookAt);
    } else if (this.mode === 'ball') {
      // Third person chase cam right behind the ball
      const chasePos = new THREE.Vector3(ballPos.x - 14, Math.max(7, ballPos.y + 6), ballPos.z + 10);
      this.camera.position.lerp(chasePos, 0.08);
      this.currentLookAt.lerp(ballPos, 0.1);
      this.camera.lookAt(this.currentLookAt);
    } else if (this.mode === 'goal') {
      this.camera.position.lerp(this.targetCamPos, 0.08);
      this.currentLookAt.lerp(this.targetLookAt, 0.08);
      this.camera.lookAt(this.currentLookAt);
    } else if (this.mode === 'orbit') {
      this.controls.update();
    }

    // Camera Shake on Goal
    if (this.isShaking) {
      if (now < this.shakeEndTime) {
        const remainingFactor = (this.shakeEndTime - now) / 700;
        const currentIntensity = this.shakeIntensity * remainingFactor;
        this.camera.position.x += (Math.random() - 0.5) * currentIntensity;
        this.camera.position.y += (Math.random() - 0.5) * currentIntensity;
        this.camera.position.z += (Math.random() - 0.5) * currentIntensity;
      } else {
        this.isShaking = false;
      }
    }
  }
}
