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

    //#region Socket
    this.socket.on("connect", function () {
        this.connected = true;

        this.socket.on("login", function (data) {
            this.id = data;

            this.socket.emit("playerData", { id: this.id, name: this.name, image: this.image, x: this.x, y: this.y });
        }.bind(this));

        this.socket.on("addPlayer", function (data) {
            console.log(JSON.stringify(data));
            gameObjects.push(new NetworkedPlayer(data.id, data.name, data.x, data.y, data.image));
        });

        this.socket.on("movePlayer", function (data) {
            console.log(JSON.stringify(data));
            gameObjects.forEach(function (element, index, array) {
                if (element.id === data.id) { array[index].x = data.x; array[index].y = data.y; }
            });
        });

        this.socket.on("removePlayer", function (data) {
            gameObjects.forEach(function (element, index, array) {
                if (element.id === data.id) { array.splice(index, 1); }
            });
        });
    }.bind(this));
    //#endregion

    this.draw = function () {
        if (this.connected) {
            var positionChanged = false;
            if (keyboardState.leftDown) { this.x -= this.speed; positionChanged = true; }
            if (keyboardState.rightDown) { this.x += this.speed; positionChanged = true; }

            if (positionChanged) { this.socket.emit("position", { id: this.id, x: this.x, y: this.y }); }

            context.drawImage(images["dragon" + image], this.x, this.y);
        }
    }
}

function NetworkedPlayer(id, name, x, y, image) {
    this.id = id;
    this.name = name;

    this.x = x;
    this.y = y;
    this.image = image;

    this.draw = function() {
        context.drawImage(images["dragon" + image], this.x, this.y);
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

    $("#join").click(function () {
        var name = $("#playerName").val();
        if (name === "") { $("#error").text("You must enter a name for the player"); return; }
        $("#join").prop("disabled", true);

        gameObjects.push(new Player(name, Math.floor(Math.random() * 3) + 1));
        setInterval(draw, 10);
    });
});