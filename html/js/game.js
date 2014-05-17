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

function Dragon() {
    this.id = null;

    this.x = 50;
    this.y = 50;

    this.speed = 2;

    this.connected = null;
    this.socket = io.connect("ws://localhost:8080");

    this.socket.on("connect", function () {
        this.connected = true;
        this.socket.on("login", function (data) {
            debugger;
            this.id = data;
        }.bind(this));

    }.bind(this));

    this.draw = function () {
        if (this.connected) {
            var positionChanged = false;
            if (keyboardState.leftDown) { this.x -= this.speed; positionChanged = true; }
            if (keyboardState.rightDown) { this.x += this.speed; positionChanged = true; }

            if (positionChanged) this.socket.emit("position", { id: this.id, x: this.x, y: this.y });

            context.drawImage(images.dragon, this.x, this.y);
        }
    }
}

function draw() {
    context.clearRect(0, 0, 250, 250); // canvas width, height

    gameObjects.forEach(function (element, index, array) {
        element.draw();
    });
}

$(document).ready(function () {
    context = document.getElementById("game").getContext("2d");

    images = {
        dragon: document.getElementById("dragon")
    };

    $(document).keydown(keyDown);
    $(document).keyup(keyUp);

    gameObjects.push(new Dragon());

    setInterval(draw, 10);
});