"use strict";

let rotationDirection = 1, rotationSpeed = 0.01, rotationAngle = 0.0;
let pointsOfStar = [], colorsOfStar = [];
let angleLocation, buffersForColor;

let drawingSurface, webGLinstance, shaderProgram;

// Function to construct the vertices of a star
function constructStarPoints() {
    const points = 5;
    const outerRad = 0.5;
    const innerRad = outerRad * 0.5 * Math.cos(Math.PI / points) / Math.cos(Math.PI / points - Math.PI / points / 2);

    for (let i = 0; i < points; i++) {
        const outerTheta = i * 2 * Math.PI / points - Math.PI / 2;
        const innerTheta = (i * 2 + 1) * Math.PI / points - Math.PI / 2;
        pointsOfStar.push(vec2(outerRad * Math.cos(outerTheta), outerRad * Math.sin(outerTheta)));
        pointsOfStar.push(vec2(innerRad * Math.cos(innerTheta), innerRad * Math.sin(innerTheta)));
    }
}

// Function to generate random colors for the star
function generateRandomStarColors() {
    colorsOfStar = [];
    for (let i = 0; i < 10; i++) {
        colorsOfStar.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
    }
}

// Function to initialize WebGL
function initializeWebGL() {
    drawingSurface = document.getElementById("gl-canvas");
    webGLinstance = WebGLUtils.setupWebGL(drawingSurface);
    if (!webGLinstance) { alert("WebGL isn't available"); }

    webGLinstance.viewport(0, 0, drawingSurface.width, drawingSurface.height);
    webGLinstance.clearColor(1.0, 1.0, 1.0, 1.0);

    shaderProgram = initShaders(webGLinstance, "vertex-shader", "fragment-shader");
    webGLinstance.useProgram(shaderProgram);

    constructStarPoints();
    generateRandomStarColors();

    prepareBuffers();
    attachEventListeners();

    renderFrame();
}

// Function to prepare buffers
function prepareBuffers() {
    setupVertexBuffers();
    setupColorBuffers();
}

// Function to setup vertex buffers
function setupVertexBuffers() {
    const vertexBuffer = webGLinstance.createBuffer();
    webGLinstance.bindBuffer(webGLinstance.ARRAY_BUFFER, vertexBuffer);
    webGLinstance.bufferData(webGLinstance.ARRAY_BUFFER, flatten(pointsOfStar), webGLinstance.STATIC_DRAW);

    const vertexPos = webGLinstance.getAttribLocation(shaderProgram, "vPosition");
    webGLinstance.vertexAttribPointer(vertexPos, 2, webGLinstance.FLOAT, false, 0, 0);
    webGLinstance.enableVertexAttribArray(vertexPos);
}

// Function to setup color buffers
function setupColorBuffers() {
    const colorBuffer = webGLinstance.createBuffer();
    webGLinstance.bindBuffer(webGLinstance.ARRAY_BUFFER, colorBuffer);
    webGLinstance.bufferData(webGLinstance.ARRAY_BUFFER, flatten(colorsOfStar), webGLinstance.STATIC_DRAW);

    const vertexColor = webGLinstance.getAttribLocation(shaderProgram, "vColor");
    webGLinstance.vertexAttribPointer(vertexColor, 4, webGLinstance.FLOAT, false, 0, 0);
    webGLinstance.enableVertexAttribArray(vertexColor);

    buffersForColor = colorBuffer;
}

// Function to attach event listeners
function attachEventListeners() {
    document.getElementById("direction").addEventListener("click", () => rotationDirection *= -1);
    document.getElementById("speedup").addEventListener("click", () => rotationSpeed *= 1.5);
    document.getElementById("slowdown").addEventListener("click", () => rotationSpeed /= 1.5);
    document.getElementById("color").addEventListener("click", updateStarColors);
}

// Function to update star colors
function updateStarColors() {
    generateRandomStarColors();
    webGLinstance.bindBuffer(webGLinstance.ARRAY_BUFFER, buffersForColor);
    webGLinstance.bufferData(webGLinstance.ARRAY_BUFFER, flatten(colorsOfStar), webGLinstance.STATIC_DRAW);
}

// Function to render the frame
function renderFrame() {
    webGLinstance.clear(webGLinstance.COLOR_BUFFER_BIT);

    rotationAngle += rotationSpeed * rotationDirection;
    angleLocation = webGLinstance.getUniformLocation(shaderProgram, "theta");
    webGLinstance.uniform1f(angleLocation, rotationAngle);

    webGLinstance.drawArrays(webGLinstance.LINE_LOOP, 0, 10);

    window.requestAnimationFrame(renderFrame);
}

window.onload = initializeWebGL;
