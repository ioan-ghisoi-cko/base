var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var cardLabel = document.getElementById("card-label");
var dateLabel = document.getElementById("date-label");
var cvvLabel = document.getElementById("cvv-label");
var nameInput = document.getElementById("name-input");
var nameLabel = document.getElementById("name-label");

var state = {
  "card-number": {
    isValid: false,
    isEmpty: true,
  },
  "expiry-date": {
    isValid: false,
    isEmpty: true,
  },
  cvv: {
    isValid: false,
    isEmpty: true,
  },
};

var errors = {
  ["name"]: "Please enter a valid name",
  ["card-number"]: "Please enter a valid card number",
  ["expiry-date"]: "Please enter a valid expiry date",
  ["cvv"]: "Please enter a valid cvv code",
};

Frames.init({
  publicKey: "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a",
  localization: {
    cardNumberPlaceholder: "•••• •••• •••• ••••",
    expiryMonthPlaceholder: "MM",
    expiryYearPlaceholder: "YY",
    cvvPlaceholder: "•••",
  },
  style: {
    base: {
      paddingLeft: "1rem",
      borderRadius: "5px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "5px",
      fontSize: "18px",
      //   fontFamily: "'Open Sans'",
      color: "#263238",
      fontSize: "12px",
      fontStyle: "normal",
      fontFamily: "'Open Sans', Open Sans, Helvetica, Arial, sans-serif",
      fontWeight: "normal",
      lineHeight: "16px",
      letterSpacing: "0.22px",
    },
    focus: {
      border: "1px solid rgba(0, 0, 0, 0.3)",
    },
    invalid: {
      border: "1px solid #D96830",
    },
    placeholder: {
      base: {
        fontSize: "12px",
      },
      focus: {
        fontSize: "14px",
      },
    },
  },
});

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  function onValidationChanged(event) {
    switch (event.element) {
      case "card-number":
        if (event.isEmpty) {
          cardLabel.classList.remove("float-up");
        } else if (!event.isEmpty) {
          cardLabel.classList.add("float-up");
        }
        break;
      case "expiry-date":
        if (event.isEmpty) {
          dateLabel.classList.remove("float-up");
        } else if (!event.isEmpty) {
          dateLabel.classList.add("float-up");
        }
        break;
      case "cvv":
        if (event.isEmpty) {
          cvvLabel.classList.remove("float-up");
        } else if (!event.isEmpty) {
          cvvLabel.classList.add("float-up");
        }
        break;
    }
    setState(event);

    var e = event.element;
    if (event.isValid || event.isEmpty) {
      clearErrorMessage(e);
    } else {
      setErrorMessage(e);
    }
  }
);

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  function cardValidationChanged(event) {
    payButton.disabled = !Frames.isCardValid();
  }
);

Frames.addEventHandler(
  Frames.Events.PAYMENT_METHOD_CHANGED,
  function paymentMethodChanged(event) {
    var pm = event.paymentMethod;
    var logo = document.getElementById("logo-payment-method");
    let container = document.querySelector(".icon-container.payment-method");

    if (!pm) {
      logo.style.setProperty("display", "none");
      container.classList.remove("show");
    } else {
      var name = pm.toLowerCase();
      logo.setAttribute("src", "images/card-icons/" + name + ".svg");
      logo.setAttribute("alt", pm || "payment method");
      logo.style.removeProperty("display");
      container.classList.add("show");
    }
  }
);

Frames.addEventHandler(Frames.Events.FRAME_FOCUS, function (event) {
  // Float the label up when the field is focused
  switch (event.element) {
    case "card-number":
      cardLabel.classList.add("float-up");
      break;
    case "expiry-date":
      dateLabel.classList.add("float-up");
      break;
    case "cvv":
      cvvLabel.classList.add("float-up");
      break;
  }
});

Frames.addEventHandler(Frames.Events.FRAME_BLUR, function (event) {
  // Float the label to the center if the input is empty
  switch (event.element) {
    case "card-number":
      if (state["card-number"].isEmpty) {
        cardLabel.classList.remove("float-up");
      }
      break;
    case "expiry-date":
      if (state["expiry-date"].isEmpty) {
        dateLabel.classList.remove("float-up");
      }
      break;
    case "cvv":
      if (state["card-number"].isEmpty) {
        cvvLabel.classList.remove("float-up");
      }
      break;
  }
});

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, function onCardTokenized(
  event
) {
  var el = document.querySelector(".success-payment-message");
  payWithToken(event.token);
});

function setState(event) {
  switch (event.element) {
    case "card-number":
      state[event.element].isValid = event.isValid;
      state[event.element].isEmpty = event.isEmpty;
      break;
    case "expiry-date":
      state[event.element].isValid = event.isValid;
      state[event.element].isEmpty = event.isEmpty;
      break;
    case "cvv":
      state[event.element].isValid = event.isValid;
      state[event.element].isEmpty = event.isEmpty;
      break;
  }
}

function floatLabelUp(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = "";
}

function floatLabelCenter(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = "";
}

function clearErrorMessage(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = "";
}

function hasErrorIcon(img) {
  return img.hasAttribute("src") && img.src.indexOf("error") !== -1;
}

function setErrorMessage(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = errors[el];
}

Frames.addEventHandler(
  Frames.Events.CARD_TOKENIZATION_FAILED,
  function onCardTokenizationFailed(error) {
    Frames.enableSubmitForm();
  }
);

payButton.addEventListener("click", function (event) {
  event.preventDefault();

  Frames.submitCard()
    .then(function (val) {
      console.log("TOKENIZATION: ", val);
    })
    .catch(function (error) {
      console.log(error);
    });

  Frames.enableSubmitForm();
});

nameInput.addEventListener("focus", function () {
  clearErrorMessage("name");
  nameLabel.classList.add("float-up");
  nameInput.classList.remove("invalid-input");
});

nameInput.addEventListener("blur", function (event) {
  if (nameInput.value === "") {
    nameLabel.classList.remove("float-up");
    nameInput.classList.add("invalid-input");
    setErrorMessage("name");
  } else {
    Frames.cardholder.name = nameInput.value;
  }
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
var socket = io();
socket.on("connect", function () {
  console.log("socket connected");
});
socket.on("webhook", (webhookBody) => {
  console.log("WEBHOOK: ", webhookBody);
});
