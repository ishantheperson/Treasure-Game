var context;
var images;
var gameObjects = [];

//#region Keyboard
var keyboardState = {
    leftDown: false,
    rightDown: false
};

function keyDown(event) {
    switch (event.keyCode) {
        case 37: keyboardState.leftDown = true; break;
        case 39: keyboardState.rightDown = true; break;
    }
}

function keyUp(event) {
    switch (event.keyCode) {
        case 37: keyboardState.leftDown = false; break;
        case 39: keyboardState.rightDown = false; break;
    }
}
//#endregion

function Player (name, image) {
    this.id = null;

    this.x = 50;
    this.y = 50;

    this.name = name;
    this.image = image;

    this.speed = 2;

    this.connected = null;
    this.socket = io.connect("ws://localhost:8080");

    this.socket.on("connect", function () {
        this.connected = true;
        this.socket.on("login", function (data) {
            this.id = data;

            this.socket.emit("playerData", { id: this.id, name: this.name, image: this.image });
        }.bind(this));

    }.bind(this));

    this.draw = function () {
        if (this.connected) {
            var positionChanged = false;
            if (keyboardState.leftDown) { this.x -= this.speed; positionChanged = true; }
            if (keyboardState.rightDown) { this.x += this.speed; positionChanged = true; }

            if (positionChanged) this.socket.emit("position", { id: this.id, x: this.x, y: this.y });

            context.fillStyle = "rgba(200, 50, 50, 1)";
            context.drawImage(image, this.x, this.y);
        }
    }
}

function draw() {
    context.clearRect(0, 0, 250, 250);  

    gameObjects.forEach(function (element, index, array) {
        element.draw();
    });
}

$(document).ready(function () {
    context = document.getElementById("game").getContext("2d");

    images = {
        dragon1: document.getElementById("dragon1"),
        dragon2: document.getElementById("dragon2"),
        dragon3: document.getElementById("dragon3")
    };

    $(document).keydown(keyDown);
    $(document).keyup(keyUp);

    gameObjects.push(new Player($("#playerName").val(), Math.floor(Math.random() * 4)));

    setInterval(draw, 10);
});