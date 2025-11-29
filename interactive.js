const HEX_SIZE = 26;
const ACTIVE_RADIUS = 200;
let overlay;
let hexCells = [];
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let rafId;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'hex-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
}

function buildHexGrid() {
  if (!overlay) return;
  overlay.innerHTML = '';
  hexCells = [];

  const hexHeight = Math.sqrt(3) * HEX_SIZE;
  const horizontalSpacing = HEX_SIZE * 1.5;
  const verticalSpacing = hexHeight;
  const columns = Math.ceil(window.innerWidth / horizontalSpacing) + 2;
  const rows = Math.ceil(window.innerHeight / verticalSpacing) + 2;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const offsetY = col % 2 === 0 ? 0 : hexHeight / 2;
      const x = col * horizontalSpacing - HEX_SIZE;
      const y = row * verticalSpacing + offsetY - HEX_SIZE;
      const centerX = x + HEX_SIZE;
      const centerY = y + hexHeight / 2;

      const cell = document.createElement('span');
      cell.className = 'hex-cell';
      cell.style.setProperty('--x', `${x}px`);
      cell.style.setProperty('--y', `${y}px`);
      cell.style.setProperty('--size', `${HEX_SIZE}px`);

      overlay.appendChild(cell);
      hexCells.push({ el: cell, x: centerX, y: centerY, active: false });
    }
  }
}

function updateCells() {
  rafId = null;
  const radius = ACTIVE_RADIUS;
  const radiusSq = radius * radius;

  for (const cell of hexCells) {
    const dx = pointer.x - cell.x;
    const dy = pointer.y - cell.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= radiusSq) {
      const intensity = 1 - Math.sqrt(distanceSq) / radius;
      cell.el.style.setProperty('--pulse', intensity.toFixed(3));
      if (!cell.active) {
        cell.active = true;
        cell.el.style.animationDelay = `${Math.random() * 0.25}s`;
        cell.el.classList.add('is-active');
      }
    } else if (cell.active) {
      cell.active = false;
      cell.el.classList.remove('is-active');
      cell.el.style.removeProperty('--pulse');
    }
  }
}

function scheduleUpdate() {
  if (!rafId) {
    rafId = requestAnimationFrame(updateCells);
  }
}

function handleMouseMove(event) {
  pointer = { x: event.clientX, y: event.clientY };
  scheduleUpdate();
}

function handleMouseLeave() {
  pointer = { x: -ACTIVE_RADIUS, y: -ACTIVE_RADIUS };
  scheduleUpdate();
}

function initInteractiveBackground() {
  createOverlay();
  buildHexGrid();
  scheduleUpdate();

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('resize', () => {
    buildHexGrid();
    scheduleUpdate();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractiveBackground);
} else {
  initInteractiveBackground();
}
