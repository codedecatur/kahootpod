const WebSocket = require("ws");

function kahootws(wss){
    var prompts = [new prompt("test?"), new prompt("test2?")];

    var clients = [];
    var admins = [];

    var numSubs = 5;

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
                                i.answers.push({answer: msgJSON.content, totalRating: 0, timesRated: 0, user: msgJSON.user, ansId: i.answers.length});
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
                    case "adminUp":
                        sendAdminsAnswers();
                        break;
                    case "adminDistSubmissions":
                        distAnswers();
                        break;
                    case "recievedAns":
                        prompts[currentPrompt].answers[msgJSON.ansId].timesRated++;
                        break;
                    case "like":
                        prompts[currentPrompt].answers[msgJSON.ansId].totalRating++;
                        break;
                    case "dislike":
                        prompts[currentPrompt].answers[msgJSON.ansId].totalRating--;
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
            i.send(JSON.stringify({type: "prompts", prompts: prompts, currentPrompt: currentPrompt}));
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

    function distAnswers(){
        var randUsed = [];
        for(let i of clients){
            var obj = {type: "submissions", content: {submissions: []}};
            for(var j = 0; j < numSubs; j++){
                var randUsedLocal = [];
                if(randUsed.length == prompts[currentPrompt].answers.length){
                    randUsed = [];
                }
                var rand = Math.floor(Math.random() * prompts[currentPrompt].answers.length);
                while(randUsed.indexOf(rand) != -1 || randUsedLocal.indexOf(rand) != -1){
                    rand = Math.floor(Math.random() * prompts[currentPrompt].answers.length);
                }
                randUsed.push(rand);
                randUsedLocal.push(rand);
                obj.content.submissions.push(prompts[currentPrompt].answers[rand]);
            }
            i.send(JSON.stringify(obj));
        }

    }

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }


}

function prompt(s){
    this.prompt = s;
    this.answers = [];
}

module.exports = {kahootws};