/**
 * Editor Page JavaScript
 * Handles all interactive functionality for the design editor
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the canvas
    initCanvas();
    
    // Initialize toolbar functionality
    initToolbar();
    
    // Initialize left sidebar tools
    initLeftSidebar();
    
    // Initialize right sidebar properties
    initRightSidebar();
    
    // Initialize modals
    initModals();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Initialize project title editing
    initProjectTitle();
    
    // Initialize zoom functionality
    initZoom();
    
    // Initialize rulers and grid
    initRulersAndGrid();
    
    // Initialize layers panel
    initLayers();
    
    // Load project data if editing existing project
    loadProjectData();
});

/**
 * Canvas initialization and management
 */
let canvas;
let selectedElements = [];
let canvasHistory = [];
let historyIndex = -1;
let canvasScale = 1;
let canvasOffset = { x: 0, y: 0 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let activeTool = 'select';

function initCanvas() {
    canvas = document.getElementById('canvas');
    const canvasContainer = document.querySelector('.canvas-container');
    
    if (!canvas || !canvasContainer) return;
    
    // Set initial canvas size
    canvas.width = 1200;
    canvas.height = 800;
    
    // Create canvas context
    const ctx = canvas.getContext('2d');
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add event listeners for canvas interactions
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('click', handleCanvasClick);
    
    // Add event listener for canvas container to handle panning
    canvasContainer.addEventListener('wheel', handleCanvasWheel);
    
    // Save initial canvas state
    saveCanvasState();
    
    // Update canvas display
    updateCanvasTransform();
}

function handleCanvasMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    
    isDragging = true;
    dragStart = { x, y };
    
    // Handle different tools
    switch (activeTool) {
        case 'select':
            // Check if clicked on an element
            const clickedElement = findElementAt(x, y);
            if (clickedElement) {
                selectElement(clickedElement);
            } else {
                deselectAll();
            }
            break;
            
        case 'text':
            // Create new text element at click position
            createTextElement(x, y);
            break;
            
        case 'shape':
            // Start drawing shape
            startDrawingShape(x, y);
            break;
            
        case 'draw':
            // Start drawing path
            startDrawingPath(x, y);
            break;
            
        case 'image':
            // Open image upload dialog
            document.getElementById('imageUpload').click();
            break;
            
        case 'comment':
            // Add comment at position
            addComment(x, y);
            break;
    }
}

function handleCanvasMouseMove(e) {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    
    // Handle different tools during drag
    switch (activeTool) {
        case 'select':
            // Move selected elements
            if (selectedElements.length > 0) {
                moveSelectedElements(x - dragStart.x, y - dragStart.y);
                dragStart = { x, y };
            }
            break;
            
        case 'shape':
            // Update shape size during drag
            updateShapeSize(x, y);
            break;
            
        case 'draw':
            // Continue drawing path
            continueDrawingPath(x, y);
            break;
    }
    
    // Update cursor position display
    updateCursorPosition(x, y);
}

function handleCanvasMouseUp(e) {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Handle different tools on mouse up
    switch (activeTool) {
        case 'select':
            // Finalize element movement
            if (selectedElements.length > 0) {
                finalizeElementMovement();
            }
            break;
            
        case 'shape':
            // Finalize shape drawing
            finalizeShapeDrawing();
            break;
            
        case 'draw':
            // Finalize path drawing
            finalizePathDrawing();
            break;
    }
    
    // Save canvas state after action
    saveCanvasState();
}

function handleCanvasClick(e) {
    // Handle single click actions
    // This is separate from mousedown/up for certain tools
}

function handleCanvasWheel(e) {
    // Prevent default scrolling
    e.preventDefault();
    
    // Handle zooming with Ctrl key
    if (e.ctrlKey) {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        zoomCanvas(zoomFactor, e.clientX, e.clientY);
    } else {
        // Handle panning
        canvasOffset.x -= e.deltaX;
        canvasOffset.y -= e.deltaY;
        updateCanvasTransform();
    }
}

function updateCanvasTransform() {
    canvas.style.transform = `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`;
    
    // Update rulers
    updateRulers();
}

function zoomCanvas(factor, centerX, centerY) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = centerX - rect.left;
    const mouseY = centerY - rect.top;
    
    // Calculate new scale
    const newScale = canvasScale * factor;
    
    // Limit zoom level
    if (newScale < 0.1 || newScale > 5) return;
    
    // Calculate new offsets to zoom toward mouse position
    const scaleChange = newScale / canvasScale;
    canvasOffset.x = mouseX - (mouseX - canvasOffset.x) * scaleChange;
    canvasOffset.y = mouseY - (mouseY - canvasOffset.y) * scaleChange;
    
    // Update scale
    canvasScale = newScale;
    
    // Update zoom display
    updateZoomDisplay();
    
    // Update canvas transform
    updateCanvasTransform();
}

function updateZoomDisplay() {
    const zoomDisplay = document.getElementById('zoomLevel');
    if (zoomDisplay) {
        zoomDisplay.textContent = `${Math.round(canvasScale * 100)}%`;
    }
}

function updateCursorPosition(x, y) {
    const positionDisplay = document.getElementById('cursorPosition');
    if (positionDisplay) {
        positionDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    }
}

function saveCanvasState() {
    // Get canvas data
    const canvasData = canvas.toDataURL();
    
    // If we're not at the end of the history, remove future states
    if (historyIndex < canvasHistory.length - 1) {
        canvasHistory = canvasHistory.slice(0, historyIndex + 1);
    }
    
    // Add current state to history
    canvasHistory.push({
        canvasData: canvasData,
        elements: JSON.parse(JSON.stringify(getAllElements()))
    });
    
    // Update history index
    historyIndex = canvasHistory.length - 1;
    
    // Update undo/redo buttons
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex <= 0) return;
    
    historyIndex--;
    restoreCanvasState(historyIndex);
    updateUndoRedoButtons();
}

function redo() {
    if (historyIndex >= canvasHistory.length - 1) return;
    
    historyIndex++;
    restoreCanvasState(historyIndex);
    updateUndoRedoButtons();
}

function restoreCanvasState(index) {
    const state = canvasHistory[index];
    
    // Load canvas image
    const img = new Image();
    img.onload = function() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = state.canvasData;
    
    // Restore elements
    restoreElements(state.elements);
    
    // Update layers panel
    updateLayersPanel();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = historyIndex <= 0;
    }
    
    if (redoBtn) {
        redoBtn.disabled = historyIndex >= canvasHistory.length - 1;
    }
}

/**
 * Element management functions
 */
function getAllElements() {
    // In a real app, this would return all elements on the canvas
    // For this demo, we'll return a placeholder
    return [];
}

function restoreElements(elements) {
    // In a real app, this would restore all elements from saved state
    // For this demo, we'll just update the selected elements
    selectedElements = [];
}

function findElementAt(x, y) {
    // In a real app, this would find the element at the given position
    // For this demo, we'll return null
    return null;
}

function selectElement(element) {
    // Add element to selection
    selectedElements = [element];
    
    // Update properties panel
    updatePropertiesPanel();
}

function deselectAll() {
    selectedElements = [];
    updatePropertiesPanel();
}

function moveSelectedElements(dx, dy) {
    // In a real app, this would move the selected elements
    // For this demo, we'll just redraw the canvas
    redrawCanvas();
}

function finalizeElementMovement() {
    // In a real app, this would finalize the movement of elements
    // For this demo, we'll just save the canvas state
    saveCanvasState();
}

function redrawCanvas() {
    // In a real app, this would redraw all elements on the canvas
    // For this demo, we'll just use a placeholder
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all elements
    // ...
}

/**
 * Tool-specific functions
 */
function createTextElement(x, y) {
    // Create a text input element at the position
    const textInput = document.createElement('div');
    textInput.contentEditable = true;
    textInput.className = 'canvas-text-input';
    textInput.style.position = 'absolute';
    textInput.style.left = `${x}px`;
    textInput.style.top = `${y}px`;
    textInput.style.minWidth = '100px';
    textInput.style.minHeight = '24px';
    textInput.style.padding = '4px';
    textInput.style.border = '1px dashed #000';
    textInput.style.backgroundColor = 'transparent';
    textInput.style.zIndex = '1000';
    
    // Add to canvas container
    document.querySelector('.canvas-container').appendChild(textInput);
    
    // Focus the input
    textInput.focus();
    
    // Handle blur event to finalize text
    textInput.addEventListener('blur', function() {
        if (textInput.textContent.trim() !== '') {
            // Add text to canvas
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(textInput.textContent, x, y + 16);
            
            // Save canvas state
            saveCanvasState();
        }
        
        // Remove the input element
        textInput.remove();
    });
}

function startDrawingShape(x, y) {
    // Store starting position
    dragStart = { x, y };
    
    // Create temporary shape
    const shapeType = document.querySelector('.shape-tool.active')?.dataset.shape || 'rectangle';
    
    // Draw initial shape
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 1, 1);
}

function updateShapeSize(x, y) {
    // Calculate width and height
    const width = x - dragStart.x;
    const height = y - dragStart.y;
    
    // Redraw canvas
    redrawCanvas();
    
    // Draw updated shape
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    const shapeType = document.querySelector('.shape-tool.active')?.dataset.shape || 'rectangle';
    
    switch (shapeType) {
        case 'rectangle':
            ctx.strokeRect(dragStart.x, dragStart.y, width, height);
            break;
            
        case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(
                dragStart.x + width / 2,
                dragStart.y + height / 2,
                Math.abs(width / 2),
                Math.abs(height / 2),
                0, 0, 2 * Math.PI
            );
            ctx.stroke();
            break;
            
        case 'line':
            ctx.beginPath();
            ctx.moveTo(dragStart.x, dragStart.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
    }
}

function finalizeShapeDrawing() {
    // Shape is already drawn on canvas, just save the state
    saveCanvasState();
}

function startDrawingPath(x, y) {
    // Start a new path
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function continueDrawingPath(x, y) {
    // Continue the path
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
}

function finalizePathDrawing() {
    // Path is already drawn on canvas, just save the state
    saveCanvasState();
}

function addComment(x, y) {
    // Create comment marker
    const marker = document.createElement('div');
    marker.className = 'comment-marker';
    marker.style.position = 'absolute';
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    marker.style.width = '20px';
    marker.style.height = '20px';
    marker.style.borderRadius = '50%';
    marker.style.backgroundColor = '#ffcc00';
    marker.style.border = '2px solid #ff9900';
    marker.style.zIndex = '1000';
    marker.style.cursor = 'pointer';
    
    // Add to canvas container
    document.querySelector('.canvas-container').appendChild(marker);
    
    // Open comment dialog
    marker.addEventListener('click', function() {
        // Show comment dialog
        const commentDialog = document.createElement('div');
        commentDialog.className = 'comment-dialog';
        commentDialog.style.position = 'absolute';
        commentDialog.style.left = `${x + 30}px`;
        commentDialog.style.top = `${y}px`;
        commentDialog.style.width = '250px';
        commentDialog.style.padding = '10px';
        commentDialog.style.backgroundColor = 'white';
        commentDialog.style.border = '1px solid #ddd';
        commentDialog.style.borderRadius = '4px';
        commentDialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        commentDialog.style.zIndex = '1001';
        
        commentDialog.innerHTML = `
            <textarea placeholder="Add a comment..." style="width: 100%; height: 80px; margin-bottom: 10px; padding: 5px;"></textarea>
            <div style="display: flex; justify-content: flex-end; gap: 5px;">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save</button>
            </div>
        `;
        
        document.querySelector('.canvas-container').appendChild(commentDialog);
        
        // Focus textarea
        commentDialog.querySelector('textarea').focus();
        
        // Handle cancel button
        commentDialog.querySelector('.cancel-btn').addEventListener('click', function() {
            commentDialog.remove();
            marker.remove();
        });
        
        // Handle save button
        commentDialog.querySelector('.save-btn').addEventListener('click', function() {
            const commentText = commentDialog.querySelector('textarea').value.trim();
            if (commentText) {
                // Store comment data (in a real app, this would be saved to the project)
                marker.dataset.comment = commentText;
                
                // Add comment to comments panel
                addCommentToPanel(marker.dataset.comment, x, y);
            }
            commentDialog.remove();
        });
    });
}

function addCommentToPanel(text, x, y) {
    const commentsPanel = document.querySelector('.comments-panel');
    if (!commentsPanel) return;
    
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.innerHTML = `
        <div class="comment-header">
            <span class="comment-position">X: ${Math.round(x)}, Y: ${Math.round(y)}</span>
            <span class="comment-actions">
                <button class="btn-icon"><i class="fas fa-trash"></i></button>
            </span>
        </div>
        <div class="comment-text">${text}</div>
    `;
    
    commentsPanel.appendChild(commentItem);
    
    // Handle delete button
    commentItem.querySelector('.btn-icon').addEventListener('click', function() {
        commentItem.remove();
        // In a real app, also remove the marker from canvas
    });
}

/**
 * Toolbar initialization and functionality
 */
function initToolbar() {
    // Undo/Redo buttons
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.addEventListener('click', undo);
        undoBtn.disabled = true;
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', redo);
        redoBtn.disabled = true;
    }
    
    // Zoom buttons
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            zoomCanvas(1.1, canvas.width / 2, canvas.height / 2);
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            zoomCanvas(0.9, canvas.width / 2, canvas.height / 2);
        });
    }
    
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', function() {
            canvasScale = 1;
            canvasOffset = { x: 0, y: 0 };
            updateCanvasTransform();
            updateZoomDisplay();
        });
    }
    
    // Grid and ruler toggles
    const gridToggle = document.getElementById('gridToggle');
    const rulerToggle = document.getElementById('rulerToggle');
    
    if (gridToggle) {
        gridToggle.addEventListener('change', function() {
            document.querySelector('.canvas-container').classList.toggle('show-grid', this.checked);
        });
    }
    
    if (rulerToggle) {
        rulerToggle.addEventListener('change', function() {
            document.querySelector('.rulers-container').classList.toggle('hidden', !this.checked);
        });
    }
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProject);
    }
    
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            document.getElementById('shareModal').style.display = 'flex';
        });
    }
    
    // Preview button
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', previewProject);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            document.getElementById('exportModal').style.display = 'flex';
        });
    }
}

function saveProject() {
    // Show saving indicator
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    // Get project data
    const projectData = {
        title: document.getElementById('projectTitle').textContent,
        canvasData: canvas.toDataURL(),
        elements: getAllElements(),
        width: canvas.width,
        height: canvas.height
    };
    
    // Simulate API call
    setTimeout(function() {
        // In a real app, this would be an actual API call
        console.log('Project saved:', projectData);
        
        // Update button text
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        
        // Reset button after 2 seconds
        setTimeout(function() {
            saveBtn.innerHTML = originalText;
        }, 2000);
        
        // Show notification
        showNotification('Project saved successfully!', 'success');
    }, 1000);
}

function previewProject() {
    // Open preview in new tab
    const projectId = getProjectIdFromUrl();
    if (projectId) {
        window.open(`preview.php?id=${projectId}`, '_blank');
    } else {
        // For new projects, create a data URL
        const dataUrl = canvas.toDataURL();
        const previewWindow = window.open();
        previewWindow.document.write(`
            <html>
            <head>
                <title>Preview</title>
                <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f0f0; }
                    img { max-width: 100%; max-height: 100%; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                </style>
            </head>
            <body>
                <img src="${dataUrl}" alt="Preview">
            </body>
            </html>
        `);
    }
}

function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Left sidebar initialization and functionality
 */
function initLeftSidebar() {
    // Tool buttons
    const toolButtons = document.querySelectorAll('.tool-btn');
    
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tools
            toolButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked tool
            this.classList.add('active');
            
            // Set active tool
            activeTool = this.dataset.tool;
            
            // Update cursor
            updateCursor();
        });
    });
    
    // Shape tools
    const shapeTools = document.querySelectorAll('.shape-tool');
    
    shapeTools.forEach(tool => {
        tool.addEventListener('click', function() {
            // Remove active class from all shape tools
            shapeTools.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked shape tool
            this.classList.add('active');
            
            // Set active tool to shape
            activeTool = 'shape';
            
            // Update cursor
            updateCursor();
            
            // Activate shape tool button
            const shapeToolBtn = document.querySelector('.tool-btn[data-tool="shape"]');
            if (shapeToolBtn) {
                toolButtons.forEach(btn => btn.classList.remove('active'));
                shapeToolBtn.classList.add('active');
            }
        });
    });
    
    // Element buttons
    const elementButtons = document.querySelectorAll('.element-btn');
    
    elementButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add element to canvas
            addElementToCanvas(this.dataset.element);
        });
    });
    
    // Image upload
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
}

function updateCursor() {
    // Set cursor based on active tool
    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer) return;
    
    switch (activeTool) {
        case 'select':
            canvasContainer.style.cursor = 'default';
            break;
            
        case 'text':
            canvasContainer.style.cursor = 'text';
            break;
            
        case 'shape':
            canvasContainer.style.cursor = 'crosshair';
            break;
            
        case 'draw':
            canvasContainer.style.cursor = 'url("../assets/images/pencil-cursor.png") 0 16, auto';
            break;
            
        case 'image':
            canvasContainer.style.cursor = 'copy';
            break;
            
        case 'comment':
            canvasContainer.style.cursor = 'url("../assets/images/comment-cursor.png") 0 16, auto';
            break;
            
        default:
            canvasContainer.style.cursor = 'default';
    }
}

function addElementToCanvas(elementType) {
    // Get canvas center
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Add element based on type
    switch (elementType) {
        case 'rectangle':
            addRectangle(x, y);
            break;
            
        case 'circle':
            addCircle(x, y);
            break;
            
        case 'triangle':
            addTriangle(x, y);
            break;
            
        case 'text-heading':
            addTextHeading(x, y);
            break;
            
        case 'text-paragraph':
            addTextParagraph(x, y);
            break;
            
        case 'text-button':
            addTextButton(x, y);
            break;
    }
    
    // Save canvas state
    saveCanvasState();
}

function addRectangle(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e9ecef';
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    
    // Draw rectangle centered at x, y
    const width = 150;
    const height = 100;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
}

function addCircle(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e9ecef';
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    
    // Draw circle centered at x, y
    const radius = 50;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function addTriangle(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e9ecef';
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    
    // Draw triangle centered at x, y
    const size = 100;
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function addTextHeading(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#212529';
    ctx.textAlign = 'center';
    ctx.fillText('Heading Text', x, y);
}

function addTextParagraph(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.font = '16px Arial';
    ctx.fillStyle = '#212529';
    ctx.textAlign = 'center';
    ctx.fillText('Paragraph text goes here. Edit this text.', x, y);
}

function addTextButton(x, y) {
    const ctx = canvas.getContext('2d');
    
    // Button background
    ctx.fillStyle = '#4a6cf7';
    ctx.strokeStyle = '#3a5bd9';
    ctx.lineWidth = 1;
    
    const width = 120;
    const height = 40;
    const radius = 4;
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x - width / 2 + radius, y - height / 2);
    ctx.lineTo(x + width / 2 - radius, y - height / 2);
    ctx.quadraticCurveTo(x + width / 2, y - height / 2, x + width / 2, y - height / 2 + radius);
    ctx.lineTo(x + width / 2, y + height / 2 - radius);
    ctx.quadraticCurveTo(x + width / 2, y + height / 2, x + width / 2 - radius, y + height / 2);
    ctx.lineTo(x - width / 2 + radius, y + height / 2);
    ctx.quadraticCurveTo(x - width / 2, y + height / 2, x - width / 2, y + height / 2 - radius);
    ctx.lineTo(x - width / 2, y - height / 2 + radius);
    ctx.quadraticCurveTo(x - width / 2, y - height / 2, x - width / 2 + radius, y - height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Button text
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Button', x, y);
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    // Read file
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Calculate position (center of canvas)
            const x = canvas.width / 2 - img.width / 2;
            const y = canvas.height / 2 - img.height / 2;
            
            // Draw image on canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, x, y);
            
            // Save canvas state
            saveCanvasState();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
}

/**
 * Right sidebar initialization and functionality
 */
function initRightSidebar() {
    // Initialize properties panel
    updatePropertiesPanel();
    
    // Initialize layers panel
    updateLayersPanel();
}

function updatePropertiesPanel() {
    const propertiesPanel = document.querySelector('.properties-panel');
    if (!propertiesPanel) return;
    
    // Clear panel
    propertiesPanel.innerHTML = '';
    
    if (selectedElements.length === 0) {
        // No selection
        propertiesPanel.innerHTML = `
            <div class="panel-message">
                <i class="fas fa-info-circle"></i>
                <p>Select an element to edit its properties</p>
            </div>
        `;
        return;
    }
    
    // For demo purposes, show generic properties
    propertiesPanel.innerHTML = `
        <div class="property-group">
            <h3>Position & Size</h3>
            <div class="property-row">
                <label for="propX">X</label>
                <input type="number" id="propX" value="100">
            </div>
            <div class="property-row">
                <label for="propY">Y</label>
                <input type="number" id="propY" value="100">
            </div>
            <div class="property-row">
                <label for="propWidth">Width</label>
                <input type="number" id="propWidth" value="200">
            </div>
            <div class="property-row">
                <label for="propHeight">Height</label>
                <input type="number" id="propHeight" value="150">
            </div>
        </div>
        
        <div class="property-group">
            <h3>Appearance</h3>
            <div class="property-row">
                <label for="propFill">Fill</label>
                <input type="color" id="propFill" value="#e9ecef">
            </div>
            <div class="property-row">
                <label for="propStroke">Stroke</label>
                <input type="color" id="propStroke" value="#495057">
            </div>
            <div class="property-row">
                <label for="propStrokeWidth">Stroke Width</label>
                <input type="number" id="propStrokeWidth" value="2" min="0" max="20">
            </div>
            <div class="property-row">
                <label for="propOpacity">Opacity</label>
                <input type="range" id="propOpacity" value="100" min="0" max="100">
                <span>100%</span>
            </div>
        </div>
    `;
    
    // Add event listeners to property inputs
    const propertyInputs = propertiesPanel.querySelectorAll('input');
    propertyInputs.forEach(input => {
        input.addEventListener('change', updateSelectedElementProperties);
    });
    
    // Add event listener to opacity range
    const opacityRange = document.getElementById('propOpacity');
    const opacityValue = opacityRange.nextElementSibling;
    
    opacityRange.addEventListener('input', function() {
        opacityValue.textContent = `${this.value}%`;
    });
}

function updateSelectedElementProperties() {
    // In a real app, this would update the properties of selected elements
    // For this demo, we'll just redraw the canvas
    redrawCanvas();
    
    // Save canvas state
    saveCanvasState();
}

function updateLayersPanel() {
    const layersPanel = document.querySelector('.layers-panel');
    if (!layersPanel) return;
    
    // Clear panel
    layersPanel.innerHTML = '';
    
    // For demo purposes, add some sample layers
    layersPanel.innerHTML = `
        <div class="layer-item" draggable="true">
            <div class="layer-visibility">
                <input type="checkbox" checked>
            </div>
            <div class="layer-preview">
                <div class="layer-preview-shape" style="background-color: #4a6cf7;"></div>
            </div>
            <div class="layer-name">Button</div>
            <div class="layer-actions">
                <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
            </div>
        </div>
        
        <div class="layer-item" draggable="true">
            <div class="layer-visibility">
                <input type="checkbox" checked>
            </div>
            <div class="layer-preview">
                <div class="layer-preview-shape" style="background-color: #e9ecef; border: 1px solid #495057;"></div>
            </div>
            <div class="layer-name">Rectangle</div>
            <div class="layer-actions">
                <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
            </div>
        </div>
        
        <div class="layer-item" draggable="true">
            <div class="layer-visibility">
                <input type="checkbox" checked>
            </div>
            <div class="layer-preview">
                <div class="layer-preview-text">T</div>
            </div>
            <div class="layer-name">Heading Text</div>
            <div class="layer-actions">
                <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
            </div>
        </div>
        
        <div class="layer-item" draggable="true">
            <div class="layer-visibility">
                <input type="checkbox" checked>
            </div>
            <div class="layer-preview">
                <div class="layer-preview-shape" style="background-color: white;"></div>
            </div>
            <div class="layer-name">Background</div>
            <div class="layer-actions">
                <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
            </div>
        </div>
    `;
    
    // Add event listeners to layer items
    const layerItems = layersPanel.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
        // Visibility toggle
        const visibilityCheckbox = item.querySelector('input[type="checkbox"]');
        visibilityCheckbox.addEventListener('change', function() {
            // In a real app, this would toggle layer visibility
            // For this demo, we'll just show a notification
            const layerName = item.querySelector('.layer-name').textContent;
            showNotification(`${layerName} visibility ${this.checked ? 'enabled' : 'disabled'}`, 'info');
        });
        
        // Layer selection
        item.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT' && !e.target.closest('.layer-actions')) {
                // Remove selected class from all layers
                layerItems.forEach(layer => layer.classList.remove('selected'));
                
                // Add selected class to clicked layer
                this.classList.add('selected');
                
                // In a real app, this would select the corresponding element on canvas
            }
        });
        
        // Layer actions
        const actionsButton = item.querySelector('.layer-actions .btn-icon');
        actionsButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Show context menu
            const layerName = item.querySelector('.layer-name').textContent;
            showLayerContextMenu(this, layerName);
        });
        
        // Drag and drop for layer reordering
        item.addEventListener('dragstart', handleLayerDragStart);
        item.addEventListener('dragover', handleLayerDragOver);
        item.addEventListener('drop', handleLayerDrop);
        item.addEventListener('dragend', handleLayerDragEnd);
    });
}

function showLayerContextMenu(button, layerName) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.layer-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'layer-context-menu';
    contextMenu.innerHTML = `
        <div class="context-menu-item">Rename</div>
        <div class="context-menu-item">Duplicate</div>
        <div class="context-menu-item">Bring to Front</div>
        <div class="context-menu-item">Send to Back</div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item text-danger">Delete</div>
    `;
    
    // Position menu
    const buttonRect = button.getBoundingClientRect();
    contextMenu.style.position = 'absolute';
    contextMenu.style.top = `${buttonRect.bottom}px`;
    contextMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
    contextMenu.style.zIndex = '1050';
    
    // Add to document
    document.body.appendChild(contextMenu);
    
    // Add event listeners to menu items
    const menuItems = contextMenu.querySelectorAll('.context-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.textContent;
            
            switch (action) {
                case 'Rename':
                    const newName = prompt('Enter new name:', layerName);
                    if (newName && newName.trim() !== '') {
                        const layerNameElement = button.closest('.layer-item').querySelector('.layer-name');
                        layerNameElement.textContent = newName;
                    }
                    break;
                    
                case 'Duplicate':
                    showNotification(`Duplicated layer: ${layerName}`, 'success');
                    break;
                    
                case 'Bring to Front':
                    showNotification(`Brought to front: ${layerName}`, 'info');
                    break;
                    
                case 'Send to Back':
                    showNotification(`Sent to back: ${layerName}`, 'info');
                    break;
                    
                case 'Delete':
                    if (confirm(`Are you sure you want to delete "${layerName}"?`)) {
                        button.closest('.layer-item').remove();
                        showNotification(`Deleted layer: ${layerName}`, 'success');
                    }
                    break;
            }
            
            // Close menu
            contextMenu.remove();
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!contextMenu.contains(e.target) && e.target !== button) {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Layer drag and drop functionality
let draggedItem = null;

function handleLayerDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Required for Firefox
    e.dataTransfer.setData('text/plain', '');
}

function handleLayerDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const layersPanel = this.parentElement;
    const children = Array.from(layersPanel.children);
    
    if (this !== draggedItem) {
        const thisRect = this.getBoundingClientRect();
        const draggedRect = draggedItem.getBoundingClientRect();
        
        const thisIndex = children.indexOf(this);
        const draggedIndex = children.indexOf(draggedItem);
        
        if (thisIndex < draggedIndex) {
            this.parentElement.insertBefore(draggedItem, this);
        } else {
            this.parentElement.insertBefore(draggedItem, this.nextElementSibling);
        }
    }
}

function handleLayerDrop(e) {
    e.preventDefault();
    // The actual reordering is done in dragOver
}

function handleLayerDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    
    // In a real app, this would update the layer order in the project data
    // For this demo, we'll just show a notification
    showNotification('Layer order updated', 'info');
}

/**
 * Modal initialization and functionality
 */
function initModals() {
    // Export modal
    const exportModal = document.getElementById('exportModal');
    const closeExportModal = document.getElementById('closeExportModal');
    
    if (exportModal && closeExportModal) {
        closeExportModal.addEventListener('click', function() {
            exportModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === exportModal) {
                exportModal.style.display = 'none';
            }
        });
        
        // Export format selection
        const formatOptions = exportModal.querySelectorAll('input[name="exportFormat"]');
        formatOptions.forEach(option => {
            option.addEventListener('change', function() {
                // Show/hide format-specific options
                const formatOptions = exportModal.querySelectorAll('.format-options');
                formatOptions.forEach(el => el.classList.add('hidden'));
                
                const selectedFormat = this.value;
                const selectedFormatOptions = exportModal.querySelector(`.format-options.${selectedFormat}-options`);
                if (selectedFormatOptions) {
                    selectedFormatOptions.classList.remove('hidden');
                }
            });
        });
        
        // Export button
        const exportButton = exportModal.querySelector('.export-btn');
        if (exportButton) {
            exportButton.addEventListener('click', function() {
                // Get selected format
                const selectedFormat = exportModal.querySelector('input[name="exportFormat"]:checked').value;
                
                // In a real app, this would export the canvas in the selected format
                // For this demo, we'll just download the canvas as an image
                const link = document.createElement('a');
                link.download = `export.${selectedFormat === 'svg' ? 'svg' : 'png'}`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Close modal
                exportModal.style.display = 'none';
                
                // Show notification
                showNotification(`Exported as ${selectedFormat.toUpperCase()}`, 'success');
            });
        }
    }
    
    // Share modal
    const shareModal = document.getElementById('shareModal');
    const closeShareModal = document.getElementById('closeShareModal');
    
    if (shareModal && closeShareModal) {
        closeShareModal.addEventListener('click', function() {
            shareModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
        
        // Copy link button
        const copyLinkBtn = shareModal.querySelector('.copy-link-btn');
        const shareLinkInput = shareModal.querySelector('.share-link');
        
        if (copyLinkBtn && shareLinkInput) {
            copyLinkBtn.addEventListener('click', function() {
                shareLinkInput.select();
                document.execCommand('copy');
                
                // Change button text temporarily
                const originalText = copyLinkBtn.textContent;
                copyLinkBtn.textContent = 'Copied!';
                
                setTimeout(function() {
                    copyLinkBtn.textContent = originalText;
                }, 2000);
            });
        }
    }
}

/**
 * Keyboard shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ignore if focus is in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        
        // Ctrl+Z: Undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        
        // Ctrl+Y or Ctrl+Shift+Z: Redo
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            redo();
        }
        
        // Ctrl+S: Save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveProject();
        }
        
        // Delete: Delete selected elements
        if (e.key === 'Delete' && selectedElements.length > 0) {
            e.preventDefault();
            deleteSelectedElements();
        }
        
        // Escape: Deselect all
        if (e.key === 'Escape') {
            e.preventDefault();
            deselectAll();
        }
        
        // Tool shortcuts
        switch (e.key) {
            case 'v':
                // Select tool
                document.querySelector('.tool-btn[data-tool="select"]')?.click();
                break;
                
            case 't':
                // Text tool
                document.querySelector('.tool-btn[data-tool="text"]')?.click();
                break;
                
            case 'r':
                // Rectangle shape
                document.querySelector('.shape-tool[data-shape="rectangle"]')?.click();
                break;
                
            case 'e':
                // Ellipse shape
                document.querySelector('.shape-tool[data-shape="ellipse"]')?.click();
                break;
                
            case 'l':
                // Line shape
                document.querySelector('.shape-tool[data-shape="line"]')?.click();
                break;
                
            case 'p':
                // Pen/draw tool
                document.querySelector('.tool-btn[data-tool="draw"]')?.click();
                break;
                
            case 'i':
                // Image tool
                document.querySelector('.tool-btn[data-tool="image"]')?.click();
                break;
                
            case 'c':
                // Comment tool
                document.querySelector('.tool-btn[data-tool="comment"]')?.click();
                break;
        }
    });
}

function deleteSelectedElements() {
    if (selectedElements.length === 0) return;
    
    // In a real app, this would remove the selected elements
    // For this demo, we'll just redraw the canvas with a white background
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear selection
    selectedElements = [];
    
    // Update properties panel
    updatePropertiesPanel();
    
    // Save canvas state
    saveCanvasState();
    
    // Show notification
    showNotification('Elements deleted', 'info');
}

/**
 * Project title editing
 */
function initProjectTitle() {
    const projectTitle = document.getElementById('projectTitle');
    if (!projectTitle) return;
    
    projectTitle.addEventListener('click', function() {
        this.contentEditable = true;
        this.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(this);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    });
    
    projectTitle.addEventListener('blur', function() {
        this.contentEditable = false;
    });
    
    projectTitle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
}

/**
 * Rulers and grid
 */
function initRulersAndGrid() {
    // Initialize rulers
    const horizontalRuler = document.querySelector('.ruler.horizontal');
    const verticalRuler = document.querySelector('.ruler.vertical');
    
    if (horizontalRuler && verticalRuler) {
        // Create ruler markings
        createRulerMarkings(horizontalRuler, 'horizontal');
        createRulerMarkings(verticalRuler, 'vertical');
    }
    
    // Initialize grid
    createGrid();
    
    // Update rulers initially
    updateRulers();
}

function createRulerMarkings(ruler, orientation) {
    const size = orientation === 'horizontal' ? canvas.width : canvas.height;
    const step = 50; // Pixels between major markings
    
    for (let i = 0; i <= size; i += step) {
        // Create major marking
        const majorMarking = document.createElement('div');
        majorMarking.className = 'ruler-marking major';
        
        if (orientation === 'horizontal') {
            majorMarking.style.left = `${i}px`;
        } else {
            majorMarking.style.top = `${i}px`;
        }
        
        // Add label for major markings
        if (i > 0) {
            const label = document.createElement('span');
            label.className = 'ruler-label';
            label.textContent = i;
            majorMarking.appendChild(label);
        }
        
        ruler.appendChild(majorMarking);
        
        // Create minor markings (except at the last major marking)
        if (i < size) {
            for (let j = 10; j < step; j += 10) {
                if (j % 10 === 0) {
                    const minorMarking = document.createElement('div');
                    minorMarking.className = 'ruler-marking minor';
                    
                    if (orientation === 'horizontal') {
                        minorMarking.style.left = `${i + j}px`;
                    } else {
                        minorMarking.style.top = `${i + j}px`;
                    }
                    
                    ruler.appendChild(minorMarking);
                }
            }
        }
    }
}

function createGrid() {
    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer) return;
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    
    // Add grid to canvas container
    canvasContainer.appendChild(gridContainer);
}

function updateRulers() {
    // Update ruler positions based on canvas offset
    const horizontalRuler = document.querySelector('.ruler.horizontal');
    const verticalRuler = document.querySelector('.ruler.vertical');
    
    if (horizontalRuler && verticalRuler) {
        horizontalRuler.style.transform = `translateX(${canvasOffset.x}px) scale(${canvasScale})`;
        verticalRuler.style.transform = `translateY(${canvasOffset.y}px) scale(${canvasScale})`;
    }
}

/**
 * Project data loading
 */
function loadProjectData() {
    const projectId = getProjectIdFromUrl();
    
    if (!projectId) {
        // New project, nothing to load
        return;
    }
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading project...</div>
    `;
    document.body.appendChild(loadingIndicator);
    
    // Simulate API call to load project data
    setTimeout(function() {
        // In a real app, this would be an actual API call
        
        // Set project title
        const projectTitle = document.getElementById('projectTitle');
        if (projectTitle) {
            projectTitle.textContent = `Project #${projectId}`;
        }
        
        // Load canvas data
        const img = new Image();
        img.onload = function() {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Save initial state
            saveCanvasState();
            
            // Remove loading indicator
            loadingIndicator.remove();
            
            // Show notification
            showNotification('Project loaded successfully!', 'success');
        };
        img.src = '../assets/images/projects/project' + (projectId % 5 + 1) + '.jpg';
    }, 1500);
}

/**
 * Notification system
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                background-color: white;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
            }
            
            .notification-content i {
                margin-right: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #6c757d;
            }
            
            .notification.success {
                border-left: 4px solid #28a745;
            }
            
            .notification.error {
                border-left: 4px solid #dc3545;
            }
            
            .notification.info {
                border-left: 4px solid #17a2b8;
            }
            
            .notification.warning {
                border-left: 4px solid #ffc107;
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
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

function closeNotification(notification) {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        notification.remove();
    }, 300);
}

function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}