const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    categoryName: {type: String, required:true},
    isDelete: {type: Boolean, default: false}
})

module.exports = mongoose.model("Category", categorySchema)