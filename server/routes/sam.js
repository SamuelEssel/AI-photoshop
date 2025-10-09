const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

// Segment image using SAM
router.post('/segment', async (req, res) => {
  try {
    const { imageBase64, imageUrl, points, labels, threshold } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ 
        error: 'Either imageBase64 or imageUrl is required' 
      });
    }

    console.log('Segmenting image with SAM...');

    const response = await axios.post(`${AI_SERVICE_URL}/sam/segment`, {
      image: imageBase64,
      image_url: imageUrl,
      points: points || null,
      labels: labels || null,
      threshold: threshold || 0.5
    }, {
      timeout: 60000 // 1 minute
    });

    // Transform SAM output to layer-ready format
    const masks = response.data.masks.map((mask, index) => ({
      id: uuidv4(),
      maskId: `mask_${index}`,
      maskBase64: mask.mask_base64,
      polygonSvg: mask.polygon_svg || null,
      boundingBox: mask.bbox,
      confidence: mask.confidence || 1.0,
      area: mask.area,
      label: mask.predicted_label || `Object ${index + 1}`,
      suggested_color: mask.color || null
    }));

    res.json({
      masks,
      timestamp: new Date().toISOString(),
      imageWidth: response.data.width,
      imageHeight: response.data.height
    });

  } catch (error) {
    console.error('Error segmenting with SAM:', error.message);
    
    // Return mock data if AI service unavailable
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('SAM service unavailable, returning mock masks');
      res.json({
        masks: [
          {
            id: uuidv4(),
            maskId: 'mask_0',
            maskBase64: null,
            polygonSvg: null,
            boundingBox: { x: 100, y: 100, width: 200, height: 200 },
            confidence: 0.95,
            area: 40000,
            label: 'Main Object',
            suggested_color: '#FF5733'
          },
          {
            id: uuidv4(),
            maskId: 'mask_1',
            maskBase64: null,
            polygonSvg: null,
            boundingBox: { x: 50, y: 50, width: 300, height: 300 },
            confidence: 0.88,
            area: 90000,
            label: 'Background',
            suggested_color: '#33C3FF'
          }
        ],
        timestamp: new Date().toISOString(),
        imageWidth: 512,
        imageHeight: 512,
        mock: true
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to segment image',
        details: error.message 
      });
    }
  }
});

// Auto-segment (segment everything in image)
router.post('/auto-segment', async (req, res) => {
  try {
    const { imageBase64, minConfidence } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/sam/auto-segment`, {
      image: imageBase64,
      min_confidence: minConfidence || 0.7
    }, {
      timeout: 90000
    });

    const masks = response.data.masks.map((mask, index) => ({
      id: uuidv4(),
      maskId: `mask_${index}`,
      maskBase64: mask.mask_base64,
      polygonSvg: mask.polygon_svg,
      boundingBox: mask.bbox,
      confidence: mask.confidence,
      area: mask.area,
      label: mask.predicted_label || `Layer ${index + 1}`
    }));

    res.json({ masks });
  } catch (error) {
    console.error('Error auto-segmenting:', error.message);
    res.status(500).json({ 
      error: 'Failed to auto-segment image',
      details: error.message 
    });
  }
});

// Refine mask with additional points
router.post('/refine-mask', async (req, res) => {
  try {
    const { imageBase64, existingMask, points, labels } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/sam/refine`, {
      image: imageBase64,
      mask: existingMask,
      points,
      labels
    });

    res.json({
      maskBase64: response.data.mask_base64,
      polygonSvg: response.data.polygon_svg
    });
  } catch (error) {
    console.error('Error refining mask:', error.message);
    res.status(500).json({ 
      error: 'Failed to refine mask',
      details: error.message 
    });
  }
});

module.exports = router;
