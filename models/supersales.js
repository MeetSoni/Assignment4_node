// *** Add to models/employee.js ***
// load mongoose since we need it to define a model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalesSchema = new Schema({
    'Invoice ID': String,
    Branch: String,
    City: String,
    'Customer type': String,
    'Product line': String,
    name: String,
    image: String,
    'Unit price': Number,
    Quantity: Number,
    'Tax 5%': Number,
    Total: Number,
    Date: String,
    Payment: String,
    cogs: Number,
    'gross income': Number,
    Rating: Number
});

module.exports = mongoose.model('superSales', SalesSchema); // Changed the model name to 'Employee' and corrected the schema variable name.
