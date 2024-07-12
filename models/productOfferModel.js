const mongoose=require("mongoose")

const productOfferSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    percentage: { type: Number, required: true },
    expiryDate: {
      type: Date,
      index: { expires: 0 },
    },
})

module.exports=mongoose.model('Productoffer', productOfferSchema)