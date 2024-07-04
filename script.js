const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext('2d');
let paths = [];
let redostack = [];

let drawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let brushSize = 5;

function setupCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpi = window.devicePixelRatio;

    canvas.width = rect.width * dpi;
    canvas.height = rect.height * dpi;
}

setupCanvas();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pencilbtn').addEventListener('click', () => setActiveTool('pencil'));
    document.getElementById('erasorbtn').addEventListener('click', () => setActiveTool('erasor'));
    document.getElementById('undobtn').addEventListener('click', () => undoLastAction());
    document.getElementById('redobtn').addEventListener('click', () => redoLastAction());
    document.getElementById('clearbtn').addEventListener('click', clearCanvas);
    document.getElementById('colorbtn').addEventListener('change', (e) => { 
        currentColor = e.target.value;
        setActiveTool('pencil');
    });
    document.getElementById('savebtn').addEventListener('click', saveDrawing);
    document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = e.target.value; 
    });

    // Mouse event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    // Touch event listeners
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);

    setActiveTool('pencil');
});

function setActiveTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.toolItem').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tool}btn`).classList.add('active');
}

function stopDrawing() {
    drawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths = [];
    redostack = [];
}

function draw(e) {
    e.preventDefault(); 
    if (!drawing) return;
    const pos = getMouseOrTouchPos(e);
    paths[paths.length - 1].points.push(pos);
    redraw();
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach(drawpath);
}

function drawpath(path) {
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);

    for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y); 
    }
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.stroke();
}

function getMouseOrTouchPos(evt) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (evt.clientX !== undefined && evt.clientY !== undefined) {
        x = (evt.clientX - rect.left) * (canvas.width / rect.width);
        y = (evt.clientY - rect.top) * (canvas.height / rect.height);
    } else if (evt.touches[0]) {
        const touch = evt.touches[0];
        x = (touch.clientX - rect.left) * (canvas.width / rect.width);
        y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    }

    return { x, y };
}

function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    const pos = getMouseOrTouchPos(e);
    paths.push({
        color: currentTool === 'erasor' ? 'white' : currentColor,
        points: [pos],
        width: brushSize
    });
    redostack = [];
}

function undoLastAction() {
    if (paths.length > 0) {
        redostack.push(paths.pop());
        redraw();
    }
}

function redoLastAction() {
    if (redostack.length > 0) {
        paths.push(redostack.pop());
        redraw();
    }
}

function saveDrawing() {
    const previousBackgroundColor = canvas.style.backgroundColor; 
    canvas.style.backgroundColor = 'white';
    const prevFillStyle = ctx.fillStyle;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    paths.forEach(drawpath);
    ctx.fillStyle = prevFillStyle;
    const dataURL = canvas.toDataURL(); 
    const a = document.createElement('a'); 
    a.href = dataURL;
    a.download = 'drawing.png'; 
    a.click(); 

    canvas.style.backgroundColor = previousBackgroundColor; 
}
