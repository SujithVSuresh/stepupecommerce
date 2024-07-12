const mongoose = require("mongoose");


const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Subvarient", required: true },
    }]
})

module.exports = mongoose.model("Wishlist", wishlistSchema)