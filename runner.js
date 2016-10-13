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
    spritesheet.src = "spritesheet.png";
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
    context.drawImage(spritesheet, position.x, position.y, position.w, position.h, item.x, canvas.height - item.h - item.y, item.w, item.h);
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