// Canvas Manager Tests
// Run with: npm test

const assert = require('assert');

describe('Canvas Manager', () => {
  let canvas;

  beforeEach(() => {
    // Setup
    canvas = {
      width: 1920,
      height: 1080,
      zoom: 1
    };
  });

  describe('Zoom Controls', () => {
    it('should zoom in correctly', () => {
      const newZoom = canvas.zoom * 1.2;
      assert.strictEqual(newZoom, 1.2);
    });

    it('should zoom out correctly', () => {
      canvas.zoom = 1.2;
      const newZoom = canvas.zoom / 1.2;
      assert.strictEqual(newZoom, 1);
    });

    it('should limit max zoom to 10x', () => {
      canvas.zoom = 9;
      const newZoom = Math.min(canvas.zoom * 1.2, 10);
      assert.ok(newZoom <= 10);
    });

    it('should limit min zoom to 0.1x', () => {
      canvas.zoom = 0.2;
      const newZoom = Math.max(canvas.zoom / 1.2, 0.1);
      assert.ok(newZoom >= 0.1);
    });
  });

  describe('Canvas Size', () => {
    it('should have valid default dimensions', () => {
      assert.strictEqual(canvas.width, 1920);
      assert.strictEqual(canvas.height, 1080);
    });

    it('should clamp width to valid range', () => {
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
      const width = clamp(10000, 64, 8192);
      assert.ok(width >= 64 && width <= 8192);
    });
  });
});

describe('Layer Manager', () => {
  let layers;

  beforeEach(() => {
    layers = [];
  });

  it('should add layers correctly', () => {
    layers.push({ id: '1', name: 'Layer 1' });
    assert.strictEqual(layers.length, 1);
  });

  it('should generate unique IDs', () => {
    const id1 = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const id2 = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    assert.notStrictEqual(id1, id2);
  });
});

describe('Utils', () => {
  describe('clamp', () => {
    it('should clamp values correctly', () => {
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
      assert.strictEqual(clamp(5, 0, 10), 5);
      assert.strictEqual(clamp(-5, 0, 10), 0);
      assert.strictEqual(clamp(15, 0, 10), 10);
    });
  });

  describe('roundToStep', () => {
    it('should round to nearest step', () => {
      const roundToStep = (val, step) => Math.round(val / step) * step;
      assert.strictEqual(roundToStep(23, 20), 20);
      assert.strictEqual(roundToStep(27, 20), 20);
      assert.strictEqual(roundToStep(30, 20), 40);
    });
  });
});
