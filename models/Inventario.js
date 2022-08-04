'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InventarioSchema = Schema({
    documento: {type: Schema.ObjectId, ref: 'documento', required: true},
    variedad: {type: Schema.ObjectId, ref: 'variedad', required: true},
    cantidad: {type: Number, require: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('inventario',InventarioSchema);