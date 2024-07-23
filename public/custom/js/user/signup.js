let signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let firstName = document.getElementById("fname").value;
  let lastName = document.getElementById("lname").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value; 
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirm-password").value;

  let emailError = document.getElementById("emailError");
  let passwordError = document.getElementById("passwordError");
  let phoneError = document.getElementById("phoneError");
  let nameError = document.getElementById("nameError");
  let password2Error = document.getElementById("password2Error");
  let isValid = true;

  //Email validation
  if (!email.trim()) {
    emailError.textContent = "Email is required";
    isValid = false;
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Please enter a valid email address";
    isValid = false;
  } else if (/\s/.test(email) || /^\s|\s$/.test(email)) {
    emailError.textContent = "Please enter a valid email address";
    isValid = false;
  } else {
    emailError.textContent = "";
  }


  //Password validation
  if (!password.trim()) {
    passwordError.textContent = "Password is required";
    isValid = false;
  } else if (password && password.length < 8) {
    passwordError.textContent = "Password must be at least 8 characters long";
    isValid = false;
  } else if (/\s/.test(password) || /^\s|\s$/.test(password)) {
    passwordError.textContent = "Password cannot contain whitespace";
    isValid = false;
  } else if (!/^[^\W_][\w\W]{4,}$/.test(password)){
    passwordError.textContent = "Enter a valid password";
    isValid = false

  } else {
    passwordError.textContent = "";
  }

  //Password 2 validation
  if (!confirmPassword.trim()) {
    password2Error.textContent = "Password confirmation is required";
    isValid = false;
  } else if (password !== confirmPassword) {
    isValid = false;
    password2Error.textContent = "Passwords does not match";
  } else {
    password2Error.textContent = "";
  }

  //Name validation
  if (!firstName.trim() || !lastName.trim()) {
    nameError.textContent = "First name & Last name is required";
    isValid = false;
  } else if(!/^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(firstName)){
    nameError.textContent = "Enter a valid firstname";
    isValid = false;
  } else if(!/^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(lastName)){
    nameError.textContent = "Enter a valid lastname";
    isValid = false;
  } else {
    nameError.textContent = "";
  }

  //Phone validation
  if (!phone.trim()) {
    phoneError.textContent = "Phone number is required";
    isValid = false;
  } else if (phone && !/^[789]\d{9}$/.test(phone)) {
    phoneError.textContent = "Enter a valid phone number";
    isValid = false;
  } else {
    phoneError.textContent = "";
  }

  const referral = document.getElementById('referral').getAttribute('referral-code')

  if (isValid) {
    let data = {
      fname: firstName,
      lname: lastName,
      email: email,
      phone: phone,
      password: password,
      referral: referral
    };

    axios
      .post("/signup", data)
      .then((response) => {
        if (response.status == 200) {
          localStorage.removeItem('otpTimer');

          window.location.href = "/signup/otp";
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
        if (error.response.status == 400) {
          new Noty({
            type: "error",
            text: error.response.data.message,
            timeout: 3000,
            layout: "bottomCenter",
            theme: "metroui",
          }).show();
        }
      });
  }
});