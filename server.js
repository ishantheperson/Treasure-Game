var port = 9186;

var express = require("express");
var app = express();
app.use(express.static(__dirname + "/html"));

var server = require("http").createServer(app).listen(port);
var io = require("socket.io").listen(server);

function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.intersects = function (other) {
        if (other.x < this.x + this.width &&
            this.x < other.x + other.width &&
            other.y < this.y < this.y + this.height) {
            return this.y < other.y + other.height;
        }
        else { return false; }
    };
}

function Treasure() {
    this.x = getRandom(0, 1024);
    this.y = getRandom(0, 724);

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

var players = {};

io.set("log level", 2);
io.sockets.on("connection", function (socket) {
    var id = Object.keys(players).length;

    console.log("A socket connected w/ ID: %i", id); // yay!

    socket.emit("login", { id: id, x: currentTreasure.x, y: currentTreasure.y });

    for (var player in players) {
        socket.emit("addPlayer", { id: players[player].id, name: players[player].name, x: players[player].x, y: players[player].y, image: players[player].image });
    }

    players[id] = new Player(id);

    socket.on("playerData", function (data) {
        players[data.id].name = data.name;
        players[data.id].image = data.image;

        socket.broadcast.emit("addPlayer", { id: data.id, name: data.name, x: data.x, y: data.y, image: data.image });
    });

    socket.on("position", function (data) {
        try {
            players[data.id].x = data.x;
            players[data.id].y = data.y;

            socket.broadcast.emit("movePlayer", { id: data.id, x: data.x, y: data.y });

            if (players[data.id].getRect().intersects(currentTreasure.getRect())) {
                players[data.id].score += 1;
            }
        } catch (e){}
    });

    socket.on("disconnect", function () {
        delete players[id];
        socket.broadcast.emit("removePlayer", { id: id });
    });
});