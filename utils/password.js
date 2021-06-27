const { SECRET } = require("../config/index");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const forgotPassword = async (req, res)=>{
    
    let { email } = req.body;
    
    // First Check if the email is in the database
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            message: "Email is not found. Invalid credentials.",
            success: false
        });
    }

    // Sign in the token and issue it to the user
    let token = jwt.sign({
        user_id: user._id
    },
        SECRET,
        { expiresIn: 60 * 20 } // Token will expire in 20 minutes
    );

    await user.updateOne({ resetPassword : token },(err,success) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to reset your password.",
                success: false
            });
        } else {
            console.log(req.get('host')+"/reset-password/"+ token);
            return res.redirect(303, req.get('host')+"/reset-password/"+ token.toString());
        }
    })
}

const varifyToken = (req, res, next) => {
    const { token } = req.params
    if (token){
        jwt.verify (token, SECRET, async (err,data) => {
            if (err) {
                return res.status(500).json({
                    message: "Incorrect Token or Token has been expired !! TRY AGAIN",
                    success: false
                });
            }
            else {
                const user = await User.findOne({ _id : data.user_id });
                req.user = user;
                if (!user){
                    return res.status(500).json({
                        message: "This user doesn't exists anymore",
                        success: false
                    });
                } else {
                    user.resetPassword == token ? next() : res.status(500).json({
                        message: "Incorrect Token",
                        success: false
                    });
                }
            }
        })
    } else {
        return res.status(500).json({
            message: "Authentication error",
            success: false
        });
    }
}

module.exports = {
    forgotPassword,
    varifyToken
}