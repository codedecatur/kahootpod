const WebSocket = require("ws");

export function kahootws(){
    var clients = [];

    const wss = new WebSocket.Server({ port: 8081 });

    wss.on("connection", (ws) => {
        clients.push(ws);

        ws.on("message", (message) => {
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