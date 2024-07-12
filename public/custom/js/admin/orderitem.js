



document.addEventListener("change", (event) => {

    if (event.target && event.target.classList.contains("statusChange")) {

        let statusChange = event.target

        const status = statusChange.value
        const orderId = statusChange.getAttribute('order-id')
        const itemId = statusChange.getAttribute('item-id')

        axios.post('/admin/order/items/changeStatus', { status: status, orderId: orderId, itemId: itemId })
            .then((response) => {
                if (response.status == 200) {
                    window.location.href = `/admin/order/items?oid=${orderId}`
                }
            })
            .catch((error) => {
                console.log("it is an error", error)
            })
    }
})
