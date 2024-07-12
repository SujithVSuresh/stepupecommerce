
document.addEventListener("DOMContentLoaded", () => {
  const categoryError = document.getElementById("categoryError");
  const categoryForm = document.getElementById("category-form");

  const categoryEditError = document.getElementById('categoryEditError')


  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const categoryValue = document.getElementById("category-value").value;

    let isValid = true

    if (!categoryValue.trim()) {
        categoryError.textContent = "This field is required";
        isValid = false;
      } else if(!/^[A-Za-z\s]+$/.test(categoryValue)){
        categoryError.textContent = "Enter a valid category name";
        isValid = false;
      } else {
        categoryError.textContent = "";
      }

    if(isValid){

    axios
      .post("/admin/category/add", { categoryValue: categoryValue })
      .then((response) => {
        if (response.status == 200) {
          document.querySelector("#addCategoryModal .close").click();

          const newCardDiv = document.createElement("div");
          newCardDiv.classList.add("col-md-3", "mb-4");
          newCardDiv.setAttribute('id', `card${response.data.categoryData._id}`)

          newCardDiv.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h5 class="card-title" style="margin-bottom: 20px; text-transform: uppercase;">
                  ${response.data.categoryData.categoryName}
                </h5>
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                  <button
                    type="button"
                    data-id="${response.data.categoryData._id}"
                    data-category="${response.data.categoryData.categoryName}"
                    class="btn btn-outline-dark btn-sm categoryEditBtn"
                    data-toggle="modal"
                    data-target="#editCategoryModal"
                  >
                    Edit
                  </button>
                  <button
                    data-id="${response.data.categoryData._id}"
                    data-category="${response.data.categoryData.categoryName}"
                    type="button"
                    class="btn btn-outline-danger btn-sm categoryDeleteBtn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `;

          const cardContainer = document.getElementById("category-card-container");
          cardContainer.appendChild(newCardDiv);

          categoryForm.reset();
          categoryError.innerText = "";
        }
      })
      .catch((error) => {
        if (error.response.status == 409) {
          categoryError.innerText = error.response.data.message;
        }
      });
    }

  });

  const categoryEditForm = document.getElementById("edit-category-form");

  categoryEditForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const categoryId = categoryEditForm.getAttribute("data-id");
    const formValue = document.getElementById("edit-category-value").value;

    let isValid = true

    if (!formValue.trim()) {
        categoryEditError.textContent = "This field is required";
        isValid = false;
      } else if(!/^[A-Za-z\s]+$/.test(formValue)){
        categoryEditError.textContent = "Enter a valid category name";
        isValid = false;
      } else {
        categoryEditError.textContent = "";
      }

    if(isValid){

    axios
      .post("/admin/category/edit", {
        categoryName: formValue,
        id: categoryId,
      })
      .then((response) => {
        if (response.status == 200) {
          const categoryElement = document.getElementById(`card${categoryId}`);

          if (categoryElement) {
            const categoryNameElement = categoryElement.querySelector(".card-title");

            if (categoryNameElement) {
              categoryNameElement.textContent = response.data.categoryData.categoryName;

              document.querySelector("#editCategoryModal .close").click();

              const editButton = categoryElement.querySelector(".categoryEditBtn");
              if (editButton) {
                editButton.setAttribute("data-category", response.data.categoryData.categoryName);
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error.response.status == 409) {
          const categoryEditError = document.getElementById("categoryEditError");
          categoryEditError.innerText = error.response.data.message;
        }
      });
    }

  });

  document.addEventListener("click", (event) => {
    if (event.target && event.target.id=="categoryAddBtn") {
      categoryForm.reset()
      categoryError.textContent = "";

    }

    if (event.target && event.target.classList.contains("categoryEditBtn")) {
      const editButton = event.target;

      const categoryId = editButton.getAttribute("data-id");
      const categoryValue = editButton.getAttribute("data-category");

      document.getElementById("edit-category-value").value = categoryValue;
      categoryEditForm.setAttribute("data-id", categoryId);

      categoryEditError.innerText = ""
    }

    if (event.target && event.target.classList.contains("categoryDeleteBtn")) {
      const deleteButton = event.target;

      const categoryId = deleteButton.getAttribute("data-id");
      const categoryValue = deleteButton.getAttribute("data-category");

      Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete the category "${categoryValue}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post("/admin/category/manage", {
              id: categoryId,
            })
            .then((response) => {
              if (response.status == 200) {
                const categoryElement = document.getElementById(`card${categoryId}`);
                if (categoryElement) {
                  categoryElement.remove();

                  Swal.fire(
                    "Deleted!",
                    `The category "${categoryValue}" has been deleted.`,
                    "success"
                  );
                }
              }
            })
            .catch(() => {
              Swal.fire("Error!", "There was an error deleting the category.", "error");
            });
        }
      });
    }
  });
});


