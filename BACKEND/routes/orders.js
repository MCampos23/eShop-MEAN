
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const {Order} = require('../models/order')
const {OrderItem} = require('../models/order-item')


router.get(`/`, async (req, res) => {
    const orderList = await Order.find()
                                 .sort({'dateOrdered': -1})
                                 .populate('user', 'name')
                                 .populate({path: 'orderItems', populate:{
                                                 path: 'product', populate: 'category'
                                 }})
    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
                             
                             .populate({path: 'orderItems', select: 'quantity product', populate:{path: 'product', populate: 'category' }                             
                              })
                              .populate('user')
                             
    if(!order){
        res.status(500).json({success: false})
    }
    res.send(order)
})

router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
    }))

    const orderItemsIdsResolved = await orderItemsIds
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a + b, 0)

    console.log(totalPrices)
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress1,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })

    order = await order.save()

    if(!order)
    return res.status(404).send('The order cannot be created')
    
    res.send(order)
})

router.put(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('Invalid Product ID')

   
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        {new: true}
        )
    if(!order){
        res.status(500).json({success:false})
    }
    res.send(order)
})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order){
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
        return res.status(200).json({success: true, message: ' The order was deleted.'})
        }else{
            return res.status(404).json({success: false, message: 'Order not found'})
        }
    }).catch(err =>{
        return res.status(400).json({success: false, error: err})
    })
})
router.get('/get/userorders/:userid', async(req, res) => {

    const filter = { user: req.params.userid}
    const userOrders = await Order.find(filter)

    if(userOrders)
    res.send(userOrders)
})


router.get('/get/totalsales', async(req, res) => {
    const totalSales = await Order.aggregate([
        { $group: {_id: null, totalSales: {$sum: '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalSales})
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments((count)=> count)

    if(!orderCount){
        res.status(500).json({succes:false})
    }
    res.send({
        orderCount: orderCount,
        })
})
module.exports = router