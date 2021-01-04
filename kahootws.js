const WebSocket = require("ws");

export function kahootws(wss){
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

        ws.on("close", (...args) => {
            clients.splice(clients.indexOf(ws), 1);
        })
    })
}