
const express = require('express');
const router = express.Router();
const {User} = require('../models/user')
const mongoose = require('mongoose')
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash')
    if(!userList){
        res.status(500).json({success: false})
    }
    res.send(userList)
})

router.get(`/:id`, async (req, res) => {

    const user = await User.findById(req.params.id).select('-passwordHash')
    if(!user){
        res.status(500).json({message: 'The user with the given ID was not found!'})
    }
    res.send(user)
})

router.put('/:id', async (req,res) => {
    const userExists = await User.findById(req.params.id)
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    }else {
        newPassword = userExists.passwordHash
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            passwordHash: newPassword,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        { new: true}
        )
        if(!updatedUser)
    return res.status(404).send('The category cannot be created')
    
    res.send(updatedUser)
})
router.post(`/`, async (req, res) => {
     
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })

    user = await user.save()

    if(!user)
       return res.status(500).send("The user cannot be created")
    
    res.send(user)    
})

router.post(`/register`, async (req, res) => {
     
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })

    user = await user.save()

    if(!user)
       return res.status(500).send("The user cannot be created")
    
    res.send(user)    
})

router.post(`/login`, async (req, res) => {
     
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret
    if (!user){
        res.status(400).send('User not found')
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id
            },
            secret,
            {expiresIn: '1d'}
        )
        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(400).send('password is wrong')
    }
 
})

module.exports = router