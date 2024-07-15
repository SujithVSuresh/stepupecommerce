const User = require("../models/userModel");
const Product = require("../models/productModel");
const Subvarient = require("../models/subVarientModel");
const Varient = require("../models/varientModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModal");
const Wishlist = require("../models/wishlistModel");
const Coupon = require("../models/couponModel");
const Wallet = require("../models/walletModel");
const Categoryoffer = require("../models/categoryOfferModel");
const Productoffer = require("../models/productOfferModel");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RAZORPAY_ID_KEY = process.env.RAZORPAY_ID_KEY;
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY;

// Creating razorpay instance
const razorpayInstance = new Razorpay({
  key_id: "rzp_test_3v8uE4x50656nf",
  key_secret: "s0gjaedeIT4genxOVInUe4VI",
});

const bcrypt = require("bcrypt");
const sendMail = require("../util/mailSender");

const generateOtp = require("../util/generateOtp");
const { category } = require("./adminController");

const findTotalAmount = (item, discount = 0, limit = 0, minOrderAmount = 0) => {
  let totalPrice = 0;
  let shippingPrice = 0;
  let totalAmount = 0;
  let couponDiscount = 0;

  if (item.length != 0) {
    item.forEach((k) => {
      totalPrice += k.quantity * k.subVarientId.price;
    });

    shippingPrice = totalPrice >= 1000 ? 0 : 50;

    if (discount > 0 && totalPrice >= minOrderAmount) {
      let percentageAmount = (totalPrice * discount) / 100;
      couponDiscount = percentageAmount > limit ? limit : percentageAmount;
    }

    totalAmount = totalPrice - couponDiscount + shippingPrice;
  }

  return { totalPrice, shippingPrice, couponDiscount, totalAmount };
};

function checkCategoryOffer(categoryOffers, product) {
  try {
    let offerCategory = categoryOffers.filter((item) => {
      if (item.categoryId.toString() == product.category._id.toString()) {
        return item;
      }
    });

    if (offerCategory.length != 0) {
      return offerCategory[0].percentage;
    }

    return;
  } catch (error) {
    console.log(error);
  }
}

function checkProductOffer(productOffers, product) {
  let offerProduct = productOffers.filter((item) => {
    if (item.productId.toString() == product._id.toString()) {
      return item;
    }
  });

  if (offerProduct.length != 0) {
    return offerProduct[0].percentage;
  }

  return;
}

function selectOffer(categoryOffer, productOffer) {
  let offer;

  if (categoryOffer && productOffer) {
    offer = categoryOffer > productOffer ? categoryOffer : productOffer;
  } else if (categoryOffer && !productOffer) {
    offer = categoryOffer;
  } else if (productOffer && !categoryOffer) {
    offer = productOffer;
  } else {
    offer = 0;
  }

  return offer;
}

function calculateOffer(item, percentage) {
  const result = (percentage / 100) * item.price;
  if (result) {
    return item.price - Math.round(result);
  }
  return;
}

async function applyOfferForCart(userId) {
  try {
    const categoryOffers = await Categoryoffer.find({});
    const productOffers = await Productoffer.find({});

    // let cart = await Cart.findOne({ userId: userId }).populate([
    //   {
    //     path: "items.productId",
    //     populate: [
    //       { path: "varient" },
    //       { path: "product", populate: { path: "category" } },
    //     ],
    //   },
    //   { path: "userId" },
    // ]);
    let cart = await Cart.findOne({ userId: userId }).populate([
      {
      path: 'items.productId',
      populate: [
        {
          path: 'category'
        },
        {
          path: 'brand'
        }
      ]
      }
    ]);


    let cartItems = cart.items.map((item) => {
      let categoryOffer = checkCategoryOffer(
        categoryOffers,
        item.productId
      );
      let productOffer = checkProductOffer(
        productOffers,
        item.productId
      );
      let offer = selectOffer(categoryOffer, productOffer);

      let varient = item.productId.varient.find((v) => v._id.toString() == item.varientId);
      let subVarient = varient.subVarient.find(
        (sv) => sv._id.toString() == item.subVarientId
      );

      let offerAmount = calculateOffer(subVarient, offer);

      // return {
      //   ...item._doc,
      //   productId: {
      //     ...item.productId._doc,
      //     price: offerAmount ? offerAmount : item.productId.price,
      //   },
      // };
      return {
        ...item._doc,
        productId: {
          ...item.productId._doc,
          
        },
        varientId: {
          ...varient._doc
        },
        subVarientId: {
          ...subVarient._doc,
          price: offerAmount ? offerAmount : subVarient.price,
        }
      };
    });

    return { ...cart._doc, items: [...cartItems] };
  } catch (error) {
    console.log(error);
  }
}

const home = async (req, res) => {
  

  const categoryOffers = await Categoryoffer.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $addFields: {
        categoryId: { $arrayElemAt: ["$category", 0] },
      },
    },
  ]);

  const products = await Product.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $gt: [{ $size: "$varient" }, 0] },
            {
              $gt: [{ $size: { $arrayElemAt: ["$varient.subVarient", 0] } }, 0],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $addFields: {
        category: { $arrayElemAt: ["$category", 0] },
      },
    },
    {
      $sort: {
        date: -1,
      },
    },
    {
      $limit: 10,
    },
  ]);


  try {
    res.render("user/home", {
      newArrivals: products,
      categoryOffers: categoryOffers,
      isLogin: req.session.userId || req.session.gUser ? true : false,
      cartCount: req.session.userId ? req.session.cartCount : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

let googleSuccess = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.user.emails[0].value });

    console.log("green", req.user);
    if (!user) {
      user = new User({
        firstName: req.user.name.givenName,
        lastName: req.user.name.familyName,
        email: req.user.emails[0].value,
        isBlocked: false,
        referral: uuidv4(),
        dateJoined: Date(),
      });
      await user.save();
    }

    if (user && user.isBlocked) {
      return res.status(403).redirect("/signin");
    }

    const cart = await Cart.findOne({ userId: user._id });

    req.session.cartCount = cart?.items?.length ? cart.items.length : 0;

    req.session.userId = user._id;
    req.session.gUser = true;

    res.redirect("/");
  } catch (error) {
    console.error("Error during user logic:", error);
    return done(error);
  }
};

const signup = async (req, res) => {
  try {
    if (req.method == "GET") {
      console.log("12345", req.query.referralCode)
      
      res.render("user/signup", { isLogin: false, referralCode: req.query.referralCode ? req.query.referralCode : ""  });
    }

    if (req.method == "POST") {
      const { fname, lname, email, phone, password, referral } = req.body;

      

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      req.session.user = {
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
        password: hashedPassword,
      };

      const otp = await generateOtp();

      req.session.otp = otp;

      const mailResponse = await sendMail(
        email,
        "Verification Email",
        `This is your OTP ${otp}`
      );

      if(referral){
      req.session.referralCode = referral
      }

      res.status(200).json({ message: "User created successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/signin", { isLogin: false });
    }

    if (req.method == "POST") {
      const { email, password } = req.body;
      console.log(email, password);

      const user = await User.findOne({
        email: email,
        password: { $exists: true },
      });

      if (user && user.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account has been blocked." });
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        req.session.userId = user._id;

        const cart = await Cart.findOne({ userId: user._id });

        req.session.cartCount = cart?.items?.length ? cart?.items?.length : 0;

        const redirectTo = req.session.redirectTo || "/";
        delete req.session.redirectTo;

        res
          .status(200)
          .json({ message: "login successfull", redirectTo: redirectTo });
      } else {
        res
          .status(404)
          .json({ message: "No user found with these credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
    if (req.session.userId) {
      delete req.session.userId;
    } else if (req.session.gUser) {
      delete req.session.gUser;
    }

    res.redirect("/signin");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const otp = async (req, res) => {
  try {
    res.render("user/otp", { isLogin: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (req.method == "GET") {
      const resetPasswordToken = req.query.resetPasswordToken;
      if (req.session.resetPassword.resetPasswordToken == resetPasswordToken) {
        res.render("user/resetPassword", { isLogin: false, cartCount: 0 });
      } else {
        console.log("token doesn't match");
      }
    }

    if (req.method == "POST") {
      const { password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.findOne({
        email: req.session.resetPassword.resetPasswordEmail,
      });

      if (user && user.password) {
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ msg: "Password changed successfully" });
      } else if (user && !user.password) {
        return res.status(409).json({
          msg: "User with this account belongs to googlee authentication. Changing password is not possible.",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPasswordEmail = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/resetPasswordEmail", { isLogin: false, cartCount: 0 });
    }

    if (req.method == "POST") {
      const { email } = req.body;

      const user = await User.findOne({ email: email });

      if (user) {
        const resetPasswordToken = uuidv4();

        req.session.resetPassword = {
          resetPasswordToken: resetPasswordToken,
          resetPasswordEmail: email,
        };

        // Send reset email
        const mailResponse = await sendMail(
          email,
          "Password Reset Email",
          `Reset your password with the link http://localhost:3000/password/reset?resetPasswordToken=${resetPasswordToken}`
        );
      }

      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const otpMailSender = async (req, res) => {
  try {
    const email = req.session.user.email;
    const otp = await generateOtp();

    req.session.otp = otp;

    const mailResponse = await sendMail(
      email,
      "Verification Email",
      `This is your OTP ${otp}`
    );

    if (mailResponse) {
      res.status(200).json({ msg: "mail send successfully" });
    } else {
      res.status(500).json({ msg: "mail not send successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    if (req.session.otp == req.body.otpVal) {
      const newUser = new User({
        firstName: req.session.user.fname,
        lastName: req.session.user.lname,
        email: req.session.user.email,
        phone: req.session.user.phone,
        password: req.session.user.password,
        isBlocked: false,
        referral: uuidv4(),
        dateJoined: Date(),
      });

      await newUser.save();

      if(req.session.referralCode){
        const referral = req.session.referralCode
        console.log("haveelss", referral);

        const user = await User.findOne({referral: referral})

        if(user){
          let wallet = await Wallet.findOne({userId: user._id})
          if(!wallet){
              wallet = new Wallet({
                userId: user._id,
                balance: 0,
                history: [],
              });
              await wallet.save();
          }
          wallet.history.push({
            type: "credit",
            amount: 100,
            description: "Referral amount",
          });
          wallet.balance += 100;
          await wallet.save();


         let newUserWallet = await Wallet.findOne({userId: newUser._id})
         if(!newUserWallet){
          newUserWallet = new Wallet({
            userId: newUser._id,
            balance: 0,
            history: [],
          });
          newUserWallet.history.push({
            type: "credit",
            amount: 50,
            description: "Referral amount",
          });
          newUserWallet.balance += 50;
          await newUserWallet.save();
         }
        }
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        } else {
          console.log("Session destroyed");
        }
      });
      res.status(200).json({ msg: "User created & verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const shop = async (req, res) => {
  try {
    if (req.method === "GET") {
      const cartCount = req.session.cartCount;

      const filterCategory = await Category.find({ isDelete: false });
      const filterBrand = await Brand.find({});

      res.render("user/shop", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
        filterCategory,
        filterBrand,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const items = async (req, res) => {
//     try{
//     if(req.method === "GET"){
//         let varients = await Varient.find({}).populate("product");

//         let products = await Product.find({}).populate("category");

//         let subVarients = await Subvarient.find({})

//         res.status(200).json({varients: varients, products: products, subVarients: subVarients})

//     }
// } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

// const items = async (req, res) => {
//   try {
//     if (req.method === "GET") {
//       const sort = req.query.sort;

//       const search = req.query.search.toLowerCase();
//       const categories = req.query.category.split(",");
//       const brands = req.query.brand.split(",");
//       const gender = req.query.gender.split(",");
//       const color = req.query.color.split(",");
//       const size = req.query.size.split(",");
//       const price = req.query.price.split(",");

//       let products = await Product.find({ isDelete: false })
//         .populate("category")
//         .populate("brand");

//       let varients = await Varient.find({}).populate("product");
//       let subVarients = await Subvarient.find({});

//       const categoryOffers = await Categoryoffer.find({});
//       const productOffers = await Productoffer.find({});

//       const findingProductWithVarient = await Promise.all(
//         products.map(async (item) => {
//           const sub = await Subvarient.findOne({ product: item._id });
//           return sub ? item : null;
//         })
//       );

//       const productsWithVarients = findingProductWithVarient.filter(
//         (item) => item !== null
//       );

//       let mappedProduct = productsWithVarients.map((product) => {

//         let categoryOffer = checkCategoryOffer(categoryOffers, product);
//         let productOffer = checkProductOffer(productOffers, product);

//         let offer = selectOffer(categoryOffer, productOffer);

//         let filteredVarients = varients
//           .filter(
//             (varient) =>
//               varient.product._id.toString() === product._id.toString()
//           )
//           .map((varient) => {
//             let filteredSubvarients = subVarients.filter(
//               (subVarient) =>
//                 subVarient.varient.toString() === varient._id.toString()
//             );
//             let finalSubVarient = filteredSubvarients.map((item) => {
//               let offerAmount = offer ? calculateOffer(item, offer) : 0;

//               return { ...item._doc, offerAmount: offerAmount };
//             });
//             return { ...varient._doc, subVarients: finalSubVarient };
//           });

//         return {
//           ...product._doc,
//           varients: filteredVarients,
//           offerPercentage: offer ? offer : 0,
//         };
//       });

//       let filteredProducts = mappedProduct;

//       if (categories[0] != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           if (categories.includes(product.category.categoryName)) {
//             return product;
//           }
//         });
//       }

//       if (brands[0] != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           if (brands.includes(product.brand.name)) {
//             return product;
//           }
//         });
//       }

//       if (gender[0] != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           if (gender.includes(product.gender)) {
//             return product;
//           }
//         });
//       }

//       if (color[0] != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           let filterVarients = product.varients.filter((varient) => {
//             if (color.includes(varient.colorName.toLowerCase())) {
//               return varient;
//             }
//           });

//           if (filterVarients.length != 0) {
//             return product;
//           }
//         });
//       }

//       if (size[0] != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           let count = 0;

//           product.varients.forEach((varient) => {
//             let filterSubVarients = varient.subVarients.filter((item) => {
//               if (size.includes(item.size)) {
//                 return item;
//               }
//             });

//             if (filterSubVarients.length != 0) {
//               count++;
//             }
//           });

//           if (count > 0) {
//             return product;
//           }
//         });
//       }

//       if (price[0] != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           let count = 0;

//           product.varients.forEach((varient) => {
//             let filterSubVarients = varient.subVarients.filter((item) => {
//               if (price.includes("0-500")) {
//                 if (item.price >= 1 && item.price <= 500) {
//                   return item;
//                 }
//               } else if (price.includes("501-1000")) {
//                 if (item.price >= 501 && item.price <= 1000) {
//                   return item;
//                 }
//               } else if (price.includes("1001-1500")) {
//                 if (item.price >= 1001 && item.price <= 1500) {
//                   return item;
//                 }
//               } else if (price.includes("1501-2000")) {
//                 if (item.price >= 1501 && item.price <= 2000) {
//                   return item;
//                 }
//               } else if (price.includes("2001-2500")) {
//                 if (item.price >= 2001 && item.price <= 2500) {
//                   return item;
//                 }
//               } else if (price.includes("2501-3000")) {
//                 if (item.price >= 2501 && item.price <= 3000) {
//                   return item;
//                 }
//               } else if (price.includes("3001-10000")) {
//                 if (item.price >= 3001) {
//                   return item;
//                 }
//               }
//             });

//             if (filterSubVarients.length != 0) {
//               count++;
//             }
//           });

//           if (count > 0) {
//             return product;
//           }
//         });
//       }

//       if (search != "") {
//         filteredProducts = filteredProducts.filter((product) => {
//           if (product.modelName.toLowerCase().includes(search)) {
//             return product;
//           }
//         });
//       }

//       if (sort == "name-atoz") {
//         console.log("sort,", sort);
//         filteredProducts.sort((a, b) => {
//           if (a.modelName < b.modelName) {
//             return -1;
//           }
//           if (a.modelName > b.modelName) {
//             return 1;
//           }
//           return 0;
//         });
//       } else if (sort == "name-ztoa") {
//         console.log("sort123,", sort, filteredProducts);
//         filteredProducts.sort((a, b) => {
//           if (a.modelName > b.modelName) {
//             return -1;
//           }
//           if (a.modelName < b.modelName) {
//             return 1;
//           }
//           return 0;
//         });
//       } else if (sort == "price-asc") {
//         console.log(filteredProducts);
//         filteredProducts.sort(
//           (a, b) =>
//             a.varients[0].subVarients[0].price -
//             b.varients[0].subVarients[0].price
//         );
//       } else if (sort == "price-desc") {
//         console.log(filteredProducts);
//         filteredProducts.sort(
//           (a, b) =>
//             b.varients[0].subVarients[0].price -
//             a.varients[0].subVarients[0].price
//         );
//       } else {
//         filteredProducts.sort((a, b) => b.date - a.date);
//       }

//       // Pagenation

//       const page = parseInt(req.query.page) || 1;
//       const limit = 9;

//       const skip = (page - 1) * limit;

//       const totalProducts = filteredProducts.length;
//       const totalPages = Math.ceil(totalProducts / limit);

//       const paginatedProducts = filteredProducts.slice(skip, skip + limit);

//       res.status(200).json({
//         products: paginatedProducts,
//         totalPages: totalPages,
//         currentPage: page,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const items = async (req, res) => {
  try {
    if (req.method === "GET") {
      const sort = req.query.sort;

      const search = req.query.search.toLowerCase();
      const categories = req.query.category.split(",");
      const brands = req.query.brand.split(",");
      const gender = req.query.gender.split(",");

      const pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                { $gt: [{ $size: "$varient" }, 0] },
                {
                  $gt: [
                    { $size: { $arrayElemAt: ["$varient.subVarient", 0] } },
                    0,
                  ],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        {
          $lookup: {
            from: "productoffers",
            localField: "_id",
            foreignField: "productId",
            as: "prooffers",
          },
        },
        {
          $lookup: {
            from: "categoryoffers",
            localField: "category",
            foreignField: "categoryId",
            as: "catoffers",
          },
        },
        {
          $addFields: {
            coff: { $arrayElemAt: ["$catoffers", 0] },
            poff: { $arrayElemAt: ["$prooffers", 0] },
            category: { $arrayElemAt: ["$category", 0] },
            brand: { $arrayElemAt: ["$brand", 0] },
          },
        },
        {
          $addFields: {
            maxOffer: {
              $max: [
                { $ifNull: [{ $max: "$poff.percentage" }, 0] },
                { $ifNull: [{ $max: "$coff.percentage" }, 0] },
              ],
            },
          },
        },
      ];

      if (categories[0] != "") {
        pipeline.push({
          $match: {
            "category.categoryName": { $in: categories },
          },
        });
      }

      if (brands[0] != "") {
        pipeline.push({
          $match: {
            "brand.name": { $in: brands },
          },
        });
      }

      if (gender[0] != "") {
        pipeline.push({
          $match: {
            gender: { $in: gender },
          },
        });
      }

      if (search != "") {
        pipeline.push({
          $match: {
            modelName: { $regex: search, $options: "i" },
          },
        });
      }

      if (sort == "name-atoz") {
        pipeline.push({
          $sort: {
            modelName: 1,
          },
        });
      } else if (sort == "name-ztoa") {
        pipeline.push({
          $sort: {
            modelName: -1,
          },
        });
      } else if (sort == "price-asc") {
        pipeline.push({
          $sort: {
            "varient.0.subVarient.0.price": 1,
          },
        });
      } else if (sort == "price-desc") {
        pipeline.push({
          $sort: {
            "varient.0.subVarient.0.price": -1,
          },
        });
      } else {
        pipeline.push({
          $sort: {
            date: -1,
          },
        });
      }

      const productsWithOffers = await Product.aggregate(pipeline);

      console.log("ll", productsWithOffers);

      const page = parseInt(req.query.page) || 1;
      const limit = 2;

      const skip = (page - 1) * limit;

      const totalProducts = productsWithOffers.length;
      const totalPages = Math.ceil(totalProducts / limit);

      pipeline.push({
        $skip: skip,
      });

      pipeline.push({
        $limit: limit,
      });

      const productsWithOffers2 = await Product.aggregate(pipeline);

      console.log("ll", productsWithOffers2);

      res.status(200).json({
        products: productsWithOffers2,
        totalPages: totalPages,
        currentPage: page,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const relatedProducts = async (req, res) => {
  try {
    if (req.method == "GET") {
      let productId = req.query.pid;
      console.log("givennnn");

      const product = await Product.findOne({ _id: productId }, {category: 1});

      const products = await Product.aggregate([
        {
          $match: {
            category: product.category,
            $expr: {
              $and: [
                { $gt: [{ $size: "$varient" }, 0] },
                {
                  $gt: [{ $size: { $arrayElemAt: ["$varient.subVarient", 0] } }, 0],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $addFields: {
            category: { $arrayElemAt: ["$category", 0] },
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $limit: 10,
        },
      ]);

      res.status(200).json({relatedProducts: products})
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productDetailsPage = async (req, res) => {
  try {
    if (req.method === "GET") {
      let productId = req.params.productId;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(404).render("user/forNotFor");
      }

      console.log("productId", productId);

      // let subVarient = await Subvarient.findOne({
      //   product: productId,
      // }).populate("varient");
      const product = await Product.findById(productId);

      if (!product.varient[0].subVarient[0]._id) {
        return res.status(404).render("user/forNotFor");
      }

      res.render("user/product-detail", {
        productId: productId,
        varientId: product.varient[0]._id,
        isLogin: true,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productDetails = async (req, res) => {
  try {
    if (req.method === "GET") {
      let productId = req.query.pid;
      let varientId = req.query.vid;
      let subVarientId = req.query.svid;

      if (subVarientId && productId && varientId) {
        const product = await Product.findById(productId);

        const variant = product.varient.find((v) => {
          return v._id.toString() === varientId;
        });

        const selectedSubVarientDetails = variant.subVarient.find((sv) => {
          return sv._id.toString() === subVarientId;
        });

        const categoryOffer = await Categoryoffer.findOne({
          categoryId: product.category._id,
        });
        const productOffer = await Productoffer.findOne({
          productId: product._id,
        });

        let offer = selectOffer(
          categoryOffer ? categoryOffer.percentage : null,
          productOffer ? productOffer.percentage : null
        );

        const offerAmount = offer
          ? calculateOffer(selectedSubVarientDetails, offer)
          : 0;

        res.status(200).json({
          subVarient: {
            ...selectedSubVarientDetails._doc,
            offerAmount: offerAmount,
          },
          product: { ...product._doc, offer: offer ? offer : 0 },
        });
      }

      if (productId && varientId && !subVarientId) {
        let product = await Product.findOne({ _id: productId }).populate(
          "category"
        );

        const categoryOffer = await Categoryoffer.findOne({
          categoryId: product.category._id,
        });
        const productOffer = await Productoffer.findOne({
          productId: product._id,
        });

        let offer = selectOffer(
          categoryOffer ? categoryOffer.percentage : null,
          productOffer ? productOffer.percentage : null
        );

        const varientsWithSubVarient = product.varient.filter(
          (varient) => varient.subVarient.length > 0
        );

        let selectedVarients = product.varient.filter(
          (v) => v._id.toString() == varientId
        );

        let finalSelectedSubVarient = selectedVarients[0].subVarient.map(
          (item) => {
            let offerAmount = offer ? calculateOffer(item, offer) : 0;

            return { ...item._doc, offerAmount: offerAmount };
          }
        );

        res.status(200).json({
          product: { ...product._doc, offer: offer ? offer : 0 },
          allVarients: varientsWithSubVarient,
          selectedVarients: selectedVarients,
          selectedSubVarients: finalSelectedSubVarient,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cart = async (req, res) => {
  try {
    if (req.method == "GET") {
      const coupons = await Coupon.find({});

      if (req.session.coupon) {
        delete req.session.coupon;
      }

      res.render("user/cart", {
        coupons: coupons,
        isLogin: true,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addedtoCartProducts = async (req, res) => {
  try {
    if (req.method == "GET") {
      let userId = req.session.userId;
      let coupon = req.session.coupon;

      // const cart = await applyOfferForCart(userId)
      // const categoryOffers = await Categoryoffer.find({});
      // const productOffers = await Productoffer.find({});

      // let cartData = await Cart.findOne({ userId: userId }).populate([
      //   {
      //     path: "items.productId",
      //     populate: [
      //       { path: "varient" },
      //       { path: "product", populate: { path: "category" } },
      //     ],
      //   },
      //   { path: "userId" },
      // ]);

      // let cartItems = cartData.items.map((item) => {
      //   let categoryOffer = checkCategoryOffer(categoryOffers, item.productId.product)
      //   let productOffer = checkProductOffer(productOffers, item.productId.product)
      //   let offer = selectOffer(categoryOffer, productOffer)
      //   let offerAmount = calculateOffer(item.productId, offer)

      //   return {...item._doc, productId: {...item.productId._doc, price: offerAmount}}
      // });

      // const cart = {...cartData._doc, items: [...cartItems]}

      const cart = await applyOfferForCart(userId);

      console.log("my log,", cart.items[0].subVarientId);

      let totalAmountDetails = findTotalAmount(
        cart.items,
        coupon ? coupon.discountPercentage : 0,
        coupon ? coupon.maxOfferLimit : 0,
        coupon ? coupon.minOrderAmount : 0
      );

      console.log(totalAmountDetails, "toootooal");

      return res.status(200).json({ cartData: cart, totalAmountDetails });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cartQtyManagement = async (req, res) => {
  try {
    if (req.method == "POST") {
      let userId = req.session.userId;
      let coupon = req.session.coupon;

      const { itemId: itemId, qtyUpdateIdentifier: qtyUpdateIdentifier } =
        req.body;

      const cart = await Cart.findOne({ userId: userId }).populate([
        { path: "items.productId" },
      ]);

      const itemIndex = cart.items.findIndex((item) => item._id == itemId);

      if (itemIndex >= 0) {
        const varient = cart.items[itemIndex].productId.varient.find((v) => v._id.toString() == cart.items[itemIndex].varientId)
        const subVarient = varient.subVarient.find((sv) => sv._id.toString() == cart.items[itemIndex].subVarientId)

        if (qtyUpdateIdentifier == 0) {
          if (cart.items[itemIndex].quantity <= 1) {
            return res.status(409).json({
              message: "Quantity limit subceeded",
            });
          }

          if (
            subVarient.quantity <
            cart.items[itemIndex].quantity
          ) {
            cart.items[itemIndex].quantity =
              subVarient.quantity
          } else {
            cart.items[itemIndex].quantity -= 1;
          }
          await cart.save();

          const cartData = await applyOfferForCart(userId);

          let totalAmountDetails = findTotalAmount(
            cartData.items,
            coupon ? coupon.discountPercentage : 0,
            coupon ? coupon.maxOfferLimit : 0,
            coupon ? coupon.minOrderAmount : 0
          );

          return res.status(200).json({
            message: "Item quantity decremented successfully",
            updatedItem: cartData.items[itemIndex],
            cartItem: cartData.items,
            totalAmountDetails,
            couponValid:
              req.session.coupon && totalAmountDetails.couponDiscount == 0
                ? false
                : true,
          });
        } else if (qtyUpdateIdentifier == 1) {
          if (cart.items[itemIndex].quantity >= 10) {
            return res.status(409).json({
              message: "Quantity limit exceeded",
            });
          } else if (
            cart.items[itemIndex].quantity >=
            subVarient.quantity
          ) {
            return res.status(409).json({
              message: `Insufficient stock. Available stock: ${cart.items[itemIndex].productId.quantity}`,
            });
          }
          cart.items[itemIndex].quantity += 1;
          await cart.save();

          const cartData = await applyOfferForCart(userId);

          let totalAmountDetails = findTotalAmount(
            cartData.items,
            coupon ? coupon.discountPercentage : 0,
            coupon ? coupon.maxOfferLimit : 0,
            coupon ? coupon.minOrderAmount : 0
          );

          return res.status(200).json({
            message: "Item quantity incremented successfully",
            updatedItem: cartData.items[itemIndex],
            cartItem: cartData.items,
            totalAmountDetails,
            couponValid:
              req.session.coupon && totalAmountDetails.couponDiscount == 0
                ? false
                : true,
          });
        }
      }

      //res.status(200).json({ cartData:  cart});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const couponApply = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { code } = req.body;

    let coupon = await Coupon.findOne({ couponCode: code });

    if (!coupon) {
      return res
        .status(404)
        .json({ error: "No active coupon with this coupon code exists." });
    }

    // const cart = await Cart.findOne({ userId: userId }).populate([
    //   { path: "items.productId" },
    // ]);
    const cart = await applyOfferForCart(userId);

    if (!cart) {
      return res.status(404).json({ error: "Cannot apply coupon" });
    }

    let apply = findTotalAmount(
      cart.items,
      coupon.discountPercentage,
      coupon.maxOfferLimit
    );

    if (apply.totalPrice < coupon.minOrderAmount) {
      return res
        .status(409)
        .json({ error: "This coupon doesn't match the minimum order amount" });
    }

    req.session.coupon = coupon;
    return res.status(200).json({
      message: "Coupon applied successfully",
      data: apply,
      coupon: coupon,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeCoupon = async (req, res) => {
  try {
    let userId = req.session.userId;

    if (req.session.coupon) {
      delete req.session.coupon;

      // const cart = await Cart.findOne({ userId: userId }).populate([
      //   { path: "items.productId" },
      // ]);

      const cart = await applyOfferForCart(userId);

      if (!cart) {
        return res.status(404).json({ message: "Cannot remove cooupon" });
      }

      let totalAmountDetails = findTotalAmount(cart.items);

      return res.status(200).json({
        message: "Coupon removed successfully.",
        totalAmountDetails: totalAmountDetails,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { productId, varientId, subVarientId, quantity } = req.body;

      const userId = req.session.userId;

      let cart = await Cart.findOne({ userId });

      let productQuantity = Number(quantity);

      let product = await Product.findById(productId);
      let varient = product.varient.find((v) => v._id.toString() == varientId);
      let subVarient = varient.subVarient.find(
        (sv) => sv._id.toString() == subVarientId
      );

      // let subVarient = await Subvarient.findOne({ _id: productId });

      if (subVarient && quantity > subVarient.quantity) {
        if (subVarient.quantity == 0) {
          return res.status(409).json({ message: `Out of stock` });
        }

        return res.status(409).json({
          message: `Only ${subVarient.quantity} items available in stock`,
        });
      }

      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const productIndex = cart.items.findIndex((item) =>
        item.subVarientId.equals(subVarientId)
      );

      if (productIndex > -1) {
        return res
          .status(409)
          .json({ message: "Product already exists in cart", cart });
      } else {
        cart.items.push({
          productId: productId,
          varientId: varientId,
          subVarientId: subVarientId,
          quantity: productQuantity,
        });
        await cart.save();
        if (req.session.cartCount) {
          req.session.cartCount += 1;
        } else {
          req.session.cartCount = 1;
        }
        return res.status(200).json({
          message: "Product added to cart",
          cart,
          cartCount: req.session.cartCount,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { itemId } = req.body;
      const userId = req.session.userId;

      let wishlist = await Wishlist.findOne({ userId });

      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found." });
      }

      const productIndex = wishlist.items.findIndex((item) =>
        item._id.equals(itemId)
      );

      if (productIndex > -1) {
        await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { _id: itemId } } },
          { new: true }
        );
        return res
          .status(200)
          .json({ message: "Product removed from wishlist." });
      } else {
        return res
          .status(404)
          .json({ message: "Product does not exist in wishlist." });
      }
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { productId } = req.body;
      const userId = req.session.userId;

      let wishlist = await Wishlist.findOne({ userId });

      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      const productIndex = wishlist.items.findIndex((item) =>
        item.productId.equals(productId)
      );

      if (productIndex > -1) {
        // const message = await productRemoveFromWishlist(userId, productId)
        return res
          .status(409)
          .json({ message: "Product already exist in wishlist." });
      } else {
        wishlist.items.push({ productId: productId });
        await wishlist.save();

        return res
          .status(200)
          .json({ message: "Product added to wishlist.", code: "ADDED" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { itemId } = req.body;
      const userId = req.session.userId;
      const coupon = req.session.coupon;

      const cart = await Cart.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { _id: itemId } } },
        { new: true }
      ).populate("items.productId");

      if (cart) {
        if (req.session.cartCount) {
          req.session.cartCount -= 1;
        } else {
          req.session.cartCount = 0;
        }

        const cartData = await applyOfferForCart(userId);

        let totalAmountDetails = findTotalAmount(
          cartData.items,
          coupon ? coupon.discountPercentage : 0,
          coupon ? coupon.maxOfferLimit : 0,
          coupon ? coupon.minOrderAmount : 0
        );

        return res.status(200).json({
          message: "Item removed from cart.",
          cartData: cart,
          cartCount: req.session.cartCount,
          totalAmountDetails,
          couponValid:
            req.session.coupon && totalAmountDetails.couponDiscount == 0
              ? false
              : true,
        });
      } else {
        return res.status(404).send("Cart not found");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const wishlist = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const wishlistItems = await Wishlist.findOne({ userId }).populate([
        { path: "items.productId", populate: { path: "varient" } },
        { path: "items.productId", populate: { path: "product" } },
      ]);

      res.render("user/wishlist", {
        wishlistItems,
        isLogin: true,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;
      const coupon = req.session.coupon;

      const address = await Address.findOne({ userId: userId });

      const cart = await applyOfferForCart(userId);

      let totalAmountDetails = findTotalAmount(
        cart.items,
        coupon ? coupon.discountPercentage : 0,
        coupon ? coupon.maxOfferLimit : 0,
        coupon ? coupon.minOrderAmount : 0
      );

      res.render("user/checkout", {
        isLogin: true,
        address,
        cart,
        totalAmountDetails,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const profile = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const user = await User.findOne({ _id: userId });

      res.render("user/profile", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
        gUser: req.session.gUser ? true : false,
        user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;
      const { firstName, lastName, phoneNumber } = req.body;

      console.log(firstName, lastName, phoneNumber, "hooi");
      const user = await User.findOne({ _id: userId });

      if (user) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phoneNumber;
        await user.save();
        res
          .status(200)
          .json({ message: "Profile updated successfully.", data: user });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/changePassword", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
      });
    }

    if (req.method == "POST") {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId;

      const user = await User.findOne({
        _id: userId,
        password: { $exists: true },
      });

      const passwordChecker = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (user && passwordChecker) {
        user.password = newPassword;
        await user.save();
        return res
          .status(200)
          .json({ message: "Password changed successfully." });
      } else if (!passwordChecker) {
        return res
          .status(409)
          .json({ message: "The current password you entered is incorrect." });
      } else if (!user) {
        return res.status(409).json({ message: "User not found" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const address = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const address = await Address.findOne({ userId: userId });

      res.render("user/address", {
        address,
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------WALLET--------------------

const wallet = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const wallet = await Wallet.findOne({ userId: userId }).populate(
        "userId"
      );

      wallet.history.sort((a, b) => b.date - a.date);

      console.log(wallet);

      res.render("user/wallet", {
        wallet,
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createWalletPaymentOrder = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;
      const { amount } = req.body;

      let wallet = await Wallet.findOne({ userId: userId });

      if (!wallet) {
        wallet = new Wallet({
          userId: userId,
          balance: 0,
          history: [],
        });
        await wallet.save();
      }

      if (amount) {
        const currency = "INR";
        const receipt = uuidv4();

        razorpayInstance.orders.create(
          { amount: amount * 100, currency, receipt },
          (err, razOrder) => {
            if (!err) return res.status(200).json({ razOrder: razOrder });
            else return res.status(409).json({ message: err });
          }
        );
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addMoneyToWallet = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;
      const { amount } = req.body;

      let wallet = await Wallet.findOne({ userId: userId });

      if (!wallet) {
        return res.status(404).json({ message: "No wallet exist." });
      }

      wallet.history.push({
        type: "credit",
        amount: amount / 100,
        description: "Money added to wallet.",
      });

      wallet.balance += amount / 100;

      const recentTransaction = wallet.history[wallet.history.length - 1];

      await wallet.save();

      return res.status(200).json({
        message: "Money added to wallet.",
        transaction: recentTransaction,
        balance: balance,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const order = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const orders = await Order.find({ userId: userId }).sort({
        orderedDate: -1,
      });

      res.render("user/order", {
        orders,
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;
      const oid = req.query.oid;

      const order = await Order.findOne({ userId: userId, _id: oid });

      res.status(200).json({ order: order });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const orderDetail = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;
      const oid = req.query.oid;

      if (!mongoose.Types.ObjectId.isValid(oid)) {
        return res.status(404).render("user/forNotFor");
      }

      const order = await Order.findOne({ _id: oid });
      console.log(order);

      res.render("user/orderDetail", {
        order: order,
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const orderItemDetail = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;
      const orderId = req.query.oid || null;
      const itemId = req.query.itid || null;

      if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(itemId)
      ) {
        return res.status(404).render("user/forNotFor");
      }

      const order = await Order.findOne({ _id: orderId });

      const orderedItem = order.orderedItems.find((item) => item._id == itemId);

      const orderAddress = order.address;

      const oid = order.orderId;

      res.render("user/orderItemDetails", {
        orderId: orderId,
        orderShowId: order.orderId,
        itemId: itemId,
        orderAddress: orderAddress,
        oid: oid,
        orderedItem: orderedItem,
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAddress = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;
      const {
        fullName,
        state,
        cityDistrictTown,
        zipPostalCode,
        localityAreaStreet,
        housenoBuildingApartment,
        phone,
        landmark,
      } = req.body;

      let address = await Address.findOne({ userId });

      if (!address) {
        address = new Address({ userId: userId, address: [] });
      }

      address.address.push({
        name: fullName,
        state: state,
        cityDistrictTown: cityDistrictTown,
        pincode: zipPostalCode,
        localityAreaStreet: localityAreaStreet,
        housenoBuildingApartment: housenoBuildingApartment,
        phoneNumber: phone,
        landmark: landmark,
      });

      await address.save();

      return res.status(200).json({
        message: "Address created successfully.",
        data: address.address[address.address.length - 1],
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editAddress = async (req, res) => {
  try {
    if (req.method === "POST") {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const {
        fullName,
        state,
        cityDistrictTown,
        zipPostalCode,
        localityAreaStreet,
        housenoBuildingApartment,
        phone,
        landmark,
        addressId,
      } = req.body;

      if (!addressId) {
        return res.status(400).json({ error: "Address ID is required" });
      }

      const userAddress = await Address.findOne({ userId });

      if (!userAddress) {
        return res.status(404).json({ error: "User address not found" });
      }

      const findAddress = userAddress.address.find(
        (item) => item._id.toString() === addressId
      );

      if (!findAddress) {
        return res.status(404).json({ error: "Address not found" });
      }

      findAddress.name = fullName;
      findAddress.phoneNumber = phone;
      findAddress.pincode = zipPostalCode;
      findAddress.landmark = landmark;
      findAddress.state = state;
      findAddress.cityDistrictTown = cityDistrictTown;
      findAddress.localityAreaStreet = localityAreaStreet;
      findAddress.housenoBuildingApartment = housenoBuildingApartment;
      await userAddress.save();

      return res.status(200).json({
        message: "Address updated successfully.",
      });
    } else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;

      const { addressId } = req.body;

      const result = await Address.updateOne(
        { userId: userId },
        { $pull: { address: { _id: addressId } } }
      );

      if (result.modifiedCount === 0) {
        return res.status(409).json({ message: "No address found." });
      } else {
        return res
          .status(200)
          .json({ message: "Address deleted successfully." });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    const userId = req.session.userId;

    const coupon = req.session.coupon;

    const cart = await applyOfferForCart(userId);

    console.log("aama12324", cart.items);

    for (let item of cart.items) {
      if (item.subVarientId.quantity == 0) {
        return res
          .status(409)
          .json({ message: "Out of stock. Update cart to continue." });
      } else if (
        item.subVarientId.quantity != 0 &&
        item.subVarientId.quantity < item.quantity
      ) {
        return res
          .status(409)
          .json({ message: "Insufficient quantity. Update cart to continue." });
      }
    }

    const address = await Address.findOne(
      {
        userId: userId,
        address: { $elemMatch: { _id: deliveryAddress } },
      },
      { "address.$": 1 }
      // It will include only the first array elements that matches the condition.
    );

    const totalAmount = findTotalAmount(
      cart.items,
      coupon ? coupon.discountPercentage : 0,
      coupon ? coupon.maxOfferLimit : 0,
      coupon ? coupon.minOrderAmount : 0
    );

    if (paymentMethod == "COD" && totalAmount.totalAmount > 1000) {
      return res
        .status(409)
        .json({ message: "Order above ₹1000 is not allowed for COD" });
    }

    if (paymentMethod == "WALLET") {
      const wallet = await Wallet.findOne({ userId: userId });
      if (wallet.balance < totalAmount.totalAmount) {
        return res
          .status(409)
          .json({ message: "Insufficient Wallet Balance!" });
      }
    }

    async function createOrder(
      payment,
      amount = null,
      currency = null,
      receipt = null,
      notes = null
    ) {
      const order = new Order({
        userId: userId,
        orderedItems: [],
        address: {},
      });

      order.address.name = address.address[0].name;
      order.address.phoneNumber = address.address[0].phoneNumber;
      order.address.pincode = address.address[0].pincode;
      order.address.landmark = address.address[0].landmark;
      order.address.state = address.address[0].state;
      order.address.cityDistrictTown = address.address[0].cityDistrictTown;
      order.address.localityAreaStreet = address.address[0].localityAreaStreet;
      order.address.housenoBuildingApartment =
        address.address[0].housenoBuildingApartment;

      order.paymentMethod = paymentMethod;
      order.totalAmount = totalAmount.totalAmount;

      cart.items.forEach((item) => {
        order.orderedItems.push({
          productId: item.productId._id,
          varientId: item.varientId._id,
          subVarientId: item.subVarientId._id,
          modelName: item.productId.modelName,
          brand: item.productId.brand.name,
          gender: item.productId.gender,
          outerMaterial: item.productId.outerMaterial,
          soleMaterial: item.productId.soleMaterial,
          description: item.productId.description,
          category: item.productId.category.categoryName,
          quantity: item.quantity,
          price: item.subVarientId.price,
          color: item.varientId.colorName,
          size: item.subVarientId.size,
          image: item.varientId.images[0],
          orderStatus: payment == "COD" || "WALLET" ? "Ordered" : "Pending",
        });
      });

      await order.save();

      // Setting cart empty
      await Cart.updateOne({ userId: userId }, { $set: { items: [] } });

      // Updating header cart qty
      req.session.cartCount = 0;

      // Removing coupon data in session
      if (req.session.coupon) {
        delete req.session.coupon;
      }

      // Decrementing quantity.
      const orderById = await Order.findOne({ _id: order._id });

      for (const item of orderById.orderedItems) {
      let product = await Product.findById(item.productId)
      let varient = product.varient.find((v) => v._id.toString() == item.varientId)
      let subVarient = varient.subVarient.find((sv) => sv._id.toString() == item.subVarientId)

      let qtyDiff = subVarient.quantity - item.quantity
      subVarient.quantity = qtyDiff
      await product.save()
      }

      if (payment == "COD" || payment == "WALLET") {
        if (payment == "WALLET") {
          const wallet = await Wallet.findOne({ userId: userId });
          wallet.balance = wallet.balance - totalAmount.totalAmount;
          wallet.history.push({
            type: "debit",
            amount: totalAmount.totalAmount / 100,
            description: "Payment for order purchase",
          });
          await wallet.save();

          return res.status(200).json({
            message: "Order completed successfully.",
            pMethod: "WALLET",
            order: order,
          });
        } else if (payment == "COD") {
          return res.status(200).json({
            message: "Order completed successfully.",
            pMethod: "COD",
            order: order,
          });
        }
      } else if (payment == "ONLINE_PAYMENT") {
        razorpayInstance.orders.create(
          { amount, currency, receipt },
          (err, razOrder) => {
            if (!err)
              return res.status(200).json({
                message: "Order placed with pending status",
                razOrder: razOrder,
                order: order,
                pMethod: "ONLINE_PAYMENT",
                orderId: order._id,
              });
            else return res.send(err);
          }
        );
      }
    }
    if (paymentMethod == "COD") {
      createOrder("COD");
    } else if (paymentMethod == "ONLINE_PAYMENT") {
      let receipt1 = uuidv4();
      createOrder(
        "ONLINE_PAYMENT",
        totalAmount.totalAmount * 100,
        "INR",
        receipt1,
        (notes = "Payment for shoes purchase")
      );
    } else if (paymentMethod == "WALLET") {
      createOrder("WALLET");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPayNowOrder = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { orderId } = req.body;

      let order = await Order.findOne({ _id: orderId });

      if (order.totalAmount && order.paymentStatus == "Pending") {
        console.log("Insitialise payment");
        const currency = "INR";
        const receipt = uuidv4();

        razorpayInstance.orders.create(
          { amount: order.totalAmount * 100, currency, receipt },
          (err, razOrder) => {
            if (!err)
              return res.status(200).json({ razOrder: razOrder, order: order });
            else return res.status(409).json({ message: err });
          }
        );
      } else {
        return res.status(409).json({ message: "Payment cannot be done" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  if (req.method === "POST") {
    try {
      const userId = req.session.userId;
      const { orderId, orderItemId } = req.body;

      const order = await Order.findOne({ _id: orderId });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderItem = order.orderedItems.find(
        (item) => item._id.toString() === orderItemId
      );

      if (!orderItem) {
        return res.status(404).json({ error: "Order item not found" });
      }

      if (
        orderItem.orderStatus == "Cancelled" ||
        orderItem.orderStatus == "Delivered"
      ) {
        return res.status(409).json({ error: "Cannot cancel order" });
      }

      orderItem.orderStatus = "Cancelled";
      orderItem.cancelledDate = new Date();
      await order.save();

      const subVarient = await Subvarient.findOne({ _id: orderItem.productId });

      if (subVarient) {
        subVarient.quantity += orderItem.quantity;
        await subVarient.save();
      }

      if (order.paymentMethod != "COD") {
        let wallet = await Wallet.findOne({ userId: userId });

        if (!wallet) {
          wallet = new Wallet({ userId: userId, balance: 0, history: [] });
        }

        wallet.history.push({
          date: new Date(),
          type: "credit",
          amount: orderItem.price,
          description: "Refund for order cancellation",
        });
        wallet.balance += orderItem.price;

        await wallet.save();

        orderItem.paymentStatus = "Refunded";
        await order.save();
      }

      let count = 0;
      order.orderedItems.map((item) => {
        if (
          item.orderStatus == "Cancelled" ||
          item.orderStatus == "Delivered" ||
          item.orderStatus == "Returned"
        ) {
          count++;
        }
      });

      if (count == order.orderedItems.length) {
        order.orderStatus = "Completed";
        await order.save();
      }

      res.status(200).json({ message: "Order item cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

const requestForReturn = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { orderId, orderItemId, reason } = req.body;

      const order = await Order.findOne({ _id: orderId });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderItem = order.orderedItems.find(
        (item) => item._id.toString() === orderItemId
      );

      if (!orderItem) {
        return res.status(404).json({ error: "Order item not found" });
      }

      if (orderItem.orderStatus != "Delivered") {
        return res.status(409).json({ error: "Cannot return the item" });
      }

      orderItem.orderStatus = "REQUESTED_FOR_RETURN";
      orderItem.reasonForReturn = reason;
      orderItem.requestedDate = new Date();
      await order.save();

      let count = 0;
      order.orderedItems.map((item) => {
        if (
          item.orderStatus == "Cancelled" ||
          item.orderStatus == "Delivered" ||
          item.orderStatus == "Returned"
        ) {
          count++;
        }
      });
      if (count == order.orderedItems.length) {
        order.orderStatus = "Completed";
        await order.save();
      } else {
        order.orderStatus = "Pending";
        await order.save();
      }

      res
        .status(200)
        .json({ message: "Request for return submitted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

const orderComplete = async (req, res) => {
  try {
    if (req.method == "GET") {
      let orderId = req.query.oid;

      let order = await Order.findOne({ _id: orderId });

      if (
        order.paymentMethod == "ONLINE_PAYMENT" ||
        order.paymentMethod == "WALLET"
      ) {
        // to update all the orderStatus and paymentStatus.
        await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              "orderedItems.$[].orderStatus": "Ordered",
              "orderedItems.$[].paymentStatus": "Success",
            },
          }
        );

        order.paymentStatus = "Success";
        order.orderStatus = "Ordered";
        await order.save();
      }

      res.render("user/orderComplete", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  home,
  signin,
  signup,

  otp,
  otpMailSender,
  verifyOtp,
  resetPassword,
  resetPasswordEmail,
  shop,
  items,
  productDetailsPage,
  productDetails,
  logout,
  cart,
  addToCart,
  addedtoCartProducts,
  cartQtyManagement,
  removeFromCart,
  checkout,
  profile,
  editProfile,
  changePassword,

  createAddress,
  address,
  deleteAddress,
  editAddress,
  order,
  orderDetail,
  getOrderById,
  orderItemDetail,

  placeOrder,
  cancelOrder,
  orderComplete,
  googleSuccess,
  wishlist,
  addToWishlist,
  removeFromWishlist,
  requestForReturn,

  createPayNowOrder,

  couponApply,
  removeCoupon,

  wallet,
  createWalletPaymentOrder,
  addMoneyToWallet,

  relatedProducts,
};
