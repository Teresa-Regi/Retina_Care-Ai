import { DRGrade } from '../types/screening';

export function generateRealisticFundusImage(grade: DRGrade, size = 600): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const center = size / 2;
  const radius = size * 0.46;

  // 1. Black outer camera border
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, size, size);

  // 2. Circular Fundus aperture clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();

  // 3. Retinal Background gradient (Choroid + RPE)
  const fundusGrad = ctx.createRadialGradient(
    center - size * 0.05, center - size * 0.05, size * 0.05,
    center, center, radius
  );
  fundusGrad.addColorStop(0, '#d95a28'); // warm orange-red
  fundusGrad.addColorStop(0.5, '#b83b14'); // rich retinal red
  fundusGrad.addColorStop(0.85, '#841f0b'); // deep peripheral choroid
  fundusGrad.addColorStop(1, '#3b0a03'); // edge darkening
  ctx.fillStyle = fundusGrad;
  ctx.fillRect(0, 0, size, size);

  // 4. Subtle retinal granular texture
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.6));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.3));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 5. Optic Disc (Nasal side: x ~ 0.32 * size, y ~ 0.5 * size for OD eye)
  const discX = size * 0.32;
  const discY = size * 0.50;
  const discR = size * 0.085;

  const discGrad = ctx.createRadialGradient(discX, discY, discR * 0.2, discX, discY, discR);
  discGrad.addColorStop(0, '#fff4cc'); // pale physiological cup
  discGrad.addColorStop(0.45, '#ffd28a'); // central disc
  discGrad.addColorStop(0.85, '#f59e53'); // neuroretinal rim
  discGrad.addColorStop(1, '#c2581f'); // border margin

  ctx.beginPath();
  ctx.ellipse(discX, discY, discR * 0.95, discR * 1.05, 0.05, 0, Math.PI * 2);
  ctx.fillStyle = discGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 6. Macula Lutea & Fovea Centralis (Temporal side: x ~ 0.64 * size, y ~ 0.51 * size)
  const maculaX = size * 0.64;
  const maculaY = size * 0.51;
  const maculaR = size * 0.11;

  const maculaGrad = ctx.createRadialGradient(maculaX, maculaY, maculaR * 0.1, maculaX, maculaY, maculaR);
  maculaGrad.addColorStop(0, '#4a1207'); // dark foveal depression
  maculaGrad.addColorStop(0.4, '#731e0c'); // fovea
  maculaGrad.addColorStop(0.8, '#9c2f14'); // parafovea
  maculaGrad.addColorStop(1, 'rgba(184, 59, 20, 0)'); // blend with retina

  ctx.beginPath();
  ctx.arc(maculaX, maculaY, maculaR, 0, Math.PI * 2);
  ctx.fillStyle = maculaGrad;
  ctx.fill();

  // Foveal pinpoint reflex
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 240, 200, 0.55)';
  ctx.fill();

  // 7. Retinal Blood Vessels (Superior/Inferior Arcade Arcuate branches)
  const drawVessel = (
    pts: [number, number][],
    width: number,
    color = '#450a0a',
    isArtery = false
  ) => {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2;
      const yc = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (isArtery && width > 2.5) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2;
        const yc = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
      }
      ctx.lineTo(last[0], last[1]);
      ctx.strokeStyle = 'rgba(255, 210, 200, 0.35)';
      ctx.lineWidth = width * 0.3;
      ctx.stroke();
    }
  };

  // Superior temporal arcade (vein & artery)
  drawVessel([
    [discX + 2, discY - 10],
    [discX + 20, discY - 70],
    [discX + 70, discY - 140],
    [maculaX - 30, discY - 170],
    [maculaX + 60, discY - 165],
    [maculaX + 130, discY - 120],
  ], 5.5, '#420606');

  drawVessel([
    [discX + 5, discY - 15],
    [discX + 30, discY - 80],
    [discX + 85, discY - 145],
    [maculaX - 10, discY - 160],
    [maculaX + 75, discY - 150],
    [maculaX + 120, discY - 100],
  ], 3.5, '#7f1313', true);

  // Inferior temporal arcade (vein & artery)
  drawVessel([
    [discX + 4, discY + 12],
    [discX + 25, discY + 75],
    [discX + 75, discY + 145],
    [maculaX - 25, discY + 175],
    [maculaX + 65, discY + 165],
    [maculaX + 125, discY + 115],
  ], 5.8, '#420606');

  drawVessel([
    [discX + 8, discY + 16],
    [discX + 35, discY + 82],
    [discX + 90, discY + 140],
    [maculaX - 5, discY + 160],
    [maculaX + 80, discY + 145],
    [maculaX + 120, discY + 95],
  ], 3.6, '#7f1313', true);

  // Nasal branches
  drawVessel([
    [discX - 8, discY - 8],
    [discX - 45, discY - 60],
    [discX - 95, discY - 105],
    [discX - 130, discY - 125],
  ], 4.2, '#480808');

  drawVessel([
    [discX - 10, discY + 8],
    [discX - 50, discY + 65],
    [discX - 98, discY + 110],
    [discX - 135, discY + 130],
  ], 4.0, '#480808');

  // Smaller vessel branches towards macula / fovea
  drawVessel([
    [discX + 80, discY - 130],
    [maculaX - 20, maculaY - 35],
    [maculaX - 5, maculaY - 15],
  ], 1.8, '#631010');

  drawVessel([
    [discX + 85, discY + 130],
    [maculaX - 18, maculaY + 35],
    [maculaX - 5, maculaY + 15],
  ], 1.8, '#631010');

  // 8. PATHOLOGY INJECTION BASED ON DR GRADE
  // Helper to draw a microaneurysm (tiny sharp deep-red round dot)
  const drawMicroaneurysm = (x: number, y: number, r = 2.2) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#4a0303';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 0.4, y - 0.4, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#800c0c';
    ctx.fill();
  };

  // Helper to draw blot/flame hemorrhage
  const drawHemorrhage = (x: number, y: number, rx: number, ry: number, angle = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3d0202';
    ctx.shadowColor = 'rgba(70, 0, 0, 0.4)';
    ctx.shadowBlur = 3;
    ctx.fill();
    ctx.restore();
  };

  // Helper to draw hard exudates (bright yellow-white waxy lipid deposits)
  const drawHardExudate = (x: number, y: number, r = 2.5) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff494';
    ctx.shadowColor = 'rgba(255, 230, 100, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Helper to draw cotton wool spots (soft fluffy white ischemic patches)
  const drawCottonWoolSpot = (x: number, y: number, rx: number, ry: number) => {
    const cwGrad = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
    cwGrad.addColorStop(0, 'rgba(255, 255, 245, 0.85)');
    cwGrad.addColorStop(0.5, 'rgba(240, 240, 220, 0.6)');
    cwGrad.addColorStop(1, 'rgba(240, 240, 220, 0)');
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = cwGrad;
    ctx.fill();
  };

  if (grade === 1) {
    // Grade 1: Mild NPDR - Microaneurysms only (isolated small red dots in perimacular area)
    const maPositions = [
      [maculaX - 35, maculaY - 30],
      [maculaX + 30, maculaY - 45],
      [maculaX + 45, maculaY + 25],
      [maculaX - 15, maculaY + 40],
      [maculaX + 70, maculaY - 10],
    ];
    maPositions.forEach(([x, y]) => drawMicroaneurysm(x, y, 2.4));
  } else if (grade === 2) {
    // Grade 2: Moderate NPDR - Multiple microaneurysms, blot hemorrhages, circinate hard exudates
    // Microaneurysms
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 35 + (i % 4) * 20;
      drawMicroaneurysm(maculaX + Math.cos(angle) * dist, maculaY + Math.sin(angle) * dist, 2.2);
    }
    // Blot hemorrhages
    drawHemorrhage(maculaX - 50, maculaY + 30, 6, 4, 0.4);
    drawHemorrhage(maculaX + 60, maculaY - 35, 7, 5, -0.3);
    drawHemorrhage(discX + 60, discY - 60, 8, 4.5, 0.7);
    drawHemorrhage(maculaX + 80, maculaY + 45, 5, 4, 0.1);

    // Hard exudate ring/cluster (circinate pattern)
    for (let i = 0; i < 22; i++) {
      const angle = 0.2 + (i / 22) * 2.8;
      const rDist = 55 + Math.sin(i * 1.7) * 14;
      drawHardExudate(maculaX + Math.cos(angle) * rDist, maculaY + Math.sin(angle) * rDist, 1.8 + (i % 3) * 0.9);
    }
  } else if (grade === 3) {
    // Grade 3: Severe NPDR (4-2-1 Rule: >20 hemorrhages in 4 quadrants, venous beading, cotton wool spots)
    // Extensive hemorrhages in all 4 quadrants
    const hemList: [number, number, number, number, number][] = [
      // Superior Temporal
      [maculaX + 30, maculaY - 110, 11, 6, 0.5],
      [maculaX + 75, maculaY - 95, 9, 6, -0.4],
      [discX + 50, discY - 100, 12, 7, 0.8],
      // Inferior Temporal
      [maculaX + 20, maculaY + 115, 10, 6, -0.6],
      [maculaX + 85, maculaY + 100, 12, 8, 0.3],
      [discX + 60, discY + 110, 10, 5, -0.7],
      // Nasal Quadrants
      [discX - 60, discY - 70, 9, 5, 0.2],
      [discX - 80, discY - 40, 11, 6, -0.5],
      [discX - 70, discY + 60, 10, 6, 0.6],
      [discX - 90, discY + 30, 8, 5, -0.2],
      // Central / Perimacular
      [maculaX - 45, maculaY - 35, 7, 5, 0.1],
      [maculaX + 45, maculaY + 40, 8, 5, 0.4],
      [maculaX - 25, maculaY + 50, 9, 5, -0.3],
      [maculaX + 55, maculaY - 20, 7, 4, 0.7],
    ];
    hemList.forEach(([x, y, rx, ry, a]) => drawHemorrhage(x, y, rx, ry, a));

    // Multiple microaneurysms
    for (let i = 0; i < 30; i++) {
      const rx = center + (Math.random() - 0.5) * size * 0.6;
      const ry = center + (Math.random() - 0.5) * size * 0.6;
      drawMicroaneurysm(rx, ry, 2.5);
    }

    // Cotton wool spots
    drawCottonWoolSpot(discX + 65, discY - 70, 16, 12);
    drawCottonWoolSpot(maculaX + 40, maculaY - 70, 14, 10);
    drawCottonWoolSpot(maculaX - 35, maculaY + 70, 18, 11);

    // Venous Beading (simulated with beaded segments along arcade)
    for (let b = 0; b < 6; b++) {
      ctx.beginPath();
      ctx.arc(discX + 35 + b * 11, discY - 75 - b * 11, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#3a0202';
      ctx.fill();
    }
  } else if (grade === 4) {
    // Grade 4: Proliferative DR (PDR) - Neovascularization (NVD / NVE), Vitreous/Preretinal Hemorrhage, Fibrous proliferation
    // Dense background hemorrhages
    for (let i = 0; i < 25; i++) {
      const hx = center + (Math.random() - 0.5) * size * 0.65;
      const hy = center + (Math.random() - 0.5) * size * 0.65;
      drawHemorrhage(hx, hy, 7 + (i % 5), 4 + (i % 3), Math.random() * Math.PI);
    }

    // Cotton wool spots
    drawCottonWoolSpot(maculaX + 20, maculaY - 80, 20, 14);
    drawCottonWoolSpot(discX - 30, discY - 60, 16, 12);

    // Neovascularization of Disc (NVD): tangled fine fronds of tortuous abnormal vessels emerging from optic disc
    ctx.strokeStyle = '#6e0707';
    ctx.lineWidth = 1.4;
    for (let n = 0; n < 16; n++) {
      ctx.beginPath();
      ctx.moveTo(discX, discY);
      let nx = discX;
      let ny = discY;
      for (let s = 0; s < 5; s++) {
        nx += (Math.random() - 0.4) * 14;
        ny += (Math.random() - 0.5) * 14;
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();
    }

    // Neovascularization Elsewhere (NVE) near arcade
    const nveX = maculaX + 15;
    const nveY = discY - 145;
    for (let n = 0; n < 12; n++) {
      ctx.beginPath();
      ctx.moveTo(nveX, nveY);
      let nx = nveX;
      let ny = nveY;
      for (let s = 0; s < 4; s++) {
        nx += (Math.random() - 0.5) * 12;
        ny += (Math.random() - 0.4) * 12;
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();
    }

    // Large Preretinal / Vitreous Hemorrhage (boat-shaped gravity fluid level)
    ctx.beginPath();
    const vhX = maculaX - 10;
    const vhY = maculaY + 60;
    ctx.moveTo(vhX - 45, vhY);
    ctx.lineTo(vhX + 45, vhY); // flat horizontal upper meniscus
    ctx.arc(vhX, vhY, 45, 0, Math.PI, false); // rounded inferior pole
    ctx.closePath();
    ctx.fillStyle = '#2b0101';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fibrous proliferative membrane sheen
    const fibroGrad = ctx.createLinearGradient(discX - 10, discY - 20, discX + 40, discY + 40);
    fibroGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    fibroGrad.addColorStop(0.5, 'rgba(240, 240, 255, 0.15)');
    fibroGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.ellipse(discX + 15, discY + 5, 35, 22, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = fibroGrad;
    ctx.fill();
  }

  // 9. Camera vignette & lens glare
  const vignette = ctx.createRadialGradient(center, center, radius * 0.75, center, center, radius);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.85, 'rgba(0, 0, 0, 0.35)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  ctx.restore();

  // Draw gold/cyan reticle ring border for medical feel
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.92);
}
