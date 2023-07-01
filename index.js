const express = require("express");
const websocket = require("ws");


//create a new express app
const app = express();
//set the port to 3000
const port = 3000;

//create a new websocket server
const ws = new websocket.Server({ port: 8080 });
ws.on("error", console.error);

//when a client connects to the server, print a message in the console
ws.on("connection", (ws) => {
	console.log("Client connected");
	//send a message to the client
	ws.send("Hello from server");
	ws.on("close", () => console.log("Client disconnected"));
});

ws.on("message", function message(data) {
	console.log("received: %s", data);
});

//serve basic html file to the client as well as script files
app.get("/", (req, res) => {
	//get requests to the root ("/") will route here
	res.sendFile("Client/index.html", { root: __dirname }); //server responds by sending the index.html file to the client's browser
	//the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

//on get request to connectionManager.js, send the file to the client
app.get("/connectionManager.js", (req, res) => {
	res.sendFile("Client/connectionManager.js", { root: __dirname });
});

app.listen(port, () => {
	//server starts listening for any attempts from a client to connect at port: {port}
	console.log(`Now listening on port ${port}`);
});
