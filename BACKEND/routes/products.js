
const {Product} = require('../models/product')
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose')

router.get(`/`, async (req, res) => {
    const productList = await Product.find().select('name image')

    if(!productList){
        res.status(500).json({succes:false})
    }
    res.send(productList)
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})

router.delete(`/:id`, async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id)

    if(!product){
        res.status(500).json({success:false})
    }
    res.status(200).json({
        success: true,
        message: "The product is deleted"
    })
})

router.put(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('Invalid Product ID')
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        },
        {new: true}
        )
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save()

    if(!product)
       return res.status(500).send("The product cannot be created")
    
    res.send(product)    
})

module.exports = router