import * as THREE from 'three';
import { BoardManager, TILE_SPACING } from '../managers/BoardManager';
import { SNAKES_AND_LADDERS } from '../managers/SnakeLadderManager';
import { CameraController } from '../managers/CameraController';
import { AnimationManager } from '../managers/AnimationManager';
import { ChibiRobot3D } from './ChibiRobot3D';
import { CameraPreset, Player, RobotAnimState, TileData } from '../types/game';
import { AudioManager } from '../managers/AudioManager';

const ISLAND_HALF = 15.5;

// Deterministic pseudo-random so island decoration is the same each load
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export class GalaxyScene3D {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;
  public animManager: AnimationManager;

  private tileCanvases: Map<number, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }> = new Map();
  private tileGlowRings: Map<number, THREE.Mesh> = new Map();
  private questionFloaters: THREE.Object3D[] = [];
  private snakeCurves: Map<string, THREE.CatmullRomCurve3> = new Map();
  private ladderCurves: Map<string, THREE.CatmullRomCurve3> = new Map();
  private snakeHeads: THREE.Group[] = [];
  private robots: Map<number, ChibiRobot3D> = new Map();

  private startPlanetGroup = new THREE.Group();
  private finishGroup = new THREE.Group();
  private portalGlow: THREE.Mesh | null = null;
  private ringedPlanetGroup = new THREE.Group();
  private orbitingSpaceship = new THREE.Group();
  private orbitingSatellite = new THREE.Group();
  private blackHoleGroup = new THREE.Group();
  private warpPortalGroup = new THREE.Group();
  private cometGroup = new THREE.Group();
  private asteroidBeltGroup = new THREE.Group();
  private sparkles: THREE.Points | null = null;
  private shootingMeteors: { mesh: THREE.Group; velocity: THREE.Vector3 }[] = [];

  private clock = new THREE.Clock();
  private rafId: number | null = null;
  private isDisposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = null; // CSS bright galaxy art shows through

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 260);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    this.cameraController = new CameraController(camera, this.renderer.domElement);
    this.animManager = new AnimationManager(this.scene);

    this.setupLights();
    this.buildCosmicEnvironment();
    this.buildFloatingIsland();
    this.buildBoard100Tiles();
    this.buildCastleAndFinish();
    this.buildSnakesAndLadders();

    // Redraw tile numbers once the Fredoka font has loaded
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('700 100px "Fredoka"'),
        document.fonts.load('800 40px "Plus Jakarta Sans"'),
      ])
        .then(() => this.redrawAllTiles())
        .catch(() => {});
    }

    window.addEventListener('resize', this.handleResize);
    this.startLoop();
  }

  private setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x5b3a9a, 1.7));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const sun = new THREE.DirectionalLight(0xfff4dd, 2.3);
    sun.position.set(14, 30, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 80;
    const d = 19;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    const cyan = new THREE.PointLight(0x4fd8ff, 2.2, 45);
    cyan.position.set(-16, 9, 14);
    this.scene.add(cyan);
    const magenta = new THREE.PointLight(0xff5fc8, 1.8, 45);
    magenta.position.set(16, 9, -12);
    this.scene.add(magenta);
    const gold = new THREE.PointLight(0xffd35a, 3, 26);
    gold.position.set(-8, 8, -14);
    this.scene.add(gold);
  }

  private buildCosmicEnvironment() {
    // Twinkling colorful sparkles around the island
    const count = 700;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [0xffffff, 0x7fe7ff, 0xffe066, 0xff8ad8, 0xc49bff].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const r = 30 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7 + 5;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const c = palette[i % palette.length];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.sparkles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })
    );
    this.scene.add(this.sparkles);

    // Ringed orange planet (top-left like reference)
    this.ringedPlanetGroup.position.set(-26, 14, -22);
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.5, emissive: 0x7a2a00, emissiveIntensity: 0.35 })
    );
    const ringGeo = new THREE.RingGeometry(4.6, 6.8, 48);
    ringGeo.rotateX(Math.PI * 0.4);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xffd9a8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    this.ringedPlanetGroup.add(planet, ring);
    this.scene.add(this.ringedPlanetGroup);

    // Purple planet & small pink planet
    const purple = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 28, 28),
      new THREE.MeshStandardMaterial({ color: 0xa96bff, roughness: 0.55, emissive: 0x4a1a99, emissiveIntensity: 0.4 })
    );
    purple.position.set(-27, 2, 6);
    this.scene.add(purple);
    const pink = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xff6b8a, roughness: 0.5, emissive: 0x7a1030, emissiveIntensity: 0.35 })
    );
    pink.position.set(24, 15, -18);
    this.scene.add(pink);

    // Decorative colorful black hole (far back-right)
    this.blackHoleGroup.position.set(28, 6, -26);
    this.blackHoleGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 24), new THREE.MeshBasicMaterial({ color: 0x0a0620 })));
    const disk = new THREE.TorusGeometry(3, 0.4, 16, 50);
    disk.rotateX(Math.PI * 0.35);
    this.blackHoleGroup.add(new THREE.Mesh(disk, new THREE.MeshBasicMaterial({ color: 0xff5fc8 })));
    const halo = new THREE.TorusGeometry(3.8, 0.15, 12, 50);
    halo.rotateX(-Math.PI * 0.25);
    this.blackHoleGroup.add(new THREE.Mesh(halo, new THREE.MeshBasicMaterial({ color: 0x4fd8ff })));
    this.scene.add(this.blackHoleGroup);

    // Warp portal (front-right)
    this.warpPortalGroup.position.set(25, 4, 14);
    this.warpPortalGroup.rotation.y = -0.7;
    this.warpPortalGroup.add(
      new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.3, 16, 40),
        new THREE.MeshStandardMaterial({ color: 0x4fd8ff, emissive: 0x4fd8ff, emissiveIntensity: 1 })
      ),
      new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 32),
        new THREE.MeshBasicMaterial({ color: 0xb07bff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
      )
    );
    this.scene.add(this.warpPortalGroup);

    // Moon
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xdfe7ff, roughness: 0.8, emissive: 0x4060a0, emissiveIntensity: 0.2 })
    );
    moon.position.set(22, 12, 10);
    this.scene.add(moon);

    // Comet
    const cometTailGeo = new THREE.ConeGeometry(0.5, 3.6, 16);
    cometTailGeo.rotateZ(Math.PI / 2);
    cometTailGeo.translate(1.8, 0, 0);
    this.cometGroup.add(
      new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff3a0 })),
      new THREE.Mesh(cometTailGeo, new THREE.MeshBasicMaterial({ color: 0x7fe7ff, transparent: true, opacity: 0.65 }))
    );
    this.scene.add(this.cometGroup);

    // Rocket ship (white & red like reference)
    const hull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
    );
    hull.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 16), new THREE.MeshStandardMaterial({ color: 0xff3b3b }));
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 1.35;
    const fins = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0xff3b3b }));
    fins.position.z = -0.6;
    const window1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshBasicMaterial({ color: 0x4fd8ff }));
    window1.position.set(0, 0.42, 0.3);
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 1.2, 12),
      new THREE.MeshBasicMaterial({ color: 0x7fe7ff, transparent: true, opacity: 0.8 })
    );
    flame.rotation.x = -Math.PI / 2;
    flame.position.z = -1.5;
    this.orbitingSpaceship.add(hull, nose, fins, window1, flame);
    this.scene.add(this.orbitingSpaceship);

    // Satellite
    this.orbitingSatellite.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 0.7, roughness: 0.25 })
      ),
      new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.08, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x2a6cf0, emissive: 0x4fd8ff, emissiveIntensity: 0.4 })
      )
    );
    this.scene.add(this.orbitingSatellite);

    // Floating asteroids
    const astMat = new THREE.MeshStandardMaterial({ color: 0x8c7f9a, roughness: 0.85, flatShading: true });
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const r = 22 + (i % 3) * 2.5;
      const ast = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 + (i % 4) * 0.2, 0), astMat);
      ast.position.set(Math.cos(a) * r, 2 + Math.sin(i * 2.3) * 4, Math.sin(a) * r);
      ast.rotation.set(i, i * 0.7, 0);
      this.asteroidBeltGroup.add(ast);
    }
    this.scene.add(this.asteroidBeltGroup);

    // Shooting meteors
    for (let m = 0; m < 3; m++) {
      const g = new THREE.Group();
      const tailGeo = new THREE.ConeGeometry(0.22, 2.4, 10);
      tailGeo.rotateZ(Math.PI / 2);
      tailGeo.translate(1.2, 0, 0);
      g.add(
        new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffedd5 })),
        new THREE.Mesh(tailGeo, new THREE.MeshBasicMaterial({ color: 0xff9a3d, transparent: true, opacity: 0.75 }))
      );
      g.position.set(-28 + m * 18, 18 + m * 3, -22 - m * 5);
      this.scene.add(g);
      this.shootingMeteors.push({ mesh: g, velocity: new THREE.Vector3(-12 - m * 3, -1.8, 4 + m) });
    }
  }

  private buildFloatingIsland() {
    const rand = seeded(42);

    // Grass top slab
    const grass = new THREE.Mesh(
      new THREE.BoxGeometry(ISLAND_HALF * 2, 0.9, ISLAND_HALF * 2),
      new THREE.MeshStandardMaterial({ color: 0x4cc94a, roughness: 0.85 })
    );
    grass.position.y = -0.85;
    grass.receiveShadow = true;
    this.scene.add(grass);

    // Rocky underside (square frustum with jittered vertices)
    const rockGeo = new THREE.CylinderGeometry(ISLAND_HALF * 1.414, 5, 11, 4, 5, false);
    rockGeo.rotateY(Math.PI / 4);
    const pos = rockGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < 5.4) {
        pos.setX(i, pos.getX(i) + (rand() - 0.5) * 2.2);
        pos.setZ(i, pos.getZ(i) + (rand() - 0.5) * 2.2);
        pos.setY(i, y + (rand() - 0.5) * 0.8);
      }
    }
    rockGeo.computeVertexNormals();
    const rock = new THREE.Mesh(
      rockGeo,
      new THREE.MeshStandardMaterial({ color: 0x9a8473, roughness: 0.95, flatShading: true })
    );
    rock.position.y = -6.8;
    this.scene.add(rock);

    // Boulders along the island cliff edge
    const boulderMat = new THREE.MeshStandardMaterial({ color: 0xa8917c, roughness: 0.95, flatShading: true });
    for (let i = 0; i < 40; i++) {
      const side = i % 4;
      const t = (rand() - 0.5) * ISLAND_HALF * 2;
      const x = side === 0 ? t : side === 1 ? t : side === 2 ? -ISLAND_HALF : ISLAND_HALF;
      const z = side === 0 ? ISLAND_HALF : side === 1 ? -ISLAND_HALF : t;
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 + rand() * 0.9, 0), boulderMat);
      b.position.set(x, -1.4 - rand() * 1.4, z);
      b.rotation.set(rand() * 3, rand() * 3, 0);
      b.castShadow = true;
      this.scene.add(b);
    }

    // Small floating rocks under island
    for (let i = 0; i < 8; i++) {
      const fr = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + rand() * 1.2, 0), boulderMat);
      const a = rand() * Math.PI * 2;
      fr.position.set(Math.cos(a) * (18 + rand() * 4), -6 - rand() * 5, Math.sin(a) * (18 + rand() * 4));
      this.scene.add(fr);
      this.asteroidBeltGroup.add(fr);
    }

    // Sandstone rim frame around the board
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(24.6, 0.6, 24.6),
      new THREE.MeshStandardMaterial({ color: 0xd9b07a, roughness: 0.7 })
    );
    rim.position.y = -0.32;
    rim.receiveShadow = true;
    rim.castShadow = true;
    this.scene.add(rim);
    const rimInner = new THREE.Mesh(
      new THREE.BoxGeometry(23.2, 0.62, 23.2),
      new THREE.MeshStandardMaterial({ color: 0x1b3fae, roughness: 0.5, metalness: 0.3 })
    );
    rimInner.position.y = -0.3;
    this.scene.add(rimInner);

    // Trees around island edges (pine + round trees)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.9 });
    const leafMats = [0x2fbf4a, 0x46d65a, 0x22a33d].map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, flatShading: true })
    );
    let placed = 0;
    let guard = 0;
    while (placed < 46 && guard < 600) {
      guard++;
      const x = (rand() - 0.5) * ISLAND_HALF * 2 * 0.98;
      const z = (rand() - 0.5) * ISLAND_HALF * 2 * 0.98;
      // keep off the board & rim
      if (Math.abs(x) < 12.9 && Math.abs(z) < 12.9) continue;
      // keep START pad & castle zone clearer
      if (x < -11 && z > 7 && z < 13) continue;
      if (z < -12.5 && x > -12 && x < 8) continue;

      const tree = new THREE.Group();
      const scale = 0.7 + rand() * 0.6;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 6), trunkMat);
      trunk.position.y = 0.4;
      tree.add(trunk);
      const mat = leafMats[placed % 3];
      if (rand() > 0.5) {
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.3, 7), mat);
        c1.position.y = 1.2;
        const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 7), mat);
        c2.position.y = 1.85;
        tree.add(c1, c2);
      } else {
        const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), mat);
        s.position.y = 1.3;
        tree.add(s);
      }
      tree.traverse((o) => {
        (o as THREE.Mesh).castShadow = true;
      });
      tree.scale.setScalar(scale);
      tree.position.set(x, -0.4, z);
      this.scene.add(tree);
      placed++;
    }

    // Glowing crystals for a sci-fi touch
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x7fe7ff, emissive: 0x2fb8ff, emissiveIntensity: 0.9, roughness: 0.1 });
    for (let i = 0; i < 10; i++) {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), crystalMat);
      const a = (i / 10) * Math.PI * 2;
      c.position.set(Math.cos(a) * 14.2, 0, Math.sin(a) * 14.2);
      c.scale.y = 1.8;
      this.scene.add(c);
    }
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: TileData) {
    const S = 256;
    ctx.clearRect(0, 0, S, S);

    let rimA = '#ffe9a0';
    let rimB = '#d8901a';
    let mainA = '#4aa3ff';
    let mainB = '#1745c4';
    let numColor = '#ffffff';
    let numStroke = '#0b1f6b';

    if (tile.special === 'QUESTION') {
      mainA = '#c26bff';
      mainB = '#6a1fd1';
    } else if (tile.special === 'START') {
      mainA = '#fff27a';
      mainB = '#ffb300';
      numColor = '#1b2f8f';
      numStroke = '#ffffff';
    } else if (tile.special === 'FINISH') {
      mainA = '#ffd65a';
      mainB = '#ff8a00';
      rimA = '#ffffff';
      rimB = '#ffc94a';
    }

    // Gold rim
    const rimGrad = ctx.createLinearGradient(0, 0, 0, S);
    rimGrad.addColorStop(0, rimA);
    rimGrad.addColorStop(1, rimB);
    ctx.fillStyle = rimGrad;
    roundRectPath(ctx, 0, 0, S, S, 36);
    ctx.fill();

    // Glossy main face
    const grad = ctx.createLinearGradient(0, 14, 0, S - 14);
    grad.addColorStop(0, mainA);
    grad.addColorStop(1, mainB);
    ctx.fillStyle = grad;
    roundRectPath(ctx, 14, 14, S - 28, S - 28, 28);
    ctx.fill();

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    roundRectPath(ctx, 24, 22, S - 48, (S - 48) * 0.45, 22);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (tile.special === 'QUESTION') {
      // Big gold star with "?"
      ctx.save();
      ctx.shadowColor = 'rgba(255,200,0,0.9)';
      ctx.shadowBlur = 18;
      const sg = ctx.createLinearGradient(0, 60, 0, 200);
      sg.addColorStop(0, '#fff6a0');
      sg.addColorStop(1, '#ffb300');
      ctx.fillStyle = sg;
      drawStar(ctx, 128, 136, 82, 36);
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#a35a00';
      drawStar(ctx, 128, 136, 82, 36);
      ctx.stroke();
      ctx.font = '700 64px "Fredoka", sans-serif';
      ctx.fillStyle = '#8a3c00';
      ctx.fillText('?', 128, 142);
      // tile number in corner
      ctx.font = '700 46px "Fredoka", sans-serif';
      ctx.lineWidth = 8;
      ctx.strokeStyle = numStroke;
      ctx.strokeText(String(tile.number), 60, 52);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(tile.number), 60, 52);
      return;
    }

    const fontSize = tile.number === 100 ? 96 : 118;
    ctx.font = `700 ${fontSize}px "Fredoka", "Plus Jakarta Sans", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = numStroke;
    const yNum = tile.special === 'FINISH' ? 118 : 134;
    ctx.strokeText(String(tile.number), 128, yNum);
    ctx.fillStyle = numColor;
    ctx.fillText(String(tile.number), 128, yNum);

    if (tile.special === 'FINISH') {
      ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#7a3500';
      ctx.strokeText('FINISH', 128, 200);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FINISH', 128, 200);
    }

    // Small badge for ladder bottoms / snake heads
    if (tile.special === 'LADDER_START' || tile.special === 'SNAKE_HEAD') {
      const isLadder = tile.special === 'LADDER_START';
      ctx.fillStyle = isLadder ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(206, 206, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(isLadder ? '▲' : '▼', 206, 208);
    }
  }

  private redrawAllTiles() {
    if (this.isDisposed) return;
    const tiles = BoardManager.getTiles();
    tiles.forEach((t) => {
      const entry = this.tileCanvases.get(t.number);
      if (!entry) return;
      this.drawTile(entry.canvas.getContext('2d')!, t);
      entry.texture.needsUpdate = true;
    });
  }

  private buildBoard100Tiles() {
    const tiles = BoardManager.getTiles();
    const tileSize = TILE_SPACING * 0.92;
    const tileGeo = new THREE.BoxGeometry(tileSize, 0.34, tileSize);
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xd99a2b, roughness: 0.4, metalness: 0.35 });

    tiles.forEach((tile) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      this.drawTile(canvas.getContext('2d')!, tile);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      this.tileCanvases.set(tile.number, { canvas, texture: tex });

      const topMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.22,
        metalness: 0.05,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 0.28,
      });
      const mesh = new THREE.Mesh(tileGeo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
      mesh.position.set(tile.x, tile.y, tile.z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.scene.add(mesh);

      // Highlight ring when occupied
      const glowGeo = new THREE.RingGeometry(0.78, 1.0, 36);
      glowGeo.rotateX(-Math.PI / 2);
      const glow = new THREE.Mesh(
        glowGeo,
        new THREE.MeshBasicMaterial({ color: 0x7fe7ff, side: THREE.DoubleSide, transparent: true, opacity: 0 })
      );
      glow.position.set(tile.x, tile.y + 0.19, tile.z);
      this.scene.add(glow);
      this.tileGlowRings.set(tile.number, glow);

      if (tile.special === 'QUESTION') {
        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.2, 0),
          new THREE.MeshStandardMaterial({ color: 0xffd43b, emissive: 0xffb300, emissiveIntensity: 0.9, roughness: 0.2 })
        );
        star.position.set(tile.x, tile.y + 0.75, tile.z);
        star.userData.baseY = tile.y + 0.75;
        this.scene.add(star);
        this.questionFloaters.push(star);
      }
    });

    // Green START pad beside tile 1
    const t1 = BoardManager.getTile(1);
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.4, 2.3),
      new THREE.MeshStandardMaterial({ color: 0x3ddc4a, emissive: 0x16a34a, emissiveIntensity: 0.45, roughness: 0.3 })
    );
    pad.position.set(t1.x - 2.55, -0.15, t1.z);
    pad.castShadow = true;
    pad.receiveShadow = true;
    this.scene.add(pad);

    const startCanvas = document.createElement('canvas');
    startCanvas.width = 256;
    startCanvas.height = 96;
    const sctx = startCanvas.getContext('2d')!;
    sctx.font = '700 70px "Fredoka", sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.lineWidth = 12;
    sctx.lineJoin = 'round';
    sctx.strokeStyle = '#0b5a1e';
    sctx.strokeText('START', 128, 50);
    sctx.fillStyle = '#ffffff';
    sctx.fillText('START', 128, 50);
    const startTex = new THREE.CanvasTexture(startCanvas);
    startTex.colorSpace = THREE.SRGBColorSpace;
    const startLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.82),
      new THREE.MeshBasicMaterial({ map: startTex, transparent: true })
    );
    startLabel.rotation.x = -Math.PI / 2;
    startLabel.position.set(t1.x - 2.55, 0.07, t1.z + 0.55);
    this.scene.add(startLabel);

    // Blue START planet floating above the pad
    this.startPlanetGroup.position.set(t1.x - 2.55, 3.2, t1.z - 0.2);
    const bluePlanet = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x3fa0ff, emissive: 0x1e4fd8, emissiveIntensity: 0.5, roughness: 0.3 })
    );
    const ringS = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 12, 36), new THREE.MeshBasicMaterial({ color: 0xffd43b }));
    ringS.rotation.x = Math.PI * 0.38;
    this.startPlanetGroup.add(bluePlanet, ringS);
    this.scene.add(this.startPlanetGroup);
  }

  private buildCastleAndFinish() {
    const castle = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1dcb0, roughness: 0.6 });
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x3fa0ff, emissive: 0x1e4fd8, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffc94a, emissive: 0xb86e00, emissiveIntensity: 0.35, metalness: 0.75, roughness: 0.25 });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x7fe7ff });

    const addBuilding = (x: number, z: number, w: number, h: number) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), wallMat);
      b.position.set(x, h / 2 - 0.4, z);
      b.castShadow = true;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(w * 0.45, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      dome.position.set(x, h - 0.4, z);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 8), goldMat);
      spire.position.set(x, h - 0.4 + w * 0.45 + 0.25, z);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.35, h * 0.3), windowMat);
      win.position.set(x, h * 0.5 - 0.4, z + w * 0.41);
      castle.add(b, dome, spire, win);
    };

    addBuilding(-2, -14, 2.2, 2.6);
    addBuilding(1.4, -14.2, 1.8, 3.4);
    addBuilding(4.6, -13.8, 2.0, 2.2);
    addBuilding(7.5, -14.1, 1.6, 2.8);
    addBuilding(-12.8, -13.9, 1.6, 2.4);

    // Towers with pointy roofs
    [-4.2, 9.6].forEach((x) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 3.4, 12), wallMat);
      t.position.set(x, 1.3, -14);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.1, 12), domeMat);
      roof.position.set(x, 3.55, -14);
      castle.add(t, roof);
    });
    this.scene.add(castle);

    // Golden portal gate with crown behind tile 100 (FINISH)
    const t100 = BoardManager.getTile(100);
    this.finishGroup.position.set(t100.x + 1.2, -0.4, -13.6);

    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.4, 0.9), wallMat);
    pillarL.position.set(-2.1, 1.7, 0);
    const pillarR = pillarL.clone();
    pillarR.position.x = 2.1;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.38, 14, 28, Math.PI), goldMat);
    arch.position.set(0, 3.4, 0);
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(1.75, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    glow.position.set(0, 2.9, 0.05);
    glow.scale.y = 1.55;
    this.portalGlow = glow;

    // Crown
    const crown = new THREE.Group();
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.45, 16, 1, true), goldMat);
    crown.add(band);
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 6), goldMat);
      const a = (i / 5) * Math.PI * 2;
      spike.position.set(Math.cos(a) * 0.7, 0.45, Math.sin(a) * 0.7);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3b6b }));
      gem.position.set(Math.cos(a) * 0.76, 0.05, Math.sin(a) * 0.76);
      crown.add(spike, gem);
    }
    crown.position.set(0, 6.1, 0);
    crown.name = 'crown';

    // Golden finish planet
    const goldPlanet = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 28, 28),
      new THREE.MeshStandardMaterial({ color: 0xffd43b, emissive: 0xff9500, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.18 })
    );
    goldPlanet.position.set(3.4, 5.2, 0.4);
    goldPlanet.name = 'goldPlanet';

    const portalLight = new THREE.PointLight(0xffe08a, 4, 14);
    portalLight.position.set(0, 3, 1.5);

    this.finishGroup.add(pillarL, pillarR, arch, glow, crown, goldPlanet, portalLight);
    this.scene.add(this.finishGroup);
  }

  private buildSnakesAndLadders() {
    SNAKES_AND_LADDERS.forEach((item) => {
      const sT = BoardManager.getTile(item.startTile);
      const eT = BoardManager.getTile(item.endTile);
      const startVec = new THREE.Vector3(sT.x, sT.y + 0.3, sT.z);
      const endVec = new THREE.Vector3(eT.x, eT.y + 0.3, eT.z);

      if (item.type === 'LADDER') {
        const mid = startVec.clone().lerp(endVec, 0.5);
        mid.y += 0.9;
        const curve = new THREE.CatmullRomCurve3([startVec, mid, endVec]);
        this.ladderCurves.set(item.id, curve);

        const dir = new THREE.Vector3().subVectors(endVec, startVec);
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(0.36);
        const leftCurve = new THREE.CatmullRomCurve3(curve.getPoints(24).map((p) => p.clone().add(perp)));
        const rightCurve = new THREE.CatmullRomCurve3(curve.getPoints(24).map((p) => p.clone().sub(perp)));

        const railMat = new THREE.MeshStandardMaterial({
          color: 0xffc23a,
          emissive: 0xff9500,
          emissiveIntensity: 0.35,
          metalness: 0.55,
          roughness: 0.3,
        });
        const l = new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 32, 0.08, 8, false), railMat);
        const r = new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 32, 0.08, 8, false), railMat);
        l.castShadow = true;
        r.castShadow = true;
        this.scene.add(l, r);

        // Rungs with a soft energy glow
        const rungMat = new THREE.MeshStandardMaterial({ color: 0xffe27a, emissive: 0x7fe7ff, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.3 });
        const len = startVec.distanceTo(endVec);
        const rungCount = Math.max(6, Math.round(len / 0.7));
        for (let i = 1; i < rungCount; i++) {
          const u = i / rungCount;
          const pL = leftCurve.getPoint(u);
          const pR = rightCurve.getPoint(u);
          const center = pL.clone().lerp(pR, 0.5);
          const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, pL.distanceTo(pR), 8), rungMat);
          rung.position.copy(center);
          rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pR.clone().sub(pL).normalize());
          rung.castShadow = true;
          this.scene.add(rung);
        }
      } else {
        const dir = new THREE.Vector3().subVectors(endVec, startVec);
        const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
        const p1 = startVec.clone().lerp(endVec, 0.22).addScaledVector(side, 1.1);
        const p2 = startVec.clone().lerp(endVec, 0.45).addScaledVector(side, -1.1);
        const p3 = startVec.clone().lerp(endVec, 0.7).addScaledVector(side, 1.0);
        const p4 = startVec.clone().lerp(endVec, 0.88).addScaledVector(side, -0.5);
        [p1, p2, p3, p4].forEach((p, i) => (p.y += 0.25 + (i % 2) * 0.15));

        const curve = new THREE.CatmullRomCurve3([startVec, p1, p2, p3, p4, endVec]);
        this.snakeCurves.set(item.id, curve);

        // Banded green body (vertex colors)
        const tubular = 80;
        const radial = 12;
        const bodyGeo = new THREE.TubeGeometry(curve, tubular, 0.22, radial, false);
        const cols = new Float32Array(bodyGeo.getAttribute('position').count * 3);
        const green = new THREE.Color(0x34c759);
        const lime = new THREE.Color(0xc6f432);
        const dark = new THREE.Color(0x1f8a3a);
        for (let i = 0; i < cols.length / 3; i++) {
          const seg = Math.floor(i / (radial + 1));
          const ring = i % (radial + 1);
          let c = seg % 6 < 3 ? green : dark;
          if (ring > radial * 0.35 && ring < radial * 0.65) c = lime; // belly stripe
          cols.set([c.r, c.g, c.b], i * 3);
        }
        bodyGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        const bodyMat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.35,
          metalness: 0.1,
          emissive: new THREE.Color(item.colorHex),
          emissiveIntensity: 0.08,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = true;
        this.scene.add(body);

        // Tail tip
        const tailDir = curve.getTangent(1);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x1f8a3a }));
        tail.position.copy(endVec).addScaledVector(tailDir, 0.28);
        tail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDir);
        this.scene.add(tail);

        // Cartoon head
        const head = new THREE.Group();
        const headMat = new THREE.MeshStandardMaterial({ color: 0x34c759, roughness: 0.3 });
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 16), headMat);
        skull.scale.set(1.05, 0.8, 1.35);
        skull.castShadow = true;
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9be15d, roughness: 0.4 }));
        snout.scale.set(1.1, 0.55, 1);
        snout.position.set(0, -0.08, 0.35);
        const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const pupil = new THREE.MeshBasicMaterial({ color: 0x111111 });
        [-1, 1].forEach((s) => {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), eyeWhite);
          e.position.set(s * 0.19, 0.25, 0.18);
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), pupil);
          p.position.set(s * 0.19, 0.27, 0.31);
          head.add(e, p);
        });
        const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.35), new THREE.MeshBasicMaterial({ color: 0xff3b5c }));
        tongue.position.set(0, -0.12, 0.65);
        head.add(skull, snout, tongue);

        const forward = startVec.clone().sub(p1).setY(0).normalize();
        head.position.copy(startVec).add(new THREE.Vector3(0, 0.3, 0));
        head.lookAt(head.position.clone().add(forward));
        head.userData.baseY = head.position.y;
        this.scene.add(head);
        this.snakeHeads.push(head);
      }
    });
  }

  public syncPlayers(players: Player[]) {
    const ids = new Set(players.map((p) => p.id));
    for (const [id, robot] of this.robots.entries()) {
      if (!ids.has(id)) {
        this.scene.remove(robot.root);
        this.robots.delete(id);
      }
    }
    players.forEach((player) => {
      const existing = this.robots.get(player.id);
      if (existing && existing.colorId !== player.robotColor) {
        this.scene.remove(existing.root);
        this.robots.delete(player.id);
      }
      if (!this.robots.get(player.id)) {
        const robot = new ChibiRobot3D(player.robotColor);
        robot.root.scale.setScalar(1.1);
        this.robots.set(player.id, robot);
        this.scene.add(robot.root);
      }
    });
    this.updateRobotPositionsInstant(players);
  }

  public updateRobotPositionsInstant(players: Player[]) {
    this.tileGlowRings.forEach((ring) => {
      (ring.material as THREE.MeshBasicMaterial).opacity = 0;
    });
    const byTile = new Map<number, Player[]>();
    players.forEach((p) => {
      const arr = byTile.get(p.position) || [];
      arr.push(p);
      byTile.set(p.position, arr);
    });
    players.forEach((player) => {
      const robot = this.robots.get(player.id);
      if (!robot) return;
      const tile = BoardManager.getTile(player.position);
      const group = byTile.get(player.position) || [player];
      const idx = group.findIndex((i) => i.id === player.id);
      const off = BoardManager.getRobotSlotOffset(idx, group.length);
      robot.root.position.set(tile.x + off.dx, tile.y + 0.18, tile.z + off.dz);
      robot.root.rotation.set(0, 0, 0);
      const ring = this.tileGlowRings.get(player.position);
      if (ring) (ring.material as THREE.MeshBasicMaterial).opacity = 0.9;
    });
  }

  public setRobotAnimation(playerId: number, state: RobotAnimState) {
    this.robots.get(playerId)?.setAnimationState(state);
  }

  public setAutoRotate(enabled: boolean) {
    this.cameraController.setAutoRotate(enabled);
  }

  public setCameraPreset(preset: CameraPreset, activePlayerId?: number) {
    if (preset === 'FOLLOW' && activePlayerId !== undefined) {
      const robot = this.robots.get(activePlayerId);
      if (robot) {
        this.cameraController.followObject(robot.root);
        return;
      }
    }
    this.cameraController.setPreset(preset, false);
  }

  public async animateRobotSteps(
    playerId: number,
    fromTile: number,
    toTile: number,
    onStepTileChange?: (currentTile: number) => void
  ): Promise<void> {
    const robot = this.robots.get(playerId);
    if (!robot || fromTile === toTile) return;
    const direction = toTile > fromTile ? 1 : -1;
    const total = Math.abs(toTile - fromTile);
    robot.setAnimationState(total >= 5 ? 'RUN' : 'WALK');

    for (let step = 1; step <= total; step++) {
      if (this.isDisposed) return;
      const a = BoardManager.getTile(fromTile + (step - 1) * direction);
      const b = BoardManager.getTile(fromTile + step * direction);
      const pStart = robot.root.position.clone();
      const pEnd = new THREE.Vector3(b.x, b.y + 0.18, b.z);
      if (step === 1) pStart.set(a.x, a.y + 0.18, a.z);
      robot.root.lookAt(pEnd.x, robot.root.position.y, pEnd.z);
      AudioManager.playRobotStep(step);
      await this.tweenVector(pStart, pEnd, total >= 5 ? 230 : 280, (pos, t) => {
        robot.root.position.set(pos.x, pos.y + Math.sin(t * Math.PI) * 0.4, pos.z);
      });
      this.animManager.spawnStarBurst(pEnd, '#7FE7FF', 10);
      onStepTileChange?.(fromTile + step * direction);
    }
    robot.setAnimationState('IDLE');
    robot.root.rotation.set(0, 0, 0);
  }

  public async animateSnakeOrLadder(playerId: number, slId: string, type: 'LADDER' | 'SNAKE'): Promise<void> {
    const robot = this.robots.get(playerId);
    if (!robot) return;
    const curve = type === 'LADDER' ? this.ladderCurves.get(slId) : this.snakeCurves.get(slId);
    if (!curve) return;

    if (type === 'LADDER') {
      robot.setAnimationState('JUMP');
      AudioManager.playLaserLadder();
    } else {
      robot.setAnimationState('SLIDE');
      AudioManager.playSnakeSlide();
    }
    this.animManager.spawnStarBurst(robot.root.position, type === 'LADDER' ? '#FFE27A' : '#9BE15D', 24);

    const duration = 1400;
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        if (this.isDisposed) return resolve();
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const p = curve.getPoint(eased);
        const ahead = curve.getPoint(Math.min(1, eased + 0.02));
        robot.root.position.set(p.x, p.y + 0.1, p.z);
        robot.root.lookAt(ahead.x, robot.root.position.y, ahead.z);
        if (Math.random() < 0.5) {
          this.animManager.spawnStarBurst(p, type === 'LADDER' ? '#7FE7FF' : '#FF5FC8', 4);
        }
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

    this.animManager.spawnStarBurst(robot.root.position, type === 'LADDER' ? '#FFD43B' : '#B07BFF', 36);
    robot.setAnimationState('IDLE');
    robot.root.rotation.set(0, 0, 0);
  }

  public triggerCelebrationBurst(playerId: number, colorHex: string = '#FDE047') {
    const robot = this.robots.get(playerId);
    if (robot) this.animManager.spawnStarBurst(robot.root.position, colorHex, 48);
  }

  private tweenVector(
    from: THREE.Vector3,
    to: THREE.Vector3,
    durationMs: number,
    onUpdate: (current: THREE.Vector3, progress: number) => void
  ): Promise<void> {
    const start = performance.now();
    const temp = new THREE.Vector3();
    return new Promise((resolve) => {
      const step = (now: number) => {
        if (this.isDisposed) return resolve();
        const p = Math.min(1, (now - start) / durationMs);
        temp.lerpVectors(from, to, p);
        onUpdate(temp, p);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  private startLoop = () => {
    const animate = () => {
      if (this.isDisposed) return;
      this.rafId = requestAnimationFrame(animate);
      const delta = Math.min(0.1, this.clock.getDelta());
      const t = this.clock.getElapsedTime();

      this.cameraController.update();
      this.animManager.update(delta);
      this.robots.forEach((r) => r.updateAnimation(t));

      this.questionFloaters.forEach((o, i) => {
        o.rotation.y = t * 2.2 + i;
        o.position.y = (o.userData.baseY as number) + Math.sin(t * 3 + i) * 0.12;
      });
      this.snakeHeads.forEach((h, i) => {
        h.position.y = (h.userData.baseY as number) + Math.sin(t * 2.5 + i) * 0.06;
      });

      this.startPlanetGroup.rotation.y = t * 0.7;
      this.startPlanetGroup.position.y = 3.2 + Math.sin(t * 1.5) * 0.2;
      const crown = this.finishGroup.getObjectByName('crown');
      if (crown) {
        crown.rotation.y = t * 0.9;
        crown.position.y = 6.1 + Math.sin(t * 2) * 0.15;
      }
      const gp = this.finishGroup.getObjectByName('goldPlanet');
      if (gp) gp.rotation.y = t;
      if (this.portalGlow) {
        (this.portalGlow.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(t * 3) * 0.15;
      }

      this.ringedPlanetGroup.rotation.y = t * 0.2;
      this.blackHoleGroup.rotation.z = t * 0.9;
      this.warpPortalGroup.rotation.z = -t * 1.4;
      this.asteroidBeltGroup.rotation.y = t * 0.05;
      if (this.sparkles) this.sparkles.rotation.y = t * 0.01;

      const sa = t * 0.35;
      this.orbitingSpaceship.position.set(Math.cos(sa) * 23, 9 + Math.sin(t * 1.5) * 1.2, Math.sin(sa) * 23);
      this.orbitingSpaceship.lookAt(Math.cos(sa + 0.1) * 23, this.orbitingSpaceship.position.y, Math.sin(sa + 0.1) * 23);

      const ta = -t * 0.25;
      this.orbitingSatellite.position.set(Math.cos(ta) * 26, 13 + Math.cos(t * 1.2), Math.sin(ta) * 26);
      this.orbitingSatellite.rotation.y = ta * 2;

      const ca = t * 0.25;
      this.cometGroup.position.set(Math.sin(ca) * 30, 18 + Math.cos(ca) * 2, -26 + Math.cos(ca) * 6);

      this.shootingMeteors.forEach((m, i) => {
        m.mesh.position.addScaledVector(m.velocity, delta);
        if (m.mesh.position.x < -40 || m.mesh.position.y < -8) m.mesh.position.set(36 + i * 8, 20 + i * 4, -26 - i * 4);
      });

      this.renderer.render(this.scene, this.cameraController.camera);
    };
    animate();
  };

  private handleResize = () => {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.cameraController.camera.aspect = w / h;
    this.cameraController.camera.updateProjectionMatrix();
    this.cameraController.onResize();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.cameraController.dispose();
    this.animManager.dispose();
    this.renderer.dispose();
  }
}
