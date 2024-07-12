let loginForm = document.getElementById("login-form")



loginForm.addEventListener('submit', (event) => {
    event.preventDefault()

    let email = document.getElementById("email").value
    let password = document.getElementById("password").value
    console.log("kkk")

    let isValid = true;

                //Email validation
                if (!email.trim()) {
  emailError.textContent = "Email is required";
  isValid = false;
} else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  emailError.textContent = "Please enter a valid email address";
  isValid = false;
} else if (/\s/.test(email) && /^\s|\s$/.test(email)) {
  emailError.textContent = "Email cannot contain whitespace";
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
} else if (/\s/.test(password) && /^\s|\s$/.test(password)) {
  passwordError.textContent = "Password cannot contain whitespace";
  isValid = false;
} else {
  passwordError.textContent = "";
}

if (isValid) {

    let data = {
        email: email,
        password: password
    }

    axios.post('/admin', data)
        .then((response) => {
            if(response.status == 200){
                window.location.href = "/admin/dashboard"
            }
        })
        .catch((error) => {
            console.log("it is an error", error)
            if (error.response.status == 404) {
 
      new Noty({
            type: 'error', 
            text:  error.response.data.message,
            timeout: 3000,
            layout: 'bottomCenter',
            theme: 'metroui', 
        }).show(); 
 
    }
        })
      }

})