import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import cookieParser from 'cookie-parser';
import { nanoid } from 'nanoid';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//create a new express app
const app = express();
app.use(cookieParser());
//set the port to 3000
const port = 3000;

//create a new websocket server
const wss = new WebSocketServer({ port: 8080 });



//list of id that the server has recognized in id:name format
//{id:{name:"some name", player:true}}
//player boolean, true = player, false = spectator
let ids = {};




//when a client connects to the server, print a message in the console
wss.on("connection", (ws) => {
	//console.log("Client connected");
	ws.isAlive = true;
	ws.on("error", console.error);
	//set client to pre lobby screen
	updateClientInterface(ws, interfaces.preLobby);


	//Handlers and other boring shit
	ws.on("close", () => {
		//console.log("Client disconnected");
		ws.isAlive = false;
	});

	ws.on("message", (data) => {
		data = JSON.parse(data);
		switch(data.type){
			case "joinGame":
				console.log(data.data);
				//associate ws client with clientID
				ws.id = data.data;
				updateClientInterface(ws, interfaces.lobby);
				//TODO check if there are open slots for the client to join as a player, otherwise set as a spectator
				break;
			case "changeName":
				ids[ws.id].name = data.data;
				console.log("changed name to ", data.data);
				updateClientInterface(ws, interfaces.lobby);
				break;
			case "navigate":
				updateClientInterface(ws, interfaces[data.data]);
				break;
			default:
				console.log("unknown type");
				console.log(data);
				break;
		}

	});
});

function messageFormater(type, data){
	return JSON.stringify({
		type:type,
		data:data
	});
}

function updateClientInterface(client, interfaceState){
	client.send(messageFormater("interface", interfaceState));
}

function updateAllClientInterfaces(interfaceState){
	wss.clients.forEach((client) => {
		client.send(messageFormater("interface", interfaceState));
	});
}

//serve basic html file to the client as well as script files
app.get("/", (req, res) => {
	let id = req.cookies.id;

	//give client an id if they dont have one
	if(req.cookies.id == undefined){
		id = nanoid();
		res.cookie(`id`, id);
	}
	//check if id is not in use, if so add it to the ids object
	if(ids[id] === undefined){
		addID(id);
	};
	console.log(ids);
	res.sendFile("Client/index.html", { root: __dirname });
});


function addID(id, name = "player", player = false){
	ids[id] = {
		name: name,
		player: player
	}
}

//on get request to bundle.js, send the file to the client
app.get("/bundle.js", (req, res) => {
	res.sendFile("Client/bundle.js", { root: __dirname });
});

//on get request to client.js, send the file to the client
app.get("/styles.css", (req, res) => {
	res.sendFile("Client/styles.css", { root: __dirname });
});

//on get request to client.js, send the file to the client
app.get("/IBMPlexSans-SemiBold.ttf", (req, res) => {
	res.sendFile("Client/IBMPlexSans-SemiBold.ttf", { root: __dirname });
});


app.listen(port, () => {
	//server starts listening for any attempts from a client to connect at port: {port}
	console.log(`Now listening on port ${port}`);
});

let interfaces = {
	
	preLobby:`<div class="text">ROOM CODE</div><div id="joinGame" class="button">JOIN GAME</div>`,
	lobby:`<div class="text">WAITING FOR HOST</div><div id="changeName" class="button">CHANGE NAME</div>`,
	changeName:`<input class="textInput" id="nameInput" type="text" onfocus="this.value=''" value="PLAYER" maxlength="14"></input><div id="changeName" class="button">CHANGE NAME</div>`

}

