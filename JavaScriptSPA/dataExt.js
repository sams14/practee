// const User = require('../DB/user');

// User.find({}, function(err, foundData) {
//     if(err){
//         console.log(err);
//         res.status(500).send();
//     } else {
//         if(foundData.length == 0){
//             var responseObj = undefined;
//             if(select && select == 'count'){
//                 responseObj = { count: foundData.length};
//             }
//         } else {
//             var responseObj = foundData;
//             if(select && select == 'count'){
//                 responseObj = { count: foundData.length};
//             }
//             dataImpo(responseObj);
//         }
//     }
// });