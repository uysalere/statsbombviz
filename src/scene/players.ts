import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_RADIUS } from '../core/coordinateUtils';
import { ActivePlayerState, PlayerRenderStyle } from '../types/statsbomb';
import { createPlayerNameSprite } from './materials';

export class PlayerMeshGroup {
  public group: THREE.Group;
  public id: number;
  public state: ActivePlayerState;
  public nameSprite: THREE.Sprite | null = null;

  private broadcastFigure: THREE.Group;
  private tacticalPuck: THREE.Group;
  private jerseyMat: THREE.MeshStandardMaterial;
  private tacticalRingMat: THREE.MeshStandardMaterial;
  private visionCone: THREE.Mesh;
  private shadowDisc: THREE.Mesh;

  private fadeMaterials: THREE.Material[] = [];
  private currentOpacity: number = 1.0;
  private targetOpacity: number = 1.0;
  private isInAction: boolean = true;

  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private isMoving: boolean = false;
  private moveSpeed: number = 12; // units per second
  private currentStyle: PlayerRenderStyle = 'broadcast';

  constructor(player: ActivePlayerState, style: PlayerRenderStyle = 'broadcast') {
    this.id = player.id;
    this.state = { ...player };
    this.currentStyle = style;
    this.group = new THREE.Group();

    // 1. Team Colors
    const homeColor = 0x0284c7; // Vibrant sky blue
    const awayColor = 0xe11d48; // Crimson red
    const teamColor = player.isHome ? homeColor : awayColor;

    this.jerseyMat = new THREE.MeshStandardMaterial({
      color: teamColor,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(this.jerseyMat);

    this.tacticalRingMat = new THREE.MeshStandardMaterial({
      color: teamColor,
      emissive: teamColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(this.tacticalRingMat);

    // 2. Build Broadcast 3D Figure
    this.broadcastFigure = this.buildBroadcastFigure(player, teamColor);
    this.group.add(this.broadcastFigure);

    // 3. Build Tactical Holographic Puck
    this.tacticalPuck = this.buildTacticalPuck(player, teamColor);
    this.group.add(this.tacticalPuck);

    // Vision Cone (Subtle field of view for tactics)
    const coneGeo = new THREE.ConeGeometry(3.5, 6, 16, 1, true);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.translate(0, 0, 3);
    const coneMat = new THREE.MeshBasicMaterial({
      color: teamColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.fadeMaterials.push(coneMat);
    this.visionCone = new THREE.Mesh(coneGeo, coneMat);
    this.visionCone.position.y = 0.04;
    this.group.add(this.visionCone);

    // Dynamic ground shadow disc
    const shadowGeo = new THREE.CircleGeometry(PLAYER_RADIUS * 1.1, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x07150c,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    this.fadeMaterials.push(shadowMat);
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.02;
    this.group.add(this.shadowDisc);

    // Name Sprite
    this.nameSprite = createPlayerNameSprite(player.name, player.jerseyNumber, player.isHome);
    this.nameSprite.position.set(0, PLAYER_HEIGHT + 1.3, 0);
    this.group.add(this.nameSprite);

    // Position & Style
    this.group.position.set(player.x, 0, player.y);
    this.targetPosition.set(player.x, 0, player.y);
    this.setStyle(style);
  }

  private buildBroadcastFigure(player: ActivePlayerState, teamColor: number): THREE.Group {
    const fig = new THREE.Group();

    // Torso (Jersey)
    const torsoGeo = new THREE.CylinderGeometry(PLAYER_RADIUS * 0.75, PLAYER_RADIUS * 0.65, 1.1, 16);
    const torso = new THREE.Mesh(torsoGeo, this.jerseyMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    fig.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(PLAYER_RADIUS * 0.45, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xebd3be,
      roughness: 0.7,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(skinMat);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.15;
    head.castShadow = true;
    fig.add(head);

    // Hair / Cap
    const hairGeo = new THREE.SphereGeometry(PLAYER_RADIUS * 0.46, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.9,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(hairMat);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.18;
    fig.add(hair);

    // Shorts
    const shortsMat = new THREE.MeshStandardMaterial({
      color: player.isHome ? 0xffffff : 0x09090b,
      roughness: 0.5,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(shortsMat);
    const shortsGeo = new THREE.CylinderGeometry(PLAYER_RADIUS * 0.68, PLAYER_RADIUS * 0.62, 0.45, 16);
    const shorts = new THREE.Mesh(shortsGeo, shortsMat);
    shorts.position.y = 0.68;
    shorts.castShadow = true;
    fig.add(shorts);

    // Legs / Boots
    const legGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 12);
    const sockMat = new THREE.MeshStandardMaterial({
      color: teamColor,
      roughness: 0.6,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(sockMat);
    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(bootMat);

    const leftLeg = new THREE.Mesh(legGeo, sockMat);
    leftLeg.position.set(-0.24, 0.25, 0);
    fig.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, sockMat);
    rightLeg.position.set(0.24, 0.25, 0);
    fig.add(rightLeg);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.24, 0.14, 0.42);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(-0.24, 0.07, 0.06);
    fig.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0.24, 0.07, 0.06);
    fig.add(rightBoot);

    return fig;
  }

  private buildTacticalPuck(player: ActivePlayerState, teamColor: number): THREE.Group {
    const puck = new THREE.Group();

    // Cylindrical Glass / Metal Pedestal
    const baseGeo = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, 0.35, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 1.0
    });
    this.fadeMaterials.push(baseMat);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.18;
    base.castShadow = true;
    puck.add(base);

    // Glowing Team Ring
    const ringGeo = new THREE.TorusGeometry(PLAYER_RADIUS * 0.98, 0.06, 12, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, this.tacticalRingMat);
    ring.position.y = 0.36;
    puck.add(ring);

    // Inner Pillar
    const innerGeo = new THREE.CylinderGeometry(PLAYER_RADIUS * 0.7, PLAYER_RADIUS * 0.7, 1.2, 24);
    const innerMat = new THREE.MeshStandardMaterial({
      color: teamColor,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2
    });
    this.fadeMaterials.push(innerMat);
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = 0.8;
    puck.add(inner);

    return puck;
  }

  public setStyle(style: PlayerRenderStyle) {
    this.currentStyle = style;
    this.broadcastFigure.visible = style === 'broadcast';
    this.tacticalPuck.visible = style === 'tactical';
    this.visionCone.visible = style === 'tactical';
  }

  /**
   * Sets whether the player is involved in recent/upcoming turns.
   * If in action: fades into full opacity.
   * If out of action: smoothly fades out.
   */
  public setInAction(inAction: boolean, isImmediate: boolean = false, isPrimary: boolean = false) {
    this.isInAction = inAction;
    this.targetOpacity = inAction ? 1.0 : 0.0;

    if (this.nameSprite) {
      // Show nameplate for active players, prioritize primary actor
      this.nameSprite.visible = inAction;
      if (isPrimary) {
        this.nameSprite.scale.set(6.6, 1.65, 1);
      } else {
        this.nameSprite.scale.set(5.5, 1.35, 1);
      }
    }

    if (isImmediate) {
      this.currentOpacity = this.targetOpacity;
      this.applyOpacity(this.currentOpacity);
      this.group.visible = this.currentOpacity > 0.02;
    }
  }

  private applyOpacity(opacity: number) {
    for (const mat of this.fadeMaterials) {
      mat.opacity = opacity;
    }
    if (this.nameSprite) {
      this.nameSprite.material.opacity = opacity;
    }
  }

  public setHighlight(color: number | null, durationMs: number = 800) {
    if (color !== null) {
      this.jerseyMat.color.setHex(color);
      this.tacticalRingMat.color.setHex(color);
      this.tacticalRingMat.emissive.setHex(color);

      setTimeout(() => {
        const defaultColor = this.state.isHome ? 0x0284c7 : 0xe11d48;
        this.jerseyMat.color.setHex(defaultColor);
        this.tacticalRingMat.color.setHex(defaultColor);
        this.tacticalRingMat.emissive.setHex(defaultColor);
      }, durationMs);
    }
  }

  public moveTo(x: number, z: number, durationMs: number = 400) {
    this.targetPosition.set(x, 0, z);
    this.isMoving = true;
    const dist = Math.hypot(x - this.group.position.x, z - this.group.position.z);
    this.moveSpeed = Math.max(8, (dist / Math.max(0.1, durationMs / 1000)));

    // Orient towards movement direction
    if (dist > 0.3) {
      const angle = Math.atan2(x - this.group.position.x, z - this.group.position.z);
      this.group.rotation.y = angle;
    }
  }

  public setPositionImmediate(x: number, z: number) {
    this.group.position.set(x, 0, z);
    this.targetPosition.set(x, 0, z);
    this.isMoving = false;
  }

  public lookAtTarget(x: number, z: number) {
    const angle = Math.atan2(x - this.group.position.x, z - this.group.position.z);
    this.group.rotation.y = angle;
  }

  public update(deltaSeconds: number) {
    // 1. Smooth Fade Transition
    if (Math.abs(this.currentOpacity - this.targetOpacity) > 0.005) {
      this.currentOpacity = THREE.MathUtils.lerp(
        this.currentOpacity,
        this.targetOpacity,
        Math.min(1, deltaSeconds * 6.0)
      );
      this.applyOpacity(this.currentOpacity);
    }

    this.group.visible = this.currentOpacity > 0.02;

    // 2. Position Movement
    if (this.isMoving) {
      const curX = this.group.position.x;
      const curZ = this.group.position.z;
      const dx = this.targetPosition.x - curX;
      const dz = this.targetPosition.z - curZ;
      const dist = Math.hypot(dx, dz);

      const step = this.moveSpeed * deltaSeconds;
      if (dist <= step) {
        this.group.position.set(this.targetPosition.x, 0, this.targetPosition.z);
        this.isMoving = false;
      } else {
        this.group.position.x += (dx / dist) * step;
        this.group.position.z += (dz / dist) * step;
      }
    }
  }

  public dispose() {
    this.group.clear();
  }
}
