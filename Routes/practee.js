const router = require('express').Router();
const User = require('../DB/user');
const Vimeo = require('../models/Vimeo');
const dotenv = require('dotenv');
const Grammarbot = require('grammarbot');
const axios = require('axios');

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

async function update_VimeoFolder(req, res, next) {
    await Vimeo.deleteMany({}).then(function (params) {
        console.log('all records deleted')
    }).catch(function (err) {
        console.log(err)
    });    
    console.log("FETCHING FOLDERS FROM VIMEO");
    const headers = { "Accept": "application/json", 'authorization': 'Bearer ' + process.env.vimeo_token };
    const url = 'https://api.vimeo.com/users/' + process.env.vimeo_user_id + '/projects';
    var folder_data = [];
    var folders_counter = 0;
    var counter = 1;

    while (true) {
        var query = { 'per_page': 100, 'page': counter };
        var json_response;
        await axios({
                method: 'get',
                url: url,
                headers: headers,
                params: query
            }).then(function(response) {
                // handle success
                json_response = response['data'];
            })
            .catch(function(error) {
                // handle error
                console.log(error);
            });

        if (json_response['total'] > 0) {
            json_response['data'].forEach(async record => {
                try {
                    if ((record['name']).includes("@")){
                        var folder = new Vimeo({
                            "student_email": ((record['name'].split("(")[1]).split(")")[0]).trim(),
                            "student_name": (record['name'].split("(")[0]).trim(),
                            "privacy": record['privacy']['view'],
                            "folder_id": record['uri'].substring(record['uri'].lastIndexOf('/') + 1, (record['uri']).length)
                        });
                        const savedFolder = await folder.save()
                        folder_data.push(savedFolder);
                    }
                } catch (error) {
                    console.log(record['name']);
                }
            });
        }
        folders_counter += (json_response['data']).length;
        counter += 1;

        if (folders_counter >= json_response['total']) {
            break;
        }
    }
    req.folders = folder_data;
    console.log(folder_data);
    next();
}

router.post('/vimeo/folder/update',update_VimeoFolder , function(req, res) {
    return res.status(200).json({
        message: "Database Has Been Updated !!",
        success: true
      });
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
    var mail = req.body.pass;
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