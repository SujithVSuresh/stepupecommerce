
document.addEventListener('click', (event) => {
    if (event.target.id == "viewMoreOrder") {
      console.log(event.target)
      let orderItemContainer = document.getElementById("orderItemContainer")
      let showOrderId = document.getElementById("showOrderId")

      const clickedBtn = event.target

      const oid = clickedBtn.getAttribute('order-id')

      orderItemContainer.innerHTML = ""

      axios
        .get(`/profile/order/getOrderById?oid=${oid}`)
        .then((response) => {
          if (response.status == 200) {

             console.log(response.data);
             showOrderId.innerText = response.data.order.orderId
             response.data.order.orderedItems.map((item) => {
              orderItemContainer.innerHTML += `
                            <div class="product-cart d-flex" id="cartItemContainer${item._id}">
          <div class="one-forth">
            <div class="product-img" style="background-image: url('/static/images/${item.image}');">
            </div>
            <div class="display-tc">
              <span style="margin-left: 30px; color: black">${item.modelName}</span><br>
              <span style="margin-left: 30px;" class="price">Color: ${item.color}</span><br>
              <span style="margin-left: 30px;" class="price">Size: ${item.size}</span><br>

            </div>
          </div>
          <div class="one-forth text-center">
            <div class="display-tc">
              <span class="price">₹ ${item.price}</span>
            </div>
          </div>
          <div class="one-eight text-center">
            <div class="display-tc">
              <span class="price" style="color: rgb(252, 134, 0);">${item.orderStatus == "REQUESTED_FOR_RETURN" ? "Return requested" : item.orderStatus}</span>

            </div>
          </div>
          <div class="one-eight text-center">
            <div class="display-tc">
              <a address-id="" href="/profile/order/itemDetail?oid=${oid}&itid=${item._id}" class="button editDltBtn" style="border-color: black; padding: 5px; color: black; background-color: white;">View more</a>
            </div>
          </div>
        </div> 
              `
             })

          }
        })
        .catch((error) => {
          console.log("it is an error", error);
        });
    }
  })
