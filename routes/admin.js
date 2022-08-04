'use strict'

var express = require('express');
var AdminController = require('../controllers/AdminController');


var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/documentos'});

api.post('/login_admin',AdminController.login_admin);
api.post('/registro_documento_admin',[auth.auth,path],AdminController.registro_documento_admin);
api.get('/listar_documentos_admin',auth.auth,AdminController.listar_documentos_admin);

api.get('/obtener_documento_admin/:id',auth.auth,AdminController.obtener_documento_admin);
api.put('/actualizar_documento_admin/:id',[auth.auth,path],AdminController.actualizar_documento_admin);

api.get('/verificar_token',auth.auth,AdminController.verificar_token);

api.get('/obtener_config_admin',AdminController.obtener_config_admin);
api.put('/actualizar_config_admin',auth.auth,AdminController.actualizar_config_admin);

api.get('/obtener_pagos_admin',auth.auth,AdminController.obtener_pagos_admin);
api.get('/obtener_detallespagos_admin',auth.auth,AdminController.obtener_detallespagos_admin);

api.get('/obtener_detalles_ordenes_estudiante_abono/:id',auth.auth,AdminController.obtener_detalles_ordenes_estudiante_abono);
api.put('/marcar_finalizado_orden/:id',auth.auth,AdminController.marcar_finalizado_orden);
api.delete('/eliminar_orden_admin/:id',auth.auth,AdminController.eliminar_orden_admin);
api.delete('/eliminar_documento_admin/:id',auth.auth,AdminController.eliminar_documento_admin);

api.post('/registro_compra_manual_estudiante',auth.auth,AdminController.registro_compra_manual_estudiante);

api.get('/listar_admin',auth.auth,AdminController.listar_admin);
api.get('/listar_registro',auth.auth,AdminController.listar_registro);
api.put('/actualizar_admin/:id',auth.auth,AdminController.actualizar_admin);
api.post('/registro_admin',auth.auth,AdminController.registro_admin);
api.get('/obtener_admin/:id',auth.auth,AdminController.obtener_admin);
api.get('/eliminar_admin/:id',auth.auth,AdminController.eliminar_admin);
api.get('/eliminar_estudiante_admin/:id',auth.auth,AdminController.eliminar_estudiante_admin);
api.get('/reactivar_estudiante_admin/:id',auth.auth,AdminController.reactivar_estudiante_admin);
module.exports = api;