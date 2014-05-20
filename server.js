var port = 9186;

var express = require("express");
var app = express();
app.use(express.static(__dirname + "/html"));

var server = require("http").createServer(app).listen(port);
var io = require("socket.io").listen(server);

var collisionMargin = 12;

function Rect(x, y, width, height) {
    this.x = x + collisionMargin;
    this.y = y + collisionMargin;
    this.width = width - collisionMargin * 2;
    this.height = height - collisionMargin * 2;

    this.intersects = function (other) {
        return !(this.x > other.x + other.width ||
            this.x + this.width < other.x ||
            this.y > other.y + other.height ||
            this.y + this.height < other.y);
    };
}

function Treasure() {
    this.x = getRandom(0, 500);
    this.y = getRandom(0, 320);

    this.getRect = function () {
        return new Rect(this.x, this.y, 64, 64);
    };
}

var currentTreasure = new Treasure();

function getRandom(min, max) {
    return Math.floor(min + (1 + max - min) * Math.random());
}

function Player(id) {
    this.id = id;

    this.x = 0;
    this.y = 0;

    this.name = "";
    this.image = 0;

    this.score = 0;

    this.getRect = function () {
        return new Rect(this.x, this.y, 64, 64);
    };
}

var botSpeed = 1.5;

function Bot(id) {
    this.id = id;

    this.name = "Bot #" + (parseInt(id.substr(3), 10) + 1);
    this.score = 0;

    this.x = getRandom(0, 500);
    this.y = getRandom(0, 320);

    this.image = getRandom(1, 3);

    setInterval(function () {
        var vector = {
            x: currentTreasure.x - this.x,
            y: currentTreasure.y - this.y
        };
        var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        this.x += vector.x / length * botSpeed;
        this.y += vector.y / length * botSpeed;

        if (this.getRect().intersects(currentTreasure.getRect())) { this.score++; broadcastScores(); }

        io.sockets.emit("movePlayer", { id: this.id, x: this.x, y: this.y });
    }.bind(this), 10);

    this.getRect = function () {
        return new Rect(this.x, this.y, 64, 64);
    };
}

function sortScores(a, b) {
    if (a.score > b.score) { return -1; }
    else if (a.score < b.score) { return 1; }
    else { return 0; }
}

function getScores() {
    var scores = [];
    for (var player in players) {
        scores.push({ name: players[player].name, score: players[player].score });
    }

    scores.sort(sortScores);
    return scores;
}

function broadcastScores() {
    currentTreasure = new Treasure();

    io.sockets.emit("newTreasure", { x: currentTreasure.x, y: currentTreasure.y });
    io.sockets.emit("scores", getScores());
}

var players = {};

var maxBotCount = 5;
var botCount = 0;

io.set("log level", 2);
io.sockets.on("connection", function (socket) {
    var id = Object.keys(players).length;

    socket.emit("login", { id: id, x: currentTreasure.x, y: currentTreasure.y });
    socket.emit("scores", getScores());

    for (var player in players) {
        socket.emit("addPlayer", { id: players[player].id, name: players[player].name, x: players[player].x, y: players[player].y, image: players[player].image });
    }

    players[id] = new Player(id);

    socket.on("playerData", function (data) {
        console.log("Player connected: " + JSON.stringify(data));

        players[data.id].name = data.name;
        players[data.id].image = data.image;

        socket.broadcast.emit("addPlayer", { id: data.id, name: data.name, x: data.x, y: data.y, image: data.image });
        io.sockets.emit("scores", getScores());
    });

    socket.on("addBot", function (data) {
        if (botCount === maxBotCount) {
            socket.emit("message", "There are already too many bots, please don't add more.");
        }
        else {
            var botName = "Bot" + botCount++;
            players[botName] = new Bot(botName);
            io.sockets.emit("addPlayer", { id: players[botName].id, name: players[botName].id, x: players[botName].x, y: players[botName].y, image: players[botName].image });
        }
    });

    socket.on("position", function (data) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;

        socket.broadcast.emit("movePlayer", { id: data.id, x: data.x, y: data.y });

        if (players[data.id].getRect().intersects(currentTreasure.getRect())) {
            players[data.id].score += 1;
            broadcastScores();
        }
    });

    socket.on("disconnect", function () {
        delete players[id];
        socket.broadcast.emit("removePlayer", { id: id });
        socket.broadcast.emit("scores", getScores());
    });
});

io.of("/chat").on("connection", function (socket) {
    socket.on("message", function (data) {
        socket.broadcast.emit("addMessage", data);
    });
});