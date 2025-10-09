// Global variables
let canvas, ctx;
let currentTool = 'select';
let isDrawing = false;
let startX, startY;
let elements = [];
let selectedElement = null;
let layers = [];
let currentLayer = 0;
let zoom = 1;
let panX = 0, panY = 0;
let isPanning = false;
let lastPanX, lastPanY;
let undoStack = [];
let redoStack = [];
let isLoggedIn = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('design-canvas');
    ctx = canvas.getContext('2d');
    
    setupEventListeners();
    initializeCanvas();
    createNewLayer();
    updateLayersList();
    setupNavigationEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Canvas events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    
    // Property panel events
    document.getElementById('fill-color').addEventListener('change', updateSelectedElement);
    document.getElementById('stroke-color').addEventListener('change', updateSelectedElement);
    document.getElementById('stroke-width').addEventListener('input', updateSelectedElement);
    document.getElementById('opacity').addEventListener('input', updateSelectedElement);
}

// Setup navigation event listeners
function setupNavigationEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        const loginModal = document.getElementById('loginModal');
        const notificationPanel = document.getElementById('notificationPanel');
        const userDropdown = document.getElementById('userDropdown');
        
        // Close login modal when clicking outside
        if (event.target === loginModal) {
            closeLogin();
        }
        
        // Close notification panel when clicking outside
        if (!event.target.closest('.notifications') && !event.target.closest('.notification-panel')) {
            closeNotifications();
        }
        
        // Close user dropdown when clicking outside
        if (!event.target.closest('.user-menu') && !event.target.closest('.user-dropdown')) {
            userDropdown.style.display = 'none';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Responsive adjustments can be added here
    });
}

// Initialize canvas
function initializeCanvas() {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    redrawCanvas();
}

// Tool selection
function selectTool(tool) {
    currentTool = tool;
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    // Update cursor
    switch(tool) {
        case 'select':
            canvas.style.cursor = 'default';
            break;
        case 'pen':
            canvas.style.cursor = 'crosshair';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        default:
            canvas.style.cursor = 'crosshair';
    }
}

// Mouse event handlers
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    startX = x;
    startY = y;
    isDrawing = true;
    
    if (currentTool === 'select') {
        selectElementAt(x, y);
    } else if (currentTool === 'pen') {
        startDrawingPen(x, y);
    } else if (currentTool === 'text') {
        createTextElement(x, y);
    }
    
    updateMousePosition(x, y);
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    updateMousePosition(x, y);
    
    if (!isDrawing) return;
    
    if (currentTool === 'pen') {
        drawPen(x, y);
    } else if (currentTool === 'rectangle' || currentTool === 'circle') {
        redrawCanvas();
        drawPreview(x, y);
    }
}

function handleMouseUp(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    if (currentTool === 'rectangle') {
        createRectangle(startX, startY, x, y);
    } else if (currentTool === 'circle') {
        createCircle(startX, startY, x, y);
    } else if (currentTool === 'pen') {
        finishDrawingPen();
    }
    
    isDrawing = false;
    saveState();
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom *= delta;
    zoom = Math.max(0.1, Math.min(5, zoom));
    updateZoomLevel();
    redrawCanvas();
}

function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                e.preventDefault();
                undoAction();
                break;
            case 'y':
                e.preventDefault();
                redoAction();
                break;
            case 's':
                e.preventDefault();
                saveProject();
                break;
        }
    } else {
        switch(e.key) {
            case 'Delete':
                deleteSelectedElement();
                break;
        }
    }
}

// Drawing functions
function createRectangle(x1, y1, x2, y2) {
    const element = {
        type: 'rectangle',
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        fillColor: '#4a9eff',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        layer: currentLayer,
        id: Date.now()
    };
    
    elements.push(element);
    redrawCanvas();
    updateLayersList();
}

function createCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const element = {
        type: 'circle',
        x: x1,
        y: y1,
        radius: radius,
        fillColor: '#4a9eff',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        layer: currentLayer,
        id: Date.now()
    };
    
    elements.push(element);
    redrawCanvas();
    updateLayersList();
}

function createTextElement(x, y) {
    const text = prompt('Enter text:');
    if (text) {
        const element = {
            type: 'text',
            x: x,
            y: y,
            text: text,
            fontSize: 16,
            fontFamily: 'Arial',
            fillColor: '#000000',
            opacity: 1,
            layer: currentLayer,
            id: Date.now()
        };
        
        elements.push(element);
        redrawCanvas();
        updateLayersList();
        saveState();
    }
}

let penPath = [];
function startDrawingPen(x, y) {
    penPath = [{x, y}];
}

function drawPen(x, y) {
    penPath.push({x, y});
    redrawCanvas();
    
    ctx.beginPath();
    ctx.moveTo(penPath[0].x, penPath[0].y);
    for (let i = 1; i < penPath.length; i++) {
        ctx.lineTo(penPath[i].x, penPath[i].y);
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function finishDrawingPen() {
    if (penPath.length > 1) {
        const element = {
            type: 'pen',
            path: [...penPath],
            strokeColor: '#000000',
            strokeWidth: 2,
            opacity: 1,
            layer: currentLayer,
            id: Date.now()
        };
        
        elements.push(element);
        updateLayersList();
    }
    penPath = [];
}

function drawPreview(x, y) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#4a9eff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    if (currentTool === 'rectangle') {
        const width = x - startX;
        const height = y - startY;
        ctx.fillRect(startX, startY, width, height);
        ctx.strokeRect(startX, startY, width, height);
    } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    
    ctx.restore();
}

// Canvas rendering
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw elements
    elements.forEach(element => {
        drawElement(element);
    });
    
    // Draw selection
    if (selectedElement) {
        drawSelection(selectedElement);
    }
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    const gridSize = 20;
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawElement(element) {
    ctx.save();
    ctx.globalAlpha = element.opacity || 1;
    
    switch(element.type) {
        case 'rectangle':
            ctx.fillStyle = element.fillColor;
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            ctx.fillRect(element.x, element.y, element.width, element.height);
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            break;
            
        case 'circle':
            ctx.fillStyle = element.fillColor;
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            ctx.beginPath();
            ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'text':
            ctx.fillStyle = element.fillColor;
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            ctx.fillText(element.text, element.x, element.y);
            break;
            
        case 'pen':
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            ctx.beginPath();
            ctx.moveTo(element.path[0].x, element.path[0].y);
            for (let i = 1; i < element.path.length; i++) {
                ctx.lineTo(element.path[i].x, element.path[i].y);
            }
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

function drawSelection(element) {
    ctx.save();
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    let bounds = getElementBounds(element);
    ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
    
    ctx.restore();
}

function getElementBounds(element) {
    switch(element.type) {
        case 'rectangle':
            return {x: element.x, y: element.y, width: element.width, height: element.height};
        case 'circle':
            return {x: element.x - element.radius, y: element.y - element.radius, width: element.radius * 2, height: element.radius * 2};
        case 'text':
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            const metrics = ctx.measureText(element.text);
            return {x: element.x, y: element.y - element.fontSize, width: metrics.width, height: element.fontSize};
        case 'pen':
            let minX = Math.min(...element.path.map(p => p.x));
            let minY = Math.min(...element.path.map(p => p.y));
            let maxX = Math.max(...element.path.map(p => p.x));
            let maxY = Math.max(...element.path.map(p => p.y));
            return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
    }
}

// Selection and element manipulation
function selectElementAt(x, y) {
    selectedElement = null;
    
    for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointInElement(x, y, elements[i])) {
            selectedElement = elements[i];
            updatePropertyPanel();
            break;
        }
    }
    
    if (!selectedElement) {
        clearPropertyPanel();
    }
    
    redrawCanvas();
}

function isPointInElement(x, y, element) {
    switch(element.type) {
        case 'rectangle':
            return x >= element.x && x <= element.x + element.width &&
                   y >= element.y && y <= element.y + element.height;
        case 'circle':
            const distance = Math.sqrt(Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2));
            return distance <= element.radius;
        case 'text':
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            const metrics = ctx.measureText(element.text);
            return x >= element.x && x <= element.x + metrics.width &&
                   y >= element.y - element.fontSize && y <= element.y;
        case 'pen':
            return element.path.some(point => {
                const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
                return distance <= element.strokeWidth + 5;
            });
    }
    return false;
}

function updatePropertyPanel() {
    if (!selectedElement) return;
    
    document.getElementById('pos-x').value = Math.round(selectedElement.x);
    document.getElementById('pos-y').value = Math.round(selectedElement.y);
    document.getElementById('fill-color').value = selectedElement.fillColor || '#000000';
    document.getElementById('stroke-color').value = selectedElement.strokeColor || '#000000';
    document.getElementById('stroke-width').value = selectedElement.strokeWidth || 1;
    document.getElementById('opacity').value = selectedElement.opacity || 1;
    
    if (selectedElement.type === 'rectangle') {
        document.getElementById('size-width').value = Math.round(selectedElement.width);
        document.getElementById('size-height').value = Math.round(selectedElement.height);
    } else if (selectedElement.type === 'circle') {
        document.getElementById('size-width').value = Math.round(selectedElement.radius * 2);
        document.getElementById('size-height').value = Math.round(selectedElement.radius * 2);
    }
}

function clearPropertyPanel() {
    document.getElementById('pos-x').value = '';
    document.getElementById('pos-y').value = '';
    document.getElementById('size-width').value = '';
    document.getElementById('size-height').value = '';
    document.getElementById('fill-color').value = '#000000';
    document.getElementById('stroke-color').value = '#000000';
    document.getElementById('stroke-width').value = 1;
    document.getElementById('opacity').value = 1;
}

function updateSelectedElement() {
    if (!selectedElement) return;
    
    selectedElement.x = parseFloat(document.getElementById('pos-x').value) || selectedElement.x;
    selectedElement.y = parseFloat(document.getElementById('pos-y').value) || selectedElement.y;
    selectedElement.fillColor = document.getElementById('fill-color').value;
    selectedElement.strokeColor = document.getElementById('stroke-color').value;
    selectedElement.strokeWidth = parseFloat(document.getElementById('stroke-width').value);
    selectedElement.opacity = parseFloat(document.getElementById('opacity').value);
    
    if (selectedElement.type === 'rectangle') {
        selectedElement.width = parseFloat(document.getElementById('size-width').value) || selectedElement.width;
        selectedElement.height = parseFloat(document.getElementById('size-height').value) || selectedElement.height;
    } else if (selectedElement.type === 'circle') {
        selectedElement.radius = (parseFloat(document.getElementById('size-width').value) || selectedElement.radius * 2) / 2;
    }
    
    redrawCanvas();
}

function updateProperty(property, value) {
    if (!selectedElement) return;
    
    selectedElement[property] = parseFloat(value) || value;
    redrawCanvas();
}

// Layer management
function createNewLayer() {
    const layer = {
        id: Date.now(),
        name: `Layer ${layers.length + 1}`,
        visible: true,
        elements: []
    };
    
    layers.push(layer);
    currentLayer = layers.length - 1;
    updateLayersList();
}

function updateLayersList() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';
    
    layers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === currentLayer ? 'selected' : ''}`;
        layerItem.onclick = () => selectLayer(index);
        
        layerItem.innerHTML = `
            <span class="layer-name">${layer.name}</span>
            <button class="layer-visibility" onclick="toggleLayerVisibility(${index})">
                <i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>
            </button>
        `;
        
        layersList.appendChild(layerItem);
    });
}

function selectLayer(index) {
    currentLayer = index;
    updateLayersList();
}

function toggleLayerVisibility(index) {
    event.stopPropagation();
    layers[index].visible = !layers[index].visible;
    updateLayersList();
    redrawCanvas();
}

function addLayer() {
    createNewLayer();
}

function deleteLayer() {
    if (layers.length > 1) {
        layers.splice(currentLayer, 1);
        currentLayer = Math.min(currentLayer, layers.length - 1);
        updateLayersList();
        redrawCanvas();
    }
}

function moveLayerUp() {
    if (currentLayer < layers.length - 1) {
        [layers[currentLayer], layers[currentLayer + 1]] = [layers[currentLayer + 1], layers[currentLayer]];
        currentLayer++;
        updateLayersList();
        redrawCanvas();
    }
}

function moveLayerDown() {
    if (currentLayer > 0) {
        [layers[currentLayer], layers[currentLayer - 1]] = [layers[currentLayer - 1], layers[currentLayer]];
        currentLayer--;
        updateLayersList();
        redrawCanvas();
    }
}

// Zoom controls
function zoomIn() {
    zoom *= 1.2;
    zoom = Math.min(5, zoom);
    updateZoomLevel();
    redrawCanvas();
}

function zoomOut() {
    zoom *= 0.8;
    zoom = Math.max(0.1, zoom);
    updateZoomLevel();
    redrawCanvas();
}

function resetZoom() {
    zoom = 1;
    updateZoomLevel();
    redrawCanvas();
}

function updateZoomLevel() {
    document.getElementById('zoom-level').textContent = Math.round(zoom * 100) + '%';
}

// UI updates
function updateMousePosition(x, y) {
    document.getElementById('mouse-position').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
}

// Project management
function newProject() {
    if (confirm('Create new project? Unsaved changes will be lost.')) {
        elements = [];
        layers = [];
        selectedElement = null;
        undoStack = [];
        redoStack = [];
        createNewLayer();
        redrawCanvas();
        updateLayersList();
        clearPropertyPanel();
    }
}

function saveProject() {
    const projectName = prompt('Enter project name:');
    if (projectName) {
        const projectData = {
            name: projectName,
            elements: elements,
            layers: layers,
            canvasSize: {width: canvas.width, height: canvas.height},
            timestamp: new Date().toISOString()
        };
        
        fetch('save_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectName: projectName,
                projectData: projectData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Project saved successfully!');
            } else {
                alert('Failed to save project: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error saving project: ' + error);
        });
    }
}

function openProject() {
    fetch('list_projects.php')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.projects.length > 0) {
            const projectNames = data.projects.map(p => p.name);
            const selectedProject = prompt('Available projects:\n' + projectNames.join('\n') + '\n\nEnter project name to open:');
            
            if (selectedProject && projectNames.includes(selectedProject)) {
                fetch(`load_project.php?projectName=${encodeURIComponent(selectedProject)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadProjectData(data.projectData);
                        alert('Project loaded successfully!');
                    } else {
                        alert('Failed to load project: ' + data.message);
                    }
                })
                .catch(error => {
                    alert('Error loading project: ' + error);
                });
            }
        } else {
            alert('No saved projects found.');
        }
    })
    .catch(error => {
        alert('Error listing projects: ' + error);
    });
}

function loadProjectData(projectData) {
    elements = projectData.elements || [];
    layers = projectData.layers || [];
    selectedElement = null;
    undoStack = [];
    redoStack = [];
    
    if (layers.length === 0) {
        createNewLayer();
    } else {
        currentLayer = 0;
    }
    
    redrawCanvas();
    updateLayersList();
    clearPropertyPanel();
}

function exportDesign() {
    const format = prompt('Export format (png, jpg):', 'png');
    if (format && (format === 'png' || format === 'jpg')) {
        const filename = prompt('Enter filename:', 'design');
        if (filename) {
            const imageData = canvas.toDataURL(`image/${format}`);
            
            fetch('export_image.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: imageData,
                    format: format,
                    filename: filename
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Design exported successfully!');
                    // Create download link
                    const link = document.createElement('a');
                    link.href = imageData;
                    link.download = `${filename}.${format}`;
                    link.click();
                } else {
                    alert('Failed to export design: ' + data.message);
                }
            })
            .catch(error => {
                alert('Error exporting design: ' + error);
            });
        }
    }
}

// Templates
function loadTemplate(templateType) {
    newProject();
    
    switch(templateType) {
        case 'social-media':
            canvas.width = 1080;
            canvas.height = 1080;
            // Add social media template elements
            createRectangle(50, 50, 980, 980);
            createTextElement(540, 100, 'Social Media Post');
            break;
        case 'presentation':
            canvas.width = 1920;
            canvas.height = 1080;
            // Add presentation template elements
            createRectangle(0, 0, 1920, 1080);
            createTextElement(960, 200, 'Presentation Title');
            break;
        case 'poster':
            canvas.width = 1080;
            canvas.height = 1920;
            // Add poster template elements
            createRectangle(0, 0, 1080, 1920);
            createTextElement(540, 300, 'Poster Title');
            break;
        case 'logo':
            canvas.width = 512;
            canvas.height = 512;
            // Add logo template elements
            createCircle(256, 256, 200);
            createTextElement(256, 450, 'LOGO');
            break;
    }
    
    document.getElementById('canvas-size').textContent = `${canvas.width} x ${canvas.height}`;
    redrawCanvas();
}

// Undo/Redo functionality
function saveState() {
    undoStack.push({
        elements: JSON.parse(JSON.stringify(elements)),
        layers: JSON.parse(JSON.stringify(layers))
    });
    
    if (undoStack.length > 50) {
        undoStack.shift();
    }
    
    redoStack = [];
}

function undoAction() {
    if (undoStack.length > 0) {
        redoStack.push({
            elements: JSON.parse(JSON.stringify(elements)),
            layers: JSON.parse(JSON.stringify(layers))
        });
        
        const state = undoStack.pop();
        elements = state.elements;
        layers = state.layers;
        
        redrawCanvas();
        updateLayersList();
    }
}

function redoAction() {
    if (redoStack.length > 0) {
        undoStack.push({
            elements: JSON.parse(JSON.stringify(elements)),
            layers: JSON.parse(JSON.stringify(layers))
        });
        
        const state = redoStack.pop();
        elements = state.elements;
        layers = state.layers;
        
        redrawCanvas();
        updateLayersList();
    }
}

// Delete selected element
function deleteSelectedElement() {
    if (selectedElement) {
        elements = elements.filter(el => el.id !== selectedElement.id);
        selectedElement = null;
        clearPropertyPanel();
        redrawCanvas();
        updateLayersList();
        saveState();
    }
}

// Navigation Functions
function showHome() {
    alert('Home page - Feature coming soon!');
}

function showFeatures() {
    alert('Features page - Feature coming soon!');
}

function showTemplates() {
    alert('Templates page - Feature coming soon!');
}

function showPricing() {
    alert('Pricing page - Feature coming soon!');
}

function showAbout() {
    alert('About page - Feature coming soon!');
}

function newProject() {
    if (confirm('Create a new project? Unsaved changes will be lost.')) {
        elements = [];
        layers = [];
        selectedElement = null;
        currentLayer = 0;
        undoStack = [];
        redoStack = [];
        
        createNewLayer();
        updateLayersList();
        clearPropertyPanel();
        redrawCanvas();
        
        // Reset canvas to default size
        canvas.width = 800;
        canvas.height = 600;
        document.getElementById('canvas-size').textContent = '800 x 600';
    }
}

function openProject() {
    alert('Open project - Feature coming soon!');
}

function saveProject() {
    alert('Save project - Feature coming soon!');
}

function exportDesign() {
    alert('Export design - Feature coming soon!');
}

// Login Functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        // Simulate successful login
        isLoggedIn = true;
        currentUser = {
            name: 'John Doe',
            email: email,
            avatar: 'https://picsum.photos/seed/user/40/40.jpg'
        };
        
        updateUserInterface();
        closeLogin();
        
        // Show success message
        showNotification('Login successful!', 'success');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        isLoggedIn = false;
        currentUser = null;
        updateUserInterface();
        showNotification('Logged out successfully!', 'info');
    }
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (isLoggedIn && currentUser) {
        // Update login button to show user avatar
        loginBtn.innerHTML = `<img src="${currentUser.avatar}" alt="User" class="user-avatar-small">`;
        loginBtn.onclick = toggleUserDropdown;
        
        // Update user dropdown info
        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (userName) userName.textContent = currentUser.name;
        if (userEmail) userEmail.textContent = currentUser.email;
        if (userAvatar) userAvatar.src = currentUser.avatar;
    } else {
        // Reset to login button
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.onclick = showLogin;
        userDropdown.style.display = 'none';
    }
}

function toggleUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
}

function showProfile() {
    alert('Profile page - Feature coming soon!');
    document.getElementById('userDropdown').style.display = 'none';
}

function showSettings() {
    alert('Settings page - Feature coming soon!');
    document.getElementById('userDropdown').style.display = 'none';
}

function showHelp() {
    alert('Help page - Feature coming soon!');
    document.getElementById('userDropdown').style.display = 'none';
}

// Notification Functions
function showNotifications() {
    const notificationPanel = document.getElementById('notificationPanel');
    notificationPanel.style.display = notificationPanel.style.display === 'none' ? 'block' : 'none';
}

function closeNotifications() {
    document.getElementById('notificationPanel').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showSignup() {
    alert('Signup page - Feature coming soon!');
    closeLogin();
}

// Add CSS for notification toast
const style = document.createElement('style');
style.textContent = `
    .notification-toast {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #2d2d2d;
        border: 1px solid #404040;
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    }
    
    .notification-toast.success {
        border-color: #4caf50;
        background: linear-gradient(135deg, #2d4a2d 0%, #1a2e1a 100%);
    }
    
    .notification-toast.error {
        border-color: #f44336;
        background: linear-gradient(135deg, #4a2d2d 0%, #2e1a1a 100%);
    }
    
    .notification-toast .notification-icon {
        color: #4a9eff;
        font-size: 18px;
    }
    
    .notification-toast.success .notification-icon {
        color: #4caf50;
    }
    
    .notification-toast.error .notification-icon {
        color: #f44336;
    }
    
    .notification-toast .notification-message {
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .user-avatar-small {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
    }
`;
document.head.appendChild(style);
