const WebSocket = require("ws");

function kahootws(wss){
    var prompts = [new prompt("test?"), new prompt("test2?")];

    var clients = [];
    var admins = [];

    console.log("here!")

    var currentPrompt = 0;

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
                        currentPrompt = msgJSON.content;
                        sendPrompt(prompts[currentPrompt].prompt);
                        break;
                    case "updateReq":
                        sendPromptToOne(ws, prompts[currentPrompt].prompt);
                        break;
                    case "admiiiin":
                        admins.push(ws);
                        break;
                }
            } catch (e) {
                ws.close();
            }
        })

        ws.on("close", (...args) => {
            clients.splice(clients.indexOf(ws), 1);
        })
    })

    function sendAdminsAnswers(){
        for(let i of admins){
            i.send(JSON.stringify({type: "prompts", prompts: prompts}));
        }
    }

    function sendPrompt(p){
        for(let i of clients){
            i.send(JSON.stringify({type: "prompt", content: p}));
        }
    }

    function sendPromptToOne(ws, p){
        ws.send(JSON.stringify({type: "prompt", content: p}));
    }


}

function prompt(s){
    this.prompt = s;
    this.answers = [];
}

module.exports = {kahootws};