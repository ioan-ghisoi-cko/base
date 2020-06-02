document.querySelector('.checkmark').classList.add('hide');
document.querySelector('.cross').classList.add('hide');

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
  publicKey: "pk_test_7d9921be-b71f-47fa-b996-29515831d911",
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

// When Frames is ready
Frames.addEventHandler(Frames.Events.READY, (event) => {
  framesLoader.style.display = "none";
  form.style.display = "block";
});

// When a Frames input is focused
Frames.addEventHandler(Frames.Events.FRAME_FOCUS, (event) => {
  // Float the label up when the field is focused
  switch (event.element) {
    case "card-number":
      cardLabel.classList.add("float-up");
      hintCardNumber.classList.remove("hide");
      break;
    case "expiry-date":
      dateLabel.classList.add("float-up");
      hintDate.classList.remove("hide");
      break;
    case "cvv":
      cvvLabel.classList.add("float-up");
      hintCvv.classList.remove("hide");
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
        hintCardNumber.classList.add("hide");
      } else if (state["card-number"].isValid) {
        hintCardNumber.classList.add("hide");
      }
      break;
    case "expiry-date":
      if (state["expiry-date"].isEmpty) {
        dateLabel.classList.remove("float-up");
        hintDate.classList.add("hide");
      } else if (state["expiry-date"].isValid) {
        hintDate.classList.add("hide");
      }
      break;
    case "cvv":
      if (state["card-number"].isEmpty) {
        cvvLabel.classList.remove("float-up");
        hintCvv.classList.add("hide");
      } else if (state["card-number"].isValid) {
        hintCvv.classList.add("hide");
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

      // Payment approved
      if (data.approved) {
        payButton.style.backgroundColor = "rgba(108, 195, 180, 1)";
        document.querySelector('.checkmark').classList.remove('hide')

        window.setTimeout(() => {
          document.querySelector('.checkmark').classList.add('hide')
          payButtonText.innerHTML =
            '<img id="refresh-icon" src="./images/refresh_white.png" alt="refresh" /> New Payment';
          payButtonText.style.display = "block";
        }, 750);
      }
      // Payment declined/timeout error
      else {
        payButton.style.backgroundColor = "#ED6077";
        document.querySelector('.cross').classList.remove('hide')

        window.setTimeout(() => {
          document.querySelector('.cross').classList.add('hide')
          payButtonText.innerHTML =
            '<img id="refresh-icon" src="./images/refresh_white.png" alt="refresh" /> Retry';
          payButtonText.style.display = "block";
        }, 750);
      }
    }
  );
};
