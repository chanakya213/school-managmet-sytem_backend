const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
    try {
        let token = req.header("x-token");
        if(!token){
            res.send("oh..! oh...! token not found");
        }
        let decoded = jwt.verify(token,"iwillad,dotENV,toprotect,this,password");
        req.user = decoded.user
        next();
    } catch(err) {
        res.status(400).send("Authentication Error");
    }
};

