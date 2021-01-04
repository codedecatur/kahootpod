const express = require("express");
const ejs = require('ejs');
const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');
const url = require("url");
const { kahootws } = require("./kahootws");

let app = express();
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("pages/mainPage");
})

app.get("/test", (req, res) => {
  res.render("pages/slides/title");
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

var currentPage = "kahoot";

kahootws(kWss);

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

