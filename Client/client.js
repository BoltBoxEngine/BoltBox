let serverws = null;

const anime = require('animejs');


connectButton.addEventListener("click", () => {
	//lets ws work over localhost and ipv4 (an in theory dedicated dns but that will require more work)
	let url = new URL(window.location.href);
	url.port = '8080';
	url.protocol = 'ws';
	serverws = new WebSocket(url, 13);


	//check if cookies have any data
	let cookie = document.cookie;
	cookie = cookie.split('data=')[1];
	
	serverws.onopen = () => {
		console.log("Connected to server");
	};

    serverws.onmessage = (message) => {
        console.log(`Received message: ${message.data}`);
		handleData(message.data);
    };
    
});

function handleData(data){
	console.log(data);
	data = JSON.parse(data);
	//handle data from server
	console.log(data);
	console.log(data.type);
	console.log(data.data);
	if(data.type == "interface"){
		//replace all html within the interface div with the html under data.data
		interfaceDiv.innerHTML = data.data;
		console.log(data.data);
	}
}

sendButton.addEventListener("click", () => {
    if(serverws == null || serverws.readyState === WebSocket.CLOSED) return;
	console.log("Sending message to server");
	//get value in messageInput
	let message = messageInput.value;
	serverws.send(message);
});

disconnectButton.addEventListener("click", () => {
    if(serverws == null) return;
	console.log("Disconnecting from server");
	serverws.close();
});