document.addEventListener("DOMContentLoaded", (event) => {

  document.getElementById('searchFormContainer').style.display = "block"


  const url = new URL(window.location.href);
  const searchValue = url.searchParams.get('search');

  if(searchValue){
  document.getElementById('search-input').value = searchValue
  }

  document.addEventListener("click", (event) => {

  if (event.target && event.target.classList.contains("statusBtn")) {
    event.preventDefault();

    const userId = event.target.getAttribute("data-user-id");

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want change status of this user.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("/admin/users/data/status", { userId: userId })
          .then((response) => {
            if (response.status == 200) {
              console.log(response.data.isBlocked, "Uioo");
              if (response.data.isBlocked == false) {
                let statusBtn = document.getElementById(response.data._id);
                let label = document.getElementById(
                  `label${response.data._id}`
                );

                statusBtn.innerText = "Block";

                label.innerText = "Active";
              } else {
                let statusBtn = document.getElementById(response.data._id);
                let label = document.getElementById(
                  `label${response.data._id}`
                );

                statusBtn.innerText = "Unblock";

                label.innerText = "Blocked";
              }
            }
          })
          .catch((error) => {
            console.log("it is an error", error);
          });
      }
    });
  }

});
});
