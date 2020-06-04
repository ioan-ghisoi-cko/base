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
const toastBar = document.getElementById("toast_bar");
const switcher = document.getElementById("theme-switch");
var PAYMENT_ID = "";

let theme;
let outcome = document.getElementById("outcome");

const crossVisible =
  '<svg class="cross" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';
const crossHidden =
  '<svg class="cross hide" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';

const showCheckmark = () => {
  outcome.classList.add("checkmark", "draw");
};
const hideCheckmark = () => {
  outcome.classList.remove("checkmark", "draw");
};

const showCross = () => {
  outcome.class = "cross";
  outcome.innerHTML = crossVisible;
};
const hideCross = () => {
  outcome.classList.remove("cross");
  outcome.innerHTML = crossHidden;
};

const publicKey = "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a";

const handleResponse = (data) => {
  payLoader.classList.add("hide");
  PAYMENT_ID = data.id;
  // Payment approved
  if (data.approved) {
    payButton.style.backgroundColor = "var(--button-background)";
    showCheckmark();
    setTimeout(() => {
      hideCheckmark();
      payButton.innerHTML = "&#10227; New Payment";
      // TODO: Disable form inputs until Frames re-initialized (user clicks "New Payment")
    }, 1200);
  }
  // Payment declined / timeout error
  else {
    payButton.style.backgroundColor = "var(--button-background-error)";
    showCross();
    setTimeout(() => {
      hideCross();
      payButton.innerHTML = "&#10227; Retry";
    }, 1200);
  }
};

const cleanState = () => {
  payButton.innerHTML = "Pay Now";
  payButton.style.backgroundColor = "var(--button-background)";
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
  hideCheckmark();
  hideCross();
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
  if (webhookBody.paymentId !== PAYMENT_ID) {
    return;
  }
  let tempWebhook = webhookBody.type.replace("_", " ");

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
    newToast.outerHTML = "";
  }, 5000);
});

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
  if (theme == "dark") {
    // TODO: Skip dark switch animation when loading stored preference
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
