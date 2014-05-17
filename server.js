var express = require("express");
var app = express();

var port = 8080;

app.use(express.static(__dirname + "/html"));

var server = require("http").createServer(app).listen(port);

var io = require("socket.io").listen(server);


function Player() {
    this.x = 0;
    this.y = 0;
}

var players = [];

io.sockets.on("connection", function (socket) {
    console.log("A socket connected!"); // yay!

    players.push(new Player());

    socket.emit("login", players.length - 1);

    socket.on("position", function (data) {
        console.log(JSON.stringify(data));

        players[data.id].x = data.x;
        players[data.id].y = data.y;
    });

    console.log("Sent player ID");
});