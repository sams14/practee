var pn, tc;
t_d = JSON.parse(t_d);
st_d = JSON.parse(st_d);
var paid = new Set();
var total = new Set();
d = JSON.parse(d);

t_d.forEach(element => {
    if (element.name == d.name) {
        pn = element.phoneNo;
        console.log(pn)
    }
});
week = week.split(',');

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
                        var addNote = document.getElementById('addNote');
                        data.objects.forEach(function(ob) {
                            if (ob.call_recording != "" && ob.agent_number.split('+91')[1] == "8130436631") {
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
                                        nr.innerHTML = "<td>" + tt + "</td>" + "<td>" + st.name + "</td>" + "<td>" + st.phoneNo + "</td>" + "<td>" + st.email + "</td>" + "<td>" + st.courseType + "</td>" + "<td><a href='" + ob.call_recording + "'>click here</a></td>" + "<td>" + "<input class= 'home' type='button' value = 'Add Note' //>" + "</td>";
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
})

function sessionDet() {
    document.getElementById('home').classList.add('d-none');
    document.getElementById('session').classList.remove('d-none');
    document.getElementById('profile').classList.add('d-none');
}

function homePage() {
    document.getElementById('home').classList.remove('d-none');
    document.getElementById('session').classList.add('d-none');
    document.getElementById('profile').classList.add('d-none');
}

function studentProf() {
    document.getElementById('home').classList.add('d-none');
    document.getElementById('session').classList.add('d-none');
    document.getElementById('profile').classList.remove('d-none');
    const profdata = document.getElementById('profdata');
    var tr;
    st_d.forEach((std) => {
        tr = document.createElement('tr');
        tr.innerHTML = "<td>" + std.name + "</td>" + "<td>" + std.phoneNo + "</td>" + "<td>" + std.email + "</td>" + "<td>" + std.courseType + "</td>" + "<td>" + "<input class= 'profile' type='button' data-toggle='modal' data-target='#fullProfile' value = 'See Profile' onClick = seeProfile(" + std.phoneNo + ")//>" + "</td>";
        profdata.appendChild(tr);
    });
}

function seeProfile(phoneNo) {
    st_d.forEach((std) => {
        if (std.phoneNo == phoneNo) {
            document.getElementById('profcont').innerHTML = "<b class = 'a'>studentSNo</b> : " + std.studentSNo + "<br><b class = 'a'>Name</b> : " + std.name + "<br><b class = 'a'>moodleUN</b> : " + std.moodleUN + "<br><b class = 'a'>courseType</b> : " + std.courseType + "<br><b class = 'a'>PhoneNo</b> : " + std.phoneNo + "<br><b class = 'a'>email</b> : " + std.email + "<br><b class = 'a'>classSD</b> : " + std.classSD + "<br><b class = 'a'>classED</b> : " + std.classED + "<br><b class = 'a'>firstAmount</b> : " + std.firstAmount + "<br><b class = 'a'>secondAmount</b> : " + std.secondAmount + "<br><b class = 'a'>remainingAmount</b> : " + std.remainingAmount + "<br><b class = 'a'>RenewalD</b> : " + std.RenewalD + "<br><b class = 'a'>qualification</b> : " + std.qualification + "<br><b class = 'a'>bandScore</b> : " + std.bandScore + "<br><b class = 'a'>location</b> : " + std.location + "<br> ";
        }
    });
}

function date_result() {
    document.getElementById('table_div').classList.remove('d-none');
    const table_data = document.getElementById('table_data');
    table_data.innerHTML = "";
    const sdatePick = document.getElementById('sdatePick');
    const edatePick = document.getElementById('edatePick');
    var tc;
    fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + sdatePick.value + "%2000%3A00%3A01%2B05%3A30&end_time=" + edatePick.value + "%2023%3A23%3A59%2B05%3A30&agent_number=%2B919038715215", {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "x-api-key": "xihMXYtXYY0E1v8Vkwai7WW4YmLgCGN5PyN3i8R6",
                "Authorization": "07a30c67-cd45-4fe9-a874-347260404af9"
            }
        })
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            tc = data['meta']['total_count'];
            console.log(tc);
            fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + sdatePick.value + "%2000%3A00%3A01%2B05%3A30&end_time=" + edatePick.value + "%2023%3A23%3A59%2B05%3A30&agent_number=%2B919038715215&limit=" + tc.toString(), {
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
                    var i, spn, sn, sem, sc, c = 0;
                    for (i = 0; i < data["objects"].length; i++) {
                        if (data["objects"][i]["call_recording"] != "" && data["objects"][i]["agent_number"].split('+91')[1] == "9038715215") {
                            st_d.forEach(function(std) {
                                if (std.phoneNo == data["objects"][i]["customer_number"].split('+91')[1]) {
                                    spn = std.phoneNo;
                                    sn = std.name;
                                    sem = std.email;
                                    sc = std.courseType;
                                }
                            });
                            if (spn === undefined) {
                                spn = data["objects"][i]["customer_number"].split('+91')[1];
                                sn = "N/A";
                                sem = "N/A";
                                sc = "Free";
                            }
                            c += 1;
                            const nr = document.createElement('tr');
                            var t = (data["objects"][i]["start_time"].split(" ")[1]).split(":")[0];
                            var tt = "";
                            if (parseInt(t) >= 12) {
                                if (((parseInt(t) - 12)) < 10) {
                                    tt = "0" + (parseInt(t) - 12).toString();
                                } else {
                                    tt = (parseInt(t) - 12).toString();
                                }
                                tt += ":" + (data["objects"][i]["start_time"].split(" ")[1]).split(":")[1] + ":" + ((data["objects"][i]["start_time"].split(" ")[1]).split(":")[2]).split("+")[0] + " pm";
                            } else {
                                tt = (data["objects"][i]["start_time"].split(" ")[1]).split("+")[0] + " am";
                            }
                            tt = data["objects"][i]["start_time"].split(" ")[0] + " " + tt;
                            nr.innerHTML = "<td>" + c + "</td>" + "<td>" + tt + "</td>" + "<td>" + sn + "</td>" + "<td>" + spn + "</td>" + "<td>" + sem + "</td>" + "<td>" + sc + "</td>" + "<td><a href='" + data["objects"][i]["call_recording"] + "'>click here</a></td>";
                            table_data.appendChild(nr);
                        }
                    }
                });
        });
}


function stuForm() {
    document.getElementById('sf').classList.toggle('d-none');
    const profdata = document.getElementById('profdata');
    st_d.forEach(function(std) {
        var tr = document.createElement('tr');
    });
}