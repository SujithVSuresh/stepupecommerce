
document.addEventListener('DOMContentLoaded', (event) => {


    const amountError = document.getElementById('amountError')
    const walletAmountForm = document.getElementById('walletAmountForm')
    const addAmountToWalletBtn = document.getElementById('addAmountToWalletBtn')

    const addMoneyBtn = document.getElementById('addMoneyBtn')

    const tableDataContainer = document.getElementById('tableDataContainer')


    function walletPaymentSuccess(amount) {

      axios.post('/profile/wallet/addMoney', { amount })
        .then((response) => {
          if (response.status == 200) {
            let transaction = response.data.transaction
            
            document.querySelector("#addMoneyModal .close").click();
            tableDataContainer.insertAdjacentHTML(
              "afterbegin",
              `
              <div class="product-cart d-flex" style="height: 40px;">

                <div class="one-eight text-center">
                  <span>₹ ${transaction.amount}</span>
                </div>

                <div class="one-eight text-center">
                </div>

                <div class="one-eight text-center">
                  <span>
                    ${ transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) }
                  </span>
                </div>

                <div class="one-eight text-center">
                </div>

                <div class="one-eight text-center">
                  <span>
                 ${ transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : '' }
                  </span>
                </div>


                <div class="one-forth text-center px-4">
                  <span>
                    ${ transaction.description }
                  </span>
                </div>
              </div>
`
            );


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
          console.log("it is an error123", error)
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

    addMoneyBtn.addEventListener('click', (event) => {
      walletAmountForm.reset()
      amountError.innerText = ""
      
    })

    addAmountToWalletBtn.addEventListener('click', (event) => {
      event.preventDefault()

      const amount = document.getElementById('addToWalletAmount').value

      let isValid = true

      if (!amount.trim()) {
        amountError.textContent = "This field is required";
        isValid = false;
      } else if (!/^(?!0\d)\d+(\.\d+)?$/.test(amount)) {
        amountError.textContent = "Enter a valid amount";
        isValid = false;
      } else {
        amountError.textContent = "";
      }

      if (isValid) {

        axios.post('/profile/wallet/createOrder', { amount: amount })
          .then((response) => {
            if (response.status == 200) {
              const data = response.data
              var options = {
                "key": "rzp_test_3v8uE4x50656nf",
                "amount": data.razOrder.amount,
                "currency": "INR",
                "name": "STEPUP",
                "order_id": data.razOrder.id,
                "handler": function (response) {
                  // Payment success handler
                  walletPaymentSuccess(data.razOrder.amount)
                },
                "theme": {
                  "color": "#66BCEE"
                },
                "modal": {
                  "ondismiss": function () {
                    // Payment dismiss handler
                    console.log("payment dismissed.")
                  }
                }
              };
              var razorpayObject = new Razorpay(options);
              razorpayObject.on('payment.failed', function (response) {
                // Payment failure handler
                new Noty({
                type: 'error',
                text: "Payment failed",
                timeout: 3000,
                layout: 'bottomCenter',
                theme: 'metroui',
              }).show();
              });


              razorpayObject.open();


            }
          })
          .catch((error) => {
            if (error.response.status == 409) {
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





  })

