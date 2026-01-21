const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload asset
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const asset = {
      id: uuidv4(),
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/data/uploads/${req.file.filename}`,
      projectId: req.body.projectId || null,
      uploadedAt: new Date().toISOString()
    };

    res.json(asset);
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Upload multiple assets
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const assets = req.files.map(file => ({
      id: uuidv4(),
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/data/uploads/${file.filename}`,
      projectId: req.body.projectId || null,
      uploadedAt: new Date().toISOString()
    }));

    res.json({ assets });
  } catch (error) {
    console.error('Error uploading assets:', error);
    res.status(500).json({ error: 'Failed to upload assets' });
  }
});

// Proxy external image to avoid CORS issues (MUST be before /:id route)
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('🔄 Proxying image:', url);

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'Accept': 'image/*'
      }
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(response.data).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log('✅ Image proxied successfully, size:', base64.length, 'chars');

    res.json({ 
      dataUrl,
      contentType,
      size: response.data.length
    });
  } catch (error) {
    console.error('❌ Error proxying image:', error.message);
    res.status(500).json({ 
      error: 'Failed to proxy image',
      details: error.message 
    });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const filePath = path.join(UPLOAD_DIR, req.params.id);
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).json({ error: 'Asset not found' });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const filePath = path.join(UPLOAD_DIR, req.params.id);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

module.exports = router;
