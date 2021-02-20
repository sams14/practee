const router = require('express').Router();
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const User = require('../DB/user');
const nodemailer = require('nodemailer');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'asutosh2000ad@gmail.com',
        pass: 'asu21181981'
    }
});

router.post('/mailer', async(req, res) => {
    var mailOptions = {
        from: 'asutosh2000ad@gmail.com',
        to: 'saminvincible3@gmail.com',
        subject: 'Sending Email using Node.js',
        text: `Hi Smartherd, thank you for your nice Node.js tutorials.
                I will donate 50$ for this course. Please send me payment options.`
            // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            const updatedStatus = {
                reminderStatus: 1
            };
            User.pstudent.updateOne({ "phoneNo": req.body.phoneNo }, updatedStatus, function(err, results) {
                if (err) return console.log(err);
                else return res.redirect(`/${req.body.Role}/${req.body.Name}`);
            });
        }
    });
});

//route to post user details to db
router.post('/teacher', async(req, res) => {
    const teacher = new User.teacher({
        name: req.body.name,
        email: req.body.email,
        phoneNo: req.body.phoneNo,
        role: req.body.role
    });
    User.teacher.find({ "phoneNo": req.body.phoneNo }, async(err, foundData) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        } else {
            if (foundData.length == 0) {
                var responseObj = "";
                var saveStu = await teacher.save();
            } else {
                var responseObj = foundData;
            }
        }
        return res.redirect(`/${req.body.Role}/${req.body.Name}`);
    });
});

router.post('/editTeacher', function(req, res) {
    const updatedTeacher = {
        name: req.body.name,
        email: req.body.email,
        phoneNo: req.body.phoneNo,
        role: req.body.role
    };
    if (req.body.phoneNo != req.body.editTeaPhone) {
        User.teacher.find({ "phoneNo": req.body.phoneNo }, (err, foundData) => {
            if (err) {
                console.log(err);
                return res.status(500).send();
            } else {
                if (foundData.length != 0) {
                    return res.send("Phone number already exists..");
                } else {
                    User.teacher.updateOne({ "phoneNo": req.body.editTeaPhone }, updatedTeacher, function(err, results) {
                        if (err) return console.log(err);
                        else return res.redirect(`/${req.body.Role}/${req.body.Name}`);
                    });
                }
            }
        });
    } else {
        User.teacher.updateOne({ "phoneNo": req.body.editTeaPhone }, updatedTeacher, function(err, results) {
            if (err) return console.log(err);
            else return res.redirect(`/${req.body.Role}/${req.body.Name}`);
        });
    }
});

router.post('/deleteT', function(req, res) {
    User.teacher.deleteOne({ "phoneNo": req.body.teaPhn }, function(err, results) {
        if (err) return handleError(err);
        else res.redirect(`/${req.body.Role}/${req.body.Name}`);
    });
});

//route to see the data in the database
router.get('/readTea', function(req, res) {
    var select = req.query.select;
    User.teacher.find({}, function(err, foundData) {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            if (foundData.length == 0) {
                var responseObj = undefined;
                if (select && select == 'count') {
                    responseObj = { count: foundData.length };
                }
            } else {
                var responseObj = foundData;
                if (select && select == 'count') {
                    responseObj = { count: foundData.length };
                }
                res.send(responseObj);
            }
        }
    });
});

router.get('/student', function(req, res) {
    return res.render('student', { st_data: "first" });
});

router.post('/pstudent', async(req, res) => {
    const pstudent = new User.pstudent({
        studentSNo: req.body.studentSNo,
        name: req.body.name,
        moodleUN: req.body.moodleUN,
        email: req.body.email,
        phoneNo: req.body.phoneNo,
        courseType: req.body.courseType,
        location: req.body.location,
        qualification: req.body.qualification,
        classSD: req.body.classSD,
        classED: req.body.classED,
        RenewalD: req.body.RenewalD,
        firstAmount: req.body.firstAmount,
        secondAmount: req.body.secondAmount,
        remainingAmount: req.body.remainingAmount,
        bandScore: req.body.bandScore,
        reminderStatus: 0
    });
    User.pstudent.find({ "phoneNo": req.body.phoneNo }, async(err, foundData) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        } else {
            if (foundData.length == 0) {
                var responseObj = "";
                var saveStu = await pstudent.save();
            } else {
                var responseObj = foundData;
            }
        }
        return res.redirect(`/${req.body.Role}/${req.body.Name}`);
    });

});

router.post('/deleteS', function(req, res) {
    User.pstudent.deleteOne({ "phoneNo": parseInt(req.body.stdPhn) }, function(err, results) {
        if (err) return console.log(err);
        else res.redirect(`/${req.body.role}/${req.body.name}`);
    });
});

router.post('/editStudent', function(req, res) {
    const updatedUser = {
        studentSNo: req.body.studentSNo,
        name: req.body.name,
        moodleUN: req.body.moodleUN,
        email: req.body.email,
        phoneNo: req.body.phoneNo,
        courseType: req.body.courseType,
        location: req.body.location,
        qualification: req.body.qualification,
        classSD: req.body.classSD,
        classED: req.body.classED,
        RenewalD: req.body.RenewalD,
        firstAmount: req.body.firstAmount,
        secondAmount: req.body.secondAmount,
        remainingAmount: req.body.remainingAmount,
        bandScore: req.body.bandScore
    };
    if (req.body.phoneNo != req.body.editSPhone) {
        User.pstudent.find({ "phoneNo": req.body.phoneNo }, (err, foundData) => {
            if (err) {
                console.log(err);
                return res.status(500).send();
            } else {
                if (foundData.length != 0) {
                    return res.send("Phone number already exists..");
                } else {
                    User.pstudent.updateOne({ "phoneNo": parseInt(req.body.editSPhone) }, updatedUser, function(err, results) {
                        if (err) return console.log(err);
                        else return res.redirect(`/${req.body.Role}/${req.body.Name}`);
                    });
                }
            }
        });
    } else {
        User.pstudent.updateOne({ "phoneNo": parseInt(req.body.editSPhone) }, updatedUser, function(err, results) {
            if (err) return console.log(err);
            else return res.redirect(`/${req.body.Role}/${req.body.Name}`);
        });
    }
});

router.get('/readStu', function(req, res) {
    var select = req.query.select;
    User.student.find({}, function(err, foundData) {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            if (foundData.length == 0) {
                var responseObj = undefined;
                if (select && select == 'count') {
                    responseObj = { count: foundData.length };
                }
            } else {
                var responseObj = foundData;
                if (select && select == 'count') {
                    responseObj = { count: foundData.length };
                }
                res.send(responseObj);
            }
        }
    });
});


router.post('/test', function(req, res) {
    const mon = req.body.month;
    const dy = req.body.day;
    const yr = req.body.year;
    var tc;
    fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + yr + "-" + mon + "-" + dy + "%2000%3A00%3A01%2B05%3A30&end_time=" + yr + "-" + mon + "-" + dy + "%2023%3A23%3A59%2B05%3A30", {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "x-api-key": "xihMXYtXYY0E1v8Vkwai7WW4YmLgCGN5PyN3i8R6",
                "Authorization": "07a30c67-cd45-4fe9-a874-347260404af9"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            tc = data['meta']['total_count'];
            fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + yr + "-" + mon + "-" + dy + "%2000%3A00%3A01%2B05%3A30&end_time=" + yr + "-" + mon + "-" + dy + "%2023%3A23%3A59%2B05%3A30&limit=" + tc.toString(), {
                    method: 'GET',
                    headers: {
                        "Accept": "application/json",
                        "x-api-key": "xihMXYtXYY0E1v8Vkwai7WW4YmLgCGN5PyN3i8R6",
                        "Authorization": "07a30c67-cd45-4fe9-a874-347260404af9"
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    User.pstudent.find({}, (err, stData) => {
                        User.teacher.find({}, (err, tData) => {
                            res.render('test', { sd: data, st_d: stData, t_d: tData });
                        });
                    });
                });
        });
});

router.get('/mentor/:name', function(req, res) {
    // res.send(`Hello ${req.params.name}`);
    User.pstudent.find({}, (err, stData) => {
        User.teacher.find({}, (err, tData) => {
            User.sessionNote.find({}, (err, nData) => {
                User.mappingData.find({}, (err, mData) => {
                    data = {
                        name: req.params.name,
                        role: 'Mentor'
                    }
                    res.render('mentor', { data: data, st_d: stData, t_d: tData, n_d: nData, m_d: mData });
                });
            });
        });
    });
});

router.get('/admin/:name', function(req, res) {
    // res.send(`Hello ${req.params.name}`);
    User.pstudent.find({}, (err, stData) => {
        User.teacher.find({}, (err, tData) => {
            User.sessionNote.find({}, (err, nData) => {
                User.mappingData.find({}, (err, mData) => {
                    data = {
                        name: req.params.name,
                        role: 'admin'
                    }
                    res.render('a_vp', { data: data, st_d: stData, t_d: tData, n_d: nData, m_d: mData });
                });
            });
        });
    });
});

// the route for tseting th redirect
router.post('/redir', function(req, res) {
    console.log(req.body.role);
    if (req.body.role == "Mentor") {
        res.redirect(`/mentor/${req.body.name}`);
    } else if (["Assistant Vice President ", "Vice President", "Assistant Vice President"].includes(req.body.role)) {
        res.redirect(`/admin/${req.body.name}`)
    }
});


router.post('/addnote', function(req, res) {
    console.log(req.body);
    const note = new User.sessionNote({
        teacherNumber: parseInt(req.body.teacherNumber),
        studentNumber: parseInt(req.body.studentNumber),
        sessionStartTime: req.body.sessionStartTime,
        noteValue: req.body.noteValue
    });
    var snote = note.save();
    res.redirect(`/${req.body.role}/${req.body.name}`);
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

module.exports = router;