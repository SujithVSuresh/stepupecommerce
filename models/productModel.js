const mongoose = require("mongoose");


const subVarientSchema = new mongoose.Schema({
  size: {
    type: String, 
    required:true
  },
  quantity: {
    type: Number, 
    required: true
  },
  price: {
    type: Number, 
    required: true
  },
})

const varientSchema = new mongoose.Schema({
  colorName: {
    type: String, 
    required:true
  },
  colorCode: {
    type: String, 
    required:true
  },
  images: [{type: String}],
  subVarient: [subVarientSchema],
})

const productSchema = new mongoose.Schema({
    modelName: {
      type: String, 
      required:true
    },
    brand: {
      type:mongoose.Schema.Types.ObjectId, 
      ref: "Brand", 
      required:true
    },
    gender: {
      type: String, 
      required: true
    },
    outerMaterial: {
      type: String, 
      required: true
    },
    soleMaterial: {
      type:String, 
      required: true
    },
    description: {
      type:String, 
      required: true
    },
    category: {
      type:mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required:true
    },
    varient: [varientSchema],
    isDelete: {type: Boolean, default:false, required:true},
    date: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Product", productSchema)





// const SubVariantSchema = new Schema({
//   size: {
//       type: String,
//       required: true
//   },
//   quantity: {
//       type: Number,
//       required: true
//   }
// });

// // Variant Schema for Colors
// const VariantSchema = new Schema({
//   color: {
//       type: String,
//       required: true
//   },
//   images: {
//       type: [String],
//       required : true
//   },
//   price: {
//       type: Number,
//       required: true
//   },
//   discountPrice: Number,
//   subVariants: [SubVariantSchema],
//   offer: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'Offer' 
//   }
// });

// // Product Schema
// const ProductSchema = new Schema({
//   productName: {
//       type: String,
//       required: true
//   },
//   productCategory: {
//       type: Schema.Types.ObjectId,
//       ref: "Category",
//       required: true
//   },
//   productBrand: {
//       type: Schema.Types.ObjectId,
//       ref: "Brand",
//       required: true
//   },
//   productDescription: {
//       type: String,
//       required: true
//   },
//   productGender: {
//       type: String,
//       required: true
//   },
//   frameMaterial : {
//       type : String,
//       required : true
//   }, 
//   frameShape : {
//       type : String,
//       required : true
//   },
//   frameStyle : {
//       type : String,
//       required : true
//   },
//   lensType : {
//       type : String,
//       required : true
//   },
//   specialFeatures : {
//       type : String,
//       required : true
//   },
//   variants: [VariantSchema],
//   orderCount: {
//       type: Number,
//       default: 0
//   },
//   is_delete: {
//       type: Boolean,
//       default: false
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Product", ProductSchema);