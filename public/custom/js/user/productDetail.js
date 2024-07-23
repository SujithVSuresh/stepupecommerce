document.addEventListener("DOMContentLoaded", function () {

    let dataHandler = document.getElementById("data-handler")

    let initialProductId = dataHandler.getAttribute('product-data-id')
    let initialVarientId = dataHandler.getAttribute('varient-data-id')

    // let productImageContainer = document.getElementById("product-image-container")

    let addToCartBtn = document.getElementById('addToCartBtn')

    let addToWishlistBtn = document.getElementById('addToWishlistBtn')

    let wishlistTxt = document.getElementById('wishlistTxt')


    // Header cart count.
    let cartCount = document.getElementById('mainCartCount')


    // console.log(productImageContainer);

    let imageOne = document.getElementById('img1')
    let imageTwo = document.getElementById('img2')
    let imageThree = document.getElementById('img3')
    let imageFour = document.getElementById('img4')

    let showImg = document.getElementById('showImg')

    let pDescription = document.getElementById('p-desc')
    let pColor = document.getElementById('p-clr')
    let pModel = document.getElementById('p-model')
    let pBrand = document.getElementById('p-brand')
    let pOuter = document.getElementById('p-outer')
    let pSole = document.getElementById('p-sole')
    let pGender = document.getElementById('p-gender')
    let pCategory = document.getElementById('p-category')
    let productDescTop = document.getElementById('product-desc-top')

    axios.get(`/shop/item/productDetails?pid=${initialProductId}&vid=${initialVarientId}`)
        .then(function (response) {
            if (response.status == 200) {

                let data = response.data

                let varients = data.allVarients

                let selectedSubVarients = data.selectedSubVarients


                let product = data.product

                pColor.innerText = `Color - ${data.selectedVarients[0].colorName}`

                pDescription.innerText = `${product.description}`

                productDescTop.innerText = `${product.description.slice(0, 150)}.....`


                //Setting Subvarient id to add t cart btn
                addToCartBtn.setAttribute('svid', selectedSubVarients[0]._id)
                addToCartBtn.setAttribute('vid', response.data.selectedVarients[0]._id)
                addToCartBtn.setAttribute('pid', response.data.product._id)

                addToWishlistBtn.setAttribute('svid', selectedSubVarients[0]._id)
                addToWishlistBtn.setAttribute('vid', response.data.selectedVarients[0]._id)
                addToWishlistBtn.setAttribute('pid', response.data.product._id)


                //Setting description
                pModel.innerText = `Model - ${product.modelName}`
                pBrand.innerText = `Brand - ${product.brand.name}`
                pOuter.innerText = `Outer material - ${product.outerMaterial}`
                pSole.innerText = `Sole material - ${product.soleMaterial}`
                pCategory.innerText = `Category - ${product.category.categoryName}`
                pGender.innerText = `Gender - ${product.gender}`
                pBrand.innerText = `Brand - ${product.brand.name}`


                // Setting images
                let images = data.selectedVarients[0].images

                imageOne.src = `/static/images/${images[0]}`
                imageTwo.src = `/static/images/${images[1]}`
                imageThree.src = `/static/images/${images[2]}`
                imageFour.src = `/static/images/${images[3]}`

                showImg.src = `/static/images/${images[0]}`


                //Setting colors
                let colorContainer = document.getElementById('color-container')

                colorContainer.innerHTML = ""
                varients.forEach(function (varient) {
                    colorContainer.innerHTML += `
    <li><a id="clr${varient._id}" varient-data-id="${varient._id}" style="background-color: ${varient.colorCode}; border-width: 1px; border-style: solid; border-color: gray" class="clrBox" href="#"></a></li>
    `

                });


                // Setting sizes
                let sizeContainer = document.getElementById('size-container')

                sizeContainer.innerHTML = ""
                selectedSubVarients.forEach(function (subVarient) {
                    sizeContainer.innerHTML += `
 <li><a id="size${subVarient._id}" sub-varient-data-id="${subVarient._id}" style="border-width: 1px; border-style: solid; border-color: gray" class="sizeBox" href="#">${subVarient.size}</a></li>
    `
                });


                // Setting product details
                let showModelName = document.getElementById('show-model-name')
                let showCategoryName = document.getElementById('show-category-name')
                let showGender = document.getElementById("show-gender")
                let showPrice = document.getElementById("show-price")
                let showPriceOffer = document.getElementById("show-price-offer")


                showModelName.innerText = `${product.modelName}`
                showCategoryName.innerText = `${product.category.categoryName}`
                showGender.innerText = `${product.gender}`



                if (data.product.offer > 0) {
                    showPrice.style.display = "none"
                    showPriceOffer.innerHTML = `<span style="margin-right: 15px; color: black">₹ ${selectedSubVarients[0].offerAmount}</span> <span style="margin-right: 15px; font-size: 20px"><s>₹${selectedSubVarients[0].price}</s></span> <span style="margin-right: 15px; font-size: 20px; color: green">${data.product.offer}% Off</span>`
                } else {
                    showPriceOffer.style.display = "none"
                    showPrice.innerText = `₹ ${selectedSubVarients[0].price}`
                }

                let firstColor = document.getElementById(`clr${varients[0]._id}`)

                let firstSize = document.getElementById(`size${selectedSubVarients[0]._id}`)

                firstColor.style.borderColor = 'black'
                firstColor.style.borderWidth = '3px'

                firstSize.style.borderColor = 'black'
                firstSize.style.borderWidth = '3px'

                // Setting stock status
                let showStock = document.getElementById("show-stock")

                if (selectedSubVarients[0].quantity > 10) {
                    showStock.style.color = 'green'
                    showStock.innerText = `In Stock`

                } else if (selectedSubVarients[0].quantity <= 10 && selectedSubVarients[0].quantity >= 6) {
                    showStock.style.color = 'red'
                    showStock.innerText = `Only Few Left`

                } else if (selectedSubVarients[0].quantity > 0 && selectedSubVarients[0].quantity <= 5) {
                    showStock.style.color = 'red'
                    showStock.innerText = `Only ${selectedSubVarients[0].quantity} Left`

                } else {
                    showStock.style.color = 'red'
                    showStock.innerText = `Out of stock`
                }
            }

        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });


    // Related Products
    function fetchRelatedProducts() {

        let productId = dataHandler.getAttribute('product-data-id')

        let itemContainer = document.getElementById("item-container");

        itemContainer.innerHTML = " ";

        axios
            .get(`/shop/item/relatedProducts?pid=${productId}`)
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data.relatedProducts, "related...")

                    let products = response.data.relatedProducts;

                    products.forEach((item) => {
                        itemContainer.innerHTML += `
                             <div class="col-lg-4 mb-4 text-center">
    <div class="product-entry border">
      <a href="/shop/items/${item._id}" class="prod-img">
        <img src="/static/images/${item.varient[0].images[0]}" class="img-fluid" alt="Free html5 bootstrap 4 template">
      </a>
      <div class="desc">
        <h2>
          <a href="/shop/items/${item._id}">
            ${item.modelName} ${item.category.categoryName} for ${item.gender}
          </a>
        </h2>
    
      </div>
    </div>
  </div>
`;
                    });
                }
            })
            .catch((error) => {
                console.log("it is an error", error);
            });

    }

    fetchRelatedProducts()


    // Image zoom.

    const zoomResult = document.getElementById('zoomResult')

    showImg.addEventListener('mousemove', moveLens);
    zoomLens.addEventListener('mousemove', moveLens);
    showImg.addEventListener('mouseenter', showZoom);
    zoomLens.addEventListener('mouseenter', showZoom);
    showImg.addEventListener('mouseleave', hideZoom);
    zoomLens.addEventListener('mouseleave', hideZoom);



    function showZoom() {
        zoomLens.style.display = "block";
        zoomResult.style.display = "block";
    }

    function hideZoom() {
        zoomLens.style.display = "none";
        zoomResult.style.display = "none";
    }

    function moveLens(e) {
        const pos = getCursorPos(e);
        let x = pos.x - (zoomLens.offsetWidth / 2);
        let y = pos.y - (zoomLens.offsetHeight / 2);

        if (x > showImg.width - zoomLens.offsetWidth) { x = showImg.width - zoomLens.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > showImg.height - zoomLens.offsetHeight) { y = showImg.height - zoomLens.offsetHeight; }
        if (y < 0) { y = 0; }

        zoomLens.style.left = x + "px";
        zoomLens.style.top = y + "px";

        zoomResult.style.backgroundImage = `url(${showImg.src})`;
        zoomResult.style.backgroundSize = `${showImg.width * 2}px ${showImg.height * 2}px`;
        zoomResult.style.backgroundPosition = `-${x * 2}px -${y * 2}px`;

    }

    function getCursorPos(e) {
        const a = showImg.getBoundingClientRect();
        const x = e.clientX - a.left;
        const y = e.clientY - a.top;
        return { x: x, y: y };
    }


    // Image mouse over event start.....

    document.addEventListener('mouseover', (event) => {
        if (event.target && event.target.classList.contains("sideImg")) {
            showImg.src = event.target.src
        }
    })


    // ----------------------------CLICK EVENT START------------------------------------------

    document.addEventListener("click", (event) => {


        let showStock = document.getElementById("show-stock")



        // Qty inc & dec event
        if (event.target && (event.target.classList.contains("inc-qty-btn") || event.target.classList.contains("dec-qty-btn"))) {
            event.preventDefault()
            let qtyInput = document.getElementById("quantity-input")

            if (event.target.classList.contains("inc-qty-btn")) {
                let num = qtyInput.value

                if (num < 10) {

                    num++

                    qtyInput.value = num

                    console.log(num);
                }

            }

            if (event.target.classList.contains("dec-qty-btn")) {

                let num = qtyInput.value

                if (num > 1) {

                    num--

                    qtyInput.value = num

                    console.log(num);
                }

            }

        }

        // COLOR BUTTON
        if (event.target && event.target.classList.contains("clrBox")) {
            event.preventDefault()

            let allClrBox = document.querySelectorAll(".clrBox")

            let clickedClrBox = event.target

            let varientId = clickedClrBox.getAttribute("varient-data-id")

            document.getElementById('data-handler').setAttribute('varient-data-id', varientId)


            axios.get(`/shop/item/productDetails?pid=${initialProductId}&vid=${varientId}`)
                .then(function (response) {
                    if (response.status == 200) {
                        let data = response.data

                        console.log(data, "daaaa");

                        pColor.innerText = `Color - ${data.selectedVarients[0].colorName}`

                        let selectedSubVarients = data.selectedSubVarients


                        if (data.selectedVarients[0]._id == varientId) {

                            //Setting Subvarient id to add t cart btn
                            addToCartBtn.setAttribute('svid', selectedSubVarients[0]._id)
                            addToCartBtn.setAttribute('vid', response.data.selectedVarients[0]._id)
                            addToCartBtn.setAttribute('pid', response.data.product._id)

                            addToWishlistBtn.setAttribute('svid', selectedSubVarients[0]._id)
                            addToWishlistBtn.setAttribute('vid', response.data.selectedVarients[0]._id)
                            addToWishlistBtn.setAttribute('pid', response.data.product._id)



                            for (let i = 0; i < allClrBox.length; i++) {
                                allClrBox[i].style.borderColor = 'gray';
                                allClrBox[i].style.borderWidth = '1px';
                            }

                            clickedClrBox.style.borderColor = "black"
                            clickedClrBox.style.borderWidth = '3px'


                            // Setting images
                            let images = data.selectedVarients[0].images

                            imageOne.src = `/static/images/${images[0]}`
                            imageTwo.src = `/static/images/${images[1]}`
                            imageThree.src = `/static/images/${images[2]}`
                            imageFour.src = `/static/images/${images[3]}`

                            showImg.src = imageOne.getAttribute('src')



                            // Setting sizes
                            let sizeContainer = document.getElementById('size-container')

                            sizeContainer.innerHTML = ""
                            selectedSubVarients.forEach(function (subVarient) {
                                sizeContainer.innerHTML += `
    <li><a id="size${subVarient._id}" sub-varient-data-id="${subVarient._id}" style="border-width: 1px; border-style: solid; border-color: gray" class="sizeBox" href="#">${subVarient.size}</a></li>
    `

                            });

                            let firstSize = document.getElementById(`size${selectedSubVarients[0]._id}`)


                            firstSize.style.borderColor = 'black'
                            firstSize.style.borderWidth = '3px'

                            // Setting Price
                            let showPrice = document.getElementById("show-price")
                            // showPrice.innerText = `₹ ${selectedSubVarients[0].price}`

                            let showPriceOffer = document.getElementById("show-price-offer")


                            if (data.product.offer > 0) {
                                showPrice.style.display = "none"
                                showPriceOffer.innerHTML = `<span style="margin-right: 15px; color: black">₹ ${selectedSubVarients[0].offerAmount}</span> <span style="margin-right: 15px; font-size: 20px"><s>₹${selectedSubVarients[0].price}</s></span> <span style="margin-right: 15px; font-size: 20px; color: green">${data.product.offer}% Off</span>`
                            } else {
                                showPriceOffer.style.display = "none"
                                showPrice.innerText = `₹ ${selectedSubVarients[0].price}`

                            }


                            // Setting stock status
                            // let showStock = document.getElementById("show-stock")

                            if (selectedSubVarients[0].quantity > 10) {
                                showStock.style.color = 'green'
                                showStock.innerText = `In Stock`

                            } else if (selectedSubVarients[0].quantity <= 10 && selectedSubVarients[0].quantity >= 6) {
                                showStock.style.color = 'red'
                                showStock.innerText = `Only Few Left`

                            } else if (selectedSubVarients[0].quantity > 0 && selectedSubVarients[0].quantity <= 5) {
                                showStock.style.color = 'red'
                                showStock.innerText = `Only ${selectedSubVarients[0].quantity} Left`

                            } else {
                                showStock.style.color = 'red'
                                showStock.innerText = `Out of stock`

                            }


                        }

                    }

                })
                .catch(function (error) {
                    console.error('Error fetching data:', error);
                });
        }



        // SIZE BOX
        if (event.target && event.target.classList.contains("sizeBox")) {
            event.preventDefault()

            let allSizeBox = document.querySelectorAll(".sizeBox")

            let sizeElement = event.target

            let subVarientId = sizeElement.getAttribute("sub-varient-data-id")

            let varientId = document.getElementById('data-handler').getAttribute('varient-data-id')

            axios.get(`/shop/item/productDetails?svid=${subVarientId}&pid=${initialProductId}&vid=${varientId}`)
                .then(function (response) {
                    if (response.status == 200) {

                        const subVarient = response.data.subVarient
                        const product = response.data.product

                        if (subVarient._id == subVarientId) {
                            //Setting Subvarient id to add t cart btn
                            addToCartBtn.setAttribute('svid', subVarientId)

                            addToWishlistBtn.setAttribute('svid', subVarientId)

                            for (let i = 0; i < allSizeBox.length; i++) {
                                allSizeBox[i].style.borderColor = 'gray';
                                allSizeBox[i].style.borderWidth = '1px';
                            }

                            sizeElement.style.borderColor = "black"
                            sizeElement.style.borderWidth = '3px'


                            // Setting Price
                            // let showPrice = document.getElementById("show-price")
                            // showPrice.innerText = `₹ ${subVarient.price}`

                            // let showPriceOffer = document.getElementById("show-price-offer")
                            let showPrice = document.getElementById("show-price")
                            let showPriceOffer = document.getElementById("show-price-offer")


                            if (product.offer > 0) {
                                showPrice.style.display = "none"
                                showPriceOffer.innerHTML = `<span style="margin-right: 15px; color: black">₹ ${subVarient.offerAmount}</span> <span style="margin-right: 15px; font-size: 20px"><s>₹${subVarient.price}</s></span> <span style="margin-right: 15px; font-size: 20px; color: green">${product.offer}% Off</span>`
                            } else {
                                showPriceOffer.style.display = "none"
                                showPrice.innerText = `₹ ${subVarient.price}`
                            }




                            // Setting stock status
                            // let showStock = document.getElementById("show-stock")

                            if (subVarient.quantity > 10) {

                                showStock.style.color = 'green'
                                showStock.innerText = `In Stock`

                            } else if (subVarient.quantity <= 10 && subVarient.quantity >= 6) {
                                showStock.style.color = 'red'
                                showStock.innerText = `Only Few Left`


                            } else if (subVarient.quantity > 0 && subVarient.quantity <= 5) {
                                showStock.style.color = 'red'
                                showStock.innerText = `Only ${subVarient.quantity} Left`

                            } else {
                                showStock.style.color = 'red'
                                showStock.innerText = `Out of stock`

                            }


                        }


                    }

                })
                .catch(function (error) {
                    console.error('Error fetching data:', error);
                });
        }

        // ADD TO CART EVENT
        if (event.target && event.target.id == "addToCartBtn") {
            event.preventDefault()

            console.log("jj", event.target);

            let qty = document.getElementById("quantity-input").value


            const productId = event.target.getAttribute('pid')
            const varientId = event.target.getAttribute('vid')
            const subVarientId = event.target.getAttribute('svid')


            // console.log(qty, productSubVarientId, "qty Input");

            axios
                .post("/shop/cart/addToCart", { productId: productId, varientId: varientId, subVarientId: subVarientId, quantity: qty })
                .then((response) => {
                    if (response.status == 200) {

                        cartCount.innerText = response.data.cartCount

                        new Noty({
                            type: 'success',
                            text: response.data.message,
                            timeout: 3000,
                            layout: 'bottomCenter',
                            theme: 'metroui',
                            animation: {
                                open: 'animated bounceInRight',
                                close: 'animated bounceOutRight',
                            }
                        }).show();
                    }
                })
                .catch((error) => {
                    console.log("it is an error", error);
                    if (error.response.status == 409) {
                        new Noty({
                            type: 'warning',
                            text: error.response.data.message,
                            timeout: 3000,
                            layout: 'bottomCenter',
                            theme: 'metroui',
                            animation: {
                                open: 'animated bounceInRight',
                                close: 'animated bounceOutRight',
                            }
                        }).show();

                    }
                });

        }





        // ADD TO WISHLIST
        if (event.target && (event.target.id == "addToWishlistBtn" || event.target.id == "wishlistTxt")) {
            event.preventDefault()

            // let productSubVarientId = event.target.getAttribute('svid')
            const productId = event.target.getAttribute('pid')
            const varientId = event.target.getAttribute('vid')
            const subVarientId = event.target.getAttribute('svid')


            axios
                .post("/shop/wishlist/addToWishlist", { productId: productId, varientId: varientId, subVarientId: subVarientId })
                .then((response) => {
                    if (response.status == 200) {

                        new Noty({
                            type: 'success',
                            text: response.data.message,
                            timeout: 3000,
                            layout: 'bottomCenter',
                            theme: 'metroui',
                            animation: {
                                open: 'animated bounceInRight',
                                close: 'animated bounceOutRight',
                            }
                        }).show();
                    }
                })
                .catch((error) => {
                    console.log("it is an error", error);
                    if (error.response.status == 409) {
                        new Noty({
                            type: 'warning',
                            text: error.response.data.message,
                            timeout: 3000,
                            layout: 'bottomCenter',
                            theme: 'metroui',
                            animation: {
                                open: 'animated bounceInRight',
                                close: 'animated bounceOutRight',
                            }
                        }).show();

                    }
                });

        }



    })
    // ----------------------------CLICK EVENT END------------------------------------------

})