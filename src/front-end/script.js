const pageLoader = document.querySelector(".loader");
const form = document.getElementById("payment-form");
const nameInput = document.getElementById("cardholder");
const nameLabel = document.getElementById("name-label");
const cardLabel = document.getElementById("card-label");
const dateLabel = document.getElementById("date-label");
const cvvLabel = document.getElementById("cvv-label");
const payButton = document.getElementById("pay-button");
const scheme = document.getElementById("card-scheme");
const cardHint = document.querySelector(".card-hint");
const dateHint = document.querySelector(".expiry-date-hint");
const cvvHint = document.querySelector(".cvv-hint");
const payLoader = document.querySelector(".pay-loader");
const checkMark = document.querySelector(".checkmark");
const toastBar = document.getElementById("toast_bar");
const switcher = document.getElementById("theme-switch");
let theme;

const handleResponse = (data) => {
  payLoader.classList.add("hide");
  if (data.approved) {
    checkMark.classList.add("draw");
    setTimeout(() => {
      payButton.innerHTML = "&#x21bb; New Payment";
    }, 1200);
  }
};

const cleanState = () => {
  payButton.innerHTML = "Pay Now";
  pageLoader.style.display = "";
  form.style.display = "none";
  initializeFrames();
  nameInput.value = "";
  nameLabel.classList.remove("up");
  cardLabel.classList.remove("up");
  dateLabel.classList.remove("up");
  cvvLabel.classList.remove("up");
  scheme.removeAttribute("src");
  scheme.removeAttribute("alt");
  state = {
    "card-number": {
      isValid: false,
      isEmpty: true,
      isFocused: false,
    },
    "expiry-date": {
      isValid: false,
      isEmpty: true,
      isFocused: false,
    },
    cvv: {
      isValid: false,
      isEmpty: true,
      isFocused: false,
    },
  };
  checkMark.classList.remove("draw");
};

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

  // Payment type div
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

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
  if (theme == "dark") {
    switcher.checked = true;
  }
}

// Dark mode switch
document.getElementById("theme-switch").addEventListener("change", (event) => {
  themeSwitch(event);
});

const themeSwitch = (event) => {
  if (event.target.checked) {
    // Dark mode
    document.body.className = "";
    document.body.classList.add("dark");
    setTheme("dark");
    getTheme();
    cleanState();
  } else {
    // Light mode
    document.body.className = "";
    document.body.classList.add("light");
    setTheme("light");
    getTheme();
    cleanState();
  }
};

function getTheme() {
  theme = localStorage.getItem("theme");
}

function setTheme(mode) {
  localStorage.setItem("theme", mode);
}
