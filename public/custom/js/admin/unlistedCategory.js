document.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("categoryListBtn")) {
      let listBtn = event.target;



      let categoryId = listBtn.getAttribute("data-id");
      let categoryValue = listBtn.getAttribute("data-category");



      Swal.fire({
        title: "Are you sure?",
        text: `Do you want to list the category "${categoryValue}"?`,
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
              console.log(response, "affffff");

              if (response.status == 200) {
                let categoryElement = document.getElementById(
                  `card${categoryId}`
                );
                console.log("99999", categoryElement);
                if (categoryElement) {
                  categoryElement.remove();

                  Swal.fire(
                    "Listed!",
                    `The category "${categoryValue}" has been listed.`,
                    "success"
                  );
                } else {
                  console.error("Category not found with ID:", categoryId);
                }
              }
            })
            .catch((error) => {
              console.log(error.response.status)

              if(error.response.status){

              Swal.fire(
                "Error!",
                error.response.data.message,
                "error"
              );

              }

            });
        }
      });
    }
  });