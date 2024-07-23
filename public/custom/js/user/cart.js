document.addEventListener("DOMContentLoaded", (event) => {
    // Header cart count.
    let cartCount = document.getElementById("mainCartCount");

    let subTotal = document.getElementById("subtotalValue");

    let shippingCharge = document.getElementById("shippingCharge");

    let proceedToBuy = document.getElementById('proceedToBuy')

    let grossTotal = document.getElementById("grossTotalValue");

    let couponDiscountAmount = document.getElementById("couponDiscountAmount");

    let couponApplyForm = document.getElementById('couponApplyForm')

    let couponAddedDoneCard = document.getElementById('couponAddedDoneCard')

    let couponCodeDisplay = document.getElementById("couponCodeDisplay")

    let offerPercentageDisplay = document.getElementById("offerPercentageDisplay")

    let minOrderAmountMsg = document.getElementById("minOrderAmountMsg")


    function cartProductsFunc() {
      return axios
        .get("/shop/cart/products")
        .then((response) => {
          if (response.status == 200) {
            let cartitems = response.data.cartData.items

            let cartItemsContainer = document.getElementById("cartItemsContainer");

            if (cartitems.length == 0) {
              proceedToBuy.style.pointerEvents = "none"
              document.getElementById('showCouponBtn').style.display = "none"
              document.getElementById('couponApplyForm').style.display = "none"
            }

            const totalAmountDetails = response.data.totalAmountDetails;

            cartItemsContainer.innerHTML = "";

            if(cartitems && cartitems.length != 0){

            cartitems.forEach((item) => {

              cartItemsContainer.innerHTML += `
                  <div class="product-cart d-flex" id="cartItemContainer${item._id}">
                          <div class="one-forth">
                              <div class="product-img" style="background-image: url('/static/images/${item.varientId.images[0]
                }');">
                              </div>
                              <div class="display-tc">
                                  <span style="margin-left: 30px; color: black">${item.productId.modelName
                } for ${item.productId.gender}</span><br>
                                  <span style="margin-left: 30px;" class="price">Size: ${item.subVarientId.size
                }, Color: ${item.varientId.colorName}</span><br>
                ${item.subVarientId.quantity == 0
                  ? '<span style="margin-left: 30px; color: red;" class="price" id="oos' +
                  item._id +
                  '">Out of stock</span>'
                  : ""
                }
                        ${item.subVarientId.quantity != 0 && item.subVarientId.quantity < item.quantity
                  ? '<span style="margin-left: 30px; color: red;" class="price" id="oos' +
                  item._id +
                  '">Only 5 left</span>'
                  : ""
                }
                              </div>
                          </div>
                          <div class="one-eight text-center">
                              <div class="display-tc">
                                  <span class="price">₹ ${item.subVarientId.price}</span>
                              </div>
                          </div>
                          <div class="one-eight text-center" style="display: flex; justify-content: center; align-items: center;" >
                              <div class="quantity-wrapper" style="display: flex; flex-direction: row;">
                                  <a href="" data-cart-item-id="${item._id
                }" type="button" id="decrementBtn" class="qty-btn" style="background-color: #f1f1f1; width: 20px;">-</a>
                                  <div type="text" style="width: 30px;" id="quantity${item._id}" >${item.quantity
                }</div>
                                  <a href="" data-cart-item-id="${item._id
                }" type="button" id="incrementBtn" class="qty-btn" style="background-color: #f1f1f1; width: 20px;">+</a>
                              </div>
                          </div>
                          <div class="one-eight text-center">
                              <div class="display-tc">
                                  <span class="price" id="total${item._id}">₹ ${item.quantity * item.subVarientId.price
                }</span>
                              </div>
                          </div>
                          <div class="one-eight text-center">
                              <div class="display-tc">
                                  <a href="" data-cart-item-id=${item._id} class="removeFromCartBtn closed"></a>
                              </div>
                          </div>
                      </div>
                  `;
            });

          }else{
            cartItemsContainer.innerHTML = `<div class="text-center"> <img src="/static/user/images/empty.png" width="250px" height="250px" alt="empty cart"> </div>`
          }


            subTotal.innerText = `₹ ${totalAmountDetails.totalPrice}`;

            shippingCharge.innerText = `₹ ${totalAmountDetails.shippingPrice}`;


            couponDiscountAmount.innerText = `₹ ${totalAmountDetails.couponDiscount}`;

            grossTotal.innerText = `₹ ${totalAmountDetails.totalAmount}`;

            return response.data;
          }
        })

        .catch((error) => {
          console.log("error code", error);
          if(error.response.status == 404){
            document.getElementById("cartItemsContainer").innerHTML = `<div class="text-center"> <img src="/static/user/images/empty.png" class="mt-5" width="250px" height="250px" alt="empty cart"> </div>`

            proceedToBuy.style.pointerEvents = "none"
            document.getElementById('showCouponBtn').style.display = "none"
            document.getElementById('couponApplyForm').style.display = "none"
          }
        });
    }

    cartProductsFunc()
      .then((data) => {
        console.log("Received data:", data);
      })
      .catch((error) => {
        console.log("Failed to fetch data:", error);
      });

    // Apply coupom form handler
    couponApplyForm.addEventListener('submit', (event) => {
      event.preventDefault()

      let couponApplyInput = document.getElementById('couponApplyInput')

      let isValid = true

  if (!couponApplyInput.value.trim()) {
    isValid = false;
  } 

  if(isValid){

      axios
        .post("/shop/cart/applyCoupon", { code: couponApplyInput.value })
        .then((response) => {
          if (response.status == 200) {
            let couponAppliedData = response.data.data

            subTotal.innerText = `₹ ${couponAppliedData.totalPrice}`;

            shippingCharge.innerText = `₹ ${couponAppliedData.shippingPrice}`;


            couponDiscountAmount.innerText = `₹ ${couponAppliedData.couponDiscount}`;

            grossTotal.innerText = `₹ ${couponAppliedData.totalAmount}`;


            couponApplyForm.style.display = 'none'
            couponAddedDoneCard.style.display = 'block'

            couponApplyForm.reset()

            couponCodeDisplay.innerText = response.data.coupon.couponCode
            offerPercentageDisplay.innerText = `${response.data.coupon.discountPercentage}% off`


            new Noty({
              type: "success",
              text: response.data.message,
              timeout: 3000,
              layout: "bottomCenter",
              theme: "metroui",
              animation: {
                open: "animated bounceInRight",
                close: "animated bounceOutRight",
              },
            }).show();
          }
        })
        .catch((error) => {
          console.log("it is an error", error);
          if (error.response.status == 404 || error.response.status == 409) {
            new Noty({
              type: "error",
              text: error.response.data.error,
              timeout: 3000,
              layout: "bottomCenter",
              theme: "metroui",
            }).show();
          }
        });
      }

    })


    //   -------------------------------------CLICK EVENT START-----------------------------------

    document.addEventListener("click", (event) => {

      if (event.target && event.target.id == "couponRemoveBtn") {
        event.preventDefault()

        axios
          .post("/shop/cart/removeCoupon")
          .then((response) => {
            if (response.status == 200) {
              let totalAmountDetails = response.data.totalAmountDetails

              subTotal.innerText = `₹ ${totalAmountDetails.totalPrice}`;

              shippingCharge.innerText = `₹ ${totalAmountDetails.shippingPrice}`;

              couponDiscountAmount.innerText = `₹ ${totalAmountDetails.couponDiscount}`;

              grossTotal.innerText = `₹ ${totalAmountDetails.totalAmount}`;

              couponApplyForm.style.display = 'block'
              couponAddedDoneCard.style.display = 'none'
              new Noty({
                type: "success",
                text: response.data.message,
                timeout: 3000,
                layout: "bottomCenter",
                theme: "metroui",
                animation: {
                  open: "animated bounceInRight",
                  close: "animated bounceOutRight",
                },
              }).show();
            }
          })
          .catch((error) => {
            console.log("error code");
          });
      }

      if (event.target && event.target.classList.contains("copyToClipboard")) {
        event.preventDefault()
        let copyBtn = event.target

        let couponCode = copyBtn.getAttribute('coupon-code')

        navigator.clipboard.writeText(couponCode).then(function () {
          copyBtn.innerText = "Copied"

          setTimeout(() => {
            copyBtn.innerText = "Copy"

          }, 500)
        }).catch(function (error) {
          alert('Copy failed: ' + error);
        });

      }


      if (event.target && event.target.classList.contains("qty-btn")) {
        event.preventDefault();

        let qtyBtn = event.target;
        let cartItemId = qtyBtn.getAttribute("data-cart-item-id");

        let cartItemQtyDisplay = document.getElementById(
          `quantity${cartItemId}`
        );

        let cartItemTotalAmountDisplay = document.getElementById(
          `total${cartItemId}`
        );

        if (qtyBtn.id == "decrementBtn") {
          axios
            .post("/shop/cart/qtyManagement", {
              itemId: cartItemId,
              qtyUpdateIdentifier: 0,
            })
            .then((response) => {
              if (response.status == 200) {
                const totalAmountDetails = response.data.totalAmountDetails;
                cartItemQtyDisplay.innerText =
                  response.data.updatedItem.quantity;
                cartItemTotalAmountDisplay.innerText =
                  response.data.updatedItem.subVarientId.price *
                  response.data.updatedItem.quantity;

                subTotal.innerText = `₹ ${totalAmountDetails.totalPrice}`;

                shippingCharge.innerText = `₹ ${totalAmountDetails.shippingPrice}`;

                couponDiscountAmount.innerText = `₹ ${totalAmountDetails.couponDiscount}`;

                grossTotal.innerText = `₹ ${totalAmountDetails.totalAmount}`;

                if(!response.data.couponValid){
                  minOrderAmountMsg.style.display = "block"
                  minOrderAmountMsg.querySelector("span").innerText = totalAmountDetails.totalPrice
                }
                new Noty({
                  type: "success",
                  text: response.data.message,
                  timeout: 3000,
                  layout: "bottomCenter",
                  theme: "metroui",
                  animation: {
                    open: "animated bounceInRight",
                    close: "animated bounceOutRight",
                  },
                }).show();
              }
            })
            .catch((error) => {
              console.log("error code");
            });
        }

        if (qtyBtn.id == "incrementBtn") {
          axios
            .post("/shop/cart/qtyManagement", {
              itemId: cartItemId,
              qtyUpdateIdentifier: 1,
            })
            .then((response) => {
              if (response.status == 200) {
                const totalAmountDetails = response.data.totalAmountDetails;
                cartItemQtyDisplay.innerText =
                  response.data.updatedItem.quantity;
                cartItemTotalAmountDisplay.innerText =
                  response.data.updatedItem.subVarientId.price *
                  response.data.updatedItem.quantity;

                subTotal.innerText = `₹ ${totalAmountDetails.totalPrice}`;

                shippingCharge.innerText = `₹ ${totalAmountDetails.shippingPrice}`;

                couponDiscountAmount.innerText = `₹ ${totalAmountDetails.couponDiscount}`;

                grossTotal.innerText = `₹ ${totalAmountDetails.totalAmount}`;


                if(response.data.couponValid){
                  minOrderAmountMsg.style.display = "none"
                }

                new Noty({
                  type: "success",
                  text: response.data.message,
                  timeout: 3000,
                  layout: "bottomCenter",
                  theme: "metroui",
                  animation: {
                    open: "animated bounceInRight",
                    close: "animated bounceOutRight",
                  },
                }).show();
              }
            })
            .catch((error) => {
              console.log("error code");
              if (error.response.status == 409) {
                new Noty({
                  type: "warning",
                  text: error.response.data.message,
                  timeout: 3000,
                  layout: "bottomCenter",
                  theme: "metroui",
                  animation: {
                    open: "animated bounceInRight",
                    close: "animated bounceOutRight",
                  },
                }).show();
              }
            });
        }
      }

      if (
        event.target &&
        event.target.classList.contains("removeFromCartBtn")
      ) {
        event.preventDefault();
        const removeFromCartBtn = event.target;

        const cartItemId = removeFromCartBtn.getAttribute("data-cart-item-id");

        axios
          .post("/shop/cart/removeFromCart", {
            itemId: cartItemId,
          })
          .then((response) => {
            if (response.status == 200) {
              if (response.data) {
                const totalAmountDetails = response.data.totalAmountDetails;
                console.log(response.data, "Hey total cart amount.");
                // subTotalValue = findSubtotal(response.data.cartData.items);

                cartCount.innerText = response.data.cartCount;

                let cartItemContainer = document.getElementById(
                  `cartItemContainer${cartItemId}`
                );

                if (cartItemContainer) {
                  cartItemContainer.remove();
                }

                subTotal.innerText = `₹ ${totalAmountDetails.totalPrice}`;

                shippingCharge.innerText = `₹ ${totalAmountDetails.shippingPrice}`;

                couponDiscountAmount.innerText = `₹ ${totalAmountDetails.couponDiscount}`;

                grossTotal.innerText = `₹ ${totalAmountDetails.totalAmount}`;


                if(!response.data.couponValid){
                  minOrderAmountMsg.style.display = "block"
                }

                if(response.data.cartCount == 0){
                  document.getElementById("cartItemsContainer").innerHTML = `<div class="text-center"> <img src="/static/user/images/empty.png" class="mt-5" width="250px" height="250px" alt="empty cart"> </div>`

            proceedToBuy.style.pointerEvents = "none"
            document.getElementById('showCouponBtn').style.display = "none"
            document.getElementById('couponApplyForm').style.display = "none"

                }

                new Noty({
                  type: "success",
                  text: response.data.message,
                  timeout: 3000,
                  layout: "bottomCenter",
                  theme: "metroui",
                  animation: {
                    open: "animated bounceInRight",
                    close: "animated bounceOutRight",
                  },
                }).show();
              }
            }
          })
          .catch((error) => {
            console.log("error code");
          });
      }

      if (event.target && event.target.id == "proceedToBuy") {
        event.preventDefault();
        function showNofification(msg) {
          new Noty({
            type: "warning",
            text: msg,
            timeout: 5000,
            layout: "bottomCenter",
            theme: "metroui",
          }).show();
        }

        cartProductsFunc()
          .then((data) => {
            let cartStatus = true
            data.cartData.items.map((item) => {
              if (item.productId.quantity == 0) {
                showNofification(`${item.productId.product.modelName} of color ${item.productId.varient.colorName} & size ${item.productId.size} is out of stock. Update cart to continue.`)
                cartStatus = false

              } else if (item.productId.quantity != 0 && item.productId.quantity < item.quantity) {
                showNofification(`Insufficient stock for ${item.productId.product.modelName} of color ${item.productId.varient.colorName} & size ${item.productId.size}. Update cart to continue.`)

                cartStatus = false
              }

            })

            if (cartStatus == true) {
              window.location.href = "/shop/checkout"
            }

          })
          .catch((error) => {
            console.log("Failed to fetch data:", error);
          });
      }
    });
  });