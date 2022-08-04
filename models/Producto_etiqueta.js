'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Documento_etiquetaSchema = Schema({
    documento: {type: Schema.ObjectId, ref: 'documento', required: true},
    etiqueta: {type: Schema.ObjectId, ref: 'etiqueta', required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('documento_etiqueta',Documento_etiquetaSchema);