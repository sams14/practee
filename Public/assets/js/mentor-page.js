function edit_button (record) {
  record = JSON.parse(record);
  $('#mentorData').html(`
    <div>
      <span style=" display: inline-block; width: 200px;" class= "font-semibold">Name:</span> <span> ${record.name} </span><br>
      <span style=" display: inline-block; width: 200px;"  class= "font-semibold">Email:</span> <span> ${record.email} </span><br>
      <span style=" display: inline-block; width: 200px;"  class= "font-semibold">ZoomID:</span> <span> ${record.zoomID} </span><br>
      <span style=" display: inline-block; width: 200px;"  class= "font-semibold">Gender:</span> <span> ${record.gender} </span><br>
      <span style=" display: inline-block; width: 200px;"  class= "font-semibold">RegionalLang:</span> <span> ${record.regionalLang} </span><br>
      <span style=" display: inline-block; width: 200px;"  class= "font-semibold">WorkingHour:</span> <span> ${record.workingHour} </span><br>
      <span style=" display: inline-block; width: 200px;" class= "font-semibold">BreakHours:</span> <span> ${record.breakHours} </span>
    </div>
  `);
}