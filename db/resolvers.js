const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tarea = require('../models/Tarea')
require('dotenv').config({path: 'variables.env'})

//Crear un JsonWebToken
const crearToken = (usuario, secreta, expiresIn) => {
    const {id, email} = usuario
    return jwt.sign({id, email}, secreta, {expiresIn})
}

const resolvers = {
    Query: {
       obtenerProyectos: async (_, {}, ctx) => {
            const proyectos = await Proyecto.find({ creador: ctx.usuario.id})
            return proyectos
       },
       obtenerTareas: async (_, {id}, ctx) => {
        
            //Retornar las tareas de un proyecto
            const tareas = await Tarea.find({proyecto: id})
            return tareas
        }
    },
    Mutation: {
        crearUsuario: async( _, {input} ) => {
           const {email, password} = input

           //Si el usuario existe
           const existeUsuario = await Usuario.findOne({email})
            if(existeUsuario) {
                throw new Error('El usuario ya esta registrado')
            }

            //Si el usuario no existe, gurardar en la BD
            try {

                //Hashear pass
                const salt = await bcrypt.genSalt(10)
                input.password = await bcrypt.hash(password, salt)

                const nuevoUsuario = new Usuario(input)  
                nuevoUsuario.save()     
                return "Usuario Creado Correctamente"         
            } catch (error) {
                console.log(error)
            }
        },

        authenticarUsuario: async( _, {input} ) => {
            const {email, password} = input

            //Si el usuario existe
            const existeUsuario = await Usuario.findOne({email})
            if(!existeUsuario) {
                throw new Error('El usuario No esta registrado')
            }
            //password correcto
            const passwordCorrecto = await bcrypt.compare(password, existeUsuario.password)
            if (!passwordCorrecto) {
                throw new Error('Password Incorrecto')
            }

            //Dar acceso a la app
            return{
                token: crearToken(existeUsuario, process.env.SECRETA, '2hr')
            }
        },
        nuevoProyecto: async( _, {input}, ctx ) => {
            try {
                const proyecto = new Proyecto(input)

                //asociar el creador del proyecto
                proyecto.creador = ctx.usuario.id

                //Almacenar en la BD
                const resultado = await proyecto.save()

                return resultado
            } catch (error) {
                console.log(error)
            }
        },
        actualizarProyecto: async( _, {id, input}, ctx ) => {
            //Revisar si el proyecto existe
            let proyecto = await Proyecto.findById(id)

            if(!proyecto){
                throw new Error("Proyecto no Encontrado")
            }

            //Revisar si la persona q edita es el creador
            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error("Solo el creador puede editar el proyecto")
            }
            
            //Guardar Proyecto actualizado
            proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, {new: true})
            return proyecto
        },
        eliminarProyecto: async( _, {id}, ctx ) => {
            //Revisar si el proyecto existe
            let proyecto = await Proyecto.findById(id)

            if(!proyecto){
                throw new Error("Proyecto no Encontrado")
            }

            //Revisar si la persona q elimina es el creador
            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error("Solo el creador puede eliminar el proyecto")
            }

            //Eliminar Proyecto
            await Proyecto.findOneAndDelete({_id: id})
            return 'Proyecto Eliminardo'
            
        },
        crearTarea: async(_, {input}, ctx) => {
            try {
                //Revisar si el proyecto existe
                const {proyecto} = input
                const existeProyecto = await Proyecto.findById(proyecto)
                if(!existeProyecto) {
                    throw new Error('Proyecto no encontrado')
                }
                //Revisar que el usuario este autenticado 
                if(!ctx.usuario) {
                    throw new Error('no tienes permisos para crear una tarea')
                }
                if(ctx.usuario.exp < Date.now() / 1000) {
                    throw new Error('Token Expirado ')
                }
                //Revisar si la persona q crea la tarea es el creador
                if(tarea.creador.toString() !== ctx.usuario.id){
                    throw new Error("Solo el creador puede crear una tarea")
                }

                const tarea = new Tarea(input)
                //Asignar el creador y proyecto
                tarea.creador = ctx.usuario.id
                tarea.proyecto = input.proyecto
                //Alamacenar en la BD
                const resultado = await tarea.save()
                return resultado
            } catch (error) {
                console.log(error)
            }
        },
        actualizarTarea: async( _, {id, input}, ctx ) => {
            //Revisar si la tarea existe
            let tarea = await Tarea.findById(id)

            if(!tarea){
                throw new Error("Tarea no Encontrado")
            }
            //Revisar que el usuario este autenticado 
            if(!ctx.usuario) {
                throw new Error('no tienes permisos para crear una tarea')
            }
            if(ctx.usuario.exp < Date.now() / 1000) {
                throw new Error('Token Expirado ')
            }
            //Revisar si la persona q actualiza es el creador
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error("Solo el creador puede actualizar una tarea")
            }

            //Revisar si la tarea pertenece al proyecto
            const existeProyecto = await Proyecto.findById(input.proyecto)
            if(!existeProyecto) {
                    throw new Error('Proyecto no encontrado')
            }
            //Guardar Tarea actualizado
            tarea = await Tarea.findOneAndUpdate({ _id: id }, input, {new: true})
            return tarea

        },
        eliminarTarea: async( _, {id}, ctx) => {
            //Revisar si la tarea existe
            let tarea = await Tarea.findById(id)

            if(!tarea){
                throw new Error("Tarea no Encontrado")
            }
            //Revisar que el usuario este autenticado 
            if(!ctx.usuario) {
                throw new Error('no tienes permisos para crear una tarea')
            }
            if(ctx.usuario.exp < Date.now() / 1000) {
                throw new Error('Token Expirado ')
            }
            //Revisar si la persona q actualiza es el creador
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error("Solo el creador puede actualizar una tarea")
            }
            //Eliminar Tarea
            await Tarea.findOneAndDelete({_id: id})
            return 'Tarea Eliminarda'

        },
        cambiarEstadoTarea: async(_, {id}, ctx) => {
            //Revisar si la tarea existe
            let tarea = await Tarea.findById(id)
            if(!tarea){
                throw new Error("Tarea no Encontrada")
            }
            //Revisar que el usuario este autenticado 
            if(!ctx.usuario) {
                throw new Error('no tienes permisos para crear una tarea')
            }
            if(ctx.usuario.exp < Date.now() / 1000) {
                throw new Error('Token Expirado ')
            }
            //Revisar si la persona q actualiza es el creador
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error("Solo el creador puede actualizar una tarea")
            }
            //Cambiar el estado
            tarea.estado = !tarea.estado
            tarea = await Tarea.findOneAndUpdate( {_id: id}, tarea, {new: true})
            return tarea
        }
    }
}

module.exports = resolvers