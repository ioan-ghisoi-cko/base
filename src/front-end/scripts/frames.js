var state = {
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
      fontSize: "14px",
      fontFamily: "Arial, Helvetica, sans-serif",
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
        fontSize: "12px", // Hide placeholder behind label when not floating
      },
      focus: {
        fontSize: "14px",
        fontWeight: "300",
      },
    },
  },
});

// When a Frames input is focused
Frames.addEventHandler(Frames.Events.FRAME_FOCUS, (event) => {
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

  state[event.element].isFocused = true;
});

// When a Frames input is blurred
Frames.addEventHandler(Frames.Events.FRAME_BLUR, (event) => {
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

  state[event.element].isFocused = false;
});

// When the validation changes for one of the Frames inputs
Frames.addEventHandler(Frames.Events.FRAME_VALIDATION_CHANGED, (event) => {
  switch (event.element) {
    case "card-number":
      event.isEmpty && !state[event.element].isFocused
        ? cardLabel.classList.remove("float-up")
        : cardLabel.classList.add("float-up");
      break;
    case "expiry-date":
      event.isEmpty && !state[event.element].isFocused
        ? dateLabel.classList.remove("float-up")
        : dateLabel.classList.add("float-up");
      break;
    case "cvv":
      event.isEmpty && !state[event.element].isFocused
        ? cvvLabel.classList.remove("float-up")
        : cvvLabel.classList.add("float-up");
      break;
  }

  // Update the state
  state[event.element].isValid = event.isValid;
  state[event.element].isEmpty = event.isEmpty;
});

// When the validation changes for the hole Frames form
Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
  if (Frames.isCardValid() && nameInput.value.length > 2) {
    payButton.disabled = false;
  } else {
    payButton.disabled = true;
  }
});

// When frames detect the payment method
Frames.addEventHandler(Frames.Events.PAYMENT_METHOD_CHANGED, (event) => {
  var pm = event.paymentMethod;

  let container = document.querySelector(".icon-container.payment-method");

  if (!pm) {
    paymentMethodIcon.style.setProperty("display", "none");
  } else {
    var name = pm.toLowerCase();
    paymentMethodIcon.setAttribute("src", "images/card-icons/" + name + ".svg");
    paymentMethodIcon.setAttribute("alt", pm || "payment method");
    paymentMethodIcon.style.setProperty("display", "block");
  }
});

// When Frames has tokenized the card
Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
  payWithToken(event.token);
});

// When the pay button is clicked
payButton.addEventListener("click", function (event) {
  event.preventDefault();
  payButtonText.style.display = "none";
  payButtonLoader.style.display = "flex";
  Frames.submitCard();
  Frames.enableSubmitForm();
});

// We call our Back End server to process the payment with the token
const payWithToken = (token) => {
  http(
    {
      method: "POST",
      route: "/payWithToken",
      body: { token: token },
    },
    (data) => {
      console.log("API RESPONSE: ", data);
      payButtonLoader.style.display = "none";
      payButtonText.innerHTML = data.approved ? "Approved!" : "Declined";
      payButtonText.style.display = "block";
    }
  );
};
