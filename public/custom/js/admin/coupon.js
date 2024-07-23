document.addEventListener("DOMContentLoaded", (event) => {
  let tableContainer = document.getElementById("table-container");

  let couponCodeEdit = document.getElementById('couponCodeEdit')
  let discountPercentageEdit = document.getElementById('discountPercentageEdit')
  let maxOfferLimitEdit = document.getElementById('maxOfferLimitEdit')
  let minOrderAmountEdit = document.getElementById('minOrderAmountEdit')
  let expiryDateEdit = document.getElementById('expiryDateEdit')

  document.addEventListener("click", (event) => {


    if(event.target && event.target.classList.contains("couponEditBtn")){
      couponCodeEdit.value = event.target.getAttribute('coupon-code')
      discountPercentageEdit.value = event.target.getAttribute('percentage')
      maxOfferLimitEdit.value = event.target.getAttribute('max-off-limit')
      minOrderAmountEdit.value = event.target.getAttribute('min-order-amount')
      expiryDateEdit.value = event.target.getAttribute('expiry-date')
      document.getElementById('couponEditForm').setAttribute('coupon-id', event.target.getAttribute('coupon-id'))
    }


    if (event.target && event.target.id == "cuponAddBtnSubmit") {
      event.preventDefault();

      let couponCode = document.getElementById("couponCode").value;
      let discountPercentage =
        document.getElementById("discountPercentage").value;
      let maxOfferLimit = document.getElementById("maxOfferLimit").value;
      let minOrderAmount = document.getElementById("minOrderAmount").value;
      let expiryDate = document.getElementById("expiryDate").value;

      let couponCodeError = document.getElementById("couponCodeError");
      let discountError = document.getElementById("discountError");
      let maxOfferLimitError = document.getElementById("maxOfferLimitError");
      let minOrderAmountError = document.getElementById("minOrderAmountError");
      let expiryDateError = document.getElementById("expiryDateError");

      let isValid = true;

      if (!couponCode.trim()) {
        couponCodeError.textContent = "This field is required";
        isValid = false;
      } else if (!/^[A-Za-z0-9]+$/.test(couponCode)) {
        couponCodeError.textContent = "Enter a valid coupon code";
        isValid = false;
      } else {
        couponCodeError.textContent = "";
      }

      if (!discountPercentage.trim()) {
        discountError.textContent = "This field is required";
        isValid = false;
      } else if (!/^\d+$/.test(discountPercentage)) {
        discountError.textContent = "Enter a valid value.";
        isValid = false;
      } else if(discountPercentage < 1 || discountPercentage > 99){
        discountError.textContent = "Enter a valid value.";
        isValid = false;

      } else if (discountPercentage > 100){
        discountError.textContent = "Enter a valid value.";
        isValid = false;
      } else {
        discountError.textContent = "";
      }

      if (!maxOfferLimit.trim()) {
        maxOfferLimitError.textContent = "This field is required";
        isValid = false;
      } else if (!/^\d+$/.test(maxOfferLimit)) {
        maxOfferLimitError.textContent = "Enter a valid value.";
        isValid = false;
      } else {
        maxOfferLimitError.textContent = "";
      }

      if (!minOrderAmount.trim()) {
        minOrderAmountError.textContent = "This field is required";
        isValid = false;
      } else if (!/^\d+$/.test(minOrderAmount)) {
        minOrderAmountError.textContent = "Enter a valid value.";
        isValid = false;
      } else {
        minOrderAmountError.textContent = "";
      }

      if (!expiryDate.trim()) {
        expiryDateError.textContent = "Choose an expiry date";
        isValid = false;
      } else {
        expiryDateError.textContent = "";
      }

      if (isValid) {
        axios
          .post("/admin/coupon/addCoupon", {
            data: {
              couponCode: couponCode,
              discountPercentage: discountPercentage,
              maxOfferLimit: maxOfferLimit,
              minOrderAmount: minOrderAmount,
              expiryDate: expiryDate,
            },
          })
          .then((response) => {
            if (response.status == 200) {
              window.location.href = "/admin/coupon"              
            }
          })
          .catch((error) => {
            console.log("it is an error", error);
          });
      }
    }


    if (event.target && event.target.id == "cuponEditBtnSubmit") {
      event.preventDefault();

      let couponCodeEdit = document.getElementById('couponCodeEdit').value
      let discountPercentageEdit = document.getElementById('discountPercentageEdit').value
      let maxOfferLimitEdit = document.getElementById('maxOfferLimitEdit').value
      let minOrderAmountEdit = document.getElementById('minOrderAmountEdit').value
      let expiryDateEdit = document.getElementById('expiryDateEdit').value
      let couponId = document.getElementById('couponEditForm').getAttribute('coupon-id')

      let couponCodeEditError = document.getElementById("couponCodeEditError");
      let discountEditError = document.getElementById("discountEditError");
      let maxOfferLimitEditError = document.getElementById("maxOfferLimitEditError");
      let minOrderAmountEditError = document.getElementById("minOrderAmountEditError");
      let expiryDateEditError = document.getElementById("expiryDateEditError");

      let isValid = true;

      if (!couponCodeEdit.trim()) {
        couponCodeEditError.textContent = "This field is required";
        isValid = false;
      } else if (!/^[A-Za-z0-9]+$/.test(couponCodeEdit)) {
        couponCodeEditError.textContent = "Enter a valid coupon code";
        isValid = false;
      } else {
        couponCodeEditError.textContent = "";
      }

      if (!discountPercentageEdit.trim()) {
        discountEditError.textContent = "This field is required";
        isValid = false;
      } else if (!/^\d+$/.test(discountPercentageEdit)) {
        discountEditError.textContent = "Enter a valid value.";
        isValid = false;
      } else if(discountPercentageEdit < 1 || discountPercentageEdit > 99){
        discountEditError.textContent = "Enter a valid value.";
        isValid = false;
      } else if (discountPercentageEdit > 100){
        discountEditError.textContent = "Enter a valid value.";
        isValid = false;
      } else {
        discountEditError.textContent = "";
      }

      if (!maxOfferLimitEdit.trim()) {
        maxOfferLimitEditError.textContent = "This field is required";
        isValid = false;
      } else if (!/^\d+$/.test(maxOfferLimitEdit)) {
        maxOfferLimitEditError.textContent = "Enter a valid value.";
        isValid = false;
      } else {
        maxOfferLimitEditError.textContent = "";
      }

      if (!minOrderAmountEdit.trim()) {
        minOrderAmountEditError.textContent = "This field is required";
        isValid = false;
      } else if (!/^\d+$/.test(minOrderAmountEdit)) {
        minOrderAmountEditError.textContent = "Enter a valid value.";
        isValid = false;
      } else {
        minOrderAmountEditError.textContent = "";
      }

      if (!expiryDateEdit.trim()) {
        expiryDateEditError.textContent = "Choose an expiry date";
        isValid = false;
      } else {
        expiryDateEditError.textContent = "";
      }

      if (isValid) {
        axios
          .post("/admin/coupon/editCoupon", {
            data: {
              couponCode: couponCodeEdit,
              discountPercentage: discountPercentageEdit,
              maxOfferLimit: maxOfferLimitEdit,
              minOrderAmount: minOrderAmountEdit,
              expiryDate: expiryDateEdit,
              couponId: couponId
            },
          })
          .then((response) => {
            if (response.status == 200) {
              window.location.href = "/admin/coupon"
  
            }
          })
          .catch((error) => {
            console.log("it is an error", error);
          });
      }
    }




    

    if (event.target && event.target.classList.contains("couponDltBtn")) {
      event.preventDefault();

      const couponId = event.target.getAttribute("data-coupon-id");

      Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete this coupon.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post("/admin/coupon/deleteCoupon", {
              data: { couponId: couponId },
            })
            .then((response) => {
              if (response.status == 200) {
                const couponRow = document.getElementById(
                  `tr${response.data.coupon._id}`
                );

                couponRow.remove();
              }
            })
            .catch((error) => {
              console.log("it is an error", error);
            });
        }
      });
    }
  });
});
