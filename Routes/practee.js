const router = require('express').Router();
const User = require('../DB/user');
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

async function get_VimeoFolder(req, res, next) {
    console.log(req.body);
    if (!req.body.pass || !req.body.user) {
        console.log("redirected !!");
        res.redirect('/vimeo/folder/login');
    } else {
        console.log("FETCHING FOLDERS FROM VIMEO");
        const headers = { "Accept": "application/json", 'authorization': 'Bearer ' + process.env.vimeo_token };
        const url = 'https://api.vimeo.com/users/' + process.env.vimeo_user_id + '/projects';
        var folders = {};
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
                json_response['data'].forEach(record => {
                    folders[record['name']] = record['uri'].substring(record['uri'].lastIndexOf('/') + 1, (record['uri']).length);
                });
            }
            folders_counter += (json_response['data']).length;
            counter += 1;

            if (folders_counter >= json_response['total']) {
                break;
            }
        }
        req.folders = folders;
        next();
    }
}

router.get('/vimeo/folder/login', function(req, res) {
    res.render('vimeoLogin', { Message: "" });
});

router.post('/vimeo/folder/login', get_VimeoFolder, (req, res) => {
    // 'Shourya Mishra (dr.reenamishra@gmail.com)': '4587558',
    console.log(req.body);
    var mail = req.body.pass;
    var name = req.body.user;
    var response = req.folders;
    var folder = [];
    for (key in response) {
        try {
            if ((key.split("(")[1]).split(")")[0] == mail) {
                folder.push([key, response[key]])
            }
        } catch (error) {

        }
    }
    console.log(folder);
    console.log(folder.length);
    if (folder.length == 0) {
        res.render('vimeoLogin', { Message: "No Session Folder FOUND For This Credentials !!" });
    } else if (folder.length == 1) {
        console.log((folder[0])[1]);
        res.redirect("https://vimeo.com/user/133815660/folder/" + (folder[0])[1]);
    } else {
        folder.forEach((record, index) => {
            var folderName = record[0];
            folderName = folderName.toLowerCase();
            var studentName = name;
            var regex = new RegExp("[._-]");

            studentName = ((studentName.toLowerCase()).trim()).replace(regex, " ");
            if (!(studentName.includes(((folderName.split("(")[0]).trim()).replace(regex, " ")))) {
                if (!((((folderName.split("(")[0]).trim()).replace(regex, " ")).includes(studentName))) {
                    console.log(record);
                    folder.splice(index, 1);
                }
            }
        });
        if (folder.length == 0) {
            res.render('vimeoLogin', { Message: "There Is Multiple Folders Linked With This E-Mail And NAME Has A Conflicting Entry!! CONTACT FOR SUPPORT" });
        } else if (folder.length == 1) {
            console.log((folder[0])[1]);
            res.redirect("https://vimeo.com/user/133815660/folder/" + (folder[0])[1]);
        } else {
            res.redirect("https://vimeo.com/user/133815660/folder/" + (folder[0])[1]);
        }
    }
});


module.exports = router;