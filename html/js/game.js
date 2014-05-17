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
    this.x = 50;
    this.y = 50;

    this.speed = 2;

    this.socket = io.connect('ws://localhost:8080');

    this.draw = function () {
        if (keyboardState.leftDown) { x -= speed; }
        if (keyboardState.rightDown) { x += speed; }

        context.drawImage(images.dragon, x, y);
    }
}

function draw() {

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