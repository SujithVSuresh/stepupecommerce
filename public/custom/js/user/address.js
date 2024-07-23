document.addEventListener("DOMContentLoaded", (event) => {
  const states = [
    "Select state",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const stateSelect = document.getElementById("state");
  // const stateSelectEdit = document.getElementById("stateEdit");

  for (const state of states) {
    const option = document.createElement("option");
    if (state == "Select state") {
      option.value = "";
      option.text = state;
    } else {
      option.value = state;
      option.text = state;
    }
    stateSelect.appendChild(option);
    // stateSelectEdit.appendChild(option)
  }

  const stateSelectEdit = document.getElementById("stateEdit");

  for (const state of states) {
    const option = document.createElement("option");
    if (state == "Select state") {
      option.value = "";
      option.text = state;
    } else {
      option.value = state;
      option.text = state;
    }
    stateSelectEdit.appendChild(option);
  }

  let addressId;

  document.addEventListener("click", (event) => {

    if(event.target && event.target.id == "addAddressBtn"){
      document.getElementById('addAddressForm').reset()
    }
    
    if (event.target && event.target.classList.contains("editBtn")) {
      // const addressId = event.target.getAttribute('address-id')
      addressId = event.target.getAttribute("address-id");

      const name = document.getElementById(`name${addressId}`).innerText;
      const locality = document.getElementById(
        `locality${addressId}`
      ).innerText;
      const landmark = document.getElementById(
        `landmark${addressId}`
      ).innerText;
      const city = document.getElementById(`city${addressId}`).innerText;
      const state = document.getElementById(`state${addressId}`).innerText;
      const pincode = document.getElementById(`pincode${addressId}`).innerText;
      const phone = document.getElementById(`phone${addressId}`).innerText;

      document.getElementById("fullNameEdit").value = name
      document.getElementById("stateEdit").value = state
      document.getElementById("cityDistrictTownEdit").value = city
      document.getElementById("zipPostalCodeEdit").value = pincode
      document.getElementById("localityAreaStreetEdit").value = locality
      document.getElementById("landmarkEdit").value = landmark
      document.getElementById("phoneEdit").value = phone
    }

    if (event.target && event.target.id == "addressEditSaveBtn") {
      const nameInput = document.getElementById("fullNameEdit").value;
      const stateInput = document.getElementById("stateEdit").value;
      const cityDistrictTownInput = document.getElementById(
        "cityDistrictTownEdit"
      ).value;
      const zipPostalCodeInput =
        document.getElementById("zipPostalCodeEdit").value;
      const localityAreaStreetInput = document.getElementById(
        "localityAreaStreetEdit"
      ).value;
      const landmarkInput = document.getElementById("landmarkEdit").value;
      const phoneInput = document.getElementById("phoneEdit").value;


      let nameEditError = document.getElementById("nameEditError");
      let stateEditError = document.getElementById("stateEditError");
      let cityEditError = document.getElementById("cityEditError");
      let pincodeEditError = document.getElementById("pincodeEditError");
      let localityEditError = document.getElementById("localityEditError");
      let landmarkEditError = document.getElementById("landmarkEditError");
      let houseEditError = document.getElementById("houseEditError");
      let phoneEditError = document.getElementById("phoneEditError");


      let isValid = true;

      //Name validation
      if (!nameInput.trim()) {
        nameEditError.textContent = "Name is required";
        isValid = false;
      } else if (nameInput.trim().length < 2) {
        nameEditError.textContent = "Name must be at least 2 characters long";
        isValid = false;
      } else if (nameInput.trim().length > 100) {
        nameEditError.textContent = "Name must be less than 20 characters long";
        isValid = false;
      } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(nameInput)) {
        nameEditError.textContent = "Enter a valid name";
        isValid = false;
      }else {
        nameEditError.textContent = "";
      }

      //state validation
      if (!stateInput.trim()) {
        stateEditError.textContent = "This field is required";
        isValid = false;
      } else {
        stateEditError.textContent = "";
      }

      //city validation
      if (!cityDistrictTownInput.trim()) {
        cityEditError.textContent = "This field is required";
        isValid = false;
      } else if (cityDistrictTownInput.trim().length > 30) {
        cityEditError.textContent =
          "City/District/Town must be less than 30 characters long";
        isValid = false;
      } else if(!/^[a-zA-Z]+$/.test(cityDistrictTownInput)){
        cityEditError.textContent = "Enter a valid value";
        isValid = false;
      } else {
        cityEditError.textContent = "";
      }

      const postalCodePattern = /^\d{5,6}$/;
      //pincode validation
      if (!zipPostalCodeInput.trim()) {
        pincodeEditError.textContent = "This field is required";
        isValid = false;
      } else if (!postalCodePattern.test(zipPostalCodeInput)) {
        pincodeEditError.textContent =
          "Please enter a valid 5 or 6-digit postal code";
        isValid = false;
      } else {
        pincodeEditError.textContent = "";
      }

      if (!localityAreaStreetInput.trim()) {
        localityEditError.textContent = "This field is required";
        isValid = false;
      } else if (localityAreaStreetInput.trim().length > 30) {
        localityEditError.textContent =
          "Locality/Area/Street must be less than 30 characters long";
        isValid = false;
      } else if(!/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/.test(localityAreaStreetInput)){
        localityEditError.textContent = "Enter a valid value";
        isValid = false;
      }  else {
        localityEditError.textContent = "";
      }

      //landmark validation
      if (!landmarkInput.trim()) {
        landmarkEditError.textContent = "This field is required";
        isValid = false;
      } else if(!/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/.test(landmarkInput)){
        landmarkEditError.textContent = "Enter a valid value";
        isValid = false;
      } else {
        landmarkEditError.textContent = "";
      }

      //Phone validation
      if (!phoneInput.trim()) {
        phoneEditError.textContent = "This field is required";
        isValid = false;
      } else if (phoneInput && !/^[789]\d{9}$/.test(phoneInput)) {
        phoneEditError.textContent = "Enter a valid phone number";
        isValid = false;
      } else {
        phoneEditError.textContent = "";
      }


      if(isValid){
      const data = {
        fullName: nameInput,
        state: stateInput,
        cityDistrictTown: cityDistrictTownInput,
        zipPostalCode: zipPostalCodeInput,
        localityAreaStreet: localityAreaStreetInput,
        housenoBuildingApartment: "123",
        phone: phoneInput,
        landmark: landmarkInput,
        addressId: addressId,
      };

      axios
        .post("/address/editAddress", data)
        .then((response) => {
          if (response.status == 200) {
            window.location.href = "/address";

            document.querySelector("#addAddressModal .close").click();
          }
        })
        .catch((error) => {
          console.log("error code");
        });
      }
    }

    if (event.target && event.target.id == "addressSaveBtn") {
      event.preventDefault();

      const addressContainer = document.getElementById("addressContainer");

      let fullName = document.getElementById("fullName");
      let state = document.getElementById("state");
      let cityDistrictTown = document.getElementById("cityDistrictTown");
      let zipPostalCode = document.getElementById("zipPostalCode");
      let localityAreaStreet = document.getElementById("localityAreaStreet");
      let housenoBuildingApartment = document.getElementById(
        "housenoBuildingApartment"
      );
      let phone = document.getElementById("phone");
      let landmark = document.getElementById("landmark");

      let nameError = document.getElementById("nameError");
      let stateError = document.getElementById("stateError");
      let cityError = document.getElementById("cityError");
      let pincodeError = document.getElementById("pincodeError");
      let localityError = document.getElementById("localityError");
      let landmarkError = document.getElementById("landmarkError");
      let houseError = document.getElementById("houseError");
      let phoneError = document.getElementById("phoneError");

      let isValid = true;

      //Name validation
      if (!fullName.value.trim()) {
        nameError.textContent = "Name is required";
        isValid = false;
      } else if (fullName.value.trim().length < 2) {
        nameError.textContent = "Name must be at least 2 characters long";
        isValid = false;
      } else if (fullName.value.trim().length > 100) {
        nameError.textContent = "Name must be less than 20 characters long";
        isValid = false;
      } else if (!/^(?! )[A-Za-zÀ-ÖØ-öø-ÿ' ]*(?<! )$/.test(fullName.value)) {
        nameError.textContent = "Enter a valid name";
        isValid = false;
      }else {
        nameError.textContent = "";
      }

      //state validation
      if (!state.value.trim()) {
        stateError.textContent = "This field is required";
        isValid = false;
      } else {
        stateError.textContent = "";
      }

      //city validation
      if (!cityDistrictTown.value.trim()) {
        cityError.textContent = "This field is required";
        isValid = false;
      } else if (cityDistrictTown.value.trim().length > 30) {
        cityError.textContent =
          "City/District/Town must be less than 30 characters long";
        isValid = false;
      } else if(!/^[a-zA-Z]+$/.test(cityDistrictTown.value)){
        cityError.textContent =
          "Enter a valid value";
        isValid = false;

      } else {
        cityError.textContent = "";
      }

      const postalCodePattern = /^\d{5,6}$/;
      //pincode validation
      if (!zipPostalCode.value.trim()) {
        pincodeError.textContent = "This field is required";
        isValid = false;
      } else if (!postalCodePattern.test(zipPostalCode.value)) {
        pincodeError.textContent =
          "Please enter a valid 5 or 6-digit postal code";
        isValid = false;
      } else {
        pincodeError.textContent = "";
      }

      if (!localityAreaStreet.value.trim()) {
        localityError.textContent = "This field is required";
        isValid = false;
      } else if (localityAreaStreet.value.trim().length > 30) {
        localityError.textContent =
          "Locality/Area/Street must be less than 30 characters long";
        isValid = false;
      } else if(!/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/.test(localityAreaStreet.value)){
        localityError.textContent = "Enter a valid value";
        isValid = false;
      }  else {
        localityError.textContent = "";
      }

      //house validation
      if (!housenoBuildingApartment.value.trim()) {
        houseError.textContent = "This field is required";
        isValid = false;
      } else if(!/^[a-zA-Z0-9]+$/.test(housenoBuildingApartment.value)){
        houseError.textContent = "Enter a valid value";
        isValid = false;
      } else {
        houseError.textContent = "";
      }

      //landmark validation
      if (!landmark.value.trim()) {
        landmarkError.textContent = "This field is required";
        isValid = false;
      } else if(!/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/.test(landmark.value)){
        landmarkError.textContent = "Enter a valid value";
        isValid = false;
      } else {
        landmarkError.textContent = "";
      }

      //Phone validation
      if (!phone.value.trim()) {
        phoneError.textContent = "This field is required";
        isValid = false;
      } else if (phone.value && !/^[789]\d{9}$/.test(phone.value)) {
        phoneError.textContent = "Enter a valid phone number";
        isValid = false;
      } else {
        phoneError.textContent = "";
      }

      if (isValid) {
        const data = {
          fullName: fullName.value,
          state: state.value,
          cityDistrictTown: cityDistrictTown.value,
          zipPostalCode: zipPostalCode.value,
          localityAreaStreet: localityAreaStreet.value,
          housenoBuildingApartment: housenoBuildingApartment.value,
          phone: phone.value,
          landmark: landmark.value,
        };

        axios
          .post("/address/addAddress", data)
          .then((response) => {
            if (response.status == 200) {
                window.location.href = "/address"
            }
          })
          .catch((error) => {
            console.log("error code");
          });
      }
    }

    if (event.target && event.target.classList.contains("dltBtn")) {
      console.log("moyi");
      const addressId = event.target.getAttribute("address-id");
      let n = new Noty({
        text: "Are you sure you want to delete this item?",
        type: "confirm",
        theme: "metroui",
        layout: "center",
        modal: true,
        timeout: false,
        progressBar: true,
        animation: {
          open: "animated bounceInLeft",
          close: "animated bounceOutRight",
        },
        buttons: [
          Noty.button("Yes", "btn btn-success btn-yes", function () {
            console.log("hey yes clicked");

            axios
              .post("/address/deleteAddress", { addressId: addressId })
              .then((response) => {
                if (response.status == 200) {
                  const addressCard = document.getElementById(
                    `addressCard${addressId}`
                  );
                  addressCard.remove();
                  n.close();
                }
              })
              .catch((error) => {
                console.log("it is an error", error);
                if (error.response.status == 409) {
                }
              });
          }),
          Noty.button("No", "btn btn-danger btn-no", function () {
            // Handle the cancel action here
            console.log("Delete canceled");
            n.close();
          }),
        ],
      }).show();
    }
  });
});