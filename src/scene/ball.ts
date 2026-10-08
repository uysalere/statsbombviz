import * as THREE from 'three';
import { BALL_RADIUS } from '../core/coordinateUtils';
import { createSoccerBallTexture } from './materials';

export class FootballBall {
  public mesh: THREE.Mesh;
  public shadowMesh: THREE.Mesh;
  public trajectoryLine: THREE.Line;
  public group: THREE.Group;

  private currentTarget: THREE.Vector3 = new THREE.Vector3();
  private startPosition: THREE.Vector3 = new THREE.Vector3();
  private prevPosition: THREE.Vector3 = new THREE.Vector3();
  private peakHeight: number = 0;
  private animProgress: number = 1; // 1 means arrived
  private animDuration: number = 0.5; // in seconds
  private animElapsed: number = 0;
  private onArrivedCallback: (() => void) | null = null;

  constructor() {
    this.group = new THREE.Group();

    // 1. Ball sphere with authentic soccer ball texture
    const ballTexture = createSoccerBallTexture();
    const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.35,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(ballGeo, ballMat);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, BALL_RADIUS, 0);
    this.group.add(this.mesh);

    // 2. Dynamic ground shadow disc
    const shadowGeo = new THREE.CircleGeometry(BALL_RADIUS * 1.2, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x051a0d,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.02, 0);
    this.group.add(this.shadowMesh);

    // 3. Dynamic trajectory arc line
    const trajGeo = new THREE.BufferGeometry();
    const trajMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      linewidth: 2
    });
    this.trajectoryLine = new THREE.Line(trajGeo, trajMat);
    this.trajectoryLine.visible = false;
    this.group.add(this.trajectoryLine);
  }

  public setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, Math.max(BALL_RADIUS, y), z);
    this.shadowMesh.position.set(x, 0.02, z);
    this.updateShadowScale(this.mesh.position.y);
    this.animProgress = 1;
    this.trajectoryLine.visible = false;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }

  public flyTo(
    targetX: number,
    targetZ: number,
    targetY: number = BALL_RADIUS,
    durationMs: number = 500,
    type: 'pass' | 'shot' | 'carry' | 'default' = 'default',
    onComplete?: () => void
  ) {
    this.startPosition.copy(this.mesh.position);
    this.currentTarget.set(targetX, targetY, targetZ);
    this.prevPosition.copy(this.startPosition);

    const dist = Math.hypot(targetX - this.startPosition.x, targetZ - this.startPosition.z);

    // Determine arc height based on event type
    if (type === 'pass') {
      this.peakHeight = Math.min(6, Math.max(1, dist * 0.12));
      (this.trajectoryLine.material as THREE.LineBasicMaterial).color.setHex(0x38bdf8); // Cyan
    } else if (type === 'shot') {
      this.peakHeight = Math.min(5, Math.max(1.2, dist * 0.08));
      (this.trajectoryLine.material as THREE.LineBasicMaterial).color.setHex(0xf59e0b); // Amber / Gold
    } else {
      this.peakHeight = 0; // Flat ground movement for carries & miscontrols
    }

    this.animDuration = Math.max(0.1, durationMs / 1000);
    this.animElapsed = 0;
    this.animProgress = 0;
    this.onArrivedCallback = onComplete || null;

    // Build trajectory arc points
    if (this.peakHeight > 0.5 && dist > 3) {
      const points: THREE.Vector3[] = [];
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = THREE.MathUtils.lerp(this.startPosition.x, targetX, t);
        const pz = THREE.MathUtils.lerp(this.startPosition.z, targetZ, t);
        const arcY = Math.sin(t * Math.PI) * this.peakHeight + BALL_RADIUS;
        points.push(new THREE.Vector3(px, arcY, pz));
      }
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.trajectoryLine.visible = true;
    } else {
      this.trajectoryLine.visible = false;
    }
  }

  public update(deltaSeconds: number) {
    if (this.animProgress < 1) {
      this.animElapsed += deltaSeconds;
      this.animProgress = Math.min(1, this.animElapsed / this.animDuration);

      // Smooth step easing
      const t = this.animProgress;
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // X and Z position
      const curX = THREE.MathUtils.lerp(this.startPosition.x, this.currentTarget.x, easeT);
      const curZ = THREE.MathUtils.lerp(this.startPosition.z, this.currentTarget.z, easeT);

      // Parabolic Y Arc
      const arcY = Math.sin(t * Math.PI) * this.peakHeight;
      const curY = THREE.MathUtils.lerp(this.startPosition.y, this.currentTarget.y, easeT) + arcY;

      this.mesh.position.set(curX, Math.max(BALL_RADIUS, curY), curZ);
      this.shadowMesh.position.set(curX, 0.02, curZ);
      this.updateShadowScale(curY);

      // Calculate ball spin along direction of motion
      const dx = curX - this.prevPosition.x;
      const dz = curZ - this.prevPosition.z;
      const speed = Math.hypot(dx, dz);

      if (speed > 0.001) {
        // Rotation axis perpendicular to movement in XZ plane
        const axis = new THREE.Vector3(-dz, 0, dx).normalize();
        this.mesh.rotateOnWorldAxis(axis, speed * 2.5);
      }

      this.prevPosition.set(curX, curY, curZ);

      if (this.animProgress >= 1) {
        this.mesh.position.copy(this.currentTarget);
        this.shadowMesh.position.set(this.currentTarget.x, 0.02, this.currentTarget.z);
        this.updateShadowScale(this.currentTarget.y);
        this.trajectoryLine.visible = false;
        if (this.onArrivedCallback) {
          const cb = this.onArrivedCallback;
          this.onArrivedCallback = null;
          cb();
        }
      }
    }
  }

  private updateShadowScale(heightAbovePitch: number) {
    const scale = Math.max(0.4, 1.2 - (heightAbovePitch - BALL_RADIUS) * 0.15);
    const opacity = Math.max(0.15, 0.6 - (heightAbovePitch - BALL_RADIUS) * 0.1);
    this.shadowMesh.scale.set(scale, scale, 1);
    (this.shadowMesh.material as THREE.MeshBasicMaterial).opacity = opacity;
  }
}
