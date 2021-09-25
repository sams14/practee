const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Slot = require("../models/Slots");

function checkSlot(newSlotST, newSlotET, bS, bH, j){
    for(; j<bS.length; j++){
      // console.log("loop- ", bS[j][0], newSlotET);
      if(newSlotET <= bS[j][0]){
        for(var i=0; i<bH.length; i++){
          if((newSlotET > bH[i][0]) && (bH[i][1] >= newSlotET))
            return {start:bH[i][1], success:0, counter:j}; 
        } 
        return {start:newSlotST, success:1, counter:j};
      } else {
        newSlotST = new Date(bS[j][1]), newSlotET = new Date(bS[j][1]); 
        newSlotET.setMinutes(newSlotET.getMinutes()+30);
      }
    }
    // console.log(bS.length);
    return {start:newSlotET, success:0, counter:j};
}

async function asyncForEach(array, callback) {
for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
}
}
  
const getAvailableSlots =  async (req, res) => {
    var obj = {}
    if (req.query.gender != 'NA') {obj["gender"] = req.query.gender };
    if (req.query.lang != 'NA') {obj["regionalLang"] = req.query.lang};
    await Mentor.find(obj, async(err, foundData) => {
      if (err) {
          console.log(err);
          return res.status(500).send();
      } else {
          if (foundData.length == 0) {
            console.log("kehi jhia debeni...");
            return res.render("sales/index", {data:"NO DATA", date:req.query.date});
          } else {
            var responseObj = foundData;
            var DATA = [];
            await asyncForEach(responseObj, async (mentor) => {
              await Slot.findOne({"zoomID": mentor.zoomID}, async(err, foundData) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send();
                } else {  
                     if (foundData.length == 0) {
                       return res.status(500).send();
                     } else {
                        var slotObj = foundData;
                        let bookedSlots = new Set();
                        var availableSlots = [];
                        slotObj.T8.forEach(slot => {
                          var startTime = new Date(req.query.date + " "+ slot.start_time.split("T")[1]);
                          var endTime = new Date(startTime);
                          endTime.setMinutes(endTime.getMinutes() + slot.duration);
                          // console.log(startTime, endTime);
                          bs = []
                          bs.push(startTime); bs.push(endTime);
                          bookedSlots.add(bs);
                       });
                       bookedSlots = [...bookedSlots];
                       bookedSlots = bookedSlots.sort((a, b) => (a[0] - b[0]));
                      //  console.log(bookedSlots);
                       let bH = new Set();
                       mentor.breakHours.forEach((bh) => {
                         bhn = [];
                         bhn.push((new Date(req.query.date + " " + bh.split("-")[0]))); bhn.push((new Date(req.query.date + " " + bh.split("-")[1])));
                         bH.add(bhn);
                       });
                       bH = [...bH];
                      //  console.log(bH);
                       var sTime = new Date(req.query.date + " " + mentor.workingHour.split("-")[0]);
                       var eTime = new Date(req.query.date + " " + mentor.workingHour.split("-")[1]);
                       eTime.setMinutes(eTime.getMinutes()-30);
                      //  console.log(sTime, eTime);
                      var counter = 0;
                       while(sTime<=eTime){
                        let newSlotST = new Date(sTime);
                        let newSlotET = new Date(newSlotST);
                        newSlotET.setMinutes(newSlotET.getMinutes()+30);
                        // console.log(newSlotST, newSlotET);
                        let resp = checkSlot(newSlotST, newSlotET, bookedSlots, bH, counter)
                        // console.log(resp);
                        if(resp.success == 1){
                          // var arr = [];
                          var slotS = new Date(resp.start);  
                          availableSlots.push(slotS);
                          sTime = resp.start;
                          sTime = sTime.setMinutes(sTime.getMinutes()+30);
                          counter = resp.counter;
                        }
                        else{
                          sTime = resp.start;
                          counter = resp.counter;
                        }
                       }
                       
                        if (availableSlots.length != 0){
                          let item={}
                          item['availableSlots'] = availableSlots;
                          item['name'] = mentor.name;
                          item['email'] = mentor.email;
                          item['zoomID'] = mentor.zoomID;
                          item['breakHours'] = mentor.breakHours;
                          //  console.log(availableSlots);
                          DATA.push(item);
                        }
                      }
                    }
              });
            });
            console.log(DATA.length);
            return res.render("sales/index", {data:DATA, date:req.query.date});
          }
      }
    });
}

module.exports = {
    getAvailableSlots
};