const {gql} = require('apollo-server')


const typeDefs = gql`

    type Token {
        token: String
    }
    type Proyecto {
        nombre: String
        id: ID
    }
    type Tarea {
        nombre: String
        id: ID
        proyecto: String
        estado: Boolean
    }

    type Query {
       obtenerProyectos: [Proyecto]
       obtenerTareas(input: ProyectoIDInput): [Tarea] 
    }

    input ProyectoIDInput {
        proyecto: String!
    }
    input UsuarioInput {
        nombre: String!
        email: String!
        password: String!
    }
    input AutenticarInput {
        email: String!
        password: String!
    }
    input ProyectoInput {
        nombre: String!
    }
    input TareaInput {
        nombre: String!
        proyecto: String!
    }

    
    type Mutation {
        #Crear Usuario
            crearUsuario(input: UsuarioInput): String
            authenticarUsuario(input: AutenticarInput): Token
        
        #Crear, actualizar y elimar Proyectos
            nuevoProyecto(input: ProyectoInput): Proyecto
            actualizarProyecto(id:ID!, input: ProyectoInput): Proyecto
            eliminarProyecto(id: ID!): String

        #Tareas
            crearTarea(input: TareaInput): Tarea
            actualizarTarea(id: ID!, input: TareaInput): Tarea
            eliminarTarea(id: ID!): String
            cambiarEstadoTarea(id: ID!): Tarea
    }
`;

module.exports = typeDefs