const WebSocket = require("ws");

function kahootws(wss){
    var clients = [];

    console.log("here!")

    wss.on("connection", (ws) => {
        clients.push(ws);

        ws.on("message", (message) => {
            console.log(message);
            try{
                var msgJSON = JSON.parse(message);
                switch(msgJSON.type){
                    case "answer":
                        console.log(msgJSON.content);
                        break;
                }
            } catch (e) {
                ws.close();
            }
        })

        ws.send("hola!");

        ws.on("close", (...args) => {
            clients.splice(clients.indexOf(ws), 1);
        })
    })
}

module.exports = {kahootws};