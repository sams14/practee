const nembuu = document.getElementById('nembuu');
var pn, tc;
t_d = JSON.parse(t_d);
data = JSON.parse(d);
t_d.forEach(element => {
    if(element.name == d.name){
        pn = element.phoneNo;
    }
});
week = week.split(',');
for(let i = 0; i < week.length; i++) {
    console.log(week[i]);
    fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + week[i].split('/')[2] + "-" + week[i].split('/')[0] + "-" + week[i].split('/')[1] + "%2000%3A00%3A01%2B05%3A30&end_time=" + week[i].split('/')[2] + "-" + week[i].split('/')[0] + "-" + week[i].split('/')[1] + "%2023%3A23%3A59%2B05%3A30", {
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
                    console.log(data["meta"]["total_count"]);
                });
            });
}
