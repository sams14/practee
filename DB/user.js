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


const practeeStudentSchema = new mongoose.Schema({
    studentSNo: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    moodleUN: {
        type: String
    },
    courseType: {
        type: String,
        required: true
    },
    phoneNo: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    classSD: {
        type: String,
        required: true
    },
    classED: {
        type: String,
        required: true
    },
    firstAmount: {
        type: Number
    },
    secondAmount: {
        type: Number
    },
    remainingAmount: {
        type: Number
    },
    RenewalD: {
        type: String
    },
    qualification: {
        type: String,
        required: true
    },
    bandScore: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    }
});

var teacher = mongoose.model('Teacher', teacherSchema);
var student = mongoose.model('Student', studentSchema);
var pstudent = mongoose.model('Student Detail', practeeStudentSchema);
module.exports = {
    teacher: teacher,
    student: student,
    pstudent: pstudent
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