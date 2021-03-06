const express = require("express");
const ejs = require('ejs');
const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');
const url = require("url");
const { kahootws } = require("./kahootws");
const path = require("path");

let app = express();
app.set('view engine', 'ejs');
app.use( express.static( path.join(__dirname, "static") ) );
app.get("/", (req, res) => {
    res.render("pages/mainPage");
})

app.get("/test", (req, res) => {
  res.render("pages/slides/title");
})

app.get("/admin/bassoon", (req, res) => {
  res.render("pages/admin");
})

app.get("/admin/bassoon/kahootAns", (req, res) => {
  res.render("pages/kahootAnswers.ejs");
})

app.get("/admin/bassoon/recapAns", (req, res) => {
  res.render("pages/viewScores.ejs");
})

var privateKey = fs.readFileSync( 'privatekey.pem' );
var certificate = fs.readFileSync( 'certificate.pem' );

const server = https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(443)

const wss = new WebSocket.Server({ noServer: true });
const kWss = new WebSocket.Server({ noServer: true });

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  }
  if (pathname === '/kws') {
    kWss.handleUpgrade(request, socket, head, function done(ws) {
      kWss.emit('connection', ws, request);
    });
  }
});

var clients = [];

var currentPage = "game";

kahootws(kWss);

function ping(){
  for(let i of clients){
    i.send(JSON.stringify({type: "ping"}))
  }
}

setInterval(ping, 1000);

var scores = [];

wss.on('connection', ws => {
  clients.push(ws);
  ws.on('message', message => {
    try{
      var msgJSON = JSON.parse(message);
      switch(msgJSON.type){
        case("updateReq"):
          redirect(ws, currentPage);
          break;
        case("admin"):
          currentPage = msgJSON.content;
          redirectAll(currentPage);
          break;
        case("name"):
          ws.userName = msgJSON.content;
          break;
        case("getName"):
          ws.send(JSON.stringify({type: "userName", content: ws.userName}));
          break;
        case("score"):
          scores.push({user: msgJSON.user, score: msgJSON.content});
          break;
        case("getScores"):
          ws.send(JSON.stringify({type: "scores", scores: scores}));
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

