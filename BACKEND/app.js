const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
require('dotenv/config')
const api = process.env.API_URL
app.use(cors())
app.options('*', cors())

//Middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler)


//Routers
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
.then(()=>{
    console.log("db connection is ready")
})
.catch((err) => {
    console.log(err)
})

//Server
app.listen(3000, ()=>{
    console.log("Server running on 3000 port")
})