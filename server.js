var port = 9186;

var express = require("express");
var app = express();
app.use(express.static(__dirname + "/html"));

var server = require("http").createServer(app).listen(port);
var io = require("socket.io").listen(server);

function Player(id) {
    this.id = id;

    this.x = 0;
    this.y = 0;

    this.name = "";
    this.image = 0;
}

var players = {}

io.sockets.on("connection", function (socket) {
    var id = Object.keys(players).length;

    console.log("A socket connected w/ ID: %i", id); // yay!

    socket.emit("login", id);

    for (player in players) {
        socket.emit("addPlayer", { id: players[player].id, name: players[player].name, x: players[player].x, y: players[player].y, image: players[player].image });
    }

    players[id] = new Player(id);

    socket.on("playerData", function (data) {
        players[data.id].name = data.name;
        players[data.id].image = data.image;

        socket.broadcast.emit("addPlayer", { id: data.id, name: data.name, x: data.x, y: data.y, image: data.image });
    });

    socket.on("position", function (data) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;

        socket.broadcast.emit("movePlayer", { id: data.id, x: data.x, y: data.y });
    });

    socket.on("disconnect", function () {
        delete players[id];
        socket.broadcast.emit("removePlayer", { id: id });
    });
});