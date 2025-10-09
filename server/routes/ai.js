const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const GENERATED_DIR = path.join(__dirname, '../../data/generated');

// Ensure directory exists
fs.mkdir(GENERATED_DIR, { recursive: true }).catch(console.error);

// Text-to-image generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt, width, height, style, seed, steps, guidance } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating image for prompt:', prompt);

    // Call Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/generate`, {
      prompt,
      width: width || 512,
      height: height || 512,
      style: style || 'realistic',
      seed: seed || Math.floor(Math.random() * 1000000),
      num_inference_steps: steps || 50,
      guidance_scale: guidance || 7.5
    }, {
      timeout: 120000 // 2 minutes
    });

    const generationId = uuidv4();
    const result = {
      id: generationId,
      prompt,
      imageUrl: response.data.image_url,
      imageBase64: response.data.image_base64,
      seed: response.data.seed,
      timestamp: new Date().toISOString()
    };

    // Save generation metadata
    await fs.writeFile(
      path.join(GENERATED_DIR, `${generationId}.json`),
      JSON.stringify(result, null, 2)
    );

    res.json(result);
  } catch (error) {
    console.error('Error generating image:', error.message);
    
    // Return mock data for development if AI service is not available
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('AI service unavailable, returning mock data');
      res.json({
        id: uuidv4(),
        prompt: req.body.prompt,
        imageUrl: '/assets/mock-generated.png',
        imageBase64: null,
        seed: 12345,
        timestamp: new Date().toISOString(),
        mock: true
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate image',
        details: error.message 
      });
    }
  }
});

// Inpainting - regenerate specific layer
router.post('/inpaint', async (req, res) => {
  try {
    const { imageBase64, maskBase64, prompt } = req.body;

    if (!imageBase64 || !maskBase64 || !prompt) {
      return res.status(400).json({ 
        error: 'imageBase64, maskBase64, and prompt are required' 
      });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/inpaint`, {
      image: imageBase64,
      mask: maskBase64,
      prompt
    }, {
      timeout: 120000
    });

    res.json({
      id: uuidv4(),
      imageUrl: response.data.image_url,
      imageBase64: response.data.image_base64,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error inpainting:', error.message);
    res.status(500).json({ 
      error: 'Failed to inpaint image',
      details: error.message 
    });
  }
});

// Image variation
router.post('/variation', async (req, res) => {
  try {
    const { imageBase64, prompt, strength } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/variation`, {
      image: imageBase64,
      prompt: prompt || '',
      strength: strength || 0.75
    }, {
      timeout: 120000
    });

    res.json({
      id: uuidv4(),
      imageUrl: response.data.image_url,
      imageBase64: response.data.image_base64,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating variation:', error.message);
    res.status(500).json({ 
      error: 'Failed to create variation',
      details: error.message 
    });
  }
});

module.exports = router;
