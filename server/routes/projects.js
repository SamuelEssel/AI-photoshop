const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// In-memory storage (replace with database in production)
const projects = new Map();
const PROJECTS_DIR = path.join(__dirname, '../../data/projects');

// Ensure projects directory exists
fs.mkdir(PROJECTS_DIR, { recursive: true }).catch(console.error);

// Create new project
router.post('/', async (req, res) => {
  try {
    const project = {
      id: uuidv4(),
      ownerId: req.body.ownerId || 'anonymous',
      title: req.body.title || 'Untitled Project',
      canvasWidth: req.body.canvasWidth || 1920,
      canvasHeight: req.body.canvasHeight || 1080,
      background: req.body.background || '#ffffff',
      layers: [],
      assets: [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.set(project.id, project);
    
    // Save to file
    await fs.writeFile(
      path.join(PROJECTS_DIR, `${project.id}.json`),
      JSON.stringify(project, null, 2)
    );

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    let project = projects.get(req.params.id);
    
    if (!project) {
      // Try loading from file
      const filePath = path.join(PROJECTS_DIR, `${req.params.id}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        project = JSON.parse(data);
        projects.set(project.id, project);
      } catch (err) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = projects.get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = {
      ...project,
      ...req.body,
      id: project.id, // Prevent ID change
      updatedAt: new Date().toISOString(),
      version: project.version + 1
    };

    projects.set(project.id, updatedProject);
    
    // Save to file
    await fs.writeFile(
      path.join(PROJECTS_DIR, `${project.id}.json`),
      JSON.stringify(updatedProject, null, 2)
    );

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    projects.delete(req.params.id);
    await fs.unlink(path.join(PROJECTS_DIR, `${req.params.id}.json`));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// List projects
router.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(PROJECTS_DIR);
    const projectList = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf8');
        const project = JSON.parse(data);
        projectList.push({
          id: project.id,
          title: project.title,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        });
      }
    }

    res.json(projectList);
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

module.exports = router;
