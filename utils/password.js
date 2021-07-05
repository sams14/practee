const { SECRET, USER, PASS } = require("../config/index");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
var nodemailer = require('nodemailer');

/**
 * @DESC To trigger a mail middleware
 */
const mailer = async mailOptions => {
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER,
        pass: PASS
    }
    });

    await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent to '+ mailOptions.to +': ' + info.response);
    }
    });
}

/**
 * @DESC To sign a password-reset token middleware
 */
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

    await User.updateOne({ _id : user._id }, { resetPassword : token }, async (err,success) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to reset your password.",
                success: false
            });
        } else {
            var mailOptions = {
                from: "ash2000test@gmail.com",
                to: user.email,
                subject: 'Reset Practee Password',
                html: `
                <h3>Varification Link</h3>
                <h4>Click on the link below to reset your password. This Link will be activated for 15 mins</h4>
                <h3><a href="http://${req.get('host')+"/reset-password/"+ token}" >Varify Now!</a><h3>
                `
                };
            await mailer(mailOptions);
            console.log('http://'+req.get('host')+'/reset-password/'+ token);
            return res.status(200).json({
                message: "Confirmation Mail Has Been Sent To The Email-ID. Kindly Varify !!",
                success: true
            });
            // return res.redirect(303 ,"/reset-password/"+ token.toString());
        }
    })
}

/**
 * @DESC To authenticate password-reset token middleware
 */
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
    varifyToken,
    mailer
}