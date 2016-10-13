"use strict";

var context, canvas;
var player = {};
var obstacles = [];
var trees = [];
var stars = [];
var GRAVITY = 12.5;
var points = 0;
var spritesheet;
var isDead = false, isLimbo = false;
var gameTimer, animationTimer;
var elapsed = 0;
var isKeyPressed = false;

var FRAME_RATE = 60;
var SPACE_KEY = 32;
var ESC_KEY = 27;

var spritePositions = {
    "fire":  { x: 5,   y: 5,  w: 48, h: 48 },
    "fire2": { x: 63,  y: 5,  w: 48, h: 48 },
    "walk":  { x: 121, y: 5,  w: 48, h: 48 },
    "walk2": { x: 81,  y: 63, w: 48, h: 48 },
    "tree":  { x: 39,  y: 63, w: 32, h: 58 },
    "star":  { x: 5,   y: 63, w: 24, h: 23 }
};

var spriteData = "data:image/png;base64,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";

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
    isDead = false;
    isLimbo = false;
    elapsed = 0;

    setupSprites();
    setupPlayer();
    setupTimers();
}

var exit = function () {
    document.removeEventListener("keydown", onKeyEvent);
    document.getElementById("runner-easter-egg").remove();

    clearInterval(gameTimer);
    clearInterval(animationTimer);
}

var setupPlayer = function () {
    player.x = canvas.width / 10;
    player.jump = 0;
    player.y = 0;
    player.h = 48;
    player.w = 48;
    player.sprite = 0;
    player.sprites = ["walk", "walk2"];
}

var setupSprites = function () {
    spritesheet = new Image();
    spritesheet.src = spriteData;
}

var setupTimers = function () {
    clearInterval(gameTimer);
    clearInterval(animationTimer);

    gameTimer = window.setInterval(function () {
        redraw();
        elapsed += 1 / FRAME_RATE;
    }, 1000 / FRAME_RATE);

    animationTimer = window.setInterval(function () {
        nextSprite(player);

        obstacles.forEach(function (obstacle) {
            nextSprite(obstacle);
        });
    }, 100);
}

var nextSprite = function (item) {
    if (isDead) return;

    item.sprite++;

    if (item.sprite >= item.sprites.length)
        item.sprite = 0;
}

var redraw = function () {
    // clear screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawStars();
    drawPlayer();
    drawObstacles();
    drawGUI();

    detectCollisions();
}

var die = function () {
    isDead = true;
    isLimbo = true;

    setTimeout(function () {
        isLimbo = false;
    }, 500);
}

var drawGUI = function () {
    context.textAlign = "right";
    context.font = "bold 15px Courier";
    context.fillText(points, canvas.width - 30, 30);

    if (isDead) {
        context.textAlign = "center";
        context.font = "bold 42px Courier";
        context.fillText("FIN.", canvas.width / 2, canvas.height / 2);
    }
}

var snapBy = function (value, multiple) {
    return Math.round(value / multiple) * multiple;
}

var clamp = function (value, min, max) {
    if (min != null && value < min) return min;
    if (max != null && value > max) return max;
    return value;
}

var drawPlayer = function () {
    if (!isDead) {
        // decay jump
        player.jump = Math.max(0, player.jump - 0.3);
        player.y = clamp(player.y + player.jump - GRAVITY, 0, 400);
    }

    renderObject(player);
}

var renderObject = function (item) {
    var key = item.sprites[item.sprite];
    var position = spritePositions[key];
    
    // reverses y axis, since canvas origin is top left, not top bottom
    var invertedY = canvas.height - item.h - item.y;

    context.drawImage(spritesheet, position.x, position.y, position.w, position.h, item.x, invertedY, item.w, item.h);
}

var isBetween = function (value, min, max) {
    return value >= min && value <= max;
}

var detectCollisions = function () {
    var playerBounds = getBounds(player);

    stars.forEach(function (star) {
        var starBounds = getBounds(star);

        var intersectX = isBetween(playerBounds.right, starBounds.left, starBounds.right) || isBetween(playerBounds.left, starBounds.left, starBounds.right);
        var intersectY = isBetween(playerBounds.bottom, starBounds.bottom, starBounds.top) || isBetween(playerBounds.top, starBounds.bottom, starBounds.top);

        if (intersectX && intersectY && !star.collected) {
            star.collected = true;
            points += 10;
        }
    });

    return obstacles.some(function (obstacle) {
        var obstacleBounds = getBounds(obstacle);

        var intersectX = isBetween(playerBounds.right, obstacleBounds.left, obstacleBounds.right) || isBetween(playerBounds.left, obstacleBounds.left, obstacleBounds.right);
        var intersectY = isBetween(playerBounds.bottom, obstacleBounds.bottom, obstacleBounds.top) || isBetween(playerBounds.top, obstacleBounds.bottom, obstacleBounds.top);

        var wasHit = intersectX && intersectY;

        if (wasHit) {
            die();
            return true;
        }

        var wasAvoided = intersectX && !intersectY;

        if (wasAvoided && !obstacle.avoided) {
            points += 10;
            obstacle.avoided = true;
        }

        return wasHit
    });
}

var getBounds = function (item) {
    var toleranceX = 0.25;
    var toleranceTop = 0.33;

    return {
        left: item.x + (item.w * toleranceX),
        right: item.x + item.w - (item.w * toleranceX),
        top: item.y + item.h - (item.h * toleranceTop),
        bottom: item.y
    };
}

var drawObstacles = function () {
    var obstacleSpeedPerElapsed = Math.pow(elapsed, 0.1) + 1;

    if (obstacles.length <= 3) {
        createObstacle();
    }

    obstacles.forEach(function (obstacle) {
        if (!isDead) {
            // move obstacle
            obstacle.x -= obstacleSpeedPerElapsed;
        }

        renderObject(obstacle);
    });

    obstacles = obstacles.filter(function (obstacle) {
        return obstacle.x > -50;
    });
}

var createObstacle = function () {
    var side = 40;

    obstacles.push({
        x: canvas.width + Math.random() * 1000 + side * 2,
        y: 0,
        h: side,
        w: side,
        sprite: 0,
        sprites: ["fire", "fire2"]
    });
}

var drawBackground = function () {
    var treeSpeedPerElapsed = Math.pow(elapsed, 0.1) * 0.8;

    if (trees.length <= 5) {
        createTree();
    }

    trees.forEach(function (tree) {
        if (!isDead) {
            // move tree
            tree.x -= treeSpeedPerElapsed;
        }

        renderObject(tree);
    });

    trees = trees.filter(function (tree) {
        return tree.x > -50;
    });
}

var createTree = function () {
    var side = 40;
    var scale = Math.random() * 0.4 + 0.9;

    trees.push({
        x: canvas.width + Math.random() * 1000,
        y: 0,
        h: 120 * scale,
        w: 64 * scale,
        sprite: 0,
        sprites: ["tree"]
    });
}

var drawStars = function () {
    var starsPerElapsed = elapsed * 0.1;
    var starSpeedPerElapsed = Math.pow(elapsed, 0.1) + 1;

    if (stars.length <= starsPerElapsed) {
        createStar();
    }

    stars.forEach(function (star) {
        if (star.collected)
            return;

        if (!isDead) {
            // move star
            star.x -= starSpeedPerElapsed;
        }

        renderObject(star);
    });

    stars = stars.filter(function (star) {
        return star.x > -50;
    });
}

var createStar = function () {
    stars.push({
        x: canvas.width + Math.random() * 1000 + Math.random() * 1000,
        y: 100,
        h: 23,
        w: 24,
        sprite: 0,
        sprites: ["star"]
    });
}

var jump = function (isPressed) {
    if (player.y != 0)
        return;

    player.jump = 20;
}

var onKeyEvent = function (e) {
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

setup();