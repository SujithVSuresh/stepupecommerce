const express = require('express')
const auth = require("../middleware/userAuth")
const cart = require("../middleware/cart")

const userController = require("../controller/userController")


const router = express.Router()

router.get('/', userController.home)

router.get('/shop', auth.isLogin,  userController.shop)

router.get('/shop/cart', auth.isLogin, userController.cart)

router.get('/shop/cart/products', auth.isLogin,  userController.addedtoCartProducts)

router.post('/shop/cart/addToCart', auth.isLogin, userController.addToCart)

router.post('/shop/cart/removeFromCart', auth.isLogin, userController.removeFromCart)

router.post('/shop/cart/qtyManagement', auth.isLogin, userController.cartQtyManagement)



router.post('/shop/cart/applyCoupon', auth.isLogin, userController.couponApply)
router.post('/shop/cart/removeCoupon', auth.isLogin, userController.removeCoupon)


router.get('/shop/wishlist', auth.isLogin, userController.wishlist)

router.post('/shop/wishlist/addToWishlist', auth.isLogin, userController.addToWishlist)
router.post('/shop/wishlist/removeFromWishlist', auth.isLogin, userController.removeFromWishlist)



router.get('/shop/checkout', auth.isLogin, userController.checkout)

router.get('/shop/items', auth.isLogin,  userController.items)

router.get('/shop/items/:productId', auth.isLogin,  userController.productDetailsPage)

router.get('/shop/item/productDetails', auth.isLogin,  userController.productDetails)

router.get('/shop/item/relatedProducts', auth.isLogin,  userController.relatedProducts)

router.post('/shop/placeOrder', auth.isLogin,  userController.placeOrder)

router.post('/shop/cancelOrder', auth.isLogin,  userController.cancelOrder)

router.post('/shop/requestForReturn', auth.isLogin,  userController.requestForReturn)

router.get('/shop/orderComplete', auth.isLogin,  userController.orderComplete)

router.get('/address', auth.isLogin, userController.address)
router.post('/address/addAddress', auth.isLogin, userController.createAddress)
router.post('/address/deleteAddress', auth.isLogin, userController.deleteAddress)
router.post('/address/editAddress', auth.isLogin, userController.editAddress)

router.get('/profile', auth.isLogin, userController.profile)
router.post('/profile/editProfile', auth.isLogin, userController.editProfile)
router.get('/profile/changePassword', auth.isLogin, auth.isGoogleUser, userController.changePassword)
router.post('/profile/changePassword', auth.isLogin, auth.isGoogleUser, userController.changePassword)

router.get('/profile/order', auth.isLogin, userController.order)
router.get('/profile/order/getOrderById', auth.isLogin, userController.getOrderById)
router.get('/profile/order/orderDetail', auth.isLogin, userController.orderDetail)
router.get('/profile/order/itemDetail', auth.isLogin, userController.orderItemDetail)
router.get('/profile/order/itemDetail/trackOrder', auth.isLogin, userController.trackOrder)


router.post('/profile/order/payNowOrder', auth.isLogin,  userController.createPayNowOrder)


router.get('/profile/wallet', auth.isLogin, userController.wallet)
router.post('/profile/wallet/createOrder', auth.isLogin, userController.createWalletPaymentOrder)
router.post('/profile/wallet/addMoney', auth.isLogin, userController.addMoneyToWallet)


router.get('/signin',  auth.isLogout, userController.signin)

router.post('/signin',  auth.isLogout, userController.signin)

router.get('/logout', auth.isLogin, userController.logout)

router.get('/password/reset', auth.isLogout, userController.resetPassword)
router.post('/password/reset', auth.isLogout, userController.resetPassword)


router.get('/password/reset/request', auth.isLogout, userController.resetPasswordEmail)
router.post('/password/reset/request', auth.isLogout, userController.resetPasswordEmail)

router.get('/signup',  auth.isLogout, userController.signup)

router.post('/signup', auth.isLogout,  userController.signup)

router.get('/signup/otp', auth.isLogout,  userController.otp)

router.post('/signup/otp/email',  auth.isLogout, userController.otpMailSender)

router.post('/signup/otp/verify', userController.verifyOtp)



module.exports = router;