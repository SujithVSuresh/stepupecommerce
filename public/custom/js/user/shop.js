document.addEventListener("DOMContentLoaded", (event) => {

    let pageNo = document.getElementById('pageNo')
    let sortBy = document.getElementById('sort-by')

    let filterCategory = document.getElementsByName("filter-category")
    let filterBrand = document.getElementsByName("filter-brand")
    let filterGender = document.getElementsByName("filter-gender")
    let filterColor = document.getElementsByName("filter-color")
    let filterSize = document.getElementsByName("filter-size")
    let filterPrice = document.getElementsByName("filter-price")

    let searchInput = document.getElementById("searchInput")


    let sortValue = ""

    let searchValue = ""

    let categoryFilterArr = []
    let brandFilterArr = []
    let genderFilterArr = []
    let colorFilterArr = []
    let sizeFilterArr = []
    let priceFilterArr = []


    function fetchProducts(pg = 1, sort = sortValue) {

      let itemContainer = document.getElementById("item-container");

      let itemsUrl = "/shop/items" + `?page=${pg}` + `&sort=${sort}` + `&category=${categoryFilterArr}` + `&brand=${brandFilterArr}` + `&gender=${genderFilterArr}` + `&search=${searchValue}`

      itemContainer.innerHTML = " ";

      axios
        .get(itemsUrl)
        .then((response) => {
          if (response.status == 200) {
            let products = response.data.products;
            let totalPages = response.data.totalPages
            let currentPage = response.data.currentPage

            pageNo.setAttribute("totalPages", totalPages)
            pageNo.setAttribute("currentPage", currentPage)

            if(products.length != 0){

            products.forEach((item) => {
              itemContainer.innerHTML += `
  <div class="col-lg-4 mb-4 text-center">
    <div class="product-entry border">
      <a href="/shop/items/${item._id}" class="prod-img">
   <img src="/static/images/${item.varient[0].images[0]}" class="img-fluid" alt="Free html5 bootstrap 4 template"> 
          <div class="desc">
        <h2><a href="/shop/items/${item._id}" >${item.modelName} ${item.category.categoryName} for ${item.gender == "unisex" ? "Men & women" : item.gender}</a></h2>
        <span style="color: red">${item.varient[0].subVarient[0].quantity == 0 ? "Out of stock" : item.varient[0].subVarient[0].quantity <= 5 ? `Only ${item.varient[0].subVarient[0].quantity} left` : ""}</span>

       <span class="price">
          ₹ ${item.maxOffer ? 
              `<span>${Math.round(item.varient[0].subVarient[0].price - (item.maxOffer/100 * (item.varient[0].subVarient[0].price)))}</span> <span style="color: gray"><strike>${item.varient[0].subVarient[0].price}</strike></span>  <span style="color: green">${item.maxOffer}% Off</span>` : 
              `${item.varient[0].subVarient[0].price}`}
        </span>
      </div>
        </a>
   
    </div>
  </div>
`;
            });
          }else{
            itemContainer.innerHTML = `
            <div class="text-center w-100"> 
            <img src="/static/user/images/empty.png" class="mt-5" width="250px" height="250px" alt="empty cart"> 
            </div>
`
          }
          }
        })
        .catch((error) => {
          console.log("it is an error", error);
        });
    }

    fetchProducts(Number(pageNo.innerText))



    document.addEventListener("click", (event) => {
      const totalPages = pageNo.getAttribute("totalPages")

      if (event.target && event.target.classList.contains("nxtPageClass")) {
        event.preventDefault()


        if (Number(pageNo.innerText) < totalPages) {
          fetchProducts(Number(pageNo.innerText) + 1)
          pageNo.innerText = Number(pageNo.innerText) + 1
        }
      }

      if (event.target && event.target.classList.contains("prevPageClass")) {
        event.preventDefault()
        if (Number(pageNo.innerText) > 1) {
          fetchProducts(Number(pageNo.innerText) - 1)
          pageNo.innerText = Number(pageNo.innerText) - 1
        }
      }
    })


    sortBy.addEventListener('change', (event) => {
      fetchProducts(1, event.target.value)

      pageNo.innerText = 1

      sortValue = event.target.value
    })


    // Category filter
    filterCategory.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        const checkbox = event.target
        if (!checkbox.checked) {


          let index = categoryFilterArr.indexOf(checkbox.value);
          if (index !== -1) {
            categoryFilterArr.splice(index, 1);
            fetchProducts()
            pageNo.innerText = 1
          }
          console.log("Checkbox is unchecked", categoryFilterArr);
        } else {

          categoryFilterArr.push(checkbox.value)
          console.log("Checkbox is checked", categoryFilterArr);
          fetchProducts()
          pageNo.innerText = 1
        }
      });
    });


    // Brand filter
    filterBrand.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        const checkbox = event.target
        if (!checkbox.checked) {


          let index = brandFilterArr.indexOf(checkbox.value);
          if (index !== -1) {
            brandFilterArr.splice(index, 1);
            fetchProducts()
            pageNo.innerText = 1
          }
          console.log("Checkbox is unchecked", brandFilterArr);
        } else {

          brandFilterArr.push(checkbox.value)
          console.log("Checkbox is checked", brandFilterArr);
          fetchProducts()
          pageNo.innerText = 1
        }
      });
    });


    // Gender filter
    filterGender.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        const checkbox = event.target
        if (!checkbox.checked) {


          let index = genderFilterArr.indexOf(checkbox.value);
          if (index !== -1) {
            genderFilterArr.splice(index, 1);
            fetchProducts()
            pageNo.innerText = 1
          }
          console.log("Checkbox is unchecked", genderFilterArr);
        } else {

          genderFilterArr.push(checkbox.value)
          console.log("Checkbox is checked", genderFilterArr);
          fetchProducts()
          pageNo.innerText = 1
        }
      });
    });



    // Color filter
    // filterColor.forEach((checkbox) => {
    //   checkbox.addEventListener('change', (event) => {
    //     const checkbox = event.target
    //     if (!checkbox.checked) {


    //       let index = colorFilterArr.indexOf(checkbox.value);
    //       if (index !== -1) {
    //         colorFilterArr.splice(index, 1);
    //         fetchProducts()
    //         pageNo.innerText = 1
    //       }
    //       console.log("Checkbox is unchecked", colorFilterArr);
    //     } else {
    //       colorFilterArr.push(checkbox.value)
    //       console.log("Checkbox is checked", colorFilterArr);
    //       fetchProducts()
    //       pageNo.innerText = 1
    //     }
    //   });
    // });


    // Size filter
    // filterSize.forEach((checkbox) => {
    //   checkbox.addEventListener('change', (event) => {
    //     const checkbox = event.target
    //     if (!checkbox.checked) {


    //       let index = sizeFilterArr.indexOf(checkbox.value);
    //       if (index !== -1) {
    //         sizeFilterArr.splice(index, 1);
    //         fetchProducts()
    //         pageNo.innerText = 1
    //       }
    //       console.log("Checkbox is unchecked", sizeFilterArr);
    //     } else {
    //       sizeFilterArr.push(checkbox.value)
    //       console.log("Checkbox is checked", sizeFilterArr);
    //       fetchProducts()
    //       pageNo.innerText = 1
    //     }
    //   });
    // });

    // Price Filter
    // filterPrice.forEach((checkbox) => {
    //   checkbox.addEventListener('change', (event) => {
    //     const checkbox = event.target
    //     if (!checkbox.checked) {


    //       let index = priceFilterArr.indexOf(checkbox.value);
    //       if (index !== -1) {
    //         priceFilterArr.splice(index, 1);
    //         fetchProducts()
    //         pageNo.innerText = 1
    //       }
    //       console.log("Checkbox is unchecked", priceFilterArr);
    //     } else {
    //       priceFilterArr.push(checkbox.value)
    //       console.log("Checkbox is checked", priceFilterArr);
    //       fetchProducts()
    //       pageNo.innerText = 1
    //     }
    //   });
    // });

    // Search input
    let debounceTimeout
    searchInput.addEventListener('input', (event) => {
      clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        searchValue = event.target.value;
        console.log(`User typed: ${searchValue}`);
        fetchProducts()
        pageNo.innerText = 1
      }, 1000)
    });

  })