var express = require("express");
var app = express();

var port = 8080;

app.use(express.static(__dirname + "/html"));

var server = require("http").createServer(app).listen(port);

var io = require("socket.io").listen(server);

io.sockets.on("connection", function (socket) {
    console.log("A socket connected!");
});
