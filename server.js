var express = require("express");
var app = express();

var port = 8080;

app.use(express.static(__dirname + "/html"));

var server = require("http").createServer(app).listen(port);

var io = require("socket.io").listen(server);


function Player() {
    this.x = 0;
    this.y = 0;

    this.name = "";
    this.image = 0;
}

var players = [];

io.sockets.on("connection", function (socket) {
    console.log("A socket connected!"); // yay!

    players.push(new Player());

    socket.emit("login", players.length - 1);

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

    console.log("Sent player ID");
});