const WebSocket = require("ws");

function kahootws(wss){
    var prompts = [new prompt("test?")];

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
                        for(let i of prompts){
                            if(i.prompt === msgJSON.prompt){
                                i.answers.push({answer: msgJSON.content, totalRating: 0, timesRated: 0, user: msgJSON.user});

                            }
                        }
                        break;
                    case "admin":
                        sendPrompt(msgJSON.content);
                }
            } catch (e) {
                ws.close();
            }
        })

        ws.on("close", (...args) => {
            clients.splice(clients.indexOf(ws), 1);
        })
    })

    function sendPrompt(p){
        for(let i of clients){
            i.send(JSON.stringify({type: "prompt", content: p}));
        }
    }


}

function prompt(s){
    this.prompt = s;
    this.answers = [];
}

module.exports = {kahootws};