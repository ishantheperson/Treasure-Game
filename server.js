var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var port = 8080;

app.use(express.static(__dirname + "/html"));
app.listen(port);
