document.addEventListener("DOMContentLoaded", (event) => {
    let cartCount = document.getElementById('mainCartCount')


    //   -------------------------------------CLICK EVENT START-----------------------------------

    function removeFromWishlistFunc(wishlistItemId){
        axios
                .post("/shop/wishlist/removeFromWishlist", {
                    itemId: wishlistItemId,
                })
                .then((response) => {
                    if (response.status == 200) {
                        if (response.data) {
                            let wishlistItemsContainer = document.getElementById('wishlistItemsContainer')
            
                            let cartItemContainer = document.getElementById(
                                `wishlistItemContainer${wishlistItemId}`
                            );

                            if (cartItemContainer) {
                                cartItemContainer.remove();
                            }

                            if(response.data.wishlist.items.length == 0){
                                wishlistItemsContainer.innerHTML = `
                                                               <div class="text-center"> <img src="/static/user/images/empty.png" class="mt-5" width="250px" height="250px" alt="empty cart"> </div>

                                `

                            }

                            new Noty({
                                type: "success",
                                text: response.data.message,
                                timeout: 3000,
                                layout: "bottomCenter",
                                theme: "metroui",
                                animation: {
                                    open: "animated bounceInRight",
                                    close: "animated bounceOutRight",
                                },
                            }).show();
                        }
                    }
                })
                .catch((error) => {
                    console.log("error code");
                });
    }

    document.addEventListener("click", (event) => {

        if (
            event.target &&
            event.target.classList.contains("removeFromWishlist")
        ) {
            event.preventDefault();

            const removeFromWishlistBtn = event.target;

            const wishlistItemId = removeFromWishlistBtn.getAttribute("data-wishlist-item-id");

            removeFromWishlistFunc(wishlistItemId)

        }else if(
            event.target &&
            event.target.classList.contains("addToCartBtn")
        ){
            event.preventDefault();

      

            const addToCartBtn = event.target;

            const productId = addToCartBtn.getAttribute("product-id");
            const varientId = addToCartBtn.getAttribute("varient-id");
            const subVarientId = addToCartBtn.getAttribute("sub-varient-id");

            const wishlistItemId = addToCartBtn.getAttribute('data-wishlist-item-id')

            axios
                .post("/shop/cart/addToCart", { productId: productId, varientId: varientId, subVarientId: subVarientId, quantity: 1 })
                .then((response) => {
                    if (response.status == 200) {
                        cartCount.innerText = response.data.cartCount

                        removeFromWishlistFunc(wishlistItemId)

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
    });
});