var Estudiante = require('../models/Estudiante');
var Carrito = require('../models/Carrito');
var Variedad = require('../models/Variedad');
var Pago = require('../models/Pago');
var Dpago = require('../models/Dpago');
var Review = require('../models/Review');
var Contacto = require('../models/Contacto');
var Direccion = require('../models/Direccion');
var bcrypt = require('bcrypt-nodejs');
var Producto = require('../models/Producto');
var jwt = require('../helpers/jwt');




var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var Pension = require('../models/Pension');
const Config = require('../models/Config');
var Registro = require('../models/Registro');
registro_estudiante_tienda = async function(req,res){
    let data = req.body;
    var estudiantes_arr = [];

    estudiantes_arr = await Estudiante.find({email:data.email});

    if(estudiantes_arr.length == 0){
        if(data.password){
            bcrypt.hash(data.password,null,null, async function(err,hash){
                if(hash){
                    data.dni = '';
                    data.password = hash;
                    var reg = await Estudiante.create(data);
                    res.status(200).send({data:reg});
                }else{
                    res.status(200).send({message:'ErrorServer',data:undefined});
                }
            })
        }else{
            res.status(200).send({message:'No hay una contraseña',data:undefined});
        }

        
    }else{
        res.status(200).send({message:'El correo ya existe, intente con otro.',data:undefined});
    }
}

listar_estudiantes_tienda = async function(req,res){
    if(req.user){
        var estudiantes = await Estudiante.find().sort({createdAt:-1});
        res.status(200).send({data:estudiantes});
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}
listar_pensiones_estudiantes_tienda = async function(req,res){
    if(req.user){
        var estudiantes = await Pension.find().populate('idestudiante');
        res.status(200).send({data:estudiantes});
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}



/**** */



const listar_documentos_nuevos_publico = async function(req,res){
    let reg = await Producto.find({estado: 'Publicado'}).sort({createdAt:-1}).limit(8);
    res.status(200).send({data: reg});
}

const registro_estudiante = async function(req,res){
    if(req.user){
        try {
            var data = req.body;
            var estudiantes_arr = [];
            var pension= {};
            if(data!=undefined){

                estudiantes_arr = await Estudiante.find({dni:data.dni});
                ////console.log(data);
                if(estudiantes_arr.length == 0){
                    ////console.log(data);
                    var reg = await Estudiante.create(data);
                       /* let registro={};
                        ////console.log(req.user);
                        registro.admin=req.user.sub;
                        registro.estudiante=reg._id;
                        registro.tipo='creo';
                        registro.descripcion=
                        ' nombres: '+data.nombres+
                        ' apellidos: '+data.apellidos+
                        ' genero: '+data.genero+
                        ' f_nacimiento: '+data.f_nacimiento+
                        ' telefono: '+data.telefono+
                        ' dni: '+data.dni+
                        ' estado: '+data.estado+
                        ' curso: '+data.curso+
                        ' paralelo: '+data.paralelo;*/
                       // await Registro.create(registro);

                    let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                    var fecha2=[], meses;
                    if(data.desc_beca==100){
                        
                        for (let j = 0; j < 10; j++) {
                            fecha2.push({
                                date: new Date(config.anio_lectivo).setMonth(
                                    new Date(config.anio_lectivo).getMonth() + j
                                )
                            });
                        }
                        var des=0;
                        fecha2.forEach(element => {
                            if(new Date(element.date).getMonth()==11){
                                des=1;
                            }
                        });
                        if(des==1){
                            if(data.num_mes_beca<=9){
                                meses=data.num_mes_beca;
                            }else{
                                meses=9;
                            }
                            
                        }else{
                            meses=data.num_mes_beca;
                        }
                       
                    }else{
                        meses=0;
                    }
                    
                    pension.paga_mat=data.paga_mat;
                   // pension.meses=meses;
                    pension.idestudiante= reg.id;
                    pension.anio_lectivo= config.anio_lectivo;
                    pension.condicion_beca = data.condicion_beca;
                    pension.val_beca = data.val_beca;
                    pension.num_mes_beca = data.num_mes_beca;
                    pension.num_mes_res = data.num_mes_beca;
                    pension.desc_beca = data.desc_beca;
                    pension.matricula = data.matricula;
                    pension.curso = data.curso;
                    pension.paralelo = data.paralelo;
                    
                    ////console.log(pension);
                    var reg2 = await Pension.create(pension);
                  /*  registro={};
                        ////console.log(req.user);
                        registro.admin=req.user.sub;
                        registro.estudiante=reg._id;
                        registro.tipo='creo';
                        registro.descripcion=
                        ' condicion_beca: '+pension.condicion_beca+
                        ' desc_beca: '+pension.desc_beca+
                        ' val_beca: '+pension.val_beca+
                        ' num_mes_beca: '+pension.num_mes_beca+
                        ' num_mes_res: '+pension.num_mes_res+
                        ' curso: '+pension.curso+
                        ' paralelo: '+pension.paralelo;*/
                      //  await Registro.create(registro);
                    ////console.log(reg2);
                    res.status(200).send({message:'Estudiante agregado con exito'});
                }else{
                    if(estudiantes_arr[0].estado=='Desactivado'){
                       let re= await Estudiante.updateOne({dni:data.dni},{
                            estado:'Activo',
                            genero:data.genero,
                            nombres:data.nombres,
                            apellidos:data.apellidos,
                            email:data.email,
                            telefono:data.telefono,
                            curso:data.curso,
                            paralelo:data.paralelo
                        });
                        let reg = await Estudiante.find({dni:data.dni});
                        let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                        let pen = await Pension.find({idestudiante:reg[0].id,anio_lectivo:config.anio_lectivo });
                        if(pen.length==0){
                            var fecha2=[], meses;
                            if(data.desc_beca==100){
                                
                                for (let j = 0; j < 10; j++) {
                                    fecha2.push({
                                        date: new Date(config.anio_lectivo).setMonth(
                                            new Date(config.anio_lectivo).getMonth() + j
                                        )
                                    });
                                }
                                var des=0;
                                fecha2.forEach(element => {
                                    if(new Date(element.date).getMonth()==11){
                                        des=1;
                                    }
                                });
                                if(des==1){
                                    if(data.num_mes_beca<=9){
                                        meses=data.num_mes_beca;
                                    }else{
                                        meses=9;
                                    }
                                    
                                }else{
                                    meses=data.num_mes_beca;
                                }
                            
                            }else{
                                meses=0;
                            }
                            pension.paga_mat=data.paga_mat;
                           // pension.meses=meses;
                            pension.idestudiante= reg[0].id;
                            pension.anio_lectivo= config.anio_lectivo;
                            pension.condicion_beca = data.condicion_beca;
                            pension.val_beca = data.val_beca;
                            pension.num_mes_beca = data.num_mes_beca;
                            pension.num_mes_res = data.num_mes_beca;
                            pension.desc_beca = data.desc_beca;
                            pension.matricula = data.matricula;
                            pension.curso = data.curso;
                            pension.paralelo = data.paralelo;
                            
                            ////console.log(pension);
                            var reg2 = await Pension.create(pension);
                            res.status(200).send({message:'Reactivado'}); 
                        } else{
                            var fecha2=[], meses;
                            if(data.desc_beca==100){
                                
                                for (let j = 0; j < 10; j++) {
                                    fecha2.push({
                                        date: new Date(config.anio_lectivo).setMonth(
                                            new Date(config.anio_lectivo).getMonth() + j
                                        )
                                    });
                                }
                                var des=0;
                                fecha2.forEach(element => {
                                    if(new Date(element.date).getMonth()==11){
                                        des=1;
                                    }
                                });
                                if(des==1){
                                    if(data.num_mes_beca<=9){
                                        meses=data.num_mes_beca;
                                    }else{
                                        meses=9;
                                    }
                                    
                                }else{
                                    meses=data.num_mes_beca;
                                }
                            
                            }else{
                                meses=pen[0].meses;
                            }
                            await Pension.updateOne({idestudiante:reg[0].id,anio_lectivo:config.anio_lectivo },{
                                paga_mat:data.paga_mat,
                                //meses:meses,
                                curso:data.curso,
                                paralelo:data.paralelo
                            });
                            res.status(200).send({message:'Reactivado existing pension'});
                        }
                                 
                    }else{
                    res.status(200).send({message:'El numero de cédula ya existe en la base de datos'});
                    }
                }
            }else{
                ////console.log(error);
                res.status(200).send({message:'Algo salió mal'});
            }
        } catch (error) {
            ////console.log(error);
            res.status(200).send({message:'Algo salió mal'});
        }
    }else{
        res.status(200).send({message:'No Access'});
    }

}
const registro_estudiante_masivo = async function(req,res){
    if(req.user){
        try {
            var data = req.body;
            
            
            let subidos=0;
            let resubidos=0;
            let resubidosc=0;
            let errorneos=0;
            let errorv=0;
            let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
            if(data.length>0){
                for(var i=0; i<data.length;i++){
                    var estudiantes_arr = [];
                    var pension= {};
                    var element = data[i];
                    if(element!=undefined){
    
                        estudiantes_arr = await Estudiante.find({nombres:element.nombres,apellidos:element.apellidos});
                        var a = await Estudiante.find({dni:element.dni});
                        
                        
                        if(estudiantes_arr.length == 0 && a.length==0){
    
                            var reg = await Estudiante.create(element);
    
                         
                            
                            pension.paga_mat=element.paga_mat;
                            pension.idestudiante= reg.id;
                            pension.anio_lectivo= config.anio_lectivo;
                            pension.condicion_beca = element.condicion_beca;
                            pension.val_beca = element.val_beca;
                            pension.num_mes_beca = element.num_mes_beca;
                            pension.num_mes_res = element.num_mes_beca;
                            pension.desc_beca = element.desc_beca;
                            pension.matricula = element.matricula;
                            pension.curso = element.curso;
                            pension.paralelo = element.paralelo;
                            
                            var reg2 = await Pension.create(pension);
    
                            subidos=subidos+1;
                           // //console.log("1",subidos);
                        //  res.status(200).send({message:'Estudiante agregado con exito'});
                        }else{
                            try {
                                if(estudiantes_arr[0].estado=='Desactivado' || a[0].estado=='Desactivado'){
                                    let reg= await Estudiante.updateOne({dni:element.dni},{
                                            estado:'Activo',
                                            genero:element.genero,
                                            nombres:element.nombres,
                                            apellidos:element.apellidos,
                                            email:element.email,
                                            telefono:element.telefono,
                                            curso:element.curso,
                                            paralelo:element.paralelo
                                        });
                                        
                                        
                                        var est = await Estudiante.find({dni:element.dni});
                                        //console.log(est);
                                        //console.log(est[0]._id);
                                        //console.log(est[0].estado);
                                        //busca pension del año lectivo activo
                                        let pen = await Pension.find({idestudiante:est[0]._id,anio_lectivo:config.anio_lectivo });
                                        
                                        if(pen.length==0){
        
                                            pension.paga_mat=element.paga_mat;
                                        // pension.meses=meses;
                                            pension.idestudiante= est[0]._id;
                                            pension.anio_lectivo= config.anio_lectivo;
                                            pension.condicion_beca = element.condicion_beca;
                                            pension.val_beca = element.val_beca;
                                            pension.num_mes_beca = element.num_mes_beca;
                                            pension.num_mes_res = element.num_mes_beca;
                                            pension.desc_beca = element.desc_beca;
                                            pension.matricula = element.matricula;
                                            pension.curso = element.curso;
                                            pension.paralelo = element.paralelo;
                                            
                                            ////console.log(pension);
                                            var reg2 = await Pension.create(pension);
                                            resubidos=resubidos+1;
                                          //  //console.log("2",resubidos);
                                        //  res.status(200).send({message:'Reactivado'}); 
                                        } else{
                                            
                                            await Pension.updateOne({idestudiante:est[0]._id,anio_lectivo:config.anio_lectivo },{
                                                paga_mat:element.paga_mat,
                                                //meses:meses,
                                                curso:element.curso,
                                                paralelo:element.paralelo
                                            });
                                            resubidosc=resubidosc+1;
                                           // //console.log("3",resubidosc);
                                        // res.status(200).send({message:'Reactivado existing pension'});
                                        }
                                                
                                    }else{
                                    errorneos=errorneos+1;
                                   // //console.log("4",errorneos);
                                // res.status(200).send({message:'El numero de cédula ya existe en la base de datos'});
                                    }
                            } catch (error) {
                                //console.log(error);
                                errorv=errorv+1;
                                ////console.log("5:396",errorv);
                            }
                            
                        }
                    }else{
                        errorv=errorv+1;
                      //  //console.log("5:402",errorv);
                        ////console.log(error);
                    // res.status(200).send({message:'Algo salió mal'});
                    }
                
                }
                
                //console.log("1",subidos,"2",resubidos,"3",resubidosc,"4",errorneos,"5",errorv);
                
                
                
                res.status(200).send({s:subidos,r:resubidos,rc:resubidosc,e:errorneos,ev:errorv});
            }else{
                //console.log("6",subidos);
                //console.log("7",resubidos);
                //console.log("8",resubidosc);
                //console.log("9",errorneos);
                //console.log("10",errorv);
                res.status(200).send({s:subidos,r:resubidos,rc:resubidosc,e:errorneos,ev:(-999)});
            }
                

           
            
        
           
        } catch (error) {
            ////console.log(error);
            res.status(200).send({message:'Algo salió mal'});
        }
    }else{
        res.status(200).send({message:'No Access'});
    }

}

const crear_pension_estudiante = async (req,res)=>{
    var data = req.body;
    var estudiantes_arr = [];
    var pension= {};
    estudiantes_arr = await Estudiante.find({_id:data.id});
    if(estudiantes_arr.length == 1){
        let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
    
        pension.idestudiante= data.id;
        pension.anio_lectivo= config.anio_lectivo;
        pension.condicion_beca = 'No';
        pension.val_beca = undefined;
        pension.num_mes_beca = undefined;
        pension.num_mes_res = undefined;
        pension.desc_beca = undefined;
        pension.matricula = undefined;
        
        ////console.log(pension);
        var reg2 = await Pension.create(pension);
        ////console.log(reg2);
        res.status(200).send({message:'Prensión creada con exito',data:reg2});
    }else{
    res.status(200).send({message:'Error no existe el estudiante',data:undefined});
    }
    
   
}



const login_estudiante = async function(req,res){
    var data = req.body;
    var estudiante_arr = [];

    estudiante_arr = await Estudiante.find({email:data.email});

    if(estudiante_arr.length == 0){
        res.status(200).send({message: 'No se encontro el correo', data: undefined});
    }else{
        //LOGIN
        let user = estudiante_arr[0];
        bcrypt.compare(data.password, user.password, async function(error,check){
            if(check){

                if(data.carrito.length >= 1){
                    for(var item of data.carrito){
                        await Carrito.create({
                            cantidad:item.cantidad,
                            documento:item.documento._id,
                            variedad:item.variedad.id,
                            estudiante:user._id
                        });
                    }
                }

                res.status(200).send({
                    data:user,
                    token: jwt.createToken(user)
                });
            }else{
                res.status(200).send({message: 'La contraseña no coincide', data: undefined}); 
            }
        });
 
    } 
}

const obtener_estudiante_guest = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        try {
            let estudiante = await Estudiante.findById({_id:id});
          //  ////console.log(estudiante);
            res.status(200).send({data:estudiante});
            
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{

        res.status(500).send({message: 'NoAccess'});
    }
}
const obtener_pension_estudiante_guest = async function(req,res){
    var pen={};
    if(req.user){
        var id = req.params['id'];
        try {
            let estudiante = await Pension.find({idestudiante:id});
            ////console.log(estudiante);
            pen = Object.assign(estudiante);
           
            //////console.log(pen);
            res.status(200).send({data:pen});
            
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{

        res.status(500).send({message: 'NoAccess'});
    }
  
}
const obtener_config_admin = async (res)=>{
    let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
    ////console.log(config);
    res.status(200).send({data:config});
}

const actualizar_estudiante_admin = async function(req,res){

    if(req.user){
        var id = req.params['id'];
        let data = req.body;
        ////console.log(data);
                var reg = await Estudiante.updateOne({_id:id},{
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    telefono :data.telefono,
                    genero :data.genero,
                    email :data.email,
                    dni: data.dni,
                    curso:data.curso,
                    paralelo:data.paralelo  
                });
                let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                var reg2 = await Pension.find({idestudiante:id, anio_lectivo:config.anio_lectivo});
                ////console.log(reg2);
                try {
                    if(reg2.length==1){
                        var i=0;
                        var fecha2=[], meses;
                        if(data.desc_beca==100){
                            
                            for (let j = 0; j < 10; j++) {
                                fecha2.push({
                                    date: new Date(reg2[i].anio_lectivo).setMonth(
                                        new Date(reg2[i].anio_lectivo).getMonth() + j
                                    )
                                });
                            }
                            var des=0;
                            fecha2.forEach(element => {
                                if(new Date(element.date).getMonth()==11){
                                    des=1;
                                }
                            });
                            if(des==1){
                                if(data.num_mes_beca<=9){
                                    meses=data.num_mes_beca;
                                }else{
                                    meses=9;
                                }
                                
                            }else{
                                meses=data.num_mes_beca;
                            }
                           
                        }else{
                            meses=reg2[i].meses;
                        }
                        if(data.condicion_beca=='Si'){
                            if(reg2[i].num_mes_beca!=undefined){
                                var aux=reg2[i].num_mes_beca-data.num_mes_beca;
                                ////console.log(aux);
                                if(aux <=0) {
                                    var reg3 = await Pension.updateOne({_id:reg2[i]._id},{
                                        paga_mat:data.paga_mat,
                                        //meses:meses,
                                        matricula: data.matricula,
                                        condicion_beca: data.condicion_beca,
                                        desc_beca :data.desc_beca,
                                        val_beca: data.val_beca,
                                        num_mes_beca: data.num_mes_beca,
                                        num_mes_res: (reg2[i].num_mes_res+(data.num_mes_beca-reg2[i].num_mes_beca)),   
                                        curso:data.curso,
                                        paralelo:data.paralelo                  
                                    });
                                    res.status(200).send({message:'Actualizado con exito',data:reg3});
                                    
                                }else{
                                    if((reg2[i].num_mes_res-(reg2[i].num_mes_beca-data.num_mes_beca))>=0){
                                        var reg3 = await Pension.updateOne({_id:reg2[i]._id},{
                                            paga_mat:data.paga_mat,
                                           // meses:meses,
                                            matricula: data.matricula,
                                            condicion_beca: data.condicion_beca,
                                            desc_beca :data.desc_beca,
                                            val_beca: data.val_beca,
                                            num_mes_beca: data.num_mes_beca,
                                            num_mes_res: (reg2[i].num_mes_res-(reg2[i].num_mes_beca-data.num_mes_beca)), 
                                            curso:data.curso,
                                            paralelo:data.paralelo                     
                                        });
                                        res.status(200).send({message:'Actualizado con exito',data:reg3});
                                        
                                    }else{
                                    res.status(200).send({message:'Error de consistencia el número de meses con becas usados es mayor a los meses asignados'});
                                    
                                    }
                                }
                            }else{
                                
                                    var reg3 = await Pension.updateOne({_id:reg2[i]._id},{
                                        paga_mat:data.paga_mat,
                                        //meses:meses,
                                        matricula: data.matricula,
                                        condicion_beca: data.condicion_beca,
                                        desc_beca :data.desc_beca,
                                        val_beca: data.val_beca,
                                        num_mes_beca: data.num_mes_beca,
                                        num_mes_res: data.num_mes_beca,   
                                        curso:data.curso,
                                        paralelo:data.paralelo                   
                                    });
                                    res.status(200).send({message:'Actualizado con exito',data:reg3});
                               
                                
                                
                            }
                            
        
        
                        }else{
                            var reg3 = await Pension.updateOne({_id:reg2[i]._id},{
                                condicion_beca: 'No',
                                desc_beca :'',
                                val_beca:'',
                                num_mes_beca:'',
                                num_mes_res:'',
                                curso:data.curso,
                                paralelo:data.paralelo  
                            });
                            ////console.log(reg3);             
                            res.status(200).send({message:'Actualizado con exito',data:reg3});
                            
                        }
                    }else{
                        res.status(200).send({message:'Pension no encontrada, algo salió mal'});
                    }
                } catch (error) {
                    res.status(200).send({message:'Algo salió mal'});
                }
                    
                
                
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}




//---METODOS PUBLICOS----------------------------------------------------



const obtener_ordenes_estudiante  = async function(req,res){
    if(req.user){
        var id = req.params['id'];
     
        let reg = await Pago.find({estudiante:id}).sort({createdAt:-1});
        res.status(200).send({data:reg});   
    }else{
        res.status(500).send({message: 'NoAccess'});
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
    
     
        var orden = await Pago.findById({_id:pago}).populate('estudiante').populate('direccion');
        var dpago = await Dpago.find({pago:pago}).populate('documento').populate('variedad');
    
    
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
                    ////console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        ////console.log(error);
    }
} 


const obtener_detalles_ordenes_estudiante  = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        ////console.log(id.toString());
        try {
            let pago = await Pago.findById({_id:id}).populate('estudiante').populate('encargado');
            let detalles = await Dpago.find({pago:pago._id}).populate('documento');
            res.status(200).send({data:pago,detalles:detalles});

        } catch (error) {
            ////console.log(error);
            res.status(200).send({message:'No tiene pagos', data:undefined});
        }
            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}
const obtener_detalles_por_estudiante  = async function(req,res){

    if(req.user){
        let detalles=[];
        var id = req.params['id'];
        ////console.log(id.toString());
        try {
            let pago = await Pago.find({estudiante:id});
            ////console.log(pago);
            for(let i of pago){
                ////console.log(i._id);
                var aux = await Dpago.find({pago:i._id});
                ////console.log(aux);
                for(let k of aux){
                    detalles.push({
                        idpension:k.idpension,
                        documento:k.documento,
                        valor:k.valor,
                        tipo:k.tipo,
                        estado:k.estado,
                        pago:k.pago
                    }); 
                }
              
                ////console.log(detalles);
            }
            res.status(200).send({data:pago,detalles:detalles});

        } catch (error) {
            ////console.log(error);
            res.status(200).send({message:'No tiene pagos', data:undefined});
        }
            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const emitir_review_producto_estudiante  = async function(req,res){
    if(req.user){
        let data = req.body;
        let reg = await Review.create(data);
        res.status(200).send({data:reg});

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_review_producto_estudiante  = async function(req,res){
    let id = req.params['id'];
    let reg = await Review.find({documento:id}).sort({createdAt:-1});
    res.status(200).send({data:reg});
}

const obtener_reviews_producto_publico = async function(req,res){
    let id = req.params['id'];

    let reviews = await Review.find({documento:id}).populate('estudiante').sort({createdAt:-1});
    res.status(200).send({data: reviews});
}


const comprobar_carrito_estudiante = async function(req,res){
    if(req.user){
        try {
            var data = req.body;
            var detalles = data.detalles;
            let access = false;
            let producto_sl = '';

            for(var item of detalles){
                let variedad = await Variedad.findById({_id:item.variedad}).populate('documento');
                if(variedad.stock < item.cantidad){
                    access = true;
                    producto_sl = variedad.documento.titulo;
                }
            }

            if(!access){
                res.status(200).send({pago:true});
            }else{
                res.status(200).send({pago:false,message:'Stock insuficiente para ' + producto_sl});
            }
        } catch (error) {
            ////console.log(error);
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const consultarIDPago = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var pagos = await Pago.find({transaccion:id});
        res.status(200).send({data:pagos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const registro_compra_estudiante = async function(req,res){
    if(req.user){

        var data = req.body;
        var detalles = data.detalles;

        data.estado = 'Procesando';

        let pago = await Pago.create(data);

        for(var element of detalles){
            element.pago = pago._id;
            await Dpago.create(element);

            let element_producto = await Producto.findById({_id:element.documento});
            let new_stock = element_producto.stock - element.cantidad;
            let new_pagos = element_producto.npagos + 1;

            let element_variedad = await Variedad.findById({_id:element.variedad});
            let new_stock_variedad = element_variedad.stock - element.cantidad;

            await Producto.findByIdAndUpdate({_id: element.documento},{
                stock: new_stock,
                npagos: new_pagos
            });

            await Variedad.findByIdAndUpdate({_id: element.variedad},{
                stock: new_stock_variedad,
            });

            //limpiar carrito
            await Carrito.remove({estudiante:data.estudiante});
        }

        enviar_orden_compra(pago._id);

        res.status(200).send({data:pago});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_reviews_estudiante  = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let reg = await Review.find({estudiante:id}).populate('estudiante').populate('documento');
        res.status(200).send({data:reg});

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const enviar_mensaje_contacto  = async function(req,res){
    let data = req.body;

    data.estado = 'Abierto';
    let reg = await Contacto.create(data);
    res.status(200).send({data:reg});

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
                user: 'diegoalonssoac@gmail.com',
                pass: 'dcmplvjviofjojgf'
            }
        }));
    
     
        var orden = await Pago.findById({_id:pago}).populate('estudiante').populate('direccion');
        var dpago = await Dpago.find({pago:pago}).populate('documento').populate('variedad');
    
    
        readHTMLFile(process.cwd() + '/mails/email_compra.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dpago:dpago});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: 'diegoalonssoac@gmail.com',
                to: orden.estudiante.email,
                subject: 'Confirmación de compra ' + orden._id,
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    ////console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        ////console.log(error);
    }
} 


module.exports = {
    registro_estudiante_tienda,
    listar_estudiantes_tienda,
    listar_documentos_nuevos_publico,
    registro_estudiante,
    registro_estudiante_masivo,
    login_estudiante,
    obtener_estudiante_guest,
    actualizar_estudiante_admin,

    obtener_ordenes_estudiante,
    obtener_detalles_ordenes_estudiante,
    obtener_detalles_por_estudiante,
    comprobar_carrito_estudiante,
    consultarIDPago,
    registro_compra_estudiante,
    obtener_reviews_estudiante,
    enviar_mensaje_contacto,
    obtener_pension_estudiante_guest,
    crear_pension_estudiante,
    listar_pensiones_estudiantes_tienda
}