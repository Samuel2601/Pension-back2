var Admin = require('../models/Admin');
var Config = require('../models/Config');
var Documento = require('../models/Documento');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var Pago = require('../models/Pago');
var Dpago = require('../models/Dpago');

var Pension = require('../models/Pension');
var Registro = require('../models/Registro');

var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
const { months, suppressDeprecationWarnings } = require('moment');
const Review = require('../models/Review');
const Producto = require('../models/Producto');
const { findOneAndUpdate } = require('../models/Admin');
const Estudiante = require('../models/Estudiante');

const login_admin = async function(req,res){
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({email:data.email});

    if(admin_arr.length == 0){
        res.status(200).send({message: 'El correo electrónico no existe', data: undefined});
    }else{
        //LOGIN
        let user = admin_arr[0];

        bcrypt.compare(data.password, user.password, async function(error,check){
            if(check){
                res.status(200).send({
                    data:user,
                    token: jwt.createToken(user)
                });
            }else{
                res.status(200).send({message: 'Las credenciales no coinciden', data: undefined}); 
            }
        });
 
    } 
}
const registro_admin = async function(req,res){
    if(req.user){
        try {
            var data = req.body;
            var admin_arr = [];
            admin_arr = await Admin.find({email:data.email});

            var admin_arr2=[];
            admin_arr2= await Admin.find({dni:data.dni});
            
            var admin_arr3=[];
            admin_arr3= await Admin.find({rol:'direc'});
           
            if(admin_arr.length == 0 && admin_arr2.length==0){
                if((admin_arr3.length!=0 && data.rol!='direc')||(admin_arr3.length==0)){
                    try {
                        bcrypt.hash(data.password,null,null, async function(err,hash){
                            if(hash){
                                
                                data.password = hash;
                                data.estado = 'habilitado';
                                var reg = await Admin.create(data);
                                
                                let registro={};
                                //////console.log(req.user);
                                    registro.admin=req.user.sub;
                                    registro.tipo='creo';
                                    registro.descripcion=
                                    ' Nombres: '+data.nombres+
                                    ' Apellidos: '+data.apellidos+
                                    ' Email: '+data.email+
                                    ' Password: '+data.password+
                                    ' Telefono: '+data.telefono+
                                    ' DNI: '+data.dni+
                                    ' Rol: '+data.rol+
                                    ' Estado: '+data.estado;
                                    //////console.log(registro);
                                    
                                  
                                  await Registro.create(registro);
                                  res.status(200).send({message:'Registrado con exito'});
                            }else{
                                res.status(200).send({message:'ErrorServer'});
                            }
                        });
                    } catch (error) {
                        res.status(200).send({message:'Algo salió mal'});
                    }
                }else{
                    res.status(200).send({message:'Ya hay una cuenta con el rol de Director'});
                }
            }else{
                if(admin_arr[0].estado=='Fuera'){
                    try {
                        bcrypt.hash(data.password,null,null, async function(err,hash){
                            if(hash){
                                
                                data.password = hash;
                                data.estado = 'habilitado';
                                var reg = await Admin.updateOne({email:data.email},{
                                    nombres: data.nombres,
                                    apellidos: data.apellidos,
                                    password: data.password,
                                    rol: 'secrt',
                                    dni:data.dni,
                                    telefono: data.telefono,
                                    estado:data.estado
                                });
                                
                                let registro={};
                                //////console.log(req.user);
                                    registro.admin=req.user.sub;
                                    registro.tipo='creo';
                                    registro.descripcion=
                                    ' Nombres: '+data.nombres+
                                    ' Apellidos: '+data.apellidos+
                                    ' Email: '+data.email+
                                    ' Password: '+data.password+
                                    ' Telefono: '+data.telefono+
                                    ' DNI: '+data.dni+
                                    ' Rol: '+data.rol+
                                    ' Estado: '+data.estado;
                                    //////console.log(registro);
                                    
                                  
                                  await Registro.create(registro);
                                  res.status(200).send({message:'Registrado con exito'});
                            }else{
                                res.status(200).send({message:'ErrorServer'});
                            }
                        });
                    } catch (error) {
                        res.status(200).send({message:'Algo salió mal'});
                    }
                }else{
                res.status(200).send({message:'El correo y/o la cedula ya existe en la base de datos'});}
            }

        } catch (error) {
            res.status(200).send({message:'Algo salió mal'});
        }            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const listar_admin = async function(req,res){
    if(req.user){
        try {
           
            var admin_arr = [];
            admin_arr = await Admin.find({});
        
            res.status(200).send({data:admin_arr});

        } catch (error) {
            res.status(200).send({message:'Algo salió mal',data:undefined});
        }            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const listar_registro = async function(req,res){
    if(req.user){
        try {
           
            var admin_arr = [];
            admin_arr = await Registro.find({}).sort({createdAt:-1}).populate('admin').populate('estudiante').populate('pago').populate('documento').populate('config');
        
            res.status(200).send({data:admin_arr});

        } catch (error) {
            res.status(200).send({message:'Algo salió mal',data:undefined});
        }            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const obtener_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        try {
            let estudiante = await Admin.findById({_id:id});
        
            res.status(200).send({data:estudiante});
            
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{

        res.status(500).send({message: 'NoAccess'});
    }
}
const actualizar_admin = async function(req,res){
    if(req.user){
        try {
            
            var id = req.params['id'];
            var data = req.body;
            let admin = await Admin.findById(id);
            //////console.log(admin);
            //////console.log('Data:',data);
            var admin_arr = [];
            var aux= await Admin.find();
            aux=aux.filter((item)=>item.dni==data.dni);
            aux=aux.filter((item)=>item._id!=id);
            admin_arr = await Admin.find({email:data.email});
            //////console.log('1:',admin_arr);
            admin_arr=admin_arr.filter((item)=>item._id!=id);
            //////console.log('2:',admin_arr);
            if(admin_arr.length==1 || aux.length>=1){
                res.status(200).send({message:'Correo o cedula ya existente',data:undefined});
            }else{
                
                if(data.password!=''){
                    bcrypt.hash(data.password,null,null, async function(err,hash){
                        if(hash){
                            data.password = hash;
                            //////console.log(data.password);
                            var admin_arr3=[];
                            admin_arr3= await Admin.find({rol:'direc',_id:{$ne:id}});
                            if((admin_arr3.length!=0 && data.rol!='direc')||(admin_arr3.length==0)){
                                await Admin.updateOne({_id:id},{
                                    estado:data.estado,
                                    nombres:data.nombres,
                                    apellidos:data.apellidos,
                                    email:data.email,
                                    password:data.password,
                                    telefono:data.telefono,
                                    rol:data.rol,
                                    dni:data.dni,
                                   
                                });
                                let registro={};
                                //////console.log(req.user);
                                registro.admin=req.user.sub;
                                registro.tipo='actualizo';
                                registro.descripcion=
                                'Nombres: '+admin.nombres+
                                ' Apellidos: '+admin.apellidos+
                                ' Email: '+admin.email+
                                ' Password: '+admin.password+
                                ' Telefono: '+admin.telefono+
                                ' DNI: '+admin.dni+
                                ' Rol: '+admin.rol+
                                ' Estado: '+admin.estado+
                                ' Actualizo a:Nombres: '+data.nombres+
                                ' Apellidos: '+data.apellidos+
                                ' Email: '+data.email+
                                ' Password: '+data.password+
                                ' Telefono: '+data.telefono+
                                ' DNI: '+data.dni+
                                ' Rol: '+data.rol+
                                ' Estado: '+data.estado;
                                //////console.log(registro);
                                
                              
                              await Registro.create(registro);
                                res.status(200).send({message:'Actualizado con exito'});
                            }else{
                                await Admin.updateOne({_id:id},{
                                    estado:data.estado,
                                    nombres:data.nombres,
                                    apellidos:data.apellidos,
                                    email:data.email,
                                    password:data.password,
                                    telefono:data.telefono,
                                    rol:'secrt',
                                    dni:data.dni,
                                   
                                });
                                let registro={};
                                //////console.log(req.user);
                                registro.admin=req.user.sub;
                                registro.tipo='actualizo';
                                registro.descripcion=
                                'Nombres: '+admin.nombres+
                                ' Apellidos: '+admin.apellidos+
                                ' Email: '+admin.email+
                                ' Password: '+admin.password+
                                ' Telefono: '+admin.telefono+
                                ' DNI: '+admin.dni+
                                ' Rol: '+admin.rol+
                                ' Estado: '+admin.estado+
                                ' Actualizo a:Nombres: '+data.nombres+
                                ' Apellidos: '+data.apellidos+
                                ' Email: '+data.email+
                                ' Password: '+data.password+
                                ' Telefono: '+data.telefono+
                                ' DNI: '+data.dni+
                                ' Rol: '+data.rol+
                                ' Estado: '+data.estado;
                                //////console.log(registro);
                                
                              
                              await Registro.create(registro);
                                res.status(200).send({message:'Actualizado con exito se cambio el rol a Colecturía'});
                            }
                           
                        }else{
                            res.status(200).send({message:'ErrorServer',data:undefined});
                        } 
                    });
                }else{
                    var admin_arr3=[];
                            admin_arr3= await Admin.find({rol:'direc',_id:{$ne:id}});
                            if((admin_arr3.length!=0 && data.rol!='direc')||(admin_arr3.length==0)){
                                await Admin.updateOne({_id:id},{
                                    estado:data.estado,
                                    nombres:data.nombres,
                                    apellidos:data.apellidos,
                                    email:data.email,
                                    
                                    telefono:data.telefono,
                                    rol:data.rol,
                                    dni:data.dni,
                                   
                                });
                                let registro={};
                                //////console.log(req.user);
                                registro.admin=req.user.sub;
                                registro.tipo='actualizo';
                                registro.descripcion=
                                'Nombres: '+admin.nombres+
                                ' Apellidos: '+admin.apellidos+
                                ' Email: '+admin.email+
                                ' Password: '+admin.password+
                                ' Telefono: '+admin.telefono+
                                ' DNI: '+admin.dni+
                                ' Rol: '+admin.rol+
                                ' Estado: '+admin.estado+
                                ' Actualizo a:Nombres: '+data.nombres+
                                ' Apellidos: '+data.apellidos+
                                ' Email: '+data.email+
                                ' Password: '+data.password+
                                ' Telefono: '+data.telefono+
                                ' DNI: '+data.dni+
                                ' Rol: '+data.rol+
                                ' Estado: '+data.estado;
                                //////console.log(registro);
                                
                              
                              await Registro.create(registro);
                                res.status(200).send({message:'Actualizado con exito'});
                            }else{
                                await Admin.updateOne({_id:id},{
                                    estado:data.estado,
                                    nombres:data.nombres,
                                    apellidos:data.apellidos,
                                    email:data.email,
                                    password:data.password,
                                    telefono:data.telefono,
                                    rol:'secrt',
                                    dni:data.dni,
                                   
                                });
                                let registro={};
                                //////console.log(req.user);
                                registro.admin=req.user.sub;
                                registro.tipo='actualizo';
                                registro.descripcion=
                                'Nombres: '+admin.nombres+
                                ' Apellidos: '+admin.apellidos+
                                ' Email: '+admin.email+
                                ' Password: '+admin.password+
                                ' Telefono: '+admin.telefono+
                                ' DNI: '+admin.dni+
                                ' Rol: '+admin.rol+
                                ' Estado: '+admin.estado+
                                ' Actualizo a:Nombres: '+data.nombres+
                                ' Apellidos: '+data.apellidos+
                                ' Email: '+data.email+
                                ' Password: '+data.password+
                                ' Telefono: '+data.telefono+
                                ' DNI: '+data.dni+
                                ' Rol: '+data.rol+
                                ' Estado: '+data.estado;
                                //////console.log(registro);
                                
                              
                              await Registro.create(registro);
                                res.status(200).send({message:'Actualizado con exito se cambio el rol a Colecturía'});
                            }
                }
            }
               
        }
        catch (error) {
            //////console.log(error);
            res.status(200).send({message:error+'Algo salió mal',data:undefined});
        }            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const eliminar_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var data = await Admin.findById(id);
        await Admin.updateOne({_id:id},{
            rol:'secrt',
            estado:'Fuera',
        });
            let registro={};
            //////console.log(req.user);
            registro.admin=req.user.sub;
            registro.tipo='elimino';
            registro.descripcion=
            ' Nombres: '+data.nombres+
            ' Apellidos: '+data.apellidos+
            ' Email: '+data.email+
            ' Password: '+data.password+
            ' Telefono: '+data.telefono+
            ' DNI: '+data.dni+
            ' Rol: '+data.rol+
            ' Estado: '+data.estado+
            ' a Estado: Fuera';
            await Registro.create(registro);
        
        res.status(200).send({message:'Eliminado con exito'});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const eliminar_estudiante_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var data = await Estudiante.findById(id);
        let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
        let pen = await Pago.find({estudiante:id});
        if(pen.length==0){
            let registro={};
            //////console.log(req.user);
            registro.admin=req.user.sub;
            registro.estudiante=id;
            registro.tipo='eliminado Permanente';
            registro.descripcion=
            ' Nombres: '+data.nombres+
            ' Apellidos: '+data.apellidos+
            ' Email: '+data.email+
            ' Password: '+data.password+
            ' Telefono: '+data.telefono+
            ' DNI: '+data.dni+
            ' Rol: '+data.rol;
            let re = await Registro.create(registro);

            await Estudiante.findOneAndDelete({_id:id});
            await Pension.findOneAndDelete({idestudiante:id});
            res.status(200).send({message:'Eliminado Permanentemente'});
        }else{
            await Estudiante.updateOne({_id:id},{
                estado:'Desactivado',
                f_desac:new Date(),
                anio_desac:config.anio_lectivo
            });
            let registro={};
            //////console.log(req.user);
            registro.admin=req.user.sub;
            registro.estudiante=id;
            registro.tipo='eliminado';
            registro.descripcion=
            ' Nombres: '+data.nombres+
            ' Apellidos: '+data.apellidos+
            ' Email: '+data.email+
            ' Password: '+data.password+
            ' Telefono: '+data.telefono+
            ' DNI: '+data.dni+
            ' Rol: '+data.rol+
            ' Estado: '+data.estado+
            ' a Estado: Desactivado';
            await Registro.create(registro);
            

            res.status(200).send({message:'Eliminado con exito'});
        }

            
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const reactivar_estudiante_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var pension= {};
        var data = await Estudiante.findById(id);
        await Estudiante.updateOne({_id:id},{
            estado:'Activado',
        });
        let registro={};
            //////console.log(req.user);
            registro.admin=req.user.sub;
            registro.estudiante=id;
            registro.tipo='recreo';
            registro.descripcion=
            ' Nombres: '+data.nombres+
            ' Apellidos: '+data.apellidos+
            ' Email: '+data.email+
            ' Password: '+data.password+
            ' Telefono: '+data.telefono+
            ' DNI: '+data.dni+
            ' Rol: '+data.rol+
            ' Estado: '+data.estado+
            ' a Estado: Activado';
            await Registro.create(registro);

        let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
        let pen = await Pension.find({idestudiante:id,anio_lectivo:config.anio_lectivo });
        if(pen.length==0){
            pension.idestudiante= id;
            pension.anio_lectivo= config.anio_lectivo;
            pension.condicion_beca = 'No';
            pension.matricula = 0;
            pension.curso = data.curso;
            pension.paralelo = data.paralelo;
            
            //////console.log(pension);
            var reg2 = await Pension.create(pension);
            res.status(200).send({message:'Reactivado'}); 
        } else{
            
            res.status(200).send({message:'Reactivado existing pension'});
        }

            
        
       
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}


const registro_documento_admin = async function(req,res){
    if(req.user){
        try {
            let data = req.body;
        
            let documentos = await Documento.find({documento:data.documento});
            //////console.log(documentos);
        
            if(documentos.length == 0){

                let reg = await Documento.create(data);
                let registro={};
                //////console.log(req.user);
                registro.admin=req.user.sub;
                registro.tipo='creo';
                registro.descripcion=
                ' Titulo de Documento: '+data.documento+
                ' Cuenta: '+data.cuenta+
                ' Valor: '+data.valor+
                ' Contenido: '+data.contenido+
                ' Fecha: '+data.f_deposito;
                await Registro.create(registro);

                res.status(200).send({data:reg});
            }else{
                res.status(200).send({data:undefined, message: 'El número del documento ya existe'});
            }
        } catch (error) {
            res.status(200).send({message:'Algo salio mal'});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const listar_documentos_admin = async function(req,res){
    if(req.user){
        var documentos = await Documento.find();
        res.status(200).send({data:documentos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}
const obtener_documento_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        try {
            var reg = await Documento.findById({_id:id});
            res.status(200).send({data:reg});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const actualizar_documento_admin = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let data = req.body;
                let admin = await Documento.findById(id);
                let pagos = await Dpago.find({documetno:id});
                var a=0;
                for(var p of pagos){
                    a+=p.valor;
                }
                if(data.valor>=(a-0.1)){
                    let reg = await Documento.updateOne({_id:id},{
                        documento: data.documento,
                        cuenta: data.cuenta,
                        valor: data.valor-a,
                        contenido: data.contenido,
                        f_deposito: data.f_deposito,
                        contenido:data.contenido,
                   });
                   let registro={};
                    //////console.log(req.user);
                    registro.admin=req.user.sub;
                    registro.tipo='actualizo';
                    registro.descripcion=
                   ' Titulo de Documento: '+admin.documento+
                    ' Cuenta: '+admin.cuenta+
                    ' Valor: '+admin.valor+
                    ' Contenido: '+admin.contenido+
                    ' Fecha: '+admin.f_deposito+
                    ' Cambio a: Titulo de Documento: '+data.documento+
                    ' Cuenta: '+data.cuenta+
                    ' Valor: '+data.valor+
                    ' Contenido: '+data.contenido+
                    ' Fecha: '+data.f_deposito;
                    await Registro.create(registro);
                   res.status(200).send({data:reg});
                }else{
                    res.status(200).send({message:'El número de pagos realizados con este documento es mayor al que le asignas'});
                }    
        } catch (error) {
            res.status(200).send({message:'Algo salió mal'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const verificar_token = async function(req,res){
    //////console.log(req.user);
    if(req.user){
        res.status(200).send({data:req.user});
    }else{
        //////console.log(2);
        res.status(500).send({message: 'NoAccess'});
    } 
}
const obtener_config_admin = async (req,res)=>{

        let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
        //////console.log(config);
        res.status(200).send({data:config});
  
}

const actualizar_config_admin = async (req,res)=>{
    let fecha_actual = new Date();

    if(req.user){
        try {
            let data = req.body;
            let configfecha = new Date(data.anio_lectivo);
            const formatDate = (current_datetime)=>{
                let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
                return formatted_date;
            }
            ////console.log('Actual :',formatDate(fecha_actual),'Fecha confenviada',formatDate(configfecha),fecha_actual.getTime()>=configfecha.getTime());
          if(fecha_actual.getTime()>=configfecha.getTime()){
                var aux = await Config.findById('61abe55d2dce63583086f108');
                ////console.log(aux);
                ////console.log('enviada :',formatDate(configfecha),'del sistema',formatDate(aux.anio_lectivo),configfecha.getTime()>=aux.anio_lectivo.getTime());
                if(configfecha.getTime()>=aux.anio_lectivo.getTime()){
                    let mes = (fecha_actual.getFullYear() - configfecha.getFullYear())*12;
                    mes -= configfecha.getMonth();
                    mes += fecha_actual.getMonth();
                    if(mes>10){
                        data.numpension=10;
                    }else{

                        data.numpension=mes;
                        //////console.log("638:  ",mes); 
                    } 
                    let admin = await Config.findById('61abe55d2dce63583086f108');
                    ////console.log('enviada :',formatDate(configfecha),'del sistema',formatDate(admin.anio_lectivo),configfecha.getTime()>=admin.anio_lectivo.getTime());
                
                    if(new Date (admin.anio_lectivo).getTime()!=new Date(data.anio_lectivo).getTime()){
                        await Config.updateOne({_id:'61abe55d2dce63583086f108'},{
                            //envio_activacion : data.envio_activacion,
                            pension: data.pension,
                            matricula:data.matricula,
                            anio_lectivo:data.anio_lectivo,
                            numpension:data.numpension
                        });
                        let config = await Config.findById('61abe55d2dce63583086f108');
                        var estudiantes = await Estudiante.find();
                        //////console.log('Estudiantes:', estudiantes);
                        if(estudiantes!=undefined){
                            for(var i=0; i<estudiantes.length;i++){
                                //////console.log(estudiantes[i]);
                                if(estudiantes[i].estado=='Activo'&&estudiantes[i].curso<=9){
                                var e=await Estudiante.updateOne({_id:estudiantes[i]._id},{
                                    curso: (parseInt(estudiantes[i].curso)+1).toString()
                                });
                                ////console.log(e);
                                var pension= {};
                                pension.idestudiante= estudiantes[i]._id;
                                pension.anio_lectivo= config.anio_lectivo;
                                pension.condicion_beca = 'No';
                                pension.curso = (parseInt(estudiantes[i].curso)+1).toString();
                                pension.paralelo = estudiantes[i].paralelo;
                                ////console.log(pension);
                                var p = await Pension.create(pension);
                                ////console.log(p);
                                }else{
                                    var e=await Estudiante.updateOne({_id:estudiantes[i]._id},{
                                        estado:'Desactivado'
                                    });
                                }
                            }
                        }
                        
                        let registro={};
                        //////console.log("674:  ",req.user);
                        registro.admin=req.user.sub;
                        registro.tipo='actualizo';
                        registro.descripcion=
                        ' Año Lectivo: '+admin.anio_lectivo+
                        ' Pension: '+admin.pension+
                        ' Numero de Pensiones: '+admin.numpension+
                        ' Matricula: '+admin.matricula+
                        ' Cambio a: Año Lectivo: '+data.anio_lectivo+
                        ' Pension: '+data.pension+
                        ' Numero de Pensiones: '+data.numpension+
                        ' Matricula: '+data.matricula;
                        await Registro.create(registro);
                        res.status(200).send({data:config});
                    }else{
                        let config = await Config.updateOne({_id:'61abe55d2dce63583086f108'},{
                            //envio_activacion : data.envio_activacion,
                            pension:data.pension,
                            matricula:data.matricula,
                            //anio_lectivo:data.anio_lectivo,
                            numpension:data.numpension
                        });
                        res.status(200).send({data:config});
                    }
                }else{
                    res.status(200).send({message:'No puedes ingresar una fecha menor a la anterior'});
                }

            }else{
                res.status(200).send({message:'No puedes ingresar una fecha mayor a la actual'});
            }
        
        } catch (error) {
            ////console.log(error);
            res.status(200).send({message:'Algo Salio mal'});
        }
        
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const obtener_pagos_admin  = async function(req,res){
    if(req.user){
        let pagos = [];
            let desde = req.params['desde'];
            let hasta = req.params['hasta'];

            pagos = await Pago.find().populate('estudiante').sort({createdAt:-1});

            
            res.status(200).send({data:pagos});

            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const obtener_detallespagos_admin  = async function(req,res){
    if(req.user){

            let detalle =[];
            detalle = await Dpago.find().populate('idpension').populate('documento').populate('pago').populate('estudiante');
            
            res.status(200).send({data:detalle});

            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_detalles_ordenes_estudiante_abono  = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var data = req.body;
        abonos = await Dpago.find({idpension:id});
        //////console.log(abonos);
        if(abonos.length>0){
            res.status(200).send({data:abonos});
        }else{
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const marcar_finalizado_orden = async function(req,res){
    if(req.user){

        var id = req.params['id'];
        let data = req.body;

        var pago = await Pago.updateOne({_id:id},{
            estado: 'Finalizado'
        });

        res.status(200).send({data:pago});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const eliminar_documento_admin = async function(req,res){
    if(req.user){
        try {
            var id = req.params['id'];
            var dpagos = await Dpago.find({documento:id});
            if(dpagos.length>0){
            for(var dp of dpagos){
                //actualizacion del documento al valor original
                let doc = await Documento.findById({_id:dp.documento});
                let new_stock = parseFloat(doc.valor) + parseFloat(dp.valor);
                let new_pago = doc.npagos - 1;
                await Documento.updateOne({_id: dp.documento},{
                    valor: new_stock,
                    npagos:new_pago
                });
                //registro de dpago
                let registro={};
                registro.documento=dp.documento;
                registro.admin=req.user.sub;
                registro.tipo='Elimino';
                registro.descripcion=
                ' Pago: '+dp.pago+
                ' Valor: '+dp.valor+
                ' Pension: '+dp.idpension+
                ' Estado: '+dp.estado+
                ' Tipo: '+dp.tipo+'Abono:'+dp.abono;
                await Registro.create(registro);
                //cambio del valor total del pago
                var p = await Pago.findById({_id:dp.pago});
                var np = await Pago.updateOne({_id:dp.pago},{
                  total_pagar: parseFloat(p.total_pagar - dp.valor)
                });
                var p = await Pago.findById({_id:dp.pago});
                //eliminacion en caso de ser 0
                if(p.total_pagar<=0.01){
                    var pagos = await Pago.findById(dp.pago);
                    let registro={};
                        //////console.log(req.user);
                        registro.estudiante=pagos.estudiante;
                        registro.admin=req.user.sub;
                        registro.tipo='Elimino';
                        registro.descripcion=
                        ' Total a Pagar: '+pagos.total_pagar+
                        ' transaccion: '+pagos.transaccion+
                        ' Encargado: '+pagos.encargado.email+'-'+pagos.encargado.dni+
                        ' Estado: '+pagos.estado+
                        ' anio_lectivo: '+pagos.anio_lectivo;
                        await Registro.create(registro);
        
                    await Pago.deleteOne({_id:dp.pago});
                }
                if(dp.tipo==0){
                    //////console.log(dp.estado.search('Abono'));
                     if(dp.estado.search('Abono')==-1){
                         await Pension.updateOne({_id:dp.idpension},{
                             matricula:0
                         })                        
                     }
                     
                 }else{
                     //////console.log(dp.estado.search('Abono'));
                     if(dp.estado.search('Abono')==-1){
                         var aux = await Pension.find({_id:dp.idpension});
                         //////console.log(aux[0]);
                         let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                         if(aux[0].condicion_beca=='Si' && dp.valor!=config.pension){
                             var dpagosbeca = await Dpago.find({idpension:dp.idpension,pago:{$ne:id} });
                             //////console.log(dpagosbeca);
                             await Pension.updateOne({_id:dp.idpension},{
                                 meses:aux[0].meses-1,
                                 num_mes_res:aux[0].num_mes_res + 1
                             })
                         }else{
                             await Pension.updateOne({_id:dp.idpension},{
                                 meses:aux[0].meses-1
                             })
                         }
                         
                     } 
                 }
            }
            //remueve detalle de pago
            await Dpago.deleteMany({documento:id});
            }
            //registra documento
            let doc = await Documento.findById({_id:id});
            registro={};
            registro.documento=id;
            registro.admin=req.user.sub;
            registro.tipo='Elimino';
            registro.descripcion=
            ' documento: '+doc.documento+
            ' valor: '+doc.valor+
            ' contenido: '+doc.contenido+
            ' cuenta: '+doc.cuenta+
            ' f_deposito: '+doc.f_deposito;
            await Registro.create(registro);
            //elimina documento
            await Documento.deleteOne({_id:id});
             
            res.status(200).send({message:'Eliminado con exito'});
        } catch (error) {
            //console.log(error);
            res.status(200).send({message:'Algo salió mal'});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const eliminar_orden_admin = async function(req,res){
    if(req.user){
        try {
            var id = req.params['id'];
            //registra el pago
            var pagos = await Pago.findById(id);
            let registro={};
                //////console.log(req.user);
                registro.estudiante=pagos.estudiante;
                registro.admin=req.user.sub;
                registro.tipo='Elimino';
                registro.descripcion=
                ' Total a Pagar: '+pagos.total_pagar+
                ' transaccion: '+pagos.transaccion+
                ' Encargado: '+pagos.encargado+
                ' Estado: '+pagos.estado+
                ' anio_lectivo: '+pagos.anio_lectivo;
                await Registro.create(registro);
            //elimina el pago
            var pago = await Pago.deleteOne({_id:id});
            //busca los detalles de pago
            var dpagos = await Dpago.find({pago:id});
            for(var dp of dpagos){
                //actualiza el documento con el valor del pago
                let doc = await Documento.findById({_id:dp.documento});
                let new_stock = parseFloat(doc.valor) + parseFloat(dp.valor);
                let new_pago = doc.npagos - 1;
                await Documento.updateOne({_id: dp.documento},{
                    valor: new_stock,
                    npagos:new_pago
                });
                //
                //registro de detalle de pago
                let registro={};
                registro.estudiante=pagos.estudiante;
                registro.documento=dp.documento;
                registro.admin=req.user.sub;
                registro.tipo='Elimino';
                registro.descripcion=
                ' Pago: '+dp.pago+
                ' Valor: '+dp.valor+
                ' Pension: '+dp.idpension+
                ' Estado: '+dp.estado+
                ' Tipo: '+dp.tipo+'Abono:'+dp.abono;
                await Registro.create(registro);
                if(dp.tipo==0){
                   //////console.log(dp.estado.search('Abono'));
                    if(dp.estado.search('Abono')==-1){
                        await Pension.updateOne({_id:dp.idpension},{
                            matricula:0
                        })                        
                    }
                    
                }else{
                    //////console.log(dp.estado.search('Abono'));
                    if(dp.estado.search('Abono')==-1){
                        var aux = await Pension.find({_id:dp.idpension});
                        //////console.log(aux[0]);
                        let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                        if(aux[0].condicion_beca=='Si' && dp.valor!=config.pension){
                            var dpagosbeca = await Dpago.find({idpension:dp.idpension,pago:{$ne:id} });
                            //////console.log(dpagosbeca);
                            await Pension.updateOne({_id:dp.idpension},{
                                meses:aux[0].meses-1,
                                num_mes_res:aux[0].num_mes_res + 1
                            })
                        }else{
                            await Pension.updateOne({_id:dp.idpension},{
                                meses:aux[0].meses-1
                            })
                        }
                        
                    } 
                }
            }
            //remueve detalles de pago
            await Dpago.deleteMany({pago:id});

            res.status(200).send({message:'Eliminado con exito'});
        } catch (error) {
            //////console.log(error);
            res.status(200).send({message:'Algo salió mal'});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const registro_compra_manual_estudiante = async function(req,res){
    if(req.user){
        try {
            let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
            var data = req.body;
            var detalles = data.detalles;

            data.estado = 'Registrado';
            
            //////console.log(data);
            try {
                let pago = await Pago.create(data);
                let registro={};
                    //////console.log(req.user);
                    registro.admin=req.user.sub;
                    registro.estudiante=data.estudiante
                    registro.tipo='creo';
                    registro.descripcion=
                    ' Total: '+data.total_pagar+
                    ' Transaccion: '+data.transaccion+
                    ' Encargado: '+data.encargado+
                    ' Estado: '+data.data+
                    ' Año Lectivo: '+data.anio_lectivo;
                    await Registro.create(registro);
                for(var element of detalles){
                    element.pago = pago._id;
                    element.estudiante = pago.estudiante;
                    


                    if(element.tipo == 0){
                        let mat=0;
                        if(element.valor==config.matricula){
                            mat=1;
                        }else{
                            var acu=0;
                            abonos = await Dpago.find({estudiante:pago.estudiante, tipo: element.tipo});
                            for(var abonoaux of abonos){
                                acu=acu+abonoaux.valor;
                            }

                            if(acu+element.valor==config.matricula){
                                mat=1;
                            }else{
                                element.estado=element.estado;
                            }
                            
                        }

                    let act = await Pension.updateOne({_id:element.idpension},{
                            matricula: mat
                        });
                    }else{
                        if(element.tipo>0 && element.tipo<=10){
                            let element_meses = await Pension.findById({_id:element.idpension}); 
                            let mes =  element_meses.meses;
                            if(element_meses.condicion_beca=='Si'&& element_meses.num_mes_res>0 && element.valor<= element_meses.val_beca){
                               
                                    let res_beca = element_meses.num_mes_res;
                                    if(element.valor==element_meses.val_beca){
                                        mes=mes+1;
                                        res_beca = res_beca-1;
                                    }else{
                                        var acu=0;
                                        abonos = await Dpago.find({estudiante:pago.estudiante, tipo: element.tipo});
                                        for(var abonoaux of abonos){
                                            acu=acu+abonoaux.valor;
                                        }
                                        
                                        if(parseFloat(acu+element.valor)==parseFloat(element_meses.val_beca)){
                                            mes=mes+1;
                                            res_beca = res_beca-1;
                                        }else{
                                            element.estado=element.estado;
                                        }
                                    }
                                    await Pension.updateOne({_id: element.idpension},{
                                        meses: mes,
                                        num_mes_res: res_beca
                                    });
                                
                                

                            }else{
                                if(element.valor==config.pension){
                                    mes=mes+1;
                                }else{
                                    var acu=0;
                                    abonos = await Dpago.find({estudiante:pago.estudiante, tipo: element.tipo});
                                    for(var abonoaux of abonos){
                                        acu=acu+abonoaux.valor;
                                    }
                                
                                    if(parseFloat(acu+element.valor)==parseFloat(config.pension)){
                                        mes=mes+1;
                                    }else{
                                        element.estado=element.estado;
                                    }
                                }
        
                                await Pension.updateOne({_id: element.idpension},{
                                    meses: mes 
                                });
                            }
        
                        }
                    }
                    let registro={};
                    //////console.log(req.user);
                    registro.admin=req.user.sub;
                    registro.estudiante=element.estudiante;
                    registro.pago=element.pago;
                    registro.documento=element.documento;

                    registro.tipo='creo';
                    registro.descripcion=
                    ' Valor: '+element.valor+
                    ' idpension: '+element.idpension+
                    ' tipo: '+element.tipo+
                    ' Estado: '+element.estado+
                    ' transaccion: '+element.transaccion;
                    await Registro.create(registro);
                    await Dpago.create(element);
                
                    let element_documento = await Documento.findById({_id:element.documento});
                    let new_stock = parseFloat(element_documento.valor) - parseFloat(element.valor);
                    let new_pago = element_documento.npagos + 1;
        
                    await Documento.updateOne({_id: element.documento},{
                        valor: new_stock,
                        npagos:new_pago
                    });
                }
                
               // mail_confirmar_envio(pago._id);
                res.status(200).send({pago:pago, message:'Registrado Correctamente'});
        } catch (error) {
            res.status(200).send({message:'Algo salio mal'});
        }

        } catch (error) {
            res.status(200).send({message:'Algo salio mal'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const enviar_orden_compra = async function(pago){
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
    
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'pagos@egbfcristorey.edu.ec',
                pass: 'nxewlthjhaqhqgqb'
            }
        }));
    
     
        var orden = await Pago.findById({_id:pago}).populate('estudiante');
        var dventa = await Dventa.find({venta:venta}).populate('producto').populate('variedad');

        readHTMLFile(process.cwd() + '/mails/email_compra.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dpago:dpago});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: 'pagos@egbfcristorey.edu.ec',
                to: orden.estudiante.email,
                subject: 'Confirmación de pago ' + orden._id,
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    //console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        //console.log(error);
    }
}

const mail_confirmar_envio = async function(pago){
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
    
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'pagos@egbfcristorey.edu.ec',
                pass: 'nxewlthjhaqhqgqb'
            }
        }));
    
     
        var orden = await Pago.findById({_id:pago}).populate('estudiante');
        orden.currency='USD';
        ////console.log(orden);
        var dpago = await Dpago.find({pago:pago}).populate('documento');
       // //console.log(dpago);
    
        readHTMLFile(process.cwd() + '/mails/email_enviado.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dpago:dpago});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: 'pagos@egbfcristorey.edu.ec',
                to: orden.estudiante.email,
                subject: 'Tu pago ' + orden._id + ' fué registrado',
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    //console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        //console.log(error);
    }
}

const enviar_email_pedido_compra = async function(pago){
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
    
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'diegoalonssoac@gmail.com',
                pass: 'dcmplvjviofjojgf'
            }
        }));
    
     
        var orden = await Pago.findById({_id:pago}).populate('estudiante');
        var dpago = await Dpago.find({pago:pago}).populate('documento');
    
    
        readHTMLFile(process.cwd() + '/mails/email_pedido.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dpago:dpago});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: 'diegoalonssoac@gmail.com',
                to: orden.estudiante.email,
                subject: 'Gracias por tu orden, Prágol.',
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    //////console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        //////console.log(error);
    }
}

module.exports = {

    login_admin,
    registro_documento_admin,
    listar_documentos_admin,
    obtener_documento_admin,
    actualizar_documento_admin,
    verificar_token,
    obtener_config_admin,
    actualizar_config_admin,
    obtener_pagos_admin,
    obtener_detalles_ordenes_estudiante_abono,
    marcar_finalizado_orden,
    eliminar_orden_admin,
    registro_compra_manual_estudiante, 
    registro_admin,
    listar_admin,
    actualizar_admin,
    obtener_admin,
    eliminar_admin,
    eliminar_documento_admin,
    eliminar_estudiante_admin,
    reactivar_estudiante_admin,
    obtener_detallespagos_admin,
    listar_registro
}