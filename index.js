const {ApolloServer} = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')

require('dotenv').config({path: 'variables.env'})
const jwt = require('jsonwebtoken')

const conectarDB = require('./config/db')

//Conectar a la DB
conectarDB()

const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || ''
        if(token){
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA)
                return {
                    usuario
                }
            } catch (error) {
                console.log('token no valido')
            }
        }
    }
})

server.listen().then(({url}) => {
    console.log(`servidor listo en la URL ${url}`)
})