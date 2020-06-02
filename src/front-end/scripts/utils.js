const framesLoader = document.querySelector("#page-loader");
const form = document.getElementById("payment-form");
const paymentMethodIcon = document.getElementById("payment-method");
const nameInput = document.getElementById("name-input");
const nameLabel = document.getElementById("name-label");
const cardLabel = document.getElementById("card-label");
const dateLabel = document.getElementById("date-label");
const cvvLabel = document.getElementById("cvv-label");
const payButton = document.getElementById("pay-button");
const refreshIcon = document.getElementById("refresh-icon");
const payButtonText = document.getElementById("button-message");
const payButtonLoader = document.getElementById("button-dots");

const hintCardNumber = document.getElementById("hint_number");
const hintDate = document.getElementById("hint_date");
const hintCvv = document.getElementById("hint_cvv");

const toastBar = document.getElementById("toast_bar");

// Show the loading animation until Frames is ready
framesLoader.style.display = "flex";

// When the name input is focused
nameInput.addEventListener("focus", () => {
  nameLabel.classList.add("float-up");
  nameInput.classList.remove("invalid-input");
});

// When the name input is blurred
nameInput.addEventListener("blur", (event) => {
  if (nameInput.value === "") {
    nameLabel.classList.remove("float-up");
  } else if (nameInput.value.length < 2) {
    nameInput.classList.add("invalid-input");
  } else {
    // Update the cardholder name in Frames
    Frames.cardholder.name = nameInput.value;
  }
});

nameInput.addEventListener("input", (e) => {
  if (Frames.isCardValid() && e.target.value.length > 2) {
    payButton.disabled = false;
  } else {
    payButton.disabled = true;
  }
});

// utility function to send HTTP calls to our back end API
const http = ({ method, route, body }, callback) => {
  let requestData = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  if (method.toLocaleLowerCase() === "get") {
    delete requestData.body;
  }

  // Timeout after 10 seconds
  timeout(10000, fetch(`${window.location.origin}${route}`, requestData))
    .then((res) => res.json())
    .then((data) => callback(data))
    .catch((er) => console.log(er));
};

// For connection timeout error handling
const timeout = (ms, promise) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("Connection timeout"));
    }, ms);
    promise.then(resolve, reject);
  });
};

// Socket part so we can handle webhooks:
var socket = io();
socket.on("webhook", (webhookBody) => {
  console.log(webhookBody);
  let tempWebhook = webhookBody.replace("_", " ");

  let newToast = document.createElement("div");
  newToast.classList.add("toast_body");

  // WEBHOOK div
  let newWHDiv = document.createElement("div");
  newWHDiv.innerHTML = "WEBHOOK";
  newWHDiv.classList.add("wh_div");
  newToast.appendChild(newWHDiv);

  //Payment type div
  let newPTDiv = document.createElement("div");
  newPTDiv.innerHTML = tempWebhook;
  newPTDiv.classList.add("pt_div");
  newToast.appendChild(newPTDiv);

  toastBar.append(newToast);
  newToast.classList.add("show");
  setTimeout(function () {
    newToast.classList.remove("show");
  }, 5000);
});
