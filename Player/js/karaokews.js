var socket;
var queueId = null;

function ping(retry) {
  checkSocket().then(() => {
    socket.send(JSON.stringify({
      messageType: "PING",
      queueId: queueId
    }));
    if (retry) {
      setTimeout(ping, 2000, true);
    }
  });
}

function doSend(msg) {
  if (!msg) {
    console.error("No data in message");
    return;
  }
  checkSocket().then(() => {
    //Ensure msg.data is JSON
    if (typeof msg.data !== "string") {
      msg.data = JSON.stringify(msg.data);
    }
    socket.send(JSON.stringify(msg));
    console.log("Sent message: " + msg.messageType);
  });
}

function checkSocket() {
  return new Promise((resolve, reject) => {
    doCheck(resolve, reject);
  });
}

function doCheck(resolve, reject) {
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    if(this.location.protocol === "https:")
    {
      socket = new WebSocket("wss://"+this.location.host+"/karaoke?queueId=" + queueId);
    }
    else
    {
      socket = new WebSocket("ws://"+this.location.host+"/karaoke?queueId=" + queueId);
    }

    // Connection opened
    socket.addEventListener("open", (event) => {
      ping();
    });

    // Listen for messages
    socket.addEventListener("message", handleMessageFromServer);
    setTimeout(doCheck, 1000, resolve, reject);
  } else if (socket.readyState === WebSocket.OPEN) {
    resolve();
  } else {
    setTimeout(doCheck, 1000, resolve, reject);
  }
}

function handleMessageFromServer(event) {
  const message = JSON.parse(event.data);
  if (message.messageType === "PONG")
  {
    return;
  }
  console.log("Received message: " + message.messageType);
  self.postMessage(message);
}

self.onmessage = function handleMessageFromMain(msg) {
  var message = msg.data;
  if (message.messageType === "PING") {
    ping();
  }
  else if(message.messageType === "queueId")
  {
    queueId = message.queueId;
  }
  else
  {
    doSend(message);
  }
};

setTimeout(ping, 4000,true);
