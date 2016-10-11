"use strict";

var context, canvas;
var player = {};
var obstacles = [];
var trees = [];
var GRAVITY = 12.5;
var points = 0;
var sprites = {};
var isDead = false, isLimbo = false;
var gameTimer, animationTimer;
var elapsed = 0;
var isKeyPressed = false;

var FRAME_RATE = 60;
var SPACE_KEY = 32;
var ESC_KEY = 27;

var setup = function () {
    canvas = document.createElement("canvas");
    canvas.id = "runner-easter-egg"
    canvas.width = 700;
    canvas.height = 300;
    canvas.style.backgroundColor = "whitesmoke";
    canvas.style.border = "lightgray solid 1px"
    context = canvas.getContext("2d");

    document.body.style.textAlign = "center";
    document.body.appendChild(canvas);

    document.addEventListener("keydown", onKeyEvent);

    start();
}

var start = function () {
    obstacles = [];
    points = 0;
    sprites = {};
    isDead = false;
    isLimbo = false;
    elapsed = 0;

    setupSprites();
    setupPlayer();
    setupTimers();
}

var exit = function() {
    document.removeEventListener("keydown", onKeyEvent);
    document.getElementById("runner-easter-egg").remove();

    clearInterval(gameTimer);
    clearInterval(animationTimer);

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
    ["walk", "walk2", "fire", "fire2", "tree"].forEach(function(image) {
        var sprite = new Image();
        sprite.src = `content/${image}.png`;
        sprites[image] = sprite;
    });
}

var setupTimers = function() {
    clearInterval(gameTimer);
    clearInterval(animationTimer);

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

    drawBackground();
    drawPlayer();
    drawObstacles();
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
    context.fillText(points, canvas.width - 30, 30);

    if (isDead) {
        context.textAlign = "center";
        context.font = "bold 42px Courier";
        context.fillText("FIN.", canvas.width / 2, canvas.height / 2);
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
    var toleranceX = 0.25;
    var toleranceTop = 0.33;

    return {
        left:   item.x + (item.w * toleranceX),
        right:  item.x + item.w - (item.w * toleranceX),
        top:    item.y + item.h - (item.h * toleranceTop),
        bottom: item.y
    };
}

var drawObstacles = function() {
    var obstaclesPerElapsed = Math.pow(elapsed, 0.1);
    var obstacleSpeedPerElapsed = Math.pow(elapsed, 0.1) + 1;

    if (obstacles.length <=  obstaclesPerElapsed) {
        createObstacle();
    }

    obstacles.forEach(function(obstacle) {
        if (!isDead) {
            // move obstacle
            obstacle.x -= obstacleSpeedPerElapsed;
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
        x: canvas.width + snapBy(Math.random() * 1000, side * 5),
        y: 0,
        h: side,
        w: side,
        sprite: 0,
        sprites: [ "fire", "fire2" ]
    });
}

var drawBackground = function() {
    var treeSpeedPerElapsed = Math.pow(elapsed, 0.1) * 0.8;

    if (trees.length <=  5) {
        createTree();
    }

    trees.forEach(function(tree) {
        if (!isDead) {
            // move tree
            tree.x -= treeSpeedPerElapsed;
        }
        
        renderObject(tree);
    });

    trees = trees.filter(function(tree) {
        return tree.x > -50;
    });
}

var createTree = function() {
    var side = 40;
    var scale = Math.random() * 0.4 + 0.9;

    trees.push({
        x: canvas.width + Math.random() * 1000,
        y: 0,
        h: 120 * scale,
        w: 64 * scale,
        sprite: 0,
        sprites: [ "tree" ]
    });
}

var jump = function(isPressed) {
    if (player.y != 0)
        return;

    player.jump = 20;
}

var onKeyEvent = function(e) {
    if (e.keyCode === SPACE_KEY) {
        if (isDead) {
            if (isLimbo) return;

            start();
            return;
        }

        jump();
    } else if (e.keyCode === ESC_KEY) {
        exit();
    }
}

window.onload = function() {
    setup();
}