let serverws = null;
let clientID;

const anime = require("animejs");


//connect to ws on start
connectWS();

function connectWS() {
	//lets ws work over localhost and ipv4 (an in theory dedicated dns but that will require more work)
	let url = new URL(window.location.href);
	url.port = "8080";
	url.protocol = "ws";
	serverws = new WebSocket(url, 13);

	//check if cookies have any data
	let cookie = document.cookie;
	cookie = cookie.split("id=")[1];
	cookie = cookie.split("; undefined")[0];
	console.log(cookie);
	clientID = cookie;
	

	serverws.onopen = () => {
		console.log("Connected to server");
	};

	serverws.onmessage = (message) => {
		//console.log(`Received message: ${message.data}`);
		handleData(message.data);
	};
}

function handleData(data) {
	data = JSON.parse(data);
	//handle data from server
	if (data.type == "interface") {
		//replace all html within the interface div with the html under data.data
		interfaceDiv.innerHTML = data.data;
	}
}

function messageFormater(type, data){
	return JSON.stringify({
		type:type,
		data:data
	});
}

document.addEventListener( "click", clickListener );

function clickListener(event){
    var element = event.target;
	//get element id
	let id = element.id;

	switch(id){
		case "joinGame":
			console.log(clientID);
			serverws.send(messageFormater("joinGame", clientID));
			break;
		case "changeName":
			//check if we are requesting the change name page or if we are submitting a name change
			if(!document.getElementById("nameInput")){
				serverws.send(messageFormater("navigate", "changeName"));
			}else{
				let name = document.getElementById("nameInput").value;
				serverws.send(messageFormater("changeName", name));
			}
		default:
			break;
	}	
}