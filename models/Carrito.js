'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CarritoSchema = Schema({
    documento: {type: Schema.ObjectId, ref: 'documento', required: true},
    estudiante: {type: Schema.ObjectId, ref: 'estudiante', required: true},
    cantidad: {type: Number, require: true},
    variedad: {type: Schema.ObjectId, ref: 'variedad', required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('carrito',CarritoSchema);