document.addEventListener('click', (event) => {

    if (event.target && event.target.id == "downloadInvoice") {
        const totalAmount = document.getElementById('totalAmount').innerText

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let content = "Total revenue: ";

        doc.text("INVOICE", 90, 15);

        let todayDate = new Date();
        doc.text("STEPUP ECOMMERCE", 15, 30);

        doc.setFontSize(12)
        doc.text(String(`Date: ${todayDate.toISOString().slice(0, 10)}`), 15, 40); // Positioning "Total sales" on the same row
        doc.text(String(`Order id: ${document.getElementById('showOrderId').innerText}`), 15, 50); // Positioning "Total sales" on the same row
        doc.text(String(`Ordered date: ${todayDate.toISOString().slice(0, 10)}`), 15, 60); // Positioning "Total sales" on the same row

        
        doc.text("Delivery address:", 15, 80);
        doc.text(document.getElementById('deliveryNameShow').innerText, 15, 90);
        doc.text(document.getElementById('deliveryAddressShow').innerText, 15, 100); // Positioning "Total sales" on the same row
        doc.text(`Phone: ${document.getElementById('deliveryPhoneShow').innerText}`, 15, 110); 

        doc.autoTable({ html: "#invoiceTable", startY: 120 });

        // doc.text("Total price: 4352", 150, 200);
        // doc.text("Discount: 10%", 150, 210);
        // doc.text("Delivery charge: 50", 150, 220); // Positioning "Total sales" on the same row
        doc.text(`Total amount: Rs ${totalAmount}`, 150, 200); 


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