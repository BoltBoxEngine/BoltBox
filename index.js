import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import { nanoid } from "nanoid";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from 'fs';
import {fork} from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


let interfaces = {};
loadInterfaces();
let games = {};
loadGames();

//create a new express app
const app = express();
app.use(cookieParser());
//set the port to 3000
const port = 3000;

//serve basic html file to the client as well as script files
app.get("/", (req, res) => {
	let id = req.cookies.id;

	//give client an id if they dont have one
	if (req.cookies.id == undefined) {
		id = nanoid();
		res.cookie(`id`, id);
	}
	//check if id is not in use, if so add it to the ids object
	if (ids[id] === undefined) {
		addID(id);
	}
	//console.log(ids);
	res.sendFile("Client/index.html", { root: __dirname });
});

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
	console.log(`Server now listening on port ${port}`);
});

const hostApp = express();
const hostPort = 3001;

hostApp.get("/", (req, res) => {
	res.sendFile("Host/index.html", { root: __dirname });
});

//on get request to bundle.js, send the file to the client
hostApp.get("/bundle.js", (req, res) => {
	res.sendFile("Host/bundle.js", { root: __dirname });
});

//on get request to client.js, send the file to the client
hostApp.get("/styles.css", (req, res) => {
	res.sendFile("Host/styles.css", { root: __dirname });
});

//on get request to client.js, send the file to the client
hostApp.get("/IBMPlexSans-SemiBold.ttf", (req, res) => {
	res.sendFile("Client/IBMPlexSans-SemiBold.ttf", { root: __dirname });
});

hostApp.listen(hostPort, () => {
	//server starts listening for any attempts from a client to connect at port: {port}
	console.log(`Host is now listening on port ${hostPort}`);
});

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
		switch (data.type) {
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
			case "launchGame":
				console.log("Recieved Game Name: ", data.data);
				launchGame(data.data);
				break;
			default:
				console.log("unknown type");
				console.log(data);
				break;
		}
	});
});

function messageFormater(type, data) {
	return JSON.stringify({
		type: type,
		data: data,
	});
}

function updateClientInterface(client, interfaceState) {
	client.send(messageFormater("interface", interfaceState));
}

function updateAllClientInterfaces(interfaceState) {
	wss.clients.forEach((client) => {
		client.send(messageFormater("interface", interfaceState));
	});
}

function addID(id, name = "player", player = false) {
	ids[id] = {
		name: name,
		player: player,
	};
}



function loadInterfaces() {
	//get all html files in Client/interfaces and convert them to strings
	fs.readdir("Client/Interfaces", (err, files) => {
		files.forEach((file) => {
			let fileName = file.split(".")[0];
			interfaces[fileName] = fs.readFileSync(`Client/Interfaces/${file}`, "utf8");
		});
	});
}

function loadGames() {
	//Scan through all top level node modules and check the package.json for "game": true
	fs.readdir("node_modules", (err, files) => {
		files.forEach((file) => {
			//open package.json file in folder as an object
			try{
				let packageJson = JSON.parse(fs.readFileSync(`node_modules/${file}/package.json`, "utf8"));
				//check if package.json has game: true
				if (packageJson.game) {
					//TODO add game to games list
					games[packageJson.name] = packageJson.author;
				}
			}catch(err){
				//do nothing
			}
		});
	});
}

function launchGame(game){
	console.log(game);
	var child = fork(`node_modules/${game}/index.js`);
}