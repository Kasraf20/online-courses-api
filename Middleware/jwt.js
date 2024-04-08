const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtAuthMiddleware = (req,res,next) => {
    const token = req.header('Authorization').split(' ')[1]
    if(!token) return res.json({error:'Unauthorized'})
    try{
        const decode = jwt.verify(token,process.env.SECRATE_KEY)
        req.user = decode
        next()
    }catch(err){
        res.json({error:'Invalid Token'})
    }
}

const generateToken = (payload) => {
    return jwt.sign(payload,process.env.SECRATE_KEY)
}


module.exports = {jwtAuthMiddleware,generateToken}

