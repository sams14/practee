const router = require('express').Router();
const path =  require('path');
const bodyParser = require('body-parser');
const User = require('../DB/user');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
//route to post user details to db
router.post('/new', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    });
    const savedUser = await user.save();
    res.send(savedUser);
});

//route to see the data in the database
router.get('/read', function(req, res) {
    var select = req.query.select;
    User.find({}, function(err, foundData) {
        if(err){
            console.log(err);
            res.status(500).send();
        } else {
            if(foundData.length == 0){
                var responseObj = undefined;
                if(select && select == 'count'){
                    responseObj = { count: foundData.length};
                }
            } else {
                var responseObj = foundData;
                if(select && select == 'count'){
                    responseObj = { count: foundData.length};
                }
                res.send(JSON.parse(responseObj));
            }
        }
    });
});


router.get('/test', async (req, res) => {
    res.sendFile(path.join(__dirname + '/test.html'))
});

router.post('/test', function(req, res){
    res.send(req.body);
});

module.exports = router;