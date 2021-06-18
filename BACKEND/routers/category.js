
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    
    res.send('Category works!!')
})


module.exports = router