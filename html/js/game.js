var canvas;
var context;

var playerImages;
var images;

var treasure;
var players = [];

var CANVAS_WIDTH = 1024;
var CANVAS_HEIGHT = 724;

//#region Keyboard
var keyboardState = {
    left: false,
    right: false,
    up: false,
    down: false
};

function keyDown(event) {
    switch (event.keyCode) {
        case 37: keyboardState.left = true; break;
        case 38: keyboardState.up = true; break;
        case 39: keyboardState.right = true; break;
        case 40: keyboardState.down = true; break;
    }
}

function keyUp(event) {
    switch (event.keyCode) {
        case 37: keyboardState.left = false; break;
        case 38: keyboardState.up = false; break;
        case 39: keyboardState.right = false; break;
        case 40: keyboardState.down = false; break;
    }
}
//#endregion

function Treasure(x, y) {
    this.x = x;
    this.y = y;

    this.draw = function () {
        context.drawImage(images.treasure, this.x, this.y);
    }
}

function Player (name, image, address) {
    this.id = null;

    this.x = 50;
    this.y = 50;

    this.name = name;
    this.image = image;

    this.speed = 2;

    this.connected = null;
    this.socket = io.connect(address);

    //#region Socket
    this.socket.on("connect", function () {
        this.connected = true;

        this.socket.on("login", function (data) {
            this.id = data.id;
            treasure = new Treasure(data.x, data.y);

            this.socket.emit("playerData", { id: this.id, name: this.name, image: this.image, x: this.x, y: this.y });
        }.bind(this));

        this.socket.on("addPlayer", function (data) {
            console.log("Adding Player Data: " + JSON.stringify(data));
            players.push(new NetworkedPlayer(data.id, data.name, data.x, data.y, data.image));
        });

        this.socket.on("movePlayer", function (data) {
            players.forEach(function (element, index, array) {
                if (element.id === data.id) { array[index].x = data.x; array[index].y = data.y; }
            });
        });

        this.socket.on("removePlayer", function (data) {
            players.forEach(function (element, index, array) {
                if (element.id === data.id) { array.splice(index, 1); }
            });
        });

        this.socket.on("newTreasure", function (data) {
            
        });
    }.bind(this));
    //#endregion

    this.draw = function () {
        if (this.connected) {
            treasure.draw();

            var positionChanged = false;
            if (keyboardState.left) { this.x -= this.speed; positionChanged = true; }
            if (keyboardState.right) { this.x += this.speed; positionChanged = true; }

            if (keyboardState.up) { this.y -= this.speed; positionChanged = true; }
            if (keyboardState.down) { this.y += this.speed; positionChanged = true; }

            if (positionChanged) { this.socket.emit("position", { id: this.id, x: this.x, y: this.y }); }

            context.fillText(this.name, this.x + 32, this.y - 2);
            context.textAlign = "center";
            context.drawImage(playerImages["dragon" + image], this.x, this.y);
        }
    };
}

function NetworkedPlayer(id, name, x, y, image) {
    this.id = id;
    this.name = name;

    this.x = x;
    this.y = y;
    this.image = image;

    this.draw = function () {
        context.fillText(this.name, this.x + 32, this.y - 2);
        context.drawImage(playerImages["dragon" + image], this.x, this.y);
    };
}

function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);  

    context.drawImage(images.mountains, 0, 0);

    players.forEach(function (element, index, array) {
        element.draw();
    });
}

$(document).ready(function () {
    canvas = $("#game")[0];
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    context = canvas.getContext("2d");

    context.textAlign = "center";
    context.font = "normal 24pt serif";
    context.fillText("Click 'Join' to start the game.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    context.font = "normal 12pt monospace";

    playerImages = {
        dragon1: document.getElementById("dragon1"),
        dragon2: document.getElementById("dragon2"),
        dragon3: document.getElementById("dragon3")
    };

    images = {
        mountains: document.getElementById("mountains"),
        treasure: document.getElementById("treasure")
    };

    $(document).keydown(keyDown);
    $(document).keyup(keyUp);

    $("#join").click(function () {
        var name = $("#playerName").val();
        if (name === "") { $("#error").text("You must enter a name for the player"); }
        else {
            $("#error").text("");
            $("#join").prop("disabled", true);

            players.push(new Player(name, Math.floor(Math.random() * 3) + 1, $("#address").val()));
            setInterval(draw, 10);
        }
    });
});