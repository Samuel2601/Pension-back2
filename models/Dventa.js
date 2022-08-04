'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DventaSchema = Schema({
    documento: {type: Schema.ObjectId, ref: 'documento', required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', require: true},
    subtotal: {type: Number, require: true}, 
    variedad: {type: Schema.ObjectId, ref: 'variedad', require: true},
    cantidad: {type: Number, require: true},
    estudiante: {type: Schema.ObjectId, ref: 'estudiante', required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('dventa',DventaSchema);