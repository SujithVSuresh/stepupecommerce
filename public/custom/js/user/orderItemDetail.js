document.addEventListener("DOMContentLoaded", (event) => {
  document.addEventListener("click", (event) => {
    const orderStatusContainer = document.getElementById(
      "orderStatusContainer"
    );

    if (event.target && event.target.id == "cancelBtn") {
      event.preventDefault();

      const orderId = event.target.getAttribute("order-id");
      const itemId = event.target.getAttribute("order-item-id");

      let n = new Noty({
        text: "Are you sure you want to cancel the order of this item?",
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
            axios
              .post(`/shop/cancelOrder`, {
                orderId: orderId,
                orderItemId: itemId,
              })
              .then((response) => {
                if (response.status == 200) {
                  event.target.style.display = "none";
                  document.getElementById("cancelQuestion").style.display =
                    "none";

                  document.getElementById("orderTimeline").style.display =
                    "none";

                  console.log("ggg", document.getElementById("cancelQuestion"));
                  orderStatusContainer.innerHTML = "";

                  orderStatusContainer.innerHTML = `
             <span class="price" style="color: red;">Cancelled</span><br>
              <span class="price">Your order for this item has been cancelled</span>
            
            `;
                  n.close();
                }
              })
              .catch((error) => {
                console.log("it is an error", error);
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

    function dateFormatter(dateStr) {
      const date = new Date(dateStr);

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Extract the month and day
      const month = months[date.getUTCMonth()];
      const day = date.getUTCDate();

      return `${month} ${day}`
    }

    if (event.target.id == "returnRequestFormButton") {
      console.log(event.target);

      const reasonForReturnText = document.getElementById(
        "reasonForReturnText"
      ).value;

      console.log("event.target", reasonForReturnText);

      const orderId = event.target.getAttribute("order-id");
      const orderItemId = event.target.getAttribute("order-item-id");

      axios
        .post("/shop/requestForReturn", {
          orderId: orderId,
          orderItemId: orderItemId,
          reason: reasonForReturnText,
        })
        .then((response) => {
          if (response.status == 200) {
            document.getElementById("orderTimeline").style.display = "none";
            document.querySelector("#orderReturnReasonModal .close").click();
            orderStatusContainer.innerHTML = "";

            orderStatusContainer.innerHTML = `

                 <span class="price" style="color: rgb(255, 187, 0)">Return requested </span><br />
                <span class="price">Your item return request is in process</span>

                   `;

            document.getElementById("returnCancelBtnContainer").style.display =
              "none";
          }
        })
        .catch((error) => {
          console.log("it is an error", error);
        });
    }

    if (event.target && event.target.id == "trackOrder") {
      const orderId = event.target.getAttribute("order-id");
      const orderItemId = event.target.getAttribute("item-id");

      function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

      axios
        .get(
          `/profile/order/itemDetail/trackOrder?oid=${orderId}&itid=${orderItemId}`
        )
        .then((response) => {
          if (response.status == 200) {
            const orderItem = response.data.orderItem;
            const order = response.data.order;

            console.log(orderItem, "oorr");
            let orderTimeline = document.getElementById("orderTimeline");
            orderTimeline.style.display = "block";

            if (
              orderItem.orderStatus == "Ordered" &&
              !orderItem.shippedDate &&
              !orderItem.cancelledDate
            ) {
              orderTimeline.innerHTML = `
                  <div id="timeline" class="product-cart" style="background-color: white; padding: 20px;">

                      <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
                        <span
                          class="d-flex justify-content-center align-items-center big-dot dot">
                          <i class="fa fa-check text-white"></i></span>
                        <hr class="flex-fill track-line" style="background-color: #4f2f2d"><span class="dot"></span>
                      </div>

                      <div class="d-flex flex-row justify-content-between align-items-center">
                        <div class="d-flex flex-column align-items-start"><span>${dateFormatter(orderItem.orderedDate)}</span><span>Order placed</span>
                        </div>
       
    
                        <div class="d-flex flex-column align-items-end"><span>${dateFormatter(addDays(orderItem.orderedDate, 4))}</span>Delivery expected</span></div>
                      </div>

                </div>
         `;
            } else if (
              orderItem.orderStatus == "Cancelled" &&
              orderItem.orderedDate &&
              !orderItem.shippedDate
            ) {
              orderTimeline.innerHTML = `
          <div id="timeline" class="product-cart" style="background-color: white; padding: 20px;">

              <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
              <span class="dot"></span>  
              
                <hr class="flex-fill track-line" style="background-color: red">

                <span
                  class="d-flex justify-content-center align-items-center big-dot dot" style="background-color: red">
                  <i class="fa fa-check text-white"></i></span>
                
              </div>

              <div class="d-flex flex-row justify-content-between align-items-center">
                <div class="d-flex flex-column align-items-start"><span>${dateFormatter(orderItem.orderedDate)}</span><span>Order placed</span>
                </div>

                <div class="d-flex flex-column align-items-end"><span>${dateFormatter(orderItem.cancelledDate)}</span><span>Order cancelled</span></div>
              </div>

        </div>
 `;
            } else if (
              orderItem.orderStatus == "Shipped" &&
              !orderItem.deliveredDate &&
              !orderItem.cancelledDate
            ) {
              orderTimeline.innerHTML = `
          <div id="timeline" class="product-cart" style="background-color: white; padding: 20px;">

              <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
              <span class="dot"></span>
              <hr class="flex-fill track-line">

              <span
                  class="d-flex justify-content-center align-items-center big-dot dot">
                  <i class="fa fa-check text-white"></i></span>
                <hr class="flex-fill track-line" style="background-color: #4f2f2d">
                <span class="dot"></span>
              </div>

              <div class="d-flex flex-row justify-content-between align-items-center">
                <div class="d-flex flex-column align-items-start"><span>${dateFormatter(orderItem.orderedDate)}</span><span>Order placed</span>
                </div>

                <div class="d-flex flex-column justify-content-center align-items-center"><span>${dateFormatter(orderItem.shippedDate)}</span><span>Order Shipped</span></div>
                       

                <div class="d-flex flex-column align-items-end"><span>${dateFormatter(addDays(orderItem.orderedDate, 4))}</span><span>Delivery expected</span></div>
              </div>

        </div>
 `;
            } else if (
              orderItem.orderStatus == "Cancelled" &&
              !orderItem.deliveredDate &&
              orderItem.shippedDate
            ) {
              orderTimeline.innerHTML = `
          <div id="timeline" class="product-cart" style="background-color: white; padding: 20px;">

              <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
              <span class="dot"></span>
              <hr class="flex-fill track-line">

              <span
                  class="d-flex justify-content-center align-items-center big-dot dot">
                  <i class="fa fa-check text-white"></i></span>
                <hr class="flex-fill track-line" style="background-color: red">
                <span class="dot" style="background-color: red"></span>
              </div>

              <div class="d-flex flex-row justify-content-between align-items-center">
                <div class="d-flex flex-column align-items-start"><span>${dateFormatter(orderItem.orderedDate)}</span><span>Order placed</span>
                </div>

                <div class="d-flex flex-column justify-content-center align-items-center"><span>${dateFormatter(orderItem.shippedDate)}</span><span>Order Shipped</span></div>
                       

                <div class="d-flex flex-column align-items-end"><span>${dateFormatter(orderItem.cancelledDate)}</span><span>Order cancelled</span></div>
              </div>

        </div>
 `;
            } else if (
              (orderItem.orderStatus == "Delivered" || orderItem.orderStatus == "REQUESTED_FOR_RETURN" || orderItem.orderStatus == "RETURN_APPROVED") &&
              !orderItem.returnedDate
            ) {
              orderTimeline.innerHTML = `
          <div id="timeline" class="product-cart" style="background-color: white; padding: 20px;">

              <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
              <span class="dot"></span>
              <hr class="flex-fill track-line">
                <span class="dot"></span>

                <hr class="flex-fill track-line">
                 <span
                  class="d-flex justify-content-center align-items-center big-dot dot">
                  <i class="fa fa-check text-white"></i></span>
              </div>

              <div class="d-flex flex-row justify-content-between align-items-center">
                <div class="d-flex flex-column align-items-start"><span>${dateFormatter(orderItem.orderedDate)}</span><span>Order placed</span>
                </div>

                <div class="d-flex flex-column justify-content-center align-items-center"><span>${dateFormatter(orderItem.shippedDate)}</span><span>Order Shipped</span></div>
                       

                <div class="d-flex flex-column align-items-end"><span>${dateFormatter(orderItem.deliveredDate)}</span><span>Order delivered</span></div>
              </div>

        </div>
 `;
            } else if (orderItem.orderStatus == "Returned") {
              orderTimeline.innerHTML = `
          <div id="timeline" class="product-cart" style="background-color: white; padding: 20px;">

              <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
              <span class="dot"></span>
              <hr class="flex-fill track-line">
                <span class="dot"></span>

                <hr class="flex-fill track-line">
                <span class="dot"></span>
                  <hr class="flex-fill track-line" style="background-color: orange">
                 <span
                  class="d-flex justify-content-center align-items-center big-dot dot" style="background-color: orange">
                  <i class="fa fa-check text-white"></i></span>
              </div>

              <div class="d-flex flex-row justify-content-between align-items-center">
                <div class="d-flex flex-column align-items-start"><span>${dateFormatter(orderItem.orderedDate)}</span><span>Order placed</span>
                </div>

                <div class="d-flex flex-column justify-content-center align-items-center"><span>${dateFormatter(orderItem.shippedDate)}</span><span>Order shipped</span></div>

                <div class="d-flex flex-column justify-content-center align-items-center"><span>${dateFormatter(orderItem.deliveredDate)}</span><span>Order delivered</span></div>  
                       

                <div class="d-flex flex-column align-items-end"><span>${dateFormatter(orderItem.returnedDate)}</span><span>Order returned</span></div>
              </div>

        </div>
 `;
            }
          }
        })
        .catch((error) => {
          console.log("it is an error", error);
        });
    }
  });
});
