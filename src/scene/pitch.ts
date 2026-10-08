import * as THREE from 'three';
import { HALF_LENGTH, HALF_WIDTH, PITCH_LENGTH, PITCH_WIDTH } from '../core/coordinateUtils';
import { createGrassTexture, createLedBoardTexture } from './materials';

export class FootballPitch {
  public group: THREE.Group;
  private ledTexture: THREE.CanvasTexture;

  constructor() {
    this.group = new THREE.Group();
    this.ledTexture = createLedBoardTexture();
    this.buildPitch();
    this.buildMarkings();
    this.buildGoals();
    this.buildCornerFlags();
    this.buildLedBoards();
    this.buildBenches();
    this.buildFloodlights();
  }

  private buildPitch() {
    // 1. Main grass playing surface
    const grassTexture = createGrassTexture();
    const pitchGeo = new THREE.PlaneGeometry(PITCH_LENGTH, PITCH_WIDTH);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0x228b48,
      map: grassTexture,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.rotation.x = -Math.PI / 2;
    pitchMesh.position.y = 0;
    pitchMesh.receiveShadow = true;
    this.group.add(pitchMesh);

    // 2. Surrounding turf run-off border (apron)
    const apronGeo = new THREE.PlaneGeometry(PITCH_LENGTH + 16, PITCH_WIDTH + 14);
    const apronMat = new THREE.MeshStandardMaterial({
      color: 0x1b6833,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const apronMesh = new THREE.Mesh(apronGeo, apronMat);
    apronMesh.rotation.x = -Math.PI / 2;
    apronMesh.position.y = -0.02;
    apronMesh.receiveShadow = true;
    this.group.add(apronMesh);

    // 3. Stadium concourse ground perimeter
    const outerGeo = new THREE.PlaneGeometry(PITCH_LENGTH + 40, PITCH_WIDTH + 36);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.95,
      side: THREE.DoubleSide
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.rotation.x = -Math.PI / 2;
    outerMesh.position.y = -0.05;
    outerMesh.receiveShadow = true;
    this.group.add(outerMesh);
  }

  private buildMarkings() {
    const yLevel = 0.05;
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    });

    const markings = new THREE.Group();
    const LINE_THICKNESS = 0.22;

    const addRectLine = (cx: number, cz: number, w: number, h: number) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const mesh = new THREE.Mesh(geo, lineMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(cx, yLevel, cz);
      markings.add(mesh);
    };

    // Touchlines (Length: X from -60 to 60, Z at -40 and +40)
    addRectLine(0, -HALF_WIDTH, PITCH_LENGTH, LINE_THICKNESS);
    addRectLine(0, HALF_WIDTH, PITCH_LENGTH, LINE_THICKNESS);

    // Goal lines (Width: Z from -40 to 40, X at -60 and +60)
    addRectLine(-HALF_LENGTH, 0, LINE_THICKNESS, PITCH_WIDTH);
    addRectLine(HALF_LENGTH, 0, LINE_THICKNESS, PITCH_WIDTH);

    // Halfway line (X at 0)
    addRectLine(0, 0, LINE_THICKNESS, PITCH_WIDTH);

    // Center Circle (Radius 9.15m)
    const centerRadius = 9.15;
    const centerRingGeo = new THREE.RingGeometry(
      centerRadius - LINE_THICKNESS / 2,
      centerRadius + LINE_THICKNESS / 2,
      64
    );
    const centerRing = new THREE.Mesh(centerRingGeo, lineMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.set(0, yLevel, 0);
    markings.add(centerRing);

    // Center Spot
    const spotGeo = new THREE.CircleGeometry(0.35, 24);
    const centerSpot = new THREE.Mesh(spotGeo, lineMat);
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.set(0, yLevel, 0);
    markings.add(centerSpot);

    // Penalty Boxes (16.5m x 40.3m -> in statsbomb units: 18 x 44)
    const penLength = 18;
    const penWidth = 44;
    const halfPenW = penWidth / 2;

    // Left Penalty Box
    addRectLine(-HALF_LENGTH + penLength / 2, -halfPenW, penLength, LINE_THICKNESS);
    addRectLine(-HALF_LENGTH + penLength / 2, halfPenW, penLength, LINE_THICKNESS);
    addRectLine(-HALF_LENGTH + penLength, 0, LINE_THICKNESS, penWidth);

    // Right Penalty Box
    addRectLine(HALF_LENGTH - penLength / 2, -halfPenW, penLength, LINE_THICKNESS);
    addRectLine(HALF_LENGTH - penLength / 2, halfPenW, penLength, LINE_THICKNESS);
    addRectLine(HALF_LENGTH - penLength, 0, LINE_THICKNESS, penWidth);

    // 6-yard Goal Areas (6 x 20)
    const goalAreaL = 6;
    const goalAreaW = 20;
    const halfGoalAreaW = goalAreaW / 2;

    // Left Goal Area
    addRectLine(-HALF_LENGTH + goalAreaL / 2, -halfGoalAreaW, goalAreaL, LINE_THICKNESS);
    addRectLine(-HALF_LENGTH + goalAreaL / 2, halfGoalAreaW, goalAreaL, LINE_THICKNESS);
    addRectLine(-HALF_LENGTH + goalAreaL, 0, LINE_THICKNESS, goalAreaW);

    // Right Goal Area
    addRectLine(HALF_LENGTH - goalAreaL / 2, -halfGoalAreaW, goalAreaL, LINE_THICKNESS);
    addRectLine(HALF_LENGTH - goalAreaL / 2, halfGoalAreaW, goalAreaL, LINE_THICKNESS);
    addRectLine(HALF_LENGTH - goalAreaL, 0, LINE_THICKNESS, goalAreaW);

    // Penalty spots (12 units from goal line)
    const penSpotDist = 12;
    const leftPenSpot = new THREE.Mesh(spotGeo, lineMat);
    leftPenSpot.rotation.x = -Math.PI / 2;
    leftPenSpot.position.set(-HALF_LENGTH + penSpotDist, yLevel, 0);
    markings.add(leftPenSpot);

    const rightPenSpot = new THREE.Mesh(spotGeo, lineMat);
    rightPenSpot.rotation.x = -Math.PI / 2;
    rightPenSpot.position.set(HALF_LENGTH - penSpotDist, yLevel, 0);
    markings.add(rightPenSpot);

    // Penalty Arcs ('D' shape: 9.15m circle arc outside penalty box)
    const arcRadius = 9.15;
    const arcDist = penLength - penSpotDist; // 6
    if (arcRadius > arcDist) {
      const angle = Math.acos(arcDist / arcRadius);
      // Left D Arc
      const leftArcCurve = new THREE.ArcCurve(0, 0, arcRadius, -angle, angle, false);
      const leftArcPts = leftArcCurve.getPoints(32).map(p => new THREE.Vector3(p.x, yLevel, p.y));
      const leftArcGeo = new THREE.BufferGeometry().setFromPoints(leftArcPts);
      const leftArcLine = new THREE.Line(leftArcGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
      leftArcLine.position.set(-HALF_LENGTH + penSpotDist, 0, 0);
      markings.add(leftArcLine);

      // Right D Arc
      const rightArcCurve = new THREE.ArcCurve(0, 0, arcRadius, Math.PI - angle, Math.PI + angle, false);
      const rightArcPts = rightArcCurve.getPoints(32).map(p => new THREE.Vector3(p.x, yLevel, p.y));
      const rightArcGeo = new THREE.BufferGeometry().setFromPoints(rightArcPts);
      const rightArcLine = new THREE.Line(rightArcGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
      rightArcLine.position.set(HALF_LENGTH - penSpotDist, 0, 0);
      markings.add(rightArcLine);
    }

    // 4 Corner Arcs (Radius 1m)
    const corners = [
      { x: -HALF_LENGTH, z: -HALF_WIDTH, sa: 0, ea: Math.PI / 2 },
      { x: HALF_LENGTH, z: -HALF_WIDTH, sa: Math.PI / 2, ea: Math.PI },
      { x: -HALF_LENGTH, z: HALF_WIDTH, sa: -Math.PI / 2, ea: 0 },
      { x: HALF_LENGTH, z: HALF_WIDTH, sa: Math.PI, ea: Math.PI * 1.5 },
    ];
    corners.forEach(c => {
      const curve = new THREE.ArcCurve(0, 0, 1.2, c.sa, c.ea, false);
      const pts = curve.getPoints(12).map(p => new THREE.Vector3(p.x, yLevel, p.y));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
      line.position.set(c.x, 0, c.z);
      markings.add(line);
    });

    this.group.add(markings);
  }

  private buildGoals() {
    const goalWidth = 8;
    const goalHeight = 2.6;
    const goalDepth = 2.4;
    const postRadius = 0.12;

    const postMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.2
    });

    // Net material with subtle translucency and net grid feel
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });

    const createGoal = (xPos: number, isLeft: boolean) => {
      const goal = new THREE.Group();
      const zHalf = goalWidth / 2;

      // Two upright posts
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16);
      const post1 = new THREE.Mesh(postGeo, postMat);
      post1.position.set(0, goalHeight / 2, -zHalf);
      post1.castShadow = true;
      goal.add(post1);

      const post2 = new THREE.Mesh(postGeo, postMat);
      post2.position.set(0, goalHeight / 2, zHalf);
      post2.castShadow = true;
      goal.add(post2);

      // Crossbar
      const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 16);
      crossbarGeo.rotateX(Math.PI / 2);
      const crossbar = new THREE.Mesh(crossbarGeo, postMat);
      crossbar.position.set(0, goalHeight, 0);
      crossbar.castShadow = true;
      goal.add(crossbar);

      // Back support stanchions
      const dir = isLeft ? -1 : 1;
      const stanchionRadius = 0.06;
      const stanchionGeo = new THREE.CylinderGeometry(stanchionRadius, stanchionRadius, goalDepth * 1.2, 12);
      stanchionGeo.rotateZ((dir * Math.PI) / 4);

      const s1 = new THREE.Mesh(stanchionGeo, postMat);
      s1.position.set((dir * goalDepth) / 2, goalHeight / 2, -zHalf);
      goal.add(s1);

      const s2 = new THREE.Mesh(stanchionGeo, postMat);
      s2.position.set((dir * goalDepth) / 2, goalHeight / 2, zHalf);
      goal.add(s2);

      // 3D Net Box / Mesh
      const netBackGeo = new THREE.PlaneGeometry(goalWidth, goalHeight, 16, 8);
      const netBack = new THREE.Mesh(netBackGeo, netMat);
      netBack.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
      netBack.position.set(dir * goalDepth, goalHeight / 2, 0);
      goal.add(netBack);

      // Net Top
      const netTopGeo = new THREE.PlaneGeometry(goalDepth, goalWidth, 8, 16);
      const netTop = new THREE.Mesh(netTopGeo, netMat);
      netTop.rotation.x = -Math.PI / 2;
      netTop.position.set((dir * goalDepth) / 2, goalHeight, 0);
      goal.add(netTop);

      // Net Sides
      const netSideGeo = new THREE.PlaneGeometry(goalDepth, goalHeight, 8, 8);
      const netSide1 = new THREE.Mesh(netSideGeo, netMat);
      netSide1.position.set((dir * goalDepth) / 2, goalHeight / 2, -zHalf);
      goal.add(netSide1);

      const netSide2 = new THREE.Mesh(netSideGeo, netMat);
      netSide2.position.set((dir * goalDepth) / 2, goalHeight / 2, zHalf);
      goal.add(netSide2);

      goal.position.set(xPos, 0, 0);
      return goal;
    };

    this.group.add(createGoal(-HALF_LENGTH, true));
    this.group.add(createGoal(HALF_LENGTH, false));
  }

  private buildCornerFlags() {
    const flagHeight = 1.6;
    const flagRadius = 0.04;
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6 });
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      roughness: 0.5
    });

    const corners = [
      { x: -HALF_LENGTH, z: -HALF_WIDTH },
      { x: HALF_LENGTH, z: -HALF_WIDTH },
      { x: -HALF_LENGTH, z: HALF_WIDTH },
      { x: HALF_LENGTH, z: HALF_WIDTH }
    ];

    corners.forEach(c => {
      const flagGroup = new THREE.Group();
      // Pole
      const poleGeo = new THREE.CylinderGeometry(flagRadius, flagRadius, flagHeight, 12);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = flagHeight / 2;
      pole.castShadow = true;
      flagGroup.add(pole);

      // Flag banner
      const bannerGeo = new THREE.PlaneGeometry(0.5, 0.35);
      const banner = new THREE.Mesh(bannerGeo, flagMat);
      banner.position.set(0.25, flagHeight - 0.2, 0);
      flagGroup.add(banner);

      flagGroup.position.set(c.x, 0, c.z);
      this.group.add(flagGroup);
    });
  }

  private buildLedBoards() {
    const boardHeight = 1.0;
    const boardMat = new THREE.MeshStandardMaterial({
      map: this.ledTexture,
      roughness: 0.2,
      emissive: 0x051b11,
      emissiveIntensity: 0.4
    });

    const boardGroup = new THREE.Group();

    // Side LED boards (along sideline)
    const sideGeo = new THREE.BoxGeometry(PITCH_LENGTH + 6, boardHeight, 0.3);
    const side1 = new THREE.Mesh(sideGeo, boardMat);
    side1.position.set(0, boardHeight / 2, -HALF_WIDTH - 3.5);
    side1.castShadow = true;
    boardGroup.add(side1);

    const side2 = new THREE.Mesh(sideGeo, boardMat);
    side2.position.set(0, boardHeight / 2, HALF_WIDTH + 3.5);
    side2.castShadow = true;
    boardGroup.add(side2);

    // Goal end LED boards (behind goals with openings for goals)
    const endHalfGeo = new THREE.BoxGeometry(0.3, boardHeight, (PITCH_WIDTH - 12) / 2);
    // Left end
    const endL1 = new THREE.Mesh(endHalfGeo, boardMat);
    endL1.position.set(-HALF_LENGTH - 4.5, boardHeight / 2, -HALF_WIDTH / 2 - 3);
    boardGroup.add(endL1);

    const endL2 = new THREE.Mesh(endHalfGeo, boardMat);
    endL2.position.set(-HALF_LENGTH - 4.5, boardHeight / 2, HALF_WIDTH / 2 + 3);
    boardGroup.add(endL2);

    // Right end
    const endR1 = new THREE.Mesh(endHalfGeo, boardMat);
    endR1.position.set(HALF_LENGTH + 4.5, boardHeight / 2, -HALF_WIDTH / 2 - 3);
    boardGroup.add(endR1);

    const endR2 = new THREE.Mesh(endHalfGeo, boardMat);
    endR2.position.set(HALF_LENGTH + 4.5, boardHeight / 2, HALF_WIDTH / 2 + 3);
    boardGroup.add(endR2);

    this.group.add(boardGroup);
  }

  private buildBenches() {
    const dugoutMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.5
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1
    });

    const createDugout = (xPos: number) => {
      const dugout = new THREE.Group();
      // Shelter Roof & Back
      const shelterGeo = new THREE.BoxGeometry(8, 2.2, 2.5);
      const shelter = new THREE.Mesh(shelterGeo, glassMat);
      shelter.position.y = 1.1;
      dugout.add(shelter);

      // Frame
      const frameGeo = new THREE.BoxGeometry(8.1, 0.1, 2.6);
      const roofFrame = new THREE.Mesh(frameGeo, dugoutMat);
      roofFrame.position.y = 2.2;
      dugout.add(roofFrame);

      dugout.position.set(xPos, 0, HALF_WIDTH + 6);
      return dugout;
    };

    // Home & Away dugouts
    this.group.add(createDugout(-10));
    this.group.add(createDugout(10));
  }

  private buildFloodlights() {
    const towerHeight = 28;
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3
    });
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff0dd,
      emissiveIntensity: 0.8
    });

    const corners = [
      { x: -HALF_LENGTH - 12, z: -HALF_WIDTH - 12 },
      { x: HALF_LENGTH + 12, z: -HALF_WIDTH - 12 },
      { x: -HALF_LENGTH - 12, z: HALF_WIDTH + 12 },
      { x: HALF_LENGTH + 12, z: HALF_WIDTH + 12 }
    ];

    corners.forEach(c => {
      const tower = new THREE.Group();
      // Mast
      const mastGeo = new THREE.CylinderGeometry(0.3, 0.8, towerHeight, 8);
      const mast = new THREE.Mesh(mastGeo, towerMat);
      mast.position.y = towerHeight / 2;
      tower.add(mast);

      // Light head array (grid of floodlight bulbs)
      const headGeo = new THREE.BoxGeometry(4, 3, 1);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, towerHeight, 0);
      head.lookAt(0, 0, 0); // Aim towards center of pitch
      tower.add(head);

      tower.position.set(c.x, 0, c.z);
      this.group.add(tower);
    });
  }

  public update(_delta: number) {
    // Subtle scrolling animation for LED board if desired
    if (this.ledTexture) {
      this.ledTexture.offset.x -= 0.0003;
    }
  }
}
