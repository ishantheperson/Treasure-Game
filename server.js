var express = require("express");
var app = express();

var port = 8080;

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

var players = [];

io.sockets.on("connection", function (socket) {
    console.log("A socket connected!"); // yay!

    var id = players.length;

    socket.emit("login", id);

    players.forEach(function (element, index, array) {
        var data = { id: element.id, name: element.name, x: element.x, y: element.y, image: element.image };
        console.log(JSON.stringify(data));
        socket.emit("addPlayer", data);
    });

    players.push(new Player(id));

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
        players.splice(id, 1);
        sockets.broadcast.emit("removePlayer", { id: id });
    });
});