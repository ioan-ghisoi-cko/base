var socket = io(window.location.protocol + "//" + window.location.hostname);
socket.on("connect", function () {
  console.log("socket connected");
});
socket.on("webhook", (data) => {
  alert(data.type);
});
