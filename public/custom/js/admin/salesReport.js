document.addEventListener("DOMContentLoaded", (event) => {
  let fromStrDate;
  let toStrDate;

  const tableContainer = document.getElementById("table-container");
  const dateFilter = document.getElementById("dateFilter");
  const filterBtn = document.getElementById("filterBtn");

  const totalOrders = document.getElementById("totalOrders");
  const totalSales = document.getElementById("totalSales");
  // const totalRevenue = document.getElementById('totalRevenue')

  fetchSalesData();

  document
    .getElementById("downloadExcel")
    .addEventListener("click", function () {
      // Select the table
      var table = document.getElementById("orderTable");

      // Convert table to worksheet
      var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });

      // Create an Excel file
      var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

      // Function to convert string to ArrayBuffer
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      }

      // Save the file
      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        "order_details.xlsx"
      );
    });

  document.getElementById("downloadPDF").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let content = "Total revenue: ";

    doc.text("SALES REPORT", 85, 15);

    // Add content to PDF
    doc.text(`Total orders: ${totalOrders.innerText}`, 15, 30); // Positioning "Total revenue"
    doc.text(`Total sales: ${totalSales.innerText}`, 15, 40);

    let todayDate = new Date();
    doc.text(String(todayDate.toISOString().slice(0, 10)), 160, 15); // Positioning "Total sales" on the same row

    doc.autoTable({ html: "#orderTable", startY: 50 });

    doc.save("order_details.pdf");
  });

  function fetchSalesData(filterType = "", fromStrDate = "", toStrDate = "") {
    axios
      .get(
        `/admin/salesReport/data?filter=${filterType}&gte=${fromStrDate}&lte=${toStrDate}`
      )
      .then((response) => {
        if (response.status == 200) {
          const data = response.data;
          tableContainer.innerHTML = "";

          totalOrders.innerText = data.totalOrders[0].count;
          totalSales.innerText = data.totalSales[0].count;

          data.orders.forEach((order) => {
            console.log("ll");
            order.items.forEach((item) => {
              tableContainer.innerHTML += `
                  <tr>
                    <td>
                      ${order.orderId}
                    </td>
                    <td>
                      ${item.orderedDate.substring(0, 10)}
                    </td>
                    <td>
                      ${item.deliveredDate.substring(0, 10)}
                    </td>
                    <td>
                      ${item.deliveredDate.substring(0, 10)}
                    </td>
                    <td>
                      ${
                        order.paymentMethod == "ONLINE_PAYMENT"
                          ? "ONLINE"
                          : order.paymentMethod
                      }
                    </td>
                    <td>
                      ${item.modelName}(${item.color}, ${item.size})
                    </td>
                    <td>
                      ${item.price}
                    </td>
                    <td>
                      ${item.quantity}
                    </td>

                    <td>
                      ${item.price * item.quantity}
                    </td>
                  </tr>
                `;
            });
          });
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
      });
  }

  flatpickr("#datepicker", {
    mode: "range",
    minDate: "2024-01-01",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr, instance) {
      console.log(dateStr, instance, "lop");
      dateFilter.value = "";

      if (selectedDates.length === 2) {
        const fromDate = selectedDates[0];
        const toDate = selectedDates[1];
        fromStrDate = instance.formatDate(fromDate, "Y-m-d"); // Format fromDate as a string
        toStrDate = instance.formatDate(toDate, "Y-m-d"); // Format toDate as a string
      }
    },
    disable: [
      function (date) {
        // disable every multiple of 8
        // return !(date.getDate() % 8);
      },
    ],
  });

  dateFilter.addEventListener("change", (event) => {
    document.getElementById("datepicker").value = "";
  });

  document.addEventListener("click", (event) => {
    if (event.target && event.target.id == "filterBtn") {
      console.log(dateFilter.value);

      if (dateFilter.value) {
        fetchSalesData(dateFilter.value);
      } else {
        console.log(fromStrDate, toStrDate, "llop");
        fetchSalesData("date", fromStrDate, toStrDate);
      }
    }
  });
});
