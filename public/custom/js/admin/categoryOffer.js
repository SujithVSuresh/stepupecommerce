document.addEventListener("DOMContentLoaded", (event) => {
    let tableContainer = document.getElementById("table-container");

    let editCategory = document.getElementById('editCategory')
    let editPercentage = document.getElementById('editPercentage')
    let editExpiryDate = document.getElementById('editExpiryDate')

    function fetchAllCategories(option, data) {
        axios
          .get("/admin/category/list")
          .then((response) => {
            if (response.status === 200) {
              const categories = response.data;
      
              if (option == "add") {
                const categorySelect = document.getElementById("category");
                categorySelect.innerHTML = ""
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "----------";
                categorySelect.appendChild(option);
      
                categories.categories.forEach((category) => {
                  const option = document.createElement("option");
                  option.value = category._id;
                  option.textContent = category.categoryName;
                  categorySelect.appendChild(option);
                });
              } else if (option == "edit") {
                const categorySelect = document.getElementById("edit-category");
                categorySelect.innerHTML = ""
                categories.categories.forEach((category) => {
                  const option = document.createElement("option");
                  option.value = category._id;
                  option.textContent = category.categoryName;
                  if (category.categoryName == data) {
                    option.selected = true;
                  }
                  categorySelect.appendChild(option);
                });
              }
            }
          })
          .catch((error) => {
            console.log("it is an error", error);
          });
      }

  

    document.addEventListener('click', (event) => {
      if(event.target && event.target.id == "add-offer-btn"){
        fetchAllCategories("add")
        document.getElementById('offerAddForm').reset()
        document.getElementById("categoryError").innerText = ""
        document.getElementById("percentageError").innerText = ""
        document.getElementById("expiryDateError").innerText = ""
        
    }

    if(event.target && event.target.classList.contains("offerEditBtn")){
      editCategory.value = event.target.getAttribute('category-name')
      editPercentage.value = event.target.getAttribute('percentage')
      editExpiryDate.value = event.target.getAttribute('expiry-date')
      document.getElementById('offerEditForm').setAttribute('offer-id', event.target.getAttribute('data-offer-id'))
    }

      if (event.target && event.target.classList.contains("offerDltBtn")) {
        event.preventDefault();
  
        const offerId = event.target.getAttribute("data-offer-id");
  
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
              .post("/admin/deleteCategoryOffer", {
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
      
    })


    document.addEventListener('submit', (event) => {
      if(event.target && event.target.id == "offerAddForm"){
        let category = document.getElementById("category").value;
        let offerPercentage =document.getElementById("offerPercentage").value;
        let expiryDate = document.getElementById("expiryDate").value;
    
        let categoryError = document.getElementById("categoryError");
        let percentageError = document.getElementById("percentageError");
        let expiryDateError = document.getElementById("expiryDateError");
          event.preventDefault();
    
          let isValid = true;
    
          if (!category.trim()) {
              categoryError.textContent = "Choose a category";
              isValid = false;
            } else {
              categoryError.textContent = "";
            }
    
          if (!offerPercentage.trim()) {
            percentageError.textContent = "This field is required";
            isValid = false;
          } else if (!/^\d+$/.test(offerPercentage)) {
            percentageError.textContent = "Enter a valid value.";
            isValid = false;
          }else if (offerPercentage < 1 || offerPercentage > 99){
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
              .post("/admin/addCategoryOffer", {
                data: {
                  categoryId: category,
                  offerPercentage: offerPercentage,
                  expiryDate: expiryDate,
                },
              })
              .then((response) => {
                if (response.status == 200) {
                  // let coupon = response.data.coupon;
                  // document.querySelector("#couponAddModal .close").click();
                  window.location.href = "/admin/categoryOffer"
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

      if(event.target && event.target.id == "offerEditForm"){
        let editPercentage =document.getElementById("editPercentage").value;
        let editExpiryDate = document.getElementById("editExpiryDate").value;
        let offerId = event.target.getAttribute('offer-id')
    
        let percentageEditError = document.getElementById("percentageEditError");
        let expiryDateEditError = document.getElementById("expiryDateEditError");
          event.preventDefault();
    
          let isValid = true;
    
    
          if (!editPercentage.trim()) {
            percentageEditError.textContent = "This field is required";
            isValid = false;
          } else if (!/^\d+$/.test(editPercentage)) {
            percentageEditError.textContent = "Enter a valid value.";
            isValid = false;
          }else if (editPercentage < 1 || editPercentage > 99){
            percentageEditError.textContent = "Enter a valid value.";
            isValid = false;
          } else {
            percentageEditError.textContent = "";
          }
    
    
          if (!editExpiryDate.trim()) {
            expiryDateEditError.textContent = "Choose an expiry date";
            isValid = false;
          } else {
            expiryDateEditError.textContent = "";
          }
    
          if (isValid) {
            axios
              .post("/admin/editCategoryOffer", {
                data: {
                  offerId: offerId,
                  offerPercentage: editPercentage,
                  expiryDate: editExpiryDate,
                },
              })
              .then((response) => {
                if (response.status == 200) {
                  console.log("category offer.....");
                  // let coupon = response.data.coupon;
                  console.log(response.data);
                  // document.querySelector("#couponAddModal .close").click();
                  window.location.href = "/admin/categoryOffer"
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
  