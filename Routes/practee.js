const router = require('express').Router();
const User = require('../DB/user');
const Vimeo = require('../models/Vimeo');
const dotenv = require('dotenv');
const Grammarbot = require('grammarbot');
const { update_VimeoFolder } = require('../utils/vimeoFolder');

dotenv.config();

const bot = new Grammarbot({
    'api_key': 'def610595cmshbc7356343999a47p14650ejsn8c9fad9569d9', // (Optional) defaults to node_default
    'language': 'en-US', // (Optional) defaults to en-US
    'base_uri': 'api.grammarbot.io', // (Optional) defaults to api.grammarbot.io
});

router.post('/hook', async function(req, res) {
    console.log(req.body);
    const WebhookData = new User.WebhookData({ any: req.body });
    const data = await WebhookData.save();
    res.send(data);
});

router.get('/hook', async function(req, res) {
    User.WebhookData.find({}, (err, hookData) => {
        res.render('webhook', { data: hookData });
    });
});

router.get('/grammar', function(req, res) {
    res.render('checkGram');
});

router.post('/grammar', function(req, res) {
    var sen = req.body.txt;
    bot.check(sen, function(error, result) {
        if (!error) {
            var i = 0;
            result["matches"].forEach(corr => {
                // sen = sen.eplacer(sen.substring(corr["offset"], corr["offset"]+corr["length"]+), corr["replacements"][0]["value"]);
                sen = sen.split(sen.substring(corr["offset"] + i, corr["offset"] + corr["length"] + i))[0] + '<span style="background: rgb(236, 247, 109)"><b>' + corr["replacements"][0]["value"] + '</b></span>' + sen.split(sen.substring(corr["offset"] + i, corr["offset"] + corr["length"] + i))[1];
                i = corr["replacements"][0]["value"].length - corr["length"];
            });
            // res.send(result["matches"]);
            res.send(sen);
        }
    });
});


router.post('/vimeo/folder/update', async function(req, res) {
    let response = await update_VimeoFolder();
    if(response['success'])
        return res.status(200).json(response);
    else
        return res.status(500).json(response);
});

router.get('/vimeo/folder/login', function(req, res) {
    res.render('vimeoLogin', { Message: "" });
});

router.post('/vimeo/folder/login', async (req, res) => {
    // 'Shourya Mishra (dr.reenamishra@gmail.com)': '4587558',
    if (!req.body.pass || !req.body.user) {
        console.log("redirected !!");
        return res.redirect('/vimeo/folder/login');
    }
    console.log(req.body);
    var mail = (req.body.pass).toLowerCase();
    var name = req.body.user;
    Vimeo.find({student_email : mail}, (err, folder_data) => {
        console.log(folder_data);
        if (err) {
            console.log(err);
            return res.status(500).send();
        } else {
            if (folder_data.length == 0) {
                return res.render('vimeoLogin', { Message: "No Session Folder FOUND For This Credentials !!" });
            } else if (folder_data.length == 1){
                return res.redirect("https://vimeo.com/user/133815660/folder/" + folder_data[0]['folder_id']);
            } else {
                folder_data.forEach((record, index) => {
                    var folderName = record['student_name'];
                    folderName = folderName.toLowerCase();
                    var studentName = name;
                    var regex = new RegExp("[._-]");
                    studentName = ((studentName.toLowerCase()).trim()).replace(regex, " ");
                    
                    if (!(studentName.includes((folderName).replace(regex, " ")))) {
                        if (!(((folderName).replace(regex, " ")).includes(studentName))) {
                            console.log(record);
                            folder_data.splice(index, 1);
                        }
                    }
                });
                if (folder_data.length == 0) {
                    return res.render('vimeoLogin', { Message: "There Is Multiple Folders Linked With This E-Mail And NAME Has A Conflicting Entry!! CONTACT FOR SUPPORT" });
                } else if (folder_data.length == 1) {
                    console.log(folder_data[0]['folder_id']);
                    return res.redirect("https://vimeo.com/user/133815660/folder/" + folder_data[0]['folder_id']);
                } else {
                    return res.redirect("https://vimeo.com/user/133815660/folder/" + folder_data[0]['folder_id']);
                }
            }
        }
    });
});


module.exports = router;