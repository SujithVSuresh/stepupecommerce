document.addEventListener("click", (event) => {
  
    if (event.target && event.target.classList.contains("productRelistBtn")) {

        let relistBtn = event.target

        let productId = relistBtn.getAttribute("data-product-id");

Swal.fire({
  title: "Are you sure?",
  text: `Do you want to relist this product?`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes",
}).then((result) => {
  if (result.isConfirmed) {
    axios
      .post("/admin/manageDeleteProduct", {
        id: productId,
      })
      .then((response) => {

        if (response.status == 200) {
          let productElement = document.getElementById(
            `row${productId}`
          );
          if (productElement) {
            productElement.remove();

            Swal.fire(
              "Deleted!",
              `Product has been deleted.`,
              "success"
            );
          } else {
            console.error("Product not found with ID:", productId);
          }
        }
      })
      .catch((error) => {
        Swal.fire(
          "Error!",
          "There was an error deleting the product.",
          "error"
        );
      });
  }
});

    }
})
      //GET UNLISTED PRODUCTS DATA
  document.addEventListener("DOMContentLoaded", (event) => {
    let tableContainer = document.getElementById("unlisted-product-table-container");

    tableContainer.innerHTML = "";

    axios
      .get("/admin/unlistedProducts/data")
      .then((response) => {

        if (response.status == 200) {
          if (response.data.products.length !== 0) {
            response.data.products.forEach((product) => {
              tableContainer.innerHTML += `
                          <tr id="row${product._id}">
                        <td>${product.modelName}</td>
                        <td>${product.brand.name}</td>
                        <td>${product.category.categoryName}</td>
                        <td>${product.gender == "men" ? "Men" : product.gender == "women" ? "Women" : "Men & Women"}</td>
                        <td>${product.outerMaterial}</td>
                        <td>${product.soleMaterial}</td>

                        <td>${
                          product.isActive
                            ? `<span class="text-success">ACTIVE</span>`
                            : `<span class="text-danger">INACTIVE</span>`
                        }</td>
                       <td><button data-product-id="${product._id}" id="relist${
                product._id
              }" type="button" class="productRelistBtn btn btn-outline-dark btn-sm statusBtn">Relist</button></td>
                      </tr>
                          `;
            });
          }
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
      });
  });