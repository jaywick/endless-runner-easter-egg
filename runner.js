"use strict";

var context, canvas;
var player = {};
var obstacles = [];
var GRAVITY = 12.5;
var points = 0;
var sprites = {};
var isDead = false, isLimbo = false;
var gameTimer, animationTimer;
var elapsed = true;

var FRAME_RATE = 60;

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
}

var setup = function () {
    obstacles = [];
    points = 0;
    sprites = {};
    isDead = false;
    isLimbo = false;

    clearInterval(gameTimer);
    clearInterval(animationTimer);

    setupSprites();
    setupPlayer();
    setupTimers();
}

var setupPlayer = function() {
    player.x = canvas.width / 10;
    player.jump = 0;
    player.y = 0;
    player.h = 48;
    player.w = 48;
    player.sprite = 0;
    player.sprites = [ "walk", "walk2" ];
}

var setupSprites = function() {
    ["walk", "walk2", "fire", "fire2"].forEach(function(image) {
        var sprite = new Image();
        sprite.src = `content/${image}.png`;
        sprites[image] = sprite;
    });
}

var setupTimers = function() {
    gameTimer = window.setInterval(function() {
        redraw();
        elapsed += 1 / FRAME_RATE;
    }, 1000 / FRAME_RATE);

    animationTimer = window.setInterval(function() {
        nextSprite(player);

        obstacles.forEach(function(obstacle) {
            nextSprite(obstacle);
        });
    }, 100);
}

var nextSprite = function(item) {
    if (isDead) return;

    item.sprite++;
    
    if (item.sprite >= item.sprites.length)
        item.sprite = 0;
}

var redraw = function() {
    // clear screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    drawPlayer();
    drawGUI();

    if (hasCollided())
        die();
}

var die = function() {
    isDead = true;
    isLimbo = true;

    setTimeout(function() {
        isLimbo = false;
    }, 500);
}

var drawGUI = function() {
    context.textAlign = "right";
    context.font = "bold 15px Courier";
    context.fillText(points + " points", canvas.width - 30, 30);

    if (isDead) {
        context.textAlign = "center";
        context.font = "bold 42px Courier";
        context.fillText("WASTED", canvas.width / 2, canvas.height / 2);
    }
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
    if (!isDead) {
        // decay jump
        player.jump = Math.max(0, player.jump - 0.3);
        player.y = clamp(player.y + player.jump - GRAVITY, 0, 400);
    }

    renderObject(player);
}

var renderObject = function(item) {
    var key = item.sprites[item.sprite];
    context.drawImage(sprites[key], item.x, canvas.height - item.h - item.y, item.w, item.h);
}

var isBetween = function(value, min, max) {
    return value >= min && value <= max;
}

var hasCollided = function() {
    var playerBounds = getBounds(player);

    return obstacles.some(function(obstacle) {
        var obstacleBounds = getBounds(obstacle);

        // apply collision tolerance to obstacles
        obstacleBounds.top -= 10;
        obstacleBounds.left += 7;
        obstacleBounds.right -= 10;
        
        var intersectX = isBetween(playerBounds.right, obstacleBounds.left, obstacleBounds.right)  || isBetween(playerBounds.left, obstacleBounds.left, obstacleBounds.right);
        var intersectY = isBetween(playerBounds.bottom, obstacleBounds.bottom, obstacleBounds.top) || isBetween(playerBounds.top, obstacleBounds.bottom, obstacleBounds.top);

        var wasHit = intersectX && intersectY;
        var wasAvoided = intersectX && !intersectY;

        if (wasAvoided && !obstacle.avoided) {
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
    var obstaclesPerElapsed = Math.pow(elapsed, 0.1);

    if (obstacles.length <=  obstaclesPerElapsed) {
        createObstacle();
    }

    obstacles.forEach(function(obstacle) {
        if (!isDead) {
            // move obstacle
            obstacle.x -= 2;
        }
        
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
        sprite: 0,
        sprites: [ "fire", "fire2" ]
    });
}

var jump = function(isPressed) {
    if (player.y != 0)
        return;

    player.jump = 20;
}

var onKeyEvent = function(code) {
    if (code === 32) {
        // space
        if (isDead) {
            if (isLimbo) return;

            setup();
            return;
        }

        jump();
    }
}

window.onload = function() {
    start();
}