function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.parentNode.removeChild(backdrop);
  }
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "block";
  document.body.classList.add("modal-open");
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop fade show";
  document.body.appendChild(backdrop);
}

//FETCH ALL CATEGORIES
function fetchAllCategories(option, data) {
  axios
    .get("/admin/category/list")
    .then((response) => {
      if (response.status === 200) {
        const categories = response.data;

        if (option == "add") {
          const categorySelect = document.getElementById("category");
          categorySelect.innerHTML = "";
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
          categorySelect.innerHTML = "";
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

//FETCH ALL BRANDS
function fetchAllBrands(option, data) {
  axios
    .get("/admin/brands/list")
    .then((response) => {
      if (response.status === 200) {
        const brands = response.data;

        if (option == "add") {
          const brandSelect = document.getElementById("brand");
          brandSelect.innerHTML = ""
          const option = document.createElement("option");
          option.value = "";
          option.textContent = "----------";
          brandSelect.appendChild(option);

          brands.brands.forEach((brand) => {
            const option = document.createElement("option");
            option.value = brand._id;
            option.textContent = brand.name;
            brandSelect.appendChild(option);
          });
        } else if (option == "edit") {
          const brandSelect = document.getElementById("edit-brand");
          brandSelect.innerHTML = ""
          brands.brands.forEach((brand) => {
            const option = document.createElement("option");
            option.value = brand._id;
            option.textContent = brand.name;
            if (brand.name == data) {
              option.selected = true;
            }
            brandSelect.appendChild(option);
          });
        }
      }
    })
    .catch((error) => {
      console.log("it is an error", error);
    });
}

//--------------------------------------CLICK EVENT START-------------------------------------------

document.addEventListener("click", (event) => {
  // DELETE SIZE VARIENT
  if (event.target && event.target.classList.contains("sizeDltBtn")) {
    let dltSizeVarientBtn = event.target;

    let sizeVarientId = dltSizeVarientBtn.getAttribute("data-subvarient-id");

    let colorNameTag = document.getElementById("colorNameTag");
    let productId = colorNameTag.getAttribute('productid')
    let varientId = colorNameTag.getAttribute('varientid')

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("/admin/deleteProduct/sizeVarient", {
            id: sizeVarientId,
            productId: productId,
            varientId: varientId
          })
          .then((response) => {
            if (response.status == 200) {
              console.log(response.data);
              let sizeElement = document.getElementById(`tr${sizeVarientId}`);
              if (sizeElement) {
                sizeElement.remove();
                Swal.fire("Deleted!", `Size has been deleted.`, "success");
              } else {
                console.error(
                  "Size not found with ID:",
                  response.data.sizeVarient._id
                );
              }
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              "There was an error deleting the size.",
              "error"
            );
          });
      }
    });
  }

  //ADD PRODUCT BUTTON CLICK
  if (event.target && event.target.id == "add-product-btn") {
    fetchAllCategories("add");
    fetchAllBrands("add");
  }

  //FUNCTION TO FETCH SIZE VARIENT OF SPECIFIC COLOR
  let sizeVariantTable = document.getElementById("sizeVariantTable");

  function getSizeVarientOfColor(varientId) {
    let colorNameTag = document.getElementById("colorNameTag");
    let productId = colorNameTag.getAttribute('productid')
    sizeVariantTable.innerHTML = "";
    axios
      .get(`/admin/product/getSizeVarient?varientid=${varientId}&productid=${productId}`)
      .then((response) => {
        if (response.status === 200) {
          response.data.sizeVarients.forEach((size) => {
            sizeVariantTable.innerHTML += `
            <tr id="tr${size._id}">
                    <td>${size.size}</td>
                    <td>${size.quantity}</td>
                    <td>${size.price}</td>
                    <td>
                      <button
                        data-subvarient-id="${size._id}"
                        data-subvarient-size="${size.size}"
                        data-subvarient-qty="${size.quantity}"
                        data-subvarient-price="${size.price}"
                        id="subVarientEdit${size._id}"
                        type="button"
                        class="subVarientEditBtn btn btn-outline-dark btn-sm statusBtn"
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        data-subvarient-id="${size._id}"
                        id=""
                        type="button"
                        class="sizeDltBtn btn btn-outline-danger btn-sm statusBtn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
            `;
          });
        } else {
          console.log("Unexpected response status", response.status);
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
      });
  }

  let subVarientAddformContainer = document.getElementById(
    "subVarientAddformContainer"
  );
  let subVarientEditformContainer = document.getElementById(
    "subVarientEditformContainer"
  );

  // SUB VARIENT ADD CLICK
  if (event.target && event.target.id == "sub-varient-add-btn") {
    let subVarientAddBtn = event.target;

    subVarientAddformContainer.style.display = "block";
    subVarientEditformContainer.style.display = "none";
  }

  // SUB VARIENT EDIT CLICK
  if (event.target && event.target.classList.contains("subVarientEditBtn")) {
    console.log("button clicked Edit");
    let subVarientEditBtn = event.target;

    subVarientEditformContainer.style.display = "block";
    subVarientAddformContainer.style.display = "none";

    let sizeField = document.getElementById("edit-size");
    let qtyField = document.getElementById("edit-quantity");
    let priceField = document.getElementById("edit-price");

    sizeField.value = subVarientEditBtn.getAttribute("data-subvarient-size");
    priceField.value = subVarientEditBtn.getAttribute("data-subvarient-price");
    qtyField.value = subVarientEditBtn.getAttribute("data-subvarient-qty");

    let subVarientId = subVarientEditBtn.getAttribute("data-subvarient-id");

    // EDIT SUBVARIENT EVENT HANDLER - (SIZE)
    let subVarientEditForm = document.getElementById("sub-varient-edit-form");

    subVarientEditForm.onsubmit = (e) => {
      e.preventDefault();

      const priceEdit = document.getElementById("edit-price").value;
      const quantityEdit = document.getElementById("edit-quantity").value;
      const sizeEdit = document.getElementById("edit-size").value;

      const priceEditError = document.getElementById("priceEditError");
      const quantityEditError = document.getElementById("quantityEditError");
      const sizeEditError = document.getElementById("sizeEditError");
      
      let colorNameTag = document.getElementById("colorNameTag");
      let productId = colorNameTag.getAttribute("productId");
      let varientId = colorNameTag.getAttribute("varientid");

      let isValid = true;

      //Size validation
      if (!sizeEdit.trim()) {
        sizeEditError.textContent = "Size is required";
        isValid = false;
      } else if (sizeEdit && (sizeEdit < 1 || sizeEdit > 17)) {
        sizeEditError.textContent = "Enter a valid size";
        isValid = false;
      } else if (!/^\d+$/.test(sizeEdit)) {
        sizeEditError.textContent = "Enter a valid size";
        isValid = false;
      } else if (/\s/.test(sizeEdit) && /^\s|\s$/.test(sizeEdit)) {
        sizeEditError.textContent = "Enter a valid size";
        isValid = false;
      } else {
        sizeEditError.textContent = "";
      }

      //Quantity validation
      if (!quantityEdit.trim()) {
        quantityEditError.textContent = "Quantity is required";
        isValid = false;
      } else if (quantityEdit && quantityEdit < 0) {
        quantityEditError.textContent = "Enter a valid quantity";
        isValid = false;
      } else if (!/^\d+$/.test(quantityEdit)) {
        quantityEditError.textContent = "Enter a valid quantity";
        isValid = false;
      } else if (/\s/.test(quantityEdit) && /^\s|\s$/.test(quantityEdit)) {
        quantityEditError.textContent = "Enter a valid quantity";
        isValid = false;
      } else {
        quantityEditError.textContent = "";
      }

      //Price validation
      if (!priceEdit.trim()) {
        priceEditError.textContent = "Price is required";
        isValid = false;
      } else if (priceEdit && priceEdit < 1) {
        priceEditError.textContent = "Enter a valid price";
        isValid = false;
      } else if (!/^\d+$/.test(priceEdit)) {
        priceEditError.textContent = "Enter a valid price";
        isValid = false;
      } else if (/\s/.test(priceEdit) && /^\s|\s$/.test(priceEdit)) {
        priceEditError.textContent = "Enter a valid price";
        isValid = false;
      } else {
        priceEditError.textContent = "";
      }

      if (isValid) {
        const data = {
          price: priceEdit,
          quantity: quantityEdit,
          size: sizeEdit,
          id: subVarientId,
          varientId: varientId,
          productId: productId
        };

        axios
          .post("/admin/editProduct/sizeVarient", data)
          .then((response) => {
            if (response.status == 200) {
              subVarientEditformContainer.style.display = "none";

              // let sizeVariantTable =
              //   document.getElementById("sizeVariantTable");

              // let oldTr = document.getElementById(`tr${subVarientId}`);

              let data = response.data.subVarient;

              // const newTr = document.createElement("tr");

              // Set the id attribute using the responseData
              // newTr.id = `tr${responseData._id}`;
              let tableRow = document.getElementById(`tr${data._id}`);

              // window.location.href = "/admin/products";

              tableRow.innerHTML = `
                                            <td>${data.size}</td>
                    <td>${data.quantity}</td>
                    <td>${data.price}</td>
                    <td>


                                       <button
                        data-subvarient-id="${data._id}"
                        data-subvarient-size="${data.size}"
                        data-subvarient-qty="${data.quantity}"
                        data-subvarient-price="${data.price}"
                        id="subVarientEdit${data._id}"
                        type="button"
                        class="subVarientEditBtn btn btn-outline-dark btn-sm statusBtn"
                      >
                        Edit
                      </button>



                      <td>

                      <button
                        data-subvarient-id="${data._id}"
                        id=""
                        type="button"
                        class="sizeDltBtn btn btn-outline-danger btn-sm statusBtn"
                      >
                        Delete
                      </button>
                 
                    </td>
                    </td>

                      `;
            }
          })
          .catch((error) => {
            if (error.response.status == 409) {
              new Noty({
                type: "error",
                text: error.response.data.message,
                timeout: 3000,
                layout: "bottomCenter",
                theme: "metroui",
              }).show();
            }
          });
      }
    };
  }


  //PRODUCT EDIT BUTTON CLICK
  if (event.target && event.target.classList.contains("productEditBtn")) {
    let editBtn = event.target;

    let productId = editBtn.getAttribute("data-product-id");

    axios
      .get(`/admin/product/singleProductData?pid=${productId}`)
      .then((response) => {
        if (response.status === 200) {
          let productEditModel = document.getElementById("edit-model");
          let productEditBrand = document.getElementById("edit-brand");
          let productEditGender = document.getElementById("edit-gender");
          let productEditCategory = document.getElementById("edit-category");
          let productEditOuterMaterial = document.getElementById(
            "edit-outer-material"
          );
          let productEditSoleMaterial =
            document.getElementById("edit-sole-material");
          let productEditDescription =
            document.getElementById("edit-description");

          productEditModel.value = response.data.productData.modelName;
          productEditBrand.value = response.data.productData.brand;
          productEditGender.value = response.data.productData.gender;
          productEditCategory.value = response.data.productData.category;
          productEditOuterMaterial.value =
            response.data.productData.outerMaterial;
          productEditSoleMaterial.value =
            response.data.productData.soleMaterial;
          productEditDescription.value = response.data.productData.description;

          return response.data;
        } else {
          console.log("Unexpected response status", response.status);
        }
      })
      .then((data) => {
        fetchAllCategories("edit", data.productData.category.categoryName);
        fetchAllBrands("edit", data.productData.brand.name);
      })
      .catch((error) => {
        console.log("it is an error", error);
      });

         //----EDIT PRODUCT EVENT HANDLER
         const productEditForm = document.getElementById("product-edit-form");

         productEditForm.addEventListener("submit", (event) => {
         // productEditForm.onsubmit = function(event) {
           event.preventDefault();
     
           let model = document.getElementById("edit-model").value;
           let brand = document.getElementById("edit-brand").value;
           let gender = document.getElementById("edit-gender").value;
           let category = document.getElementById("edit-category").value;
           let outerMaterial = document.getElementById("edit-outer-material").value;
           let soleMaterial = document.getElementById("edit-sole-material").value;
           let description = document.getElementById("edit-description").value;
     
           let modelNameEditError = document.getElementById("modelNameEditError");
           let brandEditError = document.getElementById("brandEditError");
           let genderEditError = document.getElementById("genderEditError");
           let categoryEditError = document.getElementById("categoryEditError");
           let outerMaterialEditError = document.getElementById(
             "outerMaterialEditError"
           );
           let soleMaterialEditError = document.getElementById(
             "soleMaterialEditError"
           );
     
           let isValid = true;
     
           if (!model.trim()) {
             modelNameEditError.textContent = "Model name is required";
             isValid = false;
           } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(model)) {
             modelNameEditError.textContent = "Enter a valid model name";
             isValid = false;
           } else {
             modelNameEditError.textContent = "";
           }
     
           if (!brand.trim()) {
             brandEditError.textContent = "Select a brand";
             isValid = false;
           } else {
             brandEditError.textContent = "";
           }
     
           if (!gender.trim()) {
             genderEditError.textContent = "Select a user type";
             isValid = false;
           } else {
             genderEditError.textContent = "";
           }
     
           if (!category.trim()) {
             categoryEditError.textContent = "Select a category";
             isValid = false;
           } else {
             categoryEditError.textContent = "";
           }
     
           if (!outerMaterial.trim()) {
             outerMaterialEditError.textContent = "Outer material is required";
             isValid = false;
           } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(outerMaterial)) {
             outerMaterialEditError.textContent =
               "Enter a valid outer material name";
             isValid = false;
           } else {
             outerMaterialEditError.textContent = "";
           }
     
           if (!soleMaterial.trim()) {
             soleMaterialEditError.textContent = "Sole material is required";
             isValid = false;
           } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(soleMaterial)) {
             soleMaterialEditError.textContent = "Enter a valid sole material name";
             isValid = false;
           } else {
             soleMaterialEditError.textContent = "";
           }
     
           if (isValid) {
             let formData = {
               model: model,
               brand: brand,
               gender: gender,
               category: category,
               outerMaterial: outerMaterial,
               soleMaterial: soleMaterial,
               description: description,
               id: productId,
             };
     
             axios
               .post("/admin/editProduct", formData)
               .then((response) => {
                 if (response.status == 200) {
                   window.location.href = "/admin/products";
     
                  //  let product = response.data.product;
     
                  //  let tableRow = document.getElementById(`row${product._id}`);
     
                  //  tableRow.innerHTML = `
                  //           <td>${product.modelName}</td>
                  //            <td>${product.brand.name}</td>
                  //            <td>${product.category.categoryName}</td>
                  //            <td>${
                  //              product.gender == "men"
                  //                ? "Men"
                  //                : product.gender == "women"
                  //                ? "Women"
                  //                : "Men & Women"
                  //            }</td>
                  //            <td>${product.outerMaterial}</td>
                  //            <td>${product.soleMaterial}</td>
                  //            <td><button data-product-id="${
                  //              product._id
                  //            }" id="varient${
                  //    product._id
                  //  }" data-toggle="modal" data-target="#varientModal" type="button" class="productVarientBtn varientBtnClr btn btn-gradient-info btn-rounded btn-sm statusBtn">Varient</button></td>
                  //            <td><button data-product-id="${product._id}" id="edit${
                  //    product._id
                  //  }" data-toggle="modal" data-target="#productEditModal" type="button" class="productEditBtn btn-sm btn btn-outline-dark statusBtn">Edit</button></td>
                  //           <td><button data-product-id="${product._id}" id="delete${
                  //    product._id
                  //  }" type="button" class="productUnlistBtn btn btn-outline-danger btn-sm statusBtn">Unlist</button></td>
                  //  `;
     
                   document.querySelector("#productEditModal .close").click();
                 }
               })
               .catch((error) => {
                 console.log("it is an error", error);
               });
           }
         });
  }

   

  //PRODUCT DELETE BUTTON CLICK
  if (event.target && event.target.classList.contains("productUnlistBtn")) {
    let editBtn = event.target;
    let productId = editBtn.getAttribute("data-product-id");

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this product?`,
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
              let productElement = document.getElementById(`row${productId}`);
              if (productElement) {
                productElement.remove();

                Swal.fire("Deleted!", `Product has been deleted.`, "success");
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

  //PRODUCT VARIENT BUTTON CLICK
  if (event.target && event.target.classList.contains("productVarientBtn")) {
    let varientBtn = event.target;
    let productId = varientBtn.getAttribute("data-product-id");
    let colorNameTag = document.getElementById("colorNameTag");

    let imageGroup = document.getElementById("imageGroup");

    const colorSelection = document.getElementById("colorSelection");

    colorNameTag.setAttribute("productid", productId);

    colorSelection.innerHTML = "";

    imageGroup.innerHTML = "";

    axios
      .get(`/admin/product/getColorVarient?pid=${productId}`)
      .then((response) => {
        if (response.status === 200) {
          if (response.data.colorVarients.length != 0) {
            // colorNameTag.innerText = response.data.colorVarients[0].colorName;

            response.data.colorVarients.forEach((varient) => {
              colorSelection.innerHTML += `
<div class="color-box" data-color-name=${varient.colorName} data-color-code=${varient.colorCode} data-color-images=${varient.images} id="${varient._id}" style="background-color: ${varient.colorCode}"></div>
`;
            });

            response.data.colorVarients[0].images.forEach((image) => {
              imageGroup.innerHTML += `
<img class="image-box" src="/static/images/${image}" alt="A description of the image">
`;
            });

            getSizeVarientOfColor(response.data.colorVarients[0]._id);

            colorNameTag.setAttribute(
              "varientid",
              response.data.colorVarients[0]._id
            );
          } else {
            colorSelection.innerHTML = "No color added";
            imageGroup.innerHTML = " No image added";
            sizeVariantTable.innerHTML = "No data added";
          }

          subVarientAddformContainer.style.display = "none";
          subVarientEditformContainer.style.display = "none";
        } else {
          console.log("Unexpected response status", response.status);
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
      });
  }

  //COLOR BOX CLICK
  if (event.target && event.target.classList.contains("color-box")) {
    let varientBtn = event.target;
    let colorName = varientBtn.getAttribute("data-color-name");
    let colorImages = varientBtn.getAttribute("data-color-images");
    let colorVarientId = varientBtn.getAttribute("id");
    // colorNameTag.innerText = colorName;

    colorNameTag.setAttribute("varientid", colorVarientId);

    imageGroup.innerHTML = "";

    colorImages.split(",").forEach((image) => {
      imageGroup.innerHTML += `
          <img class="image-box" src="/static/images/${image}" alt="A description of the image">
          `;
    });

    subVarientAddformContainer.style.display = "none";
    subVarientEditformContainer.style.display = "none";

    getSizeVarientOfColor(colorVarientId);
  }

  // Varient edit click (color varient)
  if (event.target && event.target.classList.contains("varientEditBtn")) {
    let colorNameTag = document.getElementById("colorNameTag");

    let varientId = colorNameTag.getAttribute("varientid");
    // let productId = colorNameTag.getAttribute('productid')

    let selectedColor = document.getElementById(varientId);

    let colorEditName = document.getElementById("colorEditName");
    let colorEditCode = document.getElementById("colorEditCode");

    let imageEditPreviewOne = document.getElementById("imageEditPreviewOne");
    let imageEditPreviewTwo = document.getElementById("imageEditPreviewTwo");
    let imageEditPreviewThree = document.getElementById(
      "imageEditPreviewThree"
    );
    let imageEditPreviewFour = document.getElementById("imageEditPreviewFour");

    let colorImages = selectedColor.getAttribute("data-color-images");
    let colorName = selectedColor.getAttribute("data-color-name");
    let colorCode = selectedColor.getAttribute("data-color-code");

    colorEditName.value = colorName;
    colorEditCode.value = colorCode;

    colorImages.split(",").forEach((image, index) => {
      let imgElement = document.createElement("img");
      imgElement.src = `/static/images/${image}`;
      imgElement.alt = "Category Image";
      // imgElement.id = `cropperImageTwo`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");
      imgElement.setAttribute('indexvalue', index)

      //let imagePreviewContainer = document.getElementById("imagePreviewTwo");
      if (index == 0) {
        imageEditPreviewOne.innerHTML = "";
        imageEditPreviewOne.appendChild(imgElement);
      } else if (index == 1) {
        imageEditPreviewTwo.innerHTML = "";
        imageEditPreviewTwo.appendChild(imgElement);
      } else if (index == 2) {
        imageEditPreviewThree.innerHTML = "";
        imageEditPreviewThree.appendChild(imgElement);
      } else if (index == 3) {
        imageEditPreviewFour.innerHTML = "";
        imageEditPreviewFour.appendChild(imgElement);
      }
    });
  }

  //COLOR VARIENT DELETE
  if (event.target && event.target.classList.contains("varientDltBtn")) {
    event.preventDefault();

    let varientBtn = event.target;

    let colorNameTag = document.getElementById("colorNameTag");
    let varientId = colorNameTag.getAttribute("varientid");
    let productId = colorNameTag.getAttribute("productId");

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this color varient?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("/admin/delete/colorVarient", { varientId: varientId, productId: productId })
          .then((response) => {
            if (response.status === 200) {
              // window.location.href = "/admin/products";
              document.querySelector("#varientModal .close").click();

              Swal.fire(
                "Deleted!",
                `Color varieent has been deleted.`,
                "success"
              );
            }
          })
          .catch((error) => {
            console.log("it is an error", error);
          });
      }
    });
  }
});

//--------------------------------------CLICK EVENT END------------------------------------------

// ADD SUBVARIENT EVENT HANDLER - (SIZE)
let subVarientForm = document.getElementById("sub-varient-add-form");

subVarientForm.onsubmit = (e) => {
  e.preventDefault();

  let colorNameTag = document.getElementById("colorNameTag");

  let productId = colorNameTag.getAttribute("productid");
  let varientId = colorNameTag.getAttribute("varientid");

  const price = document.getElementById("price").value;
  const quantity = document.getElementById("quantity").value;
  const size = document.getElementById("size").value;

  const priceError = document.getElementById("priceError");
  const quantityError = document.getElementById("quantityError");
  const sizeError = document.getElementById("sizeError");

  let isValid = true;

  //Price validation
  if (!price.trim()) {
    priceError.textContent = "Price is required";
    isValid = false;
  } else if (price && price < 1) {
    priceError.textContent = "Enter a valid price";
    isValid = false;
  } else if (!/^\d+$/.test(price)) {
    priceError.textContent = "Enter a valid price";
    isValid = false;
  } else if (/\s/.test(price) && /^\s|\s$/.test(price)) {
    priceError.textContent = "Enter a valid price";
    isValid = false;
  } else {
    priceError.textContent = "";
  }

  //Quantity validation
  if (!quantity.trim()) {
    quantityError.textContent = "Quantity is required";
    isValid = false;
  } else if (quantity && quantity < 0) {
    quantityError.textContent = "Enter a valid quantity";
    isValid = false;
  } else if (!/^\d+$/.test(quantity)) {
    quantityError.textContent = "Enter a valid quantity";
    isValid = false;
  } else if (/\s/.test(quantity) && /^\s|\s$/.test(quantity)) {
    quantityError.textContent = "Enter a valid quantity";
    isValid = false;
  } else {
    quantityError.textContent = "";
  }

  //Size validation
  if (!size.trim()) {
    sizeError.textContent = "Size is required";
    isValid = false;
  } else if (size && (size < 1 || size > 17)) {
    sizeError.textContent = "Enter a valid size";
    isValid = false;
  } else if (!/^\d+$/.test(quantity)) {
    sizeError.textContent = "Enter a valid size";
    isValid = false;
  } else if (/\s/.test(quantity) && /^\s|\s$/.test(quantity)) {
    sizeError.textContent = "Enter a valid size";
    isValid = false;
  } else {
    sizeError.textContent = "";
  }

  if (isValid) {
    const data = {
      price: price,
      quantity: quantity,
      size: size,
      productId: productId,
      varientId: varientId,
    };

    axios
      .post("/admin/addProduct/sizeVarient", data)
      .then((response) => {
        if (response.status === 200) {
          let size = response.data.subVarient;
          // window.location.href = "/admin/products";
          sizeVariantTable.innerHTML += `

        
          <tr id="tr${size._id}">
                    <td>${size.size}</td>
                    <td>${size.quantity}</td>
                    <td>${size.price}</td>
                    <td>


                      <button
                      data-subvarient-id="${size._id}"
                        data-subvarient-size="${size.size}"
                        data-subvarient-qty="${size.quantity}"
                        data-subvarient-price="${size.price}"
                        id="subVarientEdit${size._id}"
                        type="button"
                        class="btn btn-outline-dark btn-sm statusBtn"
                      >
                        Edit
                      </button>

                      <td>

                      <button
                        data-user-id="${size._id}"
                        id=""
                        type="button"
                        class="sizeDltBtn btn btn-outline-danger btn-sm statusBtn"
                      >
                        Delete
                      </button>
                 
                    </td>
                    </td>
                  </tr>
          `;
          subVarientForm.reset();
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
        if (error.response.status == 409) {
          new Noty({
            type: "error",
            text: error.response.data.message,
            timeout: 3000,
            layout: "bottomCenter",
            theme: "metroui",
          }).show();
        }
      });
  }
};

// PRODUCT EDIT IMAGE SELECT & CROPPING

let cropperEditOne, cropperEditTwo, cropperEditThree, cropperEditFour;

document.addEventListener("change", (event) => {
  if (
    event.target &&
    (event.target.id == "productEditImageOne" ||
      event.target.id == "productEditImageTwo" ||
      event.target.id == "productEditImageThree" ||
      event.target.id == "productEditImageFour")
  )
    if (event.target.id == "productEditImageOne") {
      imgOneEditSetup(event.target);
    } else if (event.target.id == "productEditImageTwo") {
      imgTwoEditSetup(event.target);
    } else if (event.target.id == "productEditImageThree") {
      imgThreeEditSetup(event.target);
    } else if (event.target.id == "productEditImageFour") {
      imgFourEditSetup(event.target);
    }
});

function imgOneEditSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageEditOne`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imageEditPreviewOne = document.getElementById("imageEditPreviewOne");

      imageEditPreviewOne.innerHTML = "";
      imageEditPreviewOne.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperEditOne) {
          cropperEditOne.destroy();
        }

        cropperEditOne = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function imgTwoEditSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageEditTwo`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imageEditPreviewTwo = document.getElementById("imageEditPreviewTwo");

      imageEditPreviewTwo.innerHTML = "";
      imageEditPreviewTwo.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperEditTwo) {
          cropperEditTwo.destroy();
        }

        cropperEditTwo = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function imgThreeEditSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageEditThree`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imageEditPreviewThree = document.getElementById(
        "imageEditPreviewThree"
      );

      imageEditPreviewThree.innerHTML = "";
      imageEditPreviewThree.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperEditThree) {
          cropperEditThree.destroy();
        }

        cropperEditThree = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function imgFourEditSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageEditFour`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imageEditPreviewFour = document.getElementById(
        "imageEditPreviewFour"
      );

      imageEditPreviewFour.innerHTML = "";
      imageEditPreviewFour.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperEditFour) {
          cropperEditFour.destroy();
        }

        cropperEditFour = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

//EDIT VARIENT EVENT HANDLER - (COLOR)
const productColorVarientEditForm = document.getElementById(
  "product-color-varient-edit-form"
);

productColorVarientEditForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let colorNameTag = document.getElementById("colorNameTag");
  let varientId = colorNameTag.getAttribute("varientid");
  let productId = colorNameTag.getAttribute("productId");

  let colorEditName = document.getElementById("colorEditName").value;
  let colorEditCode = document.getElementById("colorEditCode").value;

  // let colorNameTag = document.getElementById("colorNameTag");

  // let productId = colorNameTag.getAttribute("productid");

  let colorNameEditError = document.getElementById("colorNameEditError");
  let colorCodeEditError = document.getElementById("colorCodeEditError");

  // const colorSelection = document.getElementById("colorSelection");

  let isValid = true;

  //Size validation
  if (!colorEditName.trim()) {
    colorNameEditError.textContent = "Color name is required";
    isValid = false;
  } else if (!/^[A-Za-z]+$/.test(colorEditName)) {
    colorNameEditError.textContent = "Enter a valid color name";
    isValid = false;
  } else {
    colorNameEditError.textContent = "";
  }

  //Size validation
  if (!colorEditCode.trim()) {
    colorCodeEditError.textContent = "Color code is required";
    isValid = false;
  } else if (!/^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(colorEditCode)) {
    colorCodeEditError.textContent = "Enter a valid color code";
    isValid = false;
  } else if (/\s/.test(quantity) && /^\s|\s$/.test(colorEditCode)) {
    colorCodeEditError.textContent = "Enter a valid color code";
    isValid = false;
  } else {
    colorCodeEditError.textContent = "";
  }

  if (isValid) {

    if (
      cropperEditOne ||
      cropperEditTwo ||
      cropperEditThree ||
      cropperEditFour
    ) {
      const formData = new FormData();

      // const getBlobFromCropper = (cropper) => {
      //   return new Promise((resolve) => {
      //     cropper.getCroppedCanvas().toBlob((blob) => {
      //       resolve(blob);
      //     });
      //   });
      // };

      const getBlobFromCropper = (cropper) => {
        return new Promise((resolve) => {
          if (cropper) {
            cropper.getCroppedCanvas().toBlob((blob) => {
              resolve(blob);
            });
          } else {
            resolve(undefined);
          }
        });
      };

      Promise.all([
        getBlobFromCropper(cropperEditOne),
        getBlobFromCropper(cropperEditTwo),
        getBlobFromCropper(cropperEditThree),
        getBlobFromCropper(cropperEditFour),
      ])
        .then((blobs) => {
          formData.append("productImgOne", blobs[0]);
          formData.append("productImgTwo", blobs[1]);
          formData.append("productImgThree", blobs[2]);
          formData.append("productImgFour", blobs[3]);
          formData.append("colorName", colorEditName);
          formData.append("colorCode", colorEditCode);
          formData.append("varientId", varientId);
          formData.append("productId", productId);

          //POST REQUEST - ADD COLOR VARIENT

          axios
            .post("/admin/editProduct/colorVarient", formData)
            .then((response) => {
              if (response.status === 200) {
                window.location.href = "/admin/products"
                // window.location.href = "/admin/products";
                // const varient = response.data.colorVarient;
                // colorSelection.innerHTML += `
                // <div class="color-box" data-color-name=${varient.colorName} data-color-code=${varient.colorCode} data-color-images=${varient.images} id="${varient._id}" style="background-color: ${varient.colorCode}"></div>

                // `;
                // document.querySelector("#addColorVarientModal .close").click();

                // productColorVarientForm.reset();
                // document.getElementById("imagePreviewOne").innerHTML = "";
                // document.getElementById("imagePreviewTwo").innerHTML = "";
                // document.getElementById("imagePreviewThree").innerHTML = "";
                // document.getElementById("imagePreviewFour").innerHTML = "";
              }
            })
            .catch((error) => {
              console.log("it is an error", error);
              new Noty({
                type: "error",
                text: error.response.data.message,
                timeout: 3000,
                layout: "bottomCenter",
                theme: "metroui",
              }).show();
            });
        })
        .catch((error) => {
          console.error("Error creating blobs:", error);
        });
    }
  }
});

//---------------------------------PRODUCT SELECT AND CROPPING-----------------------------------------------
let cropperOne, cropperTwo, cropperThree, cropperFour;

document.addEventListener("change", (event) => {
  if (
    event.target &&
    (event.target.id == "productImageOne" ||
      event.target.id == "productImageTwo" ||
      event.target.id == "productImageThree" ||
      event.target.id == "productImageFour")
  )
    if (event.target.id == "productImageOne") {
      imgOneSetup(event.target);
    } else if (event.target.id == "productImageTwo") {
      imgTwoSetup(event.target);
    } else if (event.target.id == "productImageThree") {
      imgThreeSetup(event.target);
    } else if (event.target.id == "productImageFour") {
      imgFourSetup(event.target);
    }
});

function imgOneSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageOne`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imagePreviewContainer = document.getElementById("imagePreviewOne");

      imagePreviewContainer.innerHTML = "";
      imagePreviewContainer.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperOne) {
          cropperOne.destroy();
        }

        cropperOne = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function imgTwoSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageTwo`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imagePreviewContainer = document.getElementById("imagePreviewTwo");

      imagePreviewContainer.innerHTML = "";
      imagePreviewContainer.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperTwo) {
          cropperTwo.destroy();
        }

        cropperTwo = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function imgThreeSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageThree`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imagePreviewContainer = document.getElementById("imagePreviewThree");

      imagePreviewContainer.innerHTML = "";
      imagePreviewContainer.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperThree) {
          cropperThree.destroy();
        }

        cropperThree = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function imgFourSetup(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.alt = "Category Image";
      imgElement.id = `cropperImageFour`;
      imgElement.style.objectFit = "contain";
      imgElement.classList.add("img-thumbnail");

      let imagePreviewContainer = document.getElementById("imagePreviewFour");

      imagePreviewContainer.innerHTML = "";
      imagePreviewContainer.appendChild(imgElement);

      imgElement.addEventListener("load", function () {
        if (cropperFour) {
          cropperFour.destroy();
        }

        cropperFour = new Cropper(imgElement, {
          aspectRatio: 1 / 1,
          viewMode: 2,
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          rotatable: true,
          minContainerWidth: 100,
          minContainerHeight: 200,
        });
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
}

//ADD VARIENT EVENT HANDLER - (COLOR)
const productColorVarientForm = document.getElementById(
  "product-color-varient-form"
);

productColorVarientForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let colorName = document.getElementById("colorName").value;
  let colorCode = document.getElementById("colorCode").value;

  let colorNameTag = document.getElementById("colorNameTag");

  let productId = colorNameTag.getAttribute("productid");

  let colorNameError = document.getElementById("colorNameError");
  let colorCodeError = document.getElementById("colorCodeError");

  const colorSelection = document.getElementById("colorSelection");

  let isValid = true;

  //Size validation
  if (!colorName.trim()) {
    colorNameError.textContent = "Color name is required";
    isValid = false;
  } else if (!/^[A-Za-z]+$/.test(colorName)) {
    colorNameError.textContent = "Enter a valid color name";
  } else {
    colorNameError.textContent = "";
  }

  //Size validation
  if (!colorCode.trim()) {
    colorCodeError.textContent = "Color code is required";
    isValid = false;
  } else if (!/^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(colorCode)) {
    colorCodeError.textContent = "Enter a valid color code";
    isValid = false;
  } else if (/\s/.test(quantity) && /^\s|\s$/.test(colorCode)) {
    colorCodeError.textContent = "Enter a valid color code";
    isValid = false;
  } else {
    colorCodeError.textContent = "";
  }

  if (isValid) {
    if (cropperOne && cropperTwo && cropperThree && cropperFour) {
      const formData = new FormData();

      const getBlobFromCropper = (cropper) => {
        return new Promise((resolve) => {
          cropper.getCroppedCanvas().toBlob((blob) => {
            resolve(blob);
          });
        });
      };

      Promise.all([
        getBlobFromCropper(cropperOne),
        getBlobFromCropper(cropperTwo),
        getBlobFromCropper(cropperThree),
        getBlobFromCropper(cropperFour),
      ])
        .then((blobs) => {
          formData.append("productImgOne", blobs[0]);
          formData.append("productImgTwo", blobs[1]);
          formData.append("productImgThree", blobs[2]);
          formData.append("productImgFour", blobs[3]);
          formData.append("colorName", colorName);
          formData.append("colorCode", colorCode);
          formData.append("productId", productId);

          //POST REQUEST - ADD COLOR VARIENT

          axios
            .post("/admin/addProduct/colorVarient", formData)
            .then((response) => {
              if (response.status === 200) {
                // window.location.href = "/admin/products";
                const varient = response.data.colorVarient;
                colorSelection.innerHTML += `
                <div class="color-box" data-color-name=${varient.colorName} data-color-code=${varient.colorCode} data-color-images=${varient.images} id="${varient._id}" style="background-color: ${varient.colorCode}"></div>
                
                `;

                productColorVarientForm.reset();
                document.getElementById("imagePreviewOne").innerHTML = "";
                document.getElementById("imagePreviewTwo").innerHTML = "";
                document.getElementById("imagePreviewThree").innerHTML = "";
                document.getElementById("imagePreviewFour").innerHTML = "";

                document.querySelector("#productEditModal .close").click();

                window.location.href = "/admin/products"

              }
            })
            .catch((error) => {
              console.log("it is an error", error);
              new Noty({
                type: "error",
                text: error.response.data.message,
                timeout: 3000,
                layout: "bottomCenter",
                theme: "metroui",
              }).show();
            });
        })
        .catch((error) => {
          console.error("Error creating blobs:", error);
        });
    }
  }
});

//ADD PRODUCT EVENT HANDLER
const productForm = document.getElementById("product-form");
productForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let model = document.getElementById("model").value;
  let brand = document.getElementById("brand").value;
  let gender = document.getElementById("gender").value;
  let category = document.getElementById("category").value;
  let outerMaterial = document.getElementById("outer-material").value;
  let soleMaterial = document.getElementById("sole-material").value;
  let description = document.getElementById("description").value;

  let modelNameError = document.getElementById("modelNameError");
  let brandNameError = document.getElementById("brandNameError");
  let genderError = document.getElementById("genderError");
  let categoryError = document.getElementById("categoryError");
  let outerMaterialError = document.getElementById("outerMaterialError");
  let soleMaterialError = document.getElementById("soleMaterialError");

  let productTableContainer = document.getElementById(
    "product-table-container"
  );

  let isValid = true;

  if (!model.trim()) {
    modelNameError.textContent = "Model name is required";
    isValid = false;
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(model)) {
    modelNameError.textContent = "Enter a valid model name";
    isValid = false;
  } else {
    modelNameError.textContent = "";
  }

  if (!brand.trim()) {
    brandNameError.textContent = "Select a brand";
    isValid = false;
  } else {
    brandNameError.textContent = "";
  }

  if (!gender.trim()) {
    genderError.textContent = "Select a user type";
    isValid = false;
  } else {
    genderError.textContent = "";
  }

  if (!category.trim()) {
    categoryError.textContent = "Select a category";
    isValid = false;
  } else {
    categoryError.textContent = "";
  }

  if (!outerMaterial.trim()) {
    outerMaterialError.textContent = "Outer material is required";
    isValid = false;
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(outerMaterial)) {
    outerMaterialError.textContent = "Enter a valid outer material name";
    isValid = false;
  } else {
    outerMaterialError.textContent = "";
  }

  if (!soleMaterial.trim()) {
    soleMaterialError.textContent = "Sole material is required";
    isValid = false;
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(soleMaterial)) {
    soleMaterialError.textContent = "Enter a valid sole material name";
    isValid = false;
  } else {
    soleMaterialError.textContent = "";
  }

  if (isValid) {
    let formData = {
      model: model,
      brand: brand,
      gender: gender,
      category: category,
      outerMaterial: outerMaterial,
      soleMaterial: soleMaterial,
      description: description,
    };

    axios
      .post("/admin/addProduct", formData)
      .then((response) => {
        if (response.status == 200) {

          let product = response.data.product;

          document.querySelector("#productModal .close").click();

          productForm.reset();

          productTableContainer.insertAdjacentHTML(
            "afterbegin",
            `
                    <tr id="row${product._id}">
                      <td>${product.modelName}</td>
                      <td>${product.brand.name}</td>
                      <td>${product.category.categoryName}</td>
                      <td>${
                        product.gender == "men"
                          ? "Men"
                          : product.gender == "women"
                          ? "Women"
                          : "Men & Women"
                      }</td>
                      <td>${product.outerMaterial}</td>
                      <td>${product.soleMaterial}</td>
                      <td><button data-product-id="${product._id}" id="varient${
              product._id
            }" data-toggle="modal" data-target="#varientModal" type="button" class="productVarientBtn varientBtnClr btn btn-gradient-info btn-rounded btn-sm statusBtn">Varient</button></td>
                      <td><button data-product-id="${product._id}" id="edit${
              product._id
            }" data-toggle="modal" data-target="#productEditModal" type="button" class="productEditBtn btn-sm btn btn-outline-dark statusBtn">Edit</button></td>
                     <td><button data-product-id="${product._id}" id="delete${
              product._id
            }" type="button" class="productUnlistBtn btn btn-outline-danger btn-sm statusBtn">Unlist</button></td>
                    </tr>
               `
          );
        }
      })
      .catch((error) => {
        console.log("it is an error", error);
      });
  }
});

//GET PRODUCTS DATA
// document.addEventListener("DOMContentLoaded", (event) => {
//   let tableContainer = document.getElementById("product-table-container");
//   tableContainer.innerHTML = "";

//   axios
//     .get("/admin/products/data")
//     .then((response) => {
//       console.log(response.data.products);
//       if (response.status == 200) {
//         if (response.data.products.length !== 0) {
//           response.data.products.forEach((product) => {
//             tableContainer.innerHTML += `
//                     <tr id="row${product._id}">
//                   <td>${product.modelName}</td>
//                   <td>${product.brand.name}</td>
//                   <td>${product.category.categoryName}</td>
//                   <td>${product.gender == "men" ? "Men" : product.gender == "women" ? "Women" : "Men & Women"}</td>
//                   <td>${product.outerMaterial}</td>
//                   <td>${product.soleMaterial}</td>

//                   <td><button data-product-id="${product._id}" id="varient${product._id}" data-toggle="modal" data-target="#varientModal" type="button" class="productVarientBtn varientBtnClr btn btn-gradient-info btn-rounded btn-sm statusBtn">Varient</button></td>
//                   <td><button data-product-id="${product._id}" id="edit${product._id}" data-toggle="modal" data-target="#productEditModal" type="button" class="productEditBtn btn-sm btn btn-outline-dark statusBtn">Edit</button></td>
//                  <td><button data-product-id="${product._id}" id="delete${product._id}" type="button" class="productUnlistBtn btn btn-outline-danger btn-sm statusBtn">Unlist</button></td>
//                 </tr>
//                     `;
//           });
//         }
//       }
//     })
//     .catch((error) => {
//       console.log("it is an error", error);
//     });
// });
