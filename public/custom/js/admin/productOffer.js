document.addEventListener("DOMContentLoaded", (event) => {
    let tableContainer = document.getElementById("table-container");

  
    document.addEventListener("click", (event) => {
        if(event.target && event.target.id == "add-offer-btn"){
            document.getElementById('offerAddForm').reset()

            document.getElementById("productError").innerText = ""
            document.getElementById("percentageError").innerText = ""
            document.getElementById("expiryDateError").innerText = ""
            
        }

  
        if (event.target && event.target.classList.contains("offerDltBtn")) {
          event.preventDefault();
    
          const offerId = event.target.getAttribute("data-offer-id");
    
          console.log(offerId, "jjj");
          Swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete this offer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
          }).then((result) => {
            if (result.isConfirmed) {
              axios
                .post("/admin/deleteProductOffer", {
                  data: { offerId: offerId },
                })
                .then((response) => {
                  if (response.status == 200) {
                    const offerRow = document.getElementById(
                      `tr${response.data.offer._id}`
                    );
    
                    offerRow.remove();
                  }
                })
                .catch((error) => {
                  console.log("it is an error", error);
                });
            }
          });
        }
    });

    document.addEventListener('submit', (event) => {
      if(event.target && event.target.id == "offerAddForm"){
        let product = document.getElementById("product").value;
        let offerPercentage =document.getElementById("offerPercentage").value;
        let expiryDate = document.getElementById("expiryDate").value;
    
        let productError = document.getElementById("productError");
        let percentageError = document.getElementById("percentageError");
        let expiryDateError = document.getElementById("expiryDateError");
          event.preventDefault();
    
          let isValid = true;
    
          if (!product.trim()) {
              productError.textContent = "Choose a product";
              isValid = false;
            } else {
              productError.textContent = "";
            }
    
          if (!offerPercentage.trim()) {
            percentageError.textContent = "This field is required";
            isValid = false;
          } else if (!/^\d+$/.test(offerPercentage)) {
            percentageError.textContent = "Enter a valid value.";
            isValid = false;
          } else {
            percentageError.textContent = "";
          }
    
    
          if (!expiryDate.trim()) {
            expiryDateError.textContent = "Choose an expiry date";
            isValid = false;
          } else {
            expiryDateError.textContent = "";
          }
    
          if (isValid) {
            axios
              .post("/admin/addProductOffer", {
                data: {
                  productId: product,
                  offerPercentage: offerPercentage,
                  expiryDate: expiryDate,
                },
              })
              .then((response) => {
                if (response.status == 200) {
                  window.location.href = "/admin/productOffer"
                  // let coupon = response.data.coupon;
                  // document.querySelector("#offerAddModal .close").click();
    //               tableContainer.insertAdjacentHTML(
    //                 "afterbegin",
    //                 `
    // <tr id="tr${coupon._id}">
    // <td>${coupon.couponCode}</td>
    // <td>${coupon.discountPercentage} %</td>
    // <td>₹ ${coupon.maxOfferLimit}</td>
    // <td>₹ ${coupon.minOrderAmount}</td>
    // <td>${new Date(coupon.expiryDate).toISOString().slice(0, 10)}</td>
    // <td>
    // <button data-coupon-id="${coupon._id}" id="coupon${coupon._id}" type="button"
    //     class="btn btn-outline-dark btn-sm couponDltBtn">Delete</button>
    // </td>
    // </tr>
    // `
    //               );
                }
              })
              .catch((error) => {
                console.log("it is an error", error);
              });
          }
        
      }
    })
  });