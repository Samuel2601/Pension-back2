'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    estudiante: {type: Schema.ObjectId, ref: 'estudiante', required: true},
    total_pagar: {type: Number, require: true},
    transaccion: {type: String, require: true},
    encargado:{type: Schema.ObjectId, ref: 'admin', required: true},
    estado: {type: String, require: true},
    nota: {type: String, require: false},
    
    anio_lectivo:{type: String, required: false},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('pago',VentaSchema);