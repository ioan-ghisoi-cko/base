var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");

Frames.init("pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a");

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  onCardValidationChanged
);
function onCardValidationChanged(event) {
  var errorMessage = document.querySelector(".error-message");
  payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  onValidationChanged
);
function onValidationChanged(event) {
  var errorMessage = document.querySelector(".error-message");
  errorMessage.textContent = getErrorMessage(event);
}

var errors = {};
errors["card-number"] = "Please enter a valid card number";
errors["expiry-date"] = "Please enter a valid expiry date";
errors["cvv"] = "Please enter a valid cvv code";

function getErrorMessage(event) {
  if (event.isValid || event.isEmpty) {
    return "";
  }
  return errors[event.element];
}

Frames.addEventHandler(
  Frames.Events.CARD_TOKENIZATION_FAILED,
  onCardTokenizationFailed
);
function onCardTokenizationFailed(error) {
  Frames.enableSubmitForm();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
function onCardTokenized(event) {
  var el = document.querySelector(".success-payment-message");
  payWithToken(event.token);
}

payButton.addEventListener("click", function (event) {
  event.preventDefault();
  Frames.submitCard();
  Frames.enableSubmitForm();
});

const payWithToken = (token) => {
  http(
    {
      method: "POST",
      route: "/payWithToken",
      body: { token: token },
    },
    (data) => {
      console.log("The API RESPONSE: ", data);
    }
  );
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

  fetch(`${window.location.origin}${route}`, requestData)
    .then((res) => res.json())
    .then((data) => callback(data))
    .catch((er) => console.log(er));
};

// Socket part so we can handle webhooks:
var socket = io(window.location.protocol + "//" + window.location.hostname);
socket.on("connect", function () {
  console.log("socket connected");
});
socket.on("webhook", (webhookBody) => {
  console.log("WEBHOOK: ", webhookBody);
});
