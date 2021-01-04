const express = require("express");
const ejs = require('ejs');
const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

let app = express();
app.set('view engine', 'ejs');

const wss = new WebSocket.Server({ port: 2083 });
var clients = [];

var currentPage = "game";


wss.on('connection', ws => {
  clients.push(ws);
  ws.on('message', message => {
    try{
      var msgJSON = JSON.parse(message);
      switch(msgJSON.type){
        case("updateReq"):
          redirect(ws, currentPage);
          break;
      }
    } catch(e){
      ws.close();
    }
  });
  ws.on("close", (...args) => {
    clients.splice(clients.indexOf(ws), 1);
  })
});

function sendToAll(s){
  console.log(s)
  for(let i of clients){
    i.send(s);
  }
}

function redirect(ws, url){
  ejs.renderFile((process.cwd() + "/views/pages/"+url+".ejs"), {/*Variables for template*/}).then((html)=>{
    ws.send(JSON.stringify({type: "html", content: html}));
  });
}

function redirectAll(url){
  ejs.renderFile((process.cwd() + "/views/pages/"+url+".ejs"), {/*Variables for template*/}).then((html)=>{
    sendToAll(JSON.stringify({type: "html", content: html}));
  });
}

app.get("/", (req, res) => {
    res.render("pages/mainPage");
})

app.get("/test", (req, res) => {
  res.render("pages/slides/title");
})


var privateKey = fs.readFileSync( 'privatekey.pem' );
var certificate = fs.readFileSync( 'certificate.pem' );

https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(443)