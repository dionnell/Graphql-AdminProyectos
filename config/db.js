const mongoose = require('mongoose')
require('dotenv').config({path: 'variables.env'})
 
const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO)
        console.log('BD conectada')
    } catch (error) {
        console.log('hubo un error')
        console.log(error)
        process.exit(1) //detener app
    }
}
 
module.exports = conectarDB