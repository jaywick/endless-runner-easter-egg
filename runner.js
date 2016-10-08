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
    
    createObstacle();
    createObstacle();
    createObstacle();
    createObstacle();

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

Number.prototype.clamp = function(min, max) {
    if (min != null && this < min) return min;
    if (max != null && this > max) return max;
    return this;
}

var playerY = 0, thrust = 0;
var drawPlayer = function() {
    var w = 35, h = 50;
    var gravity = 3.2;
    
    playerY = (playerY + thrust - gravity).clamp(0, canvas.height - h);
    
    context.fillRect((canvas.width / 10), canvas.height - h - playerY, w, h);
}

var obstacles = [];
var drawObstacles = function() {
    if (obstacles.length < 4) {
        createObstacle();
    }

    obstacles.forEach(function(obstacle) {
        obstacle.x -= 4;
        context.fillRect(obstacle.x, obstacle.y, 10, 10);
    });

    obstacles = obstacles.filter(function(obstacle) {
        return obstacle.x > -10;
    });

    console.log(obstacles.length);
}

var createObstacle = function() {
    obstacles.push({
        x: canvas.width - 20,
        y: Math.random() * canvas.height
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