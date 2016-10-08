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