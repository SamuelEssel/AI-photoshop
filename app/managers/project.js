// Project Management Module

class ProjectManager {
  constructor() {
    this.currentProject = null;
    this.isDirty = false;
    this.autoSaveInterval = null;
  }

  init() {
    this.createNewProject();
    this.startAutoSave();
  }

  createNewProject() {
    this.currentProject = {
      id: Utils.generateId(),
      title: 'Untitled Project',
      canvasWidth: APP_CONFIG.canvas.defaultWidth,
      canvasHeight: APP_CONFIG.canvas.defaultHeight,
      background: APP_CONFIG.canvas.backgroundColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.isDirty = false;
    console.log('New project created:', this.currentProject);
  }

  async save() {
    if (!this.currentProject) {
      Utils.showToast('No project to save', 'warning');
      return;
    }

    Utils.showLoading('Saving project...');

    try {
      const projectData = {
        ...this.currentProject,
        canvas: app.canvas.toJSON(),
        updatedAt: new Date().toISOString()
      };

      const response = await Utils.api('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });

      this.currentProject = response;
      this.isDirty = false;

      Utils.showToast('Project saved successfully!', 'success');
      console.log('Project saved:', response);

    } catch (error) {
      Utils.showToast('Failed to save project: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  async load(projectId) {
    Utils.showLoading('Loading project...');

    try {
      const response = await Utils.api(`/projects/${projectId}`);
      
      this.currentProject = response;
      
      // Set canvas size
      app.canvas.setCanvasSize(response.canvasWidth, response.canvasHeight);
      
      // Load canvas content
      if (response.canvas) {
        await app.canvas.fromJSON(response.canvas);
      }

      this.isDirty = false;
      Utils.showToast('Project loaded successfully!', 'success');

    } catch (error) {
      Utils.showToast('Failed to load project: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  async exportAsJSON() {
    if (!this.currentProject) return;

    const data = {
      ...this.currentProject,
      canvas: app.canvas.toJSON()
    };

    const json = JSON.stringify(data, null, 2);
    const filename = `${this.currentProject.title.replace(/\s+/g, '_')}.json`;
    
    Utils.downloadFile(json, filename, 'application/json');
    Utils.showToast('Project exported as JSON', 'success');
  }

  async importFromJSON(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      this.currentProject = data;
      
      if (data.canvas) {
        await app.canvas.fromJSON(data.canvas);
      }

      Utils.showToast('Project imported successfully!', 'success');

    } catch (error) {
      Utils.showToast('Failed to import project: ' + error.message, 'error');
    }
  }

  startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      if (this.isDirty && this.currentProject) {
        this.autoSave();
      }
    }, APP_CONFIG.history.saveInterval);
  }

  async autoSave() {
    try {
      const projectData = {
        ...this.currentProject,
        canvas: app.canvas.toJSON(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage as backup
      localStorage.setItem('autosave', JSON.stringify(projectData));
      console.log('Auto-saved to localStorage');

    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  markDirty() {
    this.isDirty = true;
  }
}

if (typeof window !== 'undefined') {
  window.ProjectManager = ProjectManager;
}
