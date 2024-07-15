const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModal");
const Varient = require("../models/varientModel");
const Subvarient = require("../models/subVarientModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const Coupon = require("../models/couponModel");
const Categoryoffer = require("../models/categoryOfferModel");
const Productoffer = require("../models/productOfferModel");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("admin/login", { isLogin: false });
    }

    if (req.method == "POST") {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email: email });
      //console.log(admin.password);

      if (admin && (await bcrypt.compare(password, admin.password))) {
        req.session.adminId = admin._id;
        req.session.adminName = admin.firstName + " " + admin.lastName;
        res.status(200).json({ message: "login successfull" });
      } else {
        res
          .status(404)
          .json({ message: "No user found with these email and password" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
    if (req.session.adminId) {
      delete req.session.adminId;
      delete req.session.adminName;
    }

    res.redirect("/admin");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const dashboard = async (req, res) => {
  try {
    const userCount = await User.find({}).count();
    const orderCount = await Order.find({}).count();
    const salesCount = await Order.aggregate([
      {
        $unwind: "$orderedItems",
      },
      {
        $match: {
          "orderedItems.orderStatus": "Delivered",
        },
      },
      {
        $count: "salesCount",
      },
    ]);
    console.log("jj", salesCount);

    const pendingOrdersCount = await Order.find({
      orderStatus: "Pending",
    }).count();

    const completedOrdersCount = await Order.find({
      orderStatus: "Completed",
    }).count();

    const topSellingProducts = await Order.aggregate([
      {
        $unwind: "$orderedItems",
      },
      {
        $group: {
          _id: "$orderedItems.productId",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: { count: 1 },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ["$product", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          "product.modelName": 1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    const topSellingBrands = await Order.aggregate([
      {
        $unwind: "$orderedItems",
      },
      {
        $group: { _id: "$orderedItems.brand", count: { $sum: 1 } },
      },
      {
        $sort: { count: 1 },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          brand: "$_id",
        },
      },
      {
        $limit: 10,
      },
    ]);

    const topSellingCategories = await Order.aggregate([
      {
        $unwind: "$orderedItems",
      },
      {
        $group: { _id: "$orderedItems.category", count: { $sum: 1 } },
      },
      {
        $sort: { count: 1 },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          category: "$_id",
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.render("admin/dashboard", {
      pendingOrdersCount,
      completedOrdersCount,
      topSellingBrands,
      topSellingCategories,
      topSellingProducts,
      userCount,
      orderCount,
      salesCount: salesCount[0].salesCount,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const dashboardSalesData = async (req, res) => {
  try {
    const filterType = req.query.filter;
    let gte = null;
    let lte = null;

    if (filterType == "week") {
      const currentDate = new Date();

      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      gte = startOfWeek;
      lte = endOfWeek;
    }

    if (filterType == "month") {
      const currentDate = new Date();

      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);

      const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);

      gte = startOfYear;
      lte = endOfYear;
    }

    if (filterType == "year") {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      const startOfLast5Years = new Date(currentYear - 5, 0, 1);
      startOfLast5Years.setHours(0, 0, 0, 0);

      const endOfCurrentYear = new Date(currentYear, 11, 31);
      endOfCurrentYear.setHours(23, 59, 59, 999);

      gte = startOfLast5Years;
      lte = endOfCurrentYear;
    }

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let salesData;

    if (filterType == "week") {
      salesData = await Order.aggregate([
        {
          $unwind: "$orderedItems",
        },
        {
          $match: {
            "orderedItems.deliveredDate": { $gte: gte, $lte: lte },
          },
        },
        {
          $group: {
            _id: "$orderedItems.deliveredDate",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            dayOfWeek: { $dayOfWeek: "$_id" },
            count: 1,
          },
        },
        {
          $sort: { dayOfWeek: 1 },
        },
      ]);
    } else if (filterType == "month") {
      salesData = await Order.aggregate([
        {
          $unwind: "$orderedItems",
        },
        {
          $match: {
            "orderedItems.deliveredDate": { $gte: gte, $lte: lte },
          },
        },
        {
          $project: {
            month: { $month: "$orderedItems.deliveredDate" },
            orderedItems: 1,
          },
        },
        {
          $group: {
            _id: "$month",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
    } else if (filterType == "year") {
      salesData = await Order.aggregate([
        {
          $unwind: "$orderedItems",
        },
        {
          $match: {
            "orderedItems.deliveredDate": { $gte: gte, $lte: lte },
          },
        },
        {
          $project: {
            year: { $year: "$orderedItems.deliveredDate" },
            orderedItems: 1,
          },
        },
        {
          $group: {
            _id: "$year",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
    }


    let d = [];
    let c = [];

    if (filterType == "week") {
      for (let i = 0; i < daysOfWeek.length; i++) {
        const day = i + 1;
        const salesForDay = salesData.find((sale) => sale.dayOfWeek === day);
        d.push(daysOfWeek[i]);
        if (salesForDay) {
          c.push(salesForDay.count);
        } else {
          c.push(0);
        }
      }
    } else if (filterType == "month") {

      for (let i = 0; i < months.length; i++) {
        const month = i + 1; 
        const salesForMonth = salesData.find((sale) => sale._id === month);
        d.push(months[i]);
        if (salesForMonth) {
          c.push(salesForMonth.count);
        } else {
          c.push(0);
        }
      }
    } else {
      const currentYear = new Date().getFullYear();
      const lastFiveYears = [];
      
      for (let i = 0; i < 5; i++) {
        lastFiveYears.push(currentYear - i);
      }
      
      // Reverse the array to have years in ascending order
      lastFiveYears.reverse();
      
      lastFiveYears.forEach(year => {
        const salesForYear = salesData.find(sale => sale._id === year);
        d.push(year);
        if (salesForYear) {
          c.push(salesForYear.count);
        } else {
          c.push(0);
        }
      });      console.log(salesData, "dd");
    }

    console.log("ggg", d, c);

    res.status(200).json({ dates: d, counts: c });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const products = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = 2;
    let skip = (page - 1) * limit;

    const products = await Product.find({ isDelete: false })
      .sort({ date: -1 })
      .populate([{ path: "category" }, { path: "brand" }])
      .skip(skip)
      .limit(limit);

    const totalOrders = await Product.countDocuments({ isDelete: false });
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("admin/product", {
      products: products,
      totalPages: totalPages,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await Product.find({ isDelete: false }).populate([
        { path: "category" },
        { path: "brand" },
      ]);

      console.log(products);

      res.status(200).json({ products: products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedProducts = async (req, res) => {
  try {
    res.render("admin/unlistedProduct", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedProductData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await Product.find({ isDelete: true }).populate([
        { path: "category" },
        { path: "brand" },
      ]);

      res.status(200).json({ products: products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    if (req.method == "POST") {
      const {
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description,
      } = req.body;

      const trimmedValue = model.trim().toLowerCase();

      let checkProduct = await Product.findOne({
        modelName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        isDelete: false,
      });

      if (!checkProduct) {
        const newProduct = new Product({
          modelName: model,
          brand: brand,
          gender: gender,
          category: category,
          outerMaterial: outerMaterial,
          soleMaterial: soleMaterial,
          description: description,
        });

        await newProduct.save();

        let createdProduct = await Product.findOne({ _id: newProduct._id })
          .populate("brand")
          .populate("category");

        return res.status(200).json({
          msg: "Product created successfully",
          product: createdProduct,
        });
      } else {
        res
          .status(409)
          .json({ message: "Product with this name already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    if (req.method === "POST") {
      const {
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description,
        id,
      } = req.body;

      const trimmedValue = model.trim().toLowerCase();
      let checkingProduct = await Product.findOne({
        modelName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        isDelete: false,
        _id: { $ne: id },
      });

      if (!checkingProduct) {
        const product = await Product.updateOne(
          { _id: id },
          {
            $set: {
              modelName: model,
              brand: brand,
              gender: gender,
              category: category,
              outerMaterial: outerMaterial,
              soleMaterial: soleMaterial,
              description: description,
            },
          }
        );

        let updatedProduct = await Product.findOne({ _id: id })
          .populate("brand")
          .populate("category");

        console.log(":product updated", updatedProduct);
        return res.status(200).json({
          message: "Product edited successfully.",
          product: updatedProduct,
        });
      } else {
        return res
          .status(409)
          .json({ message: "Product already already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageProductDeleteStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { id } = req.body;

      let product = await Product.findOne({ _id: id });

      product.isDelete = !product.isDelete;

      await product.save();

      res.status(200).json({ deleteStatus: product.isDelete });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Users
const users = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = 5;
    let skip = (page - 1) * limit;

    let users = await User.find({})
      .sort({ dateJoined: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await User.countDocuments({});
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("admin/user", {
      users: users,
      totalPages: totalPages,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const usersData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const users = await User.find({});

      res.status(200).json({ users: users });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { userId } = req.body;

      const user = await User.findOne({ _id: userId });

      if (user.isBlocked === true) {
        user.isBlocked = false;
        await user.save();
      } else {
        user.isBlocked = true;
        await user.save();
      }

      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//BRAND
const brands = async (req, res) => {
  try {
    //let categories = await Category.find({isDelete: false});

    //console.log(category);
    res.render("admin/brand", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addBrand = async (req, res) => {
  try {
    if (req.method === "POST") {
      try {
        const { brandValue } = req.body;

        console.log("lll", req.file.filename, brandValue);

        let brand = await Brand.findOne({ name: brandValue });
        // console.log(category, "lllll")

        if (!brand) {
          const newBrand = new Brand({
            name: brandValue,
            image: req.file.filename,
          });
          await newBrand.save();
          res.status(200).json({ brandData: newBrand });
        } else {
          res
            .status(409)
            .json({ message: "Brand with this name already exist." });
        }
      } catch (error) {
        console.error("Error in addColorVarient:", error);
        res.status(500).json({ error: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const brandList = async (req, res) => {
  try {
    let brands = await Brand.find({});

    res.status(200).json({ brands: brands });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const category = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: false });

    console.log(category);
    res.render("admin/category", {
      categories: categories,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const categoryList = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: false });

    res.status(200).json({ categories: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedCategory = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: true });

    res.render("admin/unlistedCategory", {
      categories: categories,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { categoryValue } = req.body;

      const trimmedValue = categoryValue.trim().toLowerCase();

      // Case insensitive querying
      let category = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        isDelete: false,
      });

      if (!category) {
        const newCategory = new Category({
          categoryName: categoryValue,
        });
        await newCategory.save();
        res.status(200).json({ categoryData: newCategory });
      } else {
        res.status(409).json({ message: "Category already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editCategory = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { categoryName, id } = req.body;

      // let category = await Category.findOne({ _id: id });

      const trimmedValue = categoryName.trim().toLowerCase();

      let checkingCategory = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        isDelete: false,
        _id: { $ne: id },
      });

      if (!checkingCategory) {
        const updatingCategory = await Category.updateOne(
          { _id: id },
          { $set: { categoryName: categoryName } }
        );

        const category = await Category.findOne({ _id: id });

        return res.status(200).json({ categoryData: category });
      } else {
        return res.status(409).json({ message: "Category already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageCategoryStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { id } = req.body;

      let category = await Category.findOne({ _id: id });

      if (category.isDelete == true) {
        const trimmedValue = category.categoryName.trim().toLowerCase();

        // Case insensitive querying
        let check = await Category.findOne({
          isDelete: false,
          categoryName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        });

        if (check) {
          return res.status(409).json({
            message:
              "Cannot list this category because the category with this same name already exist.",
          });
        }
      }

      category.isDelete = !category.isDelete;

      await category.save();

      return res.status(200).json({ deleteStatus: category.isDelete });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addColorVarient = async (req, res) => {
  try {
    let { colorName, colorCode, productId } = req.body;

    colorCode = colorCode.toLowerCase();

    const files = req.files;

    const productImage = Object.values(files).map((item) => item[0].filename);

    if (productImage.length != 4) {
      return res.status(409).json({ message: "Minimum 4 images are required" });
    }

    const newVariant = {
      colorName: colorName,
      colorCode: colorCode,
      images: productImage,
    };

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, "varient.colorCode": { $ne: colorCode } },
      { $push: { varient: newVariant } },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(409).json({ message: "Color already exist" });
    }

    const varient = updatedProduct.varient[updatedProduct.varient.length - 1];

    return res
      .status(200)
      .json({ message: "Color added successfully", colorVarient: varient });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const editColorVarient = async (req, res) => {
  try {
    const { colorName, colorCode, varientId } = req.body;

    const colorVarient = await Varient.findOne({
      _id: varientId,
    });

    let images = colorVarient.images;

    const files = req.files;

    console.log(
      files.productImgOne,
      files.productImgTwo,
      files.productImgThree,
      files.productImgFour,
      "files..."
    );

    if (files.productImgOne) {
      images.splice(0, 1, files.productImgOne[0].filename);
    }
    if (files.productImgTwo) {
      images.splice(1, 1, files.productImgTwo[0].filename);
    }
    if (files.productImgThree) {
      images.splice(2, 1, files.productImgThree[0].filename);
    }
    if (files.productImgFour) {
      images.splice(3, 1, files.productImgFour[0].filename);
    }

    await Varient.updateOne(
      { _id: varientId },
      { $set: { images: images, colorName: colorName, colorCode: colorCode } }
    );

    console.log("updated successfully...");
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteColorVarient = async (req, res) => {
  try {
    const { varientId } = req.body;

    console.log(varientId, "colorVarientId");

    const colorVariant = await Varient.findOne({ _id: varientId });

    if (!colorVariant) {
      return res.status(409).json({ message: "No color varient found" });
    }

    await Varient.findByIdAndDelete(colorVariant._id);

    return res
      .status(200)
      .json({ message: "Color variant deleted successfully." });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSizeVarient = async (req, res) => {
  try {
    const { price, size, quantity, productId, varientId } = req.body;

    const newSubVarient = {
      size,
      quantity,
      price,
    };
    const product = await Product.findOne({
      _id: productId,
      "varient._id": varientId,
      "varient.subVarient.size": size,
    });

    if (product) {
      return res
        .status(409)
        .json({ message: "Size with this value already exists." });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, "varient._id": varientId },
      { $push: { "varient.$.subVarient": newSubVarient } },
      { new: true, runValidators: true }
    );

    const varient = updatedProduct.varient.find((v) => v._id == varientId);
    const lastPushedSubVarient =
      varient.subVarient[varient.subVarient.length - 1];

    return res.status(200).json({
      message: "Size added successfully",
      subVarient: lastPushedSubVarient,
    });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const editSizeVarient = async (req, res) => {
  try {
    const { price, size, quantity, id, varientId } = req.body;

    let checkingSubVarient = await Subvarient.findOne({
      size: size,
      varient: varientId,
      _id: { $ne: id },
    });

    if (!checkingSubVarient) {
      let subVarient = await Subvarient.findOne({ _id: id });

      subVarient.price = price;
      subVarient.size = size;
      subVarient.quantity = quantity;

      await subVarient.save();

      return res.status(200).json({ subVarient: subVarient });
    } else {
      return res
        .status(409)
        .json({ message: "Size with this value already exists." });
    }
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSizeVarient = async (req, res) => {
  try {
    const { id } = req.body;

    const subVarient = await Subvarient.findByIdAndDelete(id);
    if (subVarient) {
      return res
        .status(200)
        .json({ message: "Size deleted successfully", subVarient: subVarient });
    } else {
      return res.status(404).json({ error: "Size not found" });
    }
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllColorVarient = async (req, res) => {
  try {
    const productId = req.query.pid;

    const varients = await Product.findById(productId).select("varient");

    if (!varients) {
      return res.status(404).json({ message: "Color varient not found" });
    }

    res.status(200).json({ colorVarients: varients.varient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSizeVarient = async (req, res) => {
  try {
    const varientId = req.query.varientid;
    const productId = req.query.productid;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const varient = product.varient.find((v) => v._id == varientId);

    if (!varient) {
      return res.status(404).json({ message: "Colors varient not found" });
    }

    res.status(200).json({ sizeVarients: varient.subVarient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const singleProductData = async (req, res) => {
  try {
    const productId = req.query.pid;

    const productData = await Product.findOne({ _id: productId }).populate([
      { path: "category" },
      { path: "brand" },
    ]);

    res.status(200).json({ productData: productData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const order = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = 3;
    let skip = (page - 1) * limit;

    let orders = await Order.find({})
      .populate("userId")
      .sort({ orderedDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({});
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("admin/order", {
      orders: orders,
      totalPages: totalPages,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const orderItem = async (req, res) => {
  try {
    const orderId = req.query.oid;

    const order = await Order.findOne({ _id: orderId }).populate("userId");

    res.render("admin/orderitem", {
      order: order,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { status, orderId, itemId } = req.body;

    const order = await Order.findOne({ _id: orderId }).populate("userId");

    const orderItem = order.orderedItems.find(
      (item) => item._id.toString() === itemId
    );

    if (status) {
      orderItem.orderStatus =
        status == "Approve"
          ? "RETURN_APPROVED"
          : status == "Reject"
          ? "Delivered"
          : status;
      if (status == "Approve") {
        orderItem.requestAcceptedDate = new Date();
      } else if (status == "Reject") {
        orderItem.requestRejectedDate = new Date();
      } else if (status == "Returned") {
        orderItem.returnedDate = new Date();
      } else if (status == "Shipped") {
        orderItem.shippedDate = new Date();
      } else if (status == "Delivered") {
        orderItem.deliveredDate = new Date();
      } else if (status == "Cancelled") {
        orderItem.cancelledDate = new Date();
      }

      await order.save();

      if (status == "Cancelled" || status == "Returned") {
        // To update quantity

        let subVartient = await Subvarient.findOne({
          _id: orderItem.productId,
        });
        if (subVartient) {
          subVartient.quantity += orderItem.quantity;
          await subVartient.save();
        }

        if (status == "Returned") {
          if (order.paymentMethod == "COD") {
            orderItem.paymentStatus = "Refunded";
            await order.save();
          } else if (order.paymentMethod == "ONLINE_PAYMENT") {
            let wallet = await Wallet.findOne({ userId: order.userId });

            if (!wallet) {
              wallet = new Wallet({
                userId: order.userId,
                balance: 0,
                history: [],
              });
            }

            wallet.history.push({
              date: new Date(),
              type: "credit",
              amount: orderItem.price,
              description: "Refund for order item return.",
            });
            wallet.balance += orderItem.price;

            await wallet.save();

            orderItem.paymentStatus = "Refunded";
            await order.save();
          }
        }
      } else if (status == "Delivered") {
        if (order.paymentMethod == "COD") {
          orderItem.paymentStatus = "Success";
          await order.save();
        }
      }

      let count = 0;
      let paymentCount = 0;
      order.orderedItems.map((item) => {
        if (
          item.orderStatus == "Cancelled" ||
          item.orderStatus == "Delivered" ||
          item.orderStatus == "Returned"
        ) {
          count++;
        }

        // Handling payment status
        if (item.paymentStatus == "Success") {
          paymentCount++;
        }
      });

      if (count == order.orderedItems.length) {
        order.orderStatus = "Completed";
        await order.save();
      }

      if (paymentCount == order.orderedItems.length) {
        order.paymentStatus = "Success";
        await order.save();
      }
    }

    res.status(200).json({ message: "Order status changed successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const coupon = async (req, res) => {
  try {
    if (req.method == "GET") {
      let page = req.query.page || 1;
      let limit = 10;
      let skip = (page - 1) * limit;

      const coupons = await Coupon.find({}).skip(skip).limit(limit);

      const totalOrders = await Coupon.countDocuments({});
      const totalPages = Math.ceil(totalOrders / limit);

      console.log(totalPages, totalOrders / limit, "nmopp");

      res.render("admin/coupon", {
        coupons: coupons,
        totalPages: totalPages,
        isLogin: true,
        adminName: req.session.adminName,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCoupon = async (req, res) => {
  try {
    if (req.method == "POST") {
      const {
        couponCode,
        discountPercentage,
        maxOfferLimit,
        minOrderAmount,
        expiryDate,
      } = req.body.data;

      // let realCouponCode = couponCode.toUpperCase()

      const existingCoupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
      });

      if (existingCoupon) {
        return res
          .status(400)
          .json({ error: "Coupon with this code already exists" });
      }

      const coupon = new Coupon({
        couponCode: couponCode.toUpperCase(),
        discountPercentage: discountPercentage,
        maxOfferLimit: maxOfferLimit,
        minOrderAmount: minOrderAmount,
        expiryDate: expiryDate,
      });

      await coupon.save();

      res.status(200).json({ coupon: coupon });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { couponId } = req.body.data;

      const deleteCoupon = await Coupon.findByIdAndDelete(couponId);

      if (!deleteCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      return res
        .status(200)
        .json({ message: "Coupon deleted successfully", coupon: deleteCoupon });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const salesReport = async (req, res) => {
  try {
    res.render("admin/salesReport", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const salesReportData = async (req, res) => {
  try {
    const filterType = req.query.filter;
    let gte = null;
    let lte = null;

    if (filterType == "date") {
      gte = req.query.gte;
      lte = req.query.lte;
    }

    if (filterType == "day") {
      const currentDate = new Date();

      gte = new Date(currentDate);
      gte.setHours(0, 0, 0, 0);

      lte = new Date(currentDate);
      lte.setHours(23, 59, 59, 999);
    }

    if (filterType == "week") {
      const currentDate = new Date();

      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      gte = startOfWeek;
      lte = endOfWeek;

      console.log("Start of the Week: ", gte);
      console.log("End of the Week: ", lte);
    }

    if (filterType == "month") {
      const currentDate = new Date();

      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);

      gte = startOfMonth;
      lte = endOfMonth;
    }

    if (filterType == "year") {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      gte = new Date(currentYear, 0, 1);
      gte.setHours(0, 0, 0, 0);

      lte = new Date(currentYear, 11, 31);
      lte.setHours(23, 59, 59, 999);
    }

    // Pipeline 1
    const pipeline = [
      { $unwind: "$orderedItems" },
      { $match: { "orderedItems.orderStatus": "Delivered" } },
    ];
    if (gte && lte) {
      pipeline.push({
        $match: {
          "orderedItems.deliveredDate": {
            $gte: new Date(gte),
            $lte: new Date(lte),
          },
        },
      });
    }
    pipeline.push({
      $group: {
        _id: "$_id",
        orderId: { $first: "$orderId" },
        paymentMethod: { $first: "$paymentMethod" },
        items: { $push: "$orderedItems" },
      },
    });
    const orders = await Order.aggregate(pipeline);

    // Pipeline 2
    const pipeline2 = [
      { $unwind: "$orderedItems" },
      { $match: { "orderedItems.orderStatus": "Delivered" } },
    ];

    pipeline2.push({
      $match: {},
    });

    if (gte && lte) {
      pipeline2.push({
        $match: {
          "orderedItems.deliveredDate": {
            $gte: new Date(gte),
            $lte: new Date(lte),
          },
        },
      });
    }
    pipeline2.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });
    const soldProductsCount = await Order.aggregate(pipeline2);

    const pipeline3 = [{ $unwind: "$orderedItems" }, { $match: {} }];

    pipeline3.push({
      $match: {},
    });

    if (gte && lte) {
      pipeline3.push({
        $match: {
          orderedDate: {
            $gte: new Date(gte),
            $lte: new Date(lte),
          },
        },
      });
    }

    pipeline3.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });

    const orderedProductsCount = await Order.aggregate(pipeline3);

    return res.status(200).json({
      orders: orders,
      totalOrders: orderedProductsCount,
      totalSales: soldProductsCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const categoryOffer = async (req, res) => {
  try {
    if (req.method == "GET") {
      const categoryOffers = await Categoryoffer.find({}).populate(
        "categoryId"
      );

      res.render("admin/categoryOffer", {
        categoryOffers: categoryOffers,
        isLogin: true,
        adminName: req.session.adminName,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { categoryId, offerPercentage, expiryDate } = req.body.data;

      const categoryOffer = await Categoryoffer.findOne({
        categoryId: categoryId,
      });

      if (categoryOffer) {
        return res
          .status(400)
          .json({ error: "Offer for this categoey already exist" });
      }

      const offer = new Categoryoffer({
        categoryId: categoryId,
        percentage: offerPercentage,
        expiryDate: expiryDate,
      });

      await offer.save();

      res
        .status(200)
        .json({ offer: offer, message: "Offer created successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editCategoryOffer = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { offerId, offerPercentage, expiryDate } = req.body.data;

      const offer = await Categoryoffer.findOneAndUpdate(
        {_id: offerId},
        {
          percentage: offerPercentage,
          expiryDate: expiryDate
        },
        {
          new: true
        }
      )

      if (!offer) {
        return res
          .status(400)
          .json({ error: "Offer for this categoey does not exist" });
      }

      res
        .status(200)
        .json({ offer: offer, message: "Offer edited successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCategoryOffer = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { offerId } = req.body.data;

      const categoryOffer = await Categoryoffer.findByIdAndDelete({
        _id: offerId,
      });

      if (categoryOffer) {
        return res.status(200).json({
          offer: categoryOffer,
          message: "Category offer deleted successfully",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productOffer = async (req, res) => {
  try {
    if (req.method == "GET") {
      const products = await Product.find({ isDelete: false });

      const productOffer = await Productoffer.find({}).populate("productId");

      res.render("admin/productOffer", {
        productOffer: productOffer,
        products: products,
        isLogin: true,
        adminName: req.session.adminName,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProductOffer = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { productId, offerPercentage, expiryDate } = req.body.data;

      const productOffer = await Productoffer.findOne({
        productId: productId,
      });

      if (productOffer) {
        return res
          .status(400)
          .json({ error: "Offer for this product already exist" });
      }

      const offer = new Productoffer({
        productId: productId,
        percentage: offerPercentage,
        expiryDate: expiryDate,
      });

      await offer.save();

      res
        .status(200)
        .json({ offer: offer, message: "Offer created successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProductOffer = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { offerId } = req.body.data;

      const productOffer = await Productoffer.findByIdAndDelete({
        _id: offerId,
      });

      if (productOffer) {
        return res.status(200).json({
          offer: productOffer,
          message: "Product offer deleted successfully",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  dashboard,
  dashboardSalesData,
  products,
  unlistedProducts,
  addProduct,
  editProduct,
  manageProductDeleteStatus,
  unlistedProductData,
  users,
  login,
  logout,
  category,
  addCategory,
  unlistedCategory,
  usersData,
  userStatus,
  productData,
  manageCategoryStatus,
  editCategory,
  categoryList,
  brands,
  addBrand,
  brandList,

  addColorVarient,
  editColorVarient,
  deleteColorVarient,

  addSizeVarient,
  editSizeVarient,
  deleteSizeVarient,

  getAllColorVarient,
  getAllSizeVarient,
  singleProductData,

  order,
  orderItem,
  changeOrderStatus,

  coupon,
  addCoupon,
  deleteCoupon,

  salesReport,
  salesReportData,

  categoryOffer,
  addCategoryOffer,
  editCategoryOffer,
  deleteProductOffer,

  productOffer,
  addProductOffer,
  deleteCategoryOffer,
};
