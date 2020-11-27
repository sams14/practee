const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
});

var teacher = mongoose.model('Teacher', teacherSchema);
var student = mongoose.model('Student', studentSchema);
module.exports = {
    teacher: teacher,
    student: student
}
















// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         required: true
//     }
// });

// module.exports = mongoose.model('User', userSchema);

