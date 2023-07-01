//when connectButton is clicked, connect to the server
let serverws = null;


connectButton.addEventListener("click", () => {
	serverws = new WebSocket("ws://localhost:8080", 13);

	serverws.onopen = () => {
		console.log("Connected to server");
	};

    serverws.onmessage = (message) => {
        console.log(`Received message: ${message.data}`);
    };
    
});

sendButton.addEventListener("click", () => {
    if(serverws == null || serverws.readyState === WebSocket.CLOSED) return;
	console.log("Sending message to server");
	serverws.send("Hello from client");
});

disconnectButton.addEventListener("click", () => {
    if(serverws == null) return;
	console.log("Disconnecting from server");
	serverws.close();
});

//receive messages from the server
