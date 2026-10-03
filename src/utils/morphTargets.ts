import * as THREE from 'three';

// Generates points for a heart shape
export function getHeartTargets(count: number, scale = 0.2): Float32Array {
  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Distribute parameter t along the curve, with some random jitter
    const t = Math.PI * 2 * (i / count) + (Math.random() - 0.5) * 0.1;
    // Heart parametric equation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    // Add slight random volume
    const rScale = scale * (0.95 + Math.random() * 0.1);
    targets[i * 3] = x * rScale;
    targets[i * 3 + 1] = (y * rScale) + 0.5; // shift up slightly
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // slight Z depth
  }
  return targets;
}

// Generates points for a birthday cake silhouette
export function getCakeTargets(count: number, scale = 0.8): Float32Array {
  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x = 0, y = 0;

    // Distribute points into different parts of the cake
    if (r < 0.4) {
      // Base layer
      x = (Math.random() - 0.5) * 4;
      y = -1 + (Math.random() - 0.5) * 1.5;
    } else if (r < 0.7) {
      // Middle layer
      x = (Math.random() - 0.5) * 3.2;
      y = 0.5 + (Math.random() - 0.5) * 1.2;
    } else if (r < 0.9) {
      // Top layer
      x = (Math.random() - 0.5) * 2.4;
      y = 1.8 + (Math.random() - 0.5) * 1.0;
    } else if (r < 0.97) {
      // Candle body
      x = (Math.random() - 0.5) * 0.2;
      y = 3.0 + (Math.random() - 0.5) * 1.0;
    } else {
      // Flame
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.3;
      x = Math.cos(angle) * radius;
      y = 4.0 + Math.sin(angle) * radius * 1.5; // oval flame
    }

    targets[i * 3] = x * scale;
    targets[i * 3 + 1] = y * scale;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return targets;
}

// Generates points for text by drawing to an offscreen canvas
export function getTextTargets(
  text: string,
  count: number,
  font = 'bold 100px "Outfit", "Inter", sans-serif'
): Float32Array {
  const targets = new Float32Array(count * 3);
  
  // Fallback if canvas not supported (e.g., node env)
  if (typeof document === 'undefined') {
    return new Float32Array(count * 3); 
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Float32Array(count * 3);

  // Set canvas size large enough to fit the text
  canvas.width = 800;
  canvas.height = 300;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = font;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imgData.data;

  // Collect all lit pixels
  const validPixels: { x: number; y: number }[] = [];
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const idx = (y * canvas.width + x) * 4;
      // If red channel > 128, it's part of the text
      if (pixels[idx] > 128) {
        validPixels.push({ x, y });
      }
    }
  }

  if (validPixels.length === 0) {
    return new Float32Array(count * 3); // Fallback if text didn't render
  }

  // Sample from valid pixels to fill the required count
  for (let i = 0; i < count; i++) {
    const px = validPixels[Math.floor(Math.random() * validPixels.length)];
    
    // Convert canvas coords to centered WebGL coords
    // Canvas origin is top-left, WebGL origin is center
    const nx = (px.x / canvas.width) * 2 - 1;
    const ny = -(px.y / canvas.height) * 2 + 1; // flip Y
    
    // Scale factors to make the text fit nicely
    const aspect = canvas.width / canvas.height;
    const scale = 5.0; 

    // Add slight jitter
    const jitter = 0.02;
    targets[i * 3] = (nx * aspect * scale) + (Math.random() - 0.5) * jitter;
    targets[i * 3 + 1] = (ny * scale) + (Math.random() - 0.5) * jitter;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
  }

  return targets;
}
