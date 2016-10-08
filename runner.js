"use strict";

var context, canvas, player;

var start = function() {
    canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 300;
    canvas.style.backgroundColor = "whitesmoke";
    canvas.style.border = "lightgray solid 1px"
    context = canvas.getContext("2d");

    document.body.style.textAlign = "center";
    document.body.appendChild(canvas);
    window.addEventListener("keydown", function(e) { onKeyEvent(e.keyCode, true) });
    window.addEventListener("keyup", function(e) { onKeyEvent(e.keyCode, false) });
    
    startRenderTimer();
}

var startRenderTimer = function() {
    window.setInterval(function() {
        redraw();
    }, 1000 / 60);
}

var redraw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
}

var snapBy = function(value, multiple) {
    return Math.round(value / multiple) * multiple;
}

var clamp = function(value, min, max) {
    if (min != null && value < min) return min;
    if (max != null && value > max) return max;
    return value;
}

var playerY = 0, thrust = 0;
var drawPlayer = function() {
    var w = 35, h = 50;
    var gravity = 3.2;
    
    playerY = clamp(playerY + thrust - gravity, 0, canvas.height - h);
    
    context.fillRect((canvas.width / 10), canvas.height - h - playerY, w, h);
}

var obstacles = [];
var drawObstacles = function() {
    if (obstacles.length <= 3) {
        createObstacle();
    }

    obstacles.forEach(function(obstacle) {
        obstacle.x -= 2;
        context.fillRect(obstacle.x, obstacle.y, 40, 40);
    });

    obstacles = obstacles.filter(function(obstacle) {
        return obstacle.x > -50;
    });
}

var createObstacle = function() {
    obstacles.push({
        x: canvas.width + snapBy(Math.random() * 1000, 40 * 1.5),
        y: canvas.height - 40
    });
}

var onKeyEvent = function(code, pressed) {
    switch (code) {
        case 32:
            thrust = pressed && 10 || 0;
            break;
        default:
            break;
    }
}

start();