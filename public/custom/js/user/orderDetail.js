document.addEventListener('click', (event) => {

    if (event.target && event.target.id == "downloadInvoice") {
        const totalAmount = document.getElementById('totalAmount').innerText
        const discountAmount = document.getElementById('discountAmount').innerText
        const deliveryCharge = document.getElementById('deliveryCharge').innerText  

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let content = "Total revenue: ";

        doc.text("INVOICE", 90, 15);

        let todayDate = new Date();
        doc.text("STEPUP ECOMMERCE", 15, 30);

        doc.setFontSize(12)
        doc.text(String(`Date: ${todayDate.toISOString().slice(0, 10)}`), 15, 40); 
        doc.text(String(`Order id: ${document.getElementById('showOrderId').innerText}`), 15, 50); 
        doc.text(String(`Ordered date: ${todayDate.toISOString().slice(0, 10)}`), 15, 60); 

        
        doc.text("Delivery address:", 15, 80);
        doc.text(document.getElementById('deliveryNameShow').innerText, 15, 90);
        doc.text(document.getElementById('deliveryAddressShow').innerText, 15, 100); 
        doc.text(`Phone: ${document.getElementById('deliveryPhoneShow').innerText}`, 15, 110); 

        doc.autoTable({ html: "#invoiceTable", startY: 120 });

        // doc.text("Total price: 4352", 150, 200);
        doc.text(`Discount: ${discountAmount}`, 150, 210);
        doc.text(`Delivery charge: ${deliveryCharge}`, 150, 220); 
        doc.text(`Total amount: Rs ${totalAmount}`, 150, 230); 


        doc.save("invoice.pdf");
    
    }
    if (event.target && event.target.id == "payAmountNow") {
      const orderId = event.target.getAttribute('order-id')

      axios
        .post(`/profile/order/payNowOrder`, { orderId: orderId })
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
                window.location.href = `/shop/orderComplete?oid=${data.order._id}`

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
          console.log("it is an error", error);
        });

    }
  })