import * as THREE from 'three';

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
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
}

/**
 * Creates a high quality procedural turf texture with alternating stripes and grass grain
 */
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const stripeCount = 14;
  const stripeHeight = canvas.height / stripeCount;

  for (let i = 0; i < stripeCount; i++) {
    const isEven = i % 2 === 0;
    // Rich, vibrant, broadcast-quality green turf shades
    ctx.fillStyle = isEven ? '#238a44' : '#2ba452';
    ctx.fillRect(0, i * stripeHeight, canvas.width, stripeHeight);

    // Subtle fine turf blade noise
    for (let j = 0; j < 4000; j++) {
      const nx = Math.random() * canvas.width;
      const ny = i * stripeHeight + Math.random() * stripeHeight;
      ctx.fillStyle = isEven ? 'rgba(25, 110, 50, 0.4)' : 'rgba(45, 175, 85, 0.4)';
      ctx.fillRect(nx, ny, 1 + Math.random() * 2, 2 + Math.random() * 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates an authentic soccer ball texture with black pentagons and white hexagons
 */
export function createSoccerBallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base off-white leather
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Black panels pattern
  ctx.fillStyle = '#0f172a';
  const pentagons = [
    { x: 64, y: 64, r: 24 },
    { x: 192, y: 64, r: 24 },
    { x: 320, y: 64, r: 24 },
    { x: 448, y: 64, r: 24 },
    { x: 128, y: 192, r: 24 },
    { x: 256, y: 192, r: 24 },
    { x: 384, y: 192, r: 24 },
  ];

  for (const p of pentagons) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = p.x + p.r * Math.cos(angle);
      const y = p.y + p.r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Subtle trim
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Seam lines
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 32, canvas.height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates an LED advertising board texture with glowing StatsBomb & match info
 */
export function createLedBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Dark LED background
  ctx.fillStyle = '#050811';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative border lines
  ctx.fillStyle = '#10b981';
  ctx.fillRect(0, 0, canvas.width, 4);
  ctx.fillRect(0, canvas.height - 4, canvas.width, 4);

  // LED Sponsors / Logos
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const items = [
    { text: 'STATSBOMB 360', color: '#10b981', x: 150 },
    { text: 'FIFA WORLD CUP', color: '#e2e8f0', x: 400 },
    { text: 'ADVANCED METRICS', color: '#38bdf8', x: 650 },
    { text: 'EXPECTED GOALS [xG]', color: '#f59e0b', x: 900 }
  ];

  for (const item of items) {
    ctx.fillStyle = item.color;
    ctx.fillText(item.text, item.x, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(4, 1);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates dynamic text sprite for player names and numbers
 */
export function createPlayerNameSprite(
  name: string,
  jerseyNumber: number | string | undefined,
  isHome: boolean
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  // Pill badge background
  const pillX = 20;
  const pillY = 16;
  const pillW = canvas.width - 40;
  const pillH = 64;
  const radius = 32;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, radius);
  ctx.fill();

  // Border colored by team
  ctx.lineWidth = 3;
  ctx.strokeStyle = isHome ? '#38bdf8' : '#f43f5e';
  ctx.stroke();

  // Number badge inside pill
  const numRadius = 22;
  const numCx = pillX + 32;
  const numCy = pillY + pillH / 2;
  ctx.fillStyle = isHome ? '#0284c7' : '#e11d48';
  ctx.beginPath();
  ctx.arc(numCx, numCy, numRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(jerseyNumber || '-'), numCx, numCy);

  // Player name text
  ctx.textAlign = 'left';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';

  // Shorten overly long names
  let displayName = name;
  if (displayName.length > 15) {
    const parts = displayName.split(' ');
    displayName = parts[parts.length - 1]; // Use last name
    if (displayName.length > 15) displayName = displayName.substring(0, 14) + '…';
  }
  ctx.fillText(displayName, numCx + numRadius + 12, numCy);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 1.5, 1);
  return sprite;
}
