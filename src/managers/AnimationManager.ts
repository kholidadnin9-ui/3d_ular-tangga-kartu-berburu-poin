import * as THREE from 'three';

interface ParticleBurst {
  points: THREE.Points;
  velocities: THREE.Vector3[];
  age: number;
  maxAge: number;
}

export class AnimationManager {
  private scene: THREE.Scene;
  private bursts: ParticleBurst[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public spawnStarBurst(position: THREE.Vector3, colorHex: string = '#FDE047', count: number = 36) {
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y + 0.6;
      positions[i * 3 + 2] = position.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 1.8 + Math.random() * 3.5;
      velocities.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.cos(phi)) * speed + 1.5,
          Math.sin(phi) * Math.sin(theta) * speed
        )
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(colorHex),
      size: 0.34,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.bursts.push({
      points,
      velocities,
      age: 0,
      maxAge: 1.1,
    });
  }

  public update(delta: number) {
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += delta;
      if (b.age >= b.maxAge) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
        continue;
      }

      const posAttr = b.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let j = 0; j < b.velocities.length; j++) {
        const v = b.velocities[j];
        const x = posAttr.getX(j) + v.x * delta;
        const y = posAttr.getY(j) + v.y * delta;
        const z = posAttr.getZ(j) + v.z * delta;
        v.y -= 4.2 * delta; // gentle cosmic gravity
        posAttr.setXYZ(j, x, y, z);
      }
      posAttr.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - b.age / b.maxAge);
    }
  }

  public dispose() {
    this.bursts.forEach((b) => {
      this.scene.remove(b.points);
      b.points.geometry.dispose();
      (b.points.material as THREE.Material).dispose();
    });
    this.bursts = [];
  }
}
