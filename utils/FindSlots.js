const Mentor = require("../models/Mentor");
const Slot = require("../models/Slots");

async function checkSlot(newSlotST, newSlotET, bS, bH, j){
    if (bS.length == 0) {
      for(var i=0; i<bH.length; i++){
        if((newSlotET > bH[i][0]) && (bH[i][1] >= newSlotET))
          return {start:bH[i][1], success:0, counter:j}; 
      } 
      return {start:newSlotST, success:1, counter:j};
    }
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
  
const getAvailableSlots =  async (req, res, mentorNames, regionalLang) => {
    var obj = {}
    if (req.query.gender != 'NA' && req.query.gender) {obj["gender"] = req.query.gender }
    if (req.query.mentor != 'NA' && req.query.mentor) {obj["name"] = req.query.mentor }
    if (req.query.lang != 'NA' && req.query.lang) {obj["regionalLang"] = req.query.lang}
    console.log(obj);
    await Mentor.find(obj, async(err, foundData) => {
      if (err) {
          console.log(err);
          return res.status(500).send();
      } else {
          if (foundData.length == 0) {
            return res.render("sales/index", {data:"NO DATA", searchData:req.query, mentors: mentorNames, lang: regionalLang});
          } else {
            var responseObj = foundData;
            var DATA = [];
            await asyncForEach(responseObj, async (mentor) => {
              try {
                let foundData = await Slot.findOne({"zoomID": mentor.zoomID}); 
                if (foundData.length == 0) {
                  return res.status(500).send();
                } else {
                  var slotObj = foundData;
                  let bookedSlots = new Set();
                  var availableSlots = [];
                  await asyncForEach(slotObj.T8, async (slot) => {
                    var startTime = new Date(req.query.date + " "+ slot.start_time.split("T")[1]);
                    if (new Date(slot.end_time) >= startTime) {
                      var endTime = new Date(startTime);
                      endTime.setMinutes(endTime.getMinutes() + slot.duration);
                      // console.log(startTime, endTime);
                      bs = []
                      bs.push(startTime); bs.push(endTime);
                      bookedSlots.add(bs);
                    }
                  });
                  bookedSlots = [...bookedSlots];
                  bookedSlots = bookedSlots.sort((a, b) => (a[0] - b[0]));
                  //  console.log(bookedSlots);
                  let bH = new Set();
                  await asyncForEach(mentor.breakHours, async (bh) => {
                    bhn = [];
                    bhStartTime = new Date(req.query.date + " " + bh.split("-")[0])
                    bhEndTime = new Date(req.query.date + " " + bh.split("-")[1])
                    bhn.push((bhStartTime.setMinutes(bhStartTime.getMinutes() - 330))); 
                    bhn.push((bhEndTime.setMinutes(bhEndTime.getMinutes() - 330)));
                    bH.add(bhn);
                  });
                  bH = [...bH];
                  //  console.log(bH);
                  var sTime = new Date(req.query.date + " " + mentor.workingHour.split("-")[0]);
                  sTime.setMinutes(sTime.getMinutes() - 330);
                  var eTime = new Date(req.query.date + " " + mentor.workingHour.split("-")[1]);
                  eTime.setMinutes(eTime.getMinutes() - 330);
                  eTime.setMinutes(eTime.getMinutes() - 30);
                  //  console.log(sTime, eTime);
                  var counter = 0;
                  while(sTime<=eTime){
                  let newSlotST = new Date(sTime);
                  let newSlotET = new Date(newSlotST);
                  newSlotET.setMinutes(newSlotET.getMinutes()+30);
                  // console.log(newSlotST, newSlotET);
                  let resp = await checkSlot(newSlotST, newSlotET, bookedSlots, bH, counter);
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
              } catch (err) {
                console.log(err);
                return res.status(500).send();
              }
            });
            console.log(DATA);
            return res.render("sales/index", {data:DATA, searchData:req.query, mentors: mentorNames, lang: regionalLang});
          }
      }
    });
}

module.exports = {
    getAvailableSlots
};