function startChat() {
    $("#messageArea").text("");
    $("#chatInput, #submitChat").prop("disabled", false);

    var name = $("#playerName").val();

    var chatSocket = io.connect($("#address").val() + "/chat");
    chatSocket.on("addMessage", function (data) {
        $("#messageArea").append("<p><b>" + data.name + "</b>: " + data.message + "</p>");
    });

    $("#submitChat").click(function () {
        var text = $("#chatInput").val();
        if (text !== "") {
            chatSocket.emit("message", { name: name, message: text });
            $("#messageArea").append("<p><b>Me: </b>" + text + "</p>");
        }
    });
}