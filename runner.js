"use strict";

var context, canvas;
var player = {};
var obstacles = [];
var GRAVITY = 9.8;
var points = 0;

var start = function() {
    canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 300;
    canvas.style.backgroundColor = "whitesmoke";
    canvas.style.border = "lightgray solid 1px"
    context = canvas.getContext("2d");

    document.body.style.textAlign = "center";
    document.body.appendChild(canvas);
    window.addEventListener("keypress", function(e) { onKeyEvent(e.keyCode) });
    
    setup();
    startRenderTimer();
}

var setup = function () {
    player.x = canvas.width / 10;
    player.jump = 0;
    player.y = 0;
    player.h = 50;
    player.w = 35;
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

    if (hasCollided())
        console.log("collision!");

    console.log(points);
}

var snapBy = function(value, multiple) {
    return Math.round(value / multiple) * multiple;
}

var clamp = function(value, min, max) {
    if (min != null && value < min) return min;
    if (max != null && value > max) return max;
    return value;
}

var drawPlayer = function() {
    // decay jump
    player.jump = Math.max(0, player.jump - 0.3);

    player.y = clamp(player.y + player.jump - GRAVITY, 0, 400);
    renderObject(player);
}

var renderObject = function(item) {
    context.fillRect(item.x, canvas.height - item.h - item.y, item.w, item.h);
}

var isBetween = function(value, min, max) {
    return value >= min && value <= max;
}

var hasCollided = function() {
    var playerBounds = getBounds(player);

    return obstacles.some(function(obstacle) {
        var obstacleBounds = getBounds(obstacle);
        
        var wasHit = (playerBounds.right  > obstacleBounds.left && playerBounds.left < obstacleBounds.right)
            || (playerBounds.bottom > obstacleBounds.top && playerBounds.top  < obstacleBounds.bottom);

        var avoided = (playerBounds.right  > obstacleBounds.left && playerBounds.left < obstacleBounds.right)
                   || (playerBounds.bottom < obstacleBounds.top  && playerBounds.top  < obstacleBounds.bottom);

        if (avoided && !obstacle.avoided) {
            points += 10;
            obstacle.avoided = true;
        }

        return wasHit;
    });
}

var getBounds = function(item) {
    return {
        left:   item.x,
        right:  item.x + item.w,
        top:    item.y + item.h,
        bottom: item.y
    };
}

var drawObstacles = function() {
    if (obstacles.length <= 2) {
        createObstacle();
    }

    obstacles.forEach(function(obstacle) {
        obstacle.x -= 2;
        renderObject(obstacle);
    });

    obstacles = obstacles.filter(function(obstacle) {
        return obstacle.x > -50;
    });
}

var createObstacle = function() {
    var side = 40;

    obstacles.push({
        x: canvas.width + snapBy(Math.random() * 1000, side * 2.5),
        y: 0,
        h: side,
        w: side,
    });
}

var jump = function(isPressed) {
    if (player.y != 0)
        return;

    player.jump = 20;
}

var onKeyEvent = function(code) {
    switch (code) {
        case 32:
            jump();
            break;
        default:
            break;
    }
}

start();