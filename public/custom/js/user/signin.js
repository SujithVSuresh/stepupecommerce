let signinForm = document.getElementById("signin-form")

signinForm.addEventListener('submit', (event) => {
    event.preventDefault()

    let email = document.getElementById("email").value
    let password = document.getElementById("password").value

    let emailError = document.getElementById("emailError")

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
    } else {
        passwordError.textContent = "";
    }

    if (isValid) {
        let data = {
            email: email,
            password: password
        }


        axios.post('/signin', data)
            .then((response) => {
                if (response.status == 200) {
                    const redirectTo = response.data.redirectTo
                    window.location.href = redirectTo
                }
            })
            .catch((error) => {
                console.log("it is an error12443", error)
                if (error.response.status == 404) {

                    new Noty({
                        type: 'error',
                        text: error.response.data.message,
                        timeout: 3000,
                        layout: 'bottomCenter',
                        theme: 'metroui',
                    }).show();

                }
            })
    }
})