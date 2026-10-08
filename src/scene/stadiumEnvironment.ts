import * as THREE from 'three';
import { HALF_LENGTH, HALF_WIDTH } from '../core/coordinateUtils';
import { LightingTheme } from '../types/statsbomb';

export class StadiumEnvironment {
  public group: THREE.Group;
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;
  private floodlights: THREE.SpotLight[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // 1. Base Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.group.add(this.ambientLight);

    // 2. Hemisphere Light (Soft Sky Blue above, Fresh Grass Green from below)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x1f5928, 0.75);
    this.group.add(this.hemiLight);

    // 3. Main Sun / Primary Directional Light
    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 1.5);
    this.sunLight.position.set(40, 80, 50);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 250;
    this.sunLight.shadow.camera.left = -HALF_LENGTH - 10;
    this.sunLight.shadow.camera.right = HALF_LENGTH + 10;
    this.sunLight.shadow.camera.top = HALF_WIDTH + 10;
    this.sunLight.shadow.camera.bottom = -HALF_WIDTH - 10;
    this.sunLight.shadow.bias = -0.0005;

    this.group.add(this.sunLight);

    // 4. Floodlights on the 4 corners for Night Mode
    const corners = [
      { x: -HALF_LENGTH - 12, z: -HALF_WIDTH - 12 },
      { x: HALF_LENGTH + 12, z: -HALF_WIDTH - 12 },
      { x: -HALF_LENGTH - 12, z: HALF_WIDTH + 12 },
      { x: HALF_LENGTH + 12, z: HALF_WIDTH + 12 }
    ];

    corners.forEach(c => {
      const spot = new THREE.SpotLight(0xffffff, 2.0, 200, Math.PI / 3.5, 0.4, 0.8);
      spot.position.set(c.x, 28, c.z);
      spot.target.position.set(0, 0, 0);
      this.group.add(spot.target);
      this.group.add(spot);
      this.floodlights.push(spot);
    });

    this.setTheme('night'); // Default to sleek night broadcast aesthetic
  }

  public setTheme(theme: LightingTheme) {
    if (theme === 'day') {
      this.scene.background = new THREE.Color(0x38bdf8); // Sky blue
      this.ambientLight.intensity = 1.0;
      this.ambientLight.color.setHex(0xffffff);

      this.hemiLight.intensity = 0.9;
      this.sunLight.intensity = 1.8;
      this.sunLight.color.setHex(0xfffaed);

      this.floodlights.forEach(spot => {
        spot.intensity = 0.3;
      });
    } else {
      // Night Broadcast Mode
      this.scene.background = new THREE.Color(0x0a1122); // Midnight navy
      this.ambientLight.intensity = 0.75;
      this.ambientLight.color.setHex(0xd1d5db);

      this.hemiLight.intensity = 0.7;
      this.sunLight.intensity = 0.9;
      this.sunLight.color.setHex(0xcfd8dc);

      this.floodlights.forEach(spot => {
        spot.intensity = 2.2;
        spot.color.setHex(0xffffff);
      });
    }
  }
}
