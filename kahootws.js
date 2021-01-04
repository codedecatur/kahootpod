const WebSocket = require("ws");

function kahootws(wss){
    var clients = [];

    wss.on("connection", (ws) => {
        clients.push(ws);

        ws.on("message", (message) => {
            console.log(message);
            try{
                var msgJSON = JSON.parse(message);
                switch(msgJSON.type){
                    
                }
            } catch (e) {
                ws.close();
            }
        })

        ws.on("open", (...args) => {
            ws.send("hello!");
        })

        ws.on("close", (...args) => {
            clients.splice(clients.indexOf(ws), 1);
        })
    })
}

module.exports = {kahootws};