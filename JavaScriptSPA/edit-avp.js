var paid = new Set();
var total = new Set();
t_d = JSON.parse(t_d);
st_d = JSON.parse(st_d);
n_d = JSON.parse(n_d.replace(/[\r]?[\n]/g, ''));
d = JSON.parse(d);
week = week.split(',');


function viewNOTE(noteData) {
    // document.getElementById('addNoteForm').classList.add('d-none');
    // document.getElementById('viewNoteData').classList.remove('d-none');
    document.getElementById('viewNoteData').innerHTML = "<b class = 'a'>Note Data</b> : " + noteData;

}


async function weekdetails(paid, total) {
    for (let i = 0; i < week.length; i++) {
        await fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + week[i].split('/')[2] + "-" + week[i].split('/')[0] + "-" + week[i].split('/')[1] + "%2000%3A00%3A01%2B05%3A30&end_time=" + week[i].split('/')[2] + "-" + week[i].split('/')[0] + "-" + week[i].split('/')[1] + "%2023%3A23%3A59%2B05%3A30", {
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
                fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + week[i].split('/')[2] + "-" + week[i].split('/')[0] + "-" + week[i].split('/')[1] + "%2000%3A00%3A01%2B05%3A30&end_time=" + week[i].split('/')[2] + "-" + week[i].split('/')[0] + "-" + week[i].split('/')[1] + "%2023%3A23%3A59%2B05%3A30&limit=" + tc.toString(), {
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
                        // var addNote = document.getElementById('addNote');
                        data.objects.forEach(function(ob) {
                            if (ob.call_recording != "") {
                                total.add(ob.customer_number.split('+91')[1]);
                                st_d.forEach(function(st) {
                                    if (st.phoneNo == ob.customer_number.split('+91')[1]) {
                                        paid.add(ob.customer_number.split('+91')[1]);
                                        var nr = document.createElement('tr');
                                        var t = (ob.start_time.split(" ")[1]).split(":")[0];
                                        var tt = "";
                                        if (parseInt(t) >= 12) {
                                            if (((parseInt(t) - 12)) < 10) {
                                                tt = "0" + (parseInt(t) - 12).toString();
                                            } else {
                                                tt = (parseInt(t) - 12).toString();
                                            }
                                            tt += ":" + (ob.start_time.split(" ")[1]).split(":")[1] + ":" + ((ob.start_time.split(" ")[1]).split(":")[2]).split("+")[0] + " pm";
                                        } else {
                                            tt = (ob.start_time.split(" ")[1]).split("+")[0] + " am";
                                        }
                                        tt = ob.start_time.split(" ")[0] + " " + tt;
                                        var i;
                                        for (i in n_d) {
                                            t_d.forEach(function(td){
                                                if (n_d[i].sessionStartTime == ob.start_time && n_d[i].teacherNumber == td.phoneNo) {
                                                    nr.innerHTML = "<td>" + tt + "</td>" + "<td>" + td.name + "<td>" + td.phoneNo + "</td>" +  "</td>" + "<td>" + st.name + "</td>" + "<td>" + st.phoneNo + "</td>" + "<td>" + st.email + "</td>" + "<td>" + st.courseType + "</td>" + "<td><a href='" + ob.call_recording + "'>click here</a></td>" + "<td>" + "<input class= 'home' type='button' data-toggle='modal' data-target='#noteModal' onclick = 'viewNOTE(\"" + n_d[i].noteValue + "\")' value = 'View Note' />" + "</td>";                                                   
                                                }
                                            });
                                            
                                        };
                                        addNote.appendChild(nr);
                                    }
                                });
                            }
                        });
                    })

            });
    }
    var paidcall = paid.size;
    var freecall = total.size - paid.size;
    var totalcall = total.size;
    return {
        paidcall,
        freecall,
        totalcall
    }
}
weekdetails(paid, total).then(data => {
    document.getElementById('psc').innerHTML = data.paidcall;
    document.getElementById('fsc').innerHTML = data.freecall;
    document.getElementById('tsc').innerHTML = data.totalcall;
});


function homePage() {
    document.getElementById('home').classList.remove('d-none');
    document.getElementById('tprofile').classList.add('d-none');
    document.getElementById('sprofile').classList.add('d-none');
}


function studentProf() {
    document.getElementById('home').classList.add('d-none');
    document.getElementById('tprofile').classList.add('d-none');
    document.getElementById('sprofile').classList.remove('d-none');
    const profdata = document.getElementById('profdata');
    var tr;
    st_d.forEach((std) => {
        tr = document.createElement('tr');
        tr.innerHTML = "<td>" + std.name + "</td>" + "<td>" + std.phoneNo + "</td>" + "<td>" + std.email + "</td>" + "<td>" + std.courseType + "</td>" + "<td>" + "<input class= 'profile' type='button' data-toggle='modal' data-target='#fullProfile' value = 'See Profile' onClick = seeProfile(" + std.phoneNo + ")//>" + "</td>";
        profdata.appendChild(tr);
    });
}

function teaProf() {
    document.getElementById('home').classList.add('d-none');
    document.getElementById('sprofile').classList.add('d-none');
    document.getElementById('tprofile').classList.remove('d-none');
    const tprofdata = document.getElementById('tprofdata');
    var tr;
    t_d.forEach((td) => {
        tr = document.createElement('tr');
        tr.innerHTML = "<td>" + td.name + "</td>" + "<td>" + td.email + "</td>" + "<td>" + td.phoneNo + "</td>" + "<td>" + td.role + "</td>" + "<td>" + "<input class= 'profile' type='button' data-toggle='modal' data-target='#fullTeaProfile' value = 'Delete' onClick = deleteProfile(" + td.phoneNo + ")//>" + "</td>";
        tprofdata.appendChild(tr);
    });
}

function seeProfile(phoneNo) {
    st_d.forEach((std) => {
        if (std.phoneNo == phoneNo) {
            document.getElementById('profcont').innerHTML = "<b class = 'a'>studentSNo</b> : " + std.studentSNo + "<br><b class = 'a'>Name</b> : " + std.name + "<br><b class = 'a'>moodleUN</b> : " + std.moodleUN + "<br><b class = 'a'>courseType</b> : " + std.courseType + "<br><b class = 'a'>PhoneNo</b> : " + std.phoneNo + "<br><b class = 'a'>email</b> : " + std.email + "<br><b class = 'a'>classSD</b> : " + std.classSD + "<br><b class = 'a'>classED</b> : " + std.classED + "<br><b class = 'a'>firstAmount</b> : " + std.firstAmount + "<br><b class = 'a'>secondAmount</b> : " + std.secondAmount + "<br><b class = 'a'>remainingAmount</b> : " + std.remainingAmount + "<br><b class = 'a'>RenewalD</b> : " + std.RenewalD + "<br><b class = 'a'>qualification</b> : " + std.qualification + "<br><b class = 'a'>bandScore</b> : " + std.bandScore + "<br><b class = 'a'>location</b> : " + std.location + "<br> ";
            document.getElementById('stdPhn').value = std.phoneNo;
        }
    });
}

function deleteProfile(phoneNo) {
    t_d.forEach((td) => {
        if (td.phoneNo == phoneNo) {
            document.getElementById('tprofcont').innerHTML = "<b class='a'>Name</b>" + td.name + "<br>" + "<b class='a'>Email</b>" + td.email + "<br>" + "<b class='a'>Phone Number</b>" + td.phoneNo + "<br>" + "<b class='a'>Role</b>" + td.role + "<br>";
            document.getElementById('teaPhn').value = td.phoneNo;
        }
    });
}
