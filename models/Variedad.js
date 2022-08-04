'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VariedadSchema = Schema({
    documento: {type: Schema.ObjectId, ref: 'documento', required: true},
    valor: {type: String, required: true},
    stock: {type: String, required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('variedad',VariedadSchema);