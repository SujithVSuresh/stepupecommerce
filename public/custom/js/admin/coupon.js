document.addEventListener("DOMContentLoaded", (event) => {
  let tableContainer = document.getElementById("table-container");

  document.addEventListener("click", (event) => {
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
              let coupon = response.data.coupon;
              document.querySelector("#couponAddModal .close").click();
              tableContainer.insertAdjacentHTML(
                "afterbegin",
                `
<tr id="tr${coupon._id}">
<td>${coupon.couponCode}</td>
<td>${coupon.discountPercentage} %</td>
<td>₹ ${coupon.maxOfferLimit}</td>
<td>₹ ${coupon.minOrderAmount}</td>
<td>${new Date(coupon.expiryDate).toISOString().slice(0, 10)}</td>
<td>
<button data-coupon-id="${coupon._id}" id="coupon${coupon._id}" type="button"
    class="btn btn-outline-dark btn-sm couponDltBtn">Delete</button>
</td>
</tr>
`
              );
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
