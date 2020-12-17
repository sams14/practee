// Select DOM elements to work with
const welcomeDiv = document.getElementById("welcomeMessage");
const signInButton = document.getElementById("signIn");
const signOutButton = document.getElementById('signOut');
const cardDiv = document.getElementById("card-div");
const mailButton = document.getElementById("readMail");
const profileButton = document.getElementById("seeProfile");
const profileDiv = document.getElementById("profile-div");
const session = document.getElementById("session");
const on_sub = document.getElementById("on_sub");
const table_data = document.getElementById('table_data');
const table_div = document.getElementById('table_div');
const acc_r = document.getElementById('acc_r');
const acc_n = document.getElementById('acc_n');

function expData (data, endpoint) {
  console.log('Graph API responded at: ' + new Date().toString());
  if(endpoint === graphConfig.graphMeEndpoint){
    // console.log(data.displayName);
    acc_r.value = data.jobTitle;
    acc_n.value = data.displayName;
    if(data.jobTitle === "Consultant"){
      session.classList.remove('d-none');
    }
  }
}

 function goback(){
   console.log('hi');
   signIn();
 }

function redir(){
  window.location.href = window.location.href + 'redir';
}

function showWelcomeMessage(account) {
  console.log(account)
  // Reconfiguring DOM elements
  cardDiv.classList.remove('d-none');
  welcomeDiv.innerHTML = `Welcome ${account.name}`;
  signInButton.classList.add('d-none');
  signOutButton.classList.remove('d-none');
}

function updateUI(data, endpoint) {
  console.log('Graph API responded at: ' + new Date().toString());
  // console.log(data);

  if (endpoint === graphConfig.graphMeEndpoint) {
    const title = document.createElement('p');
    title.innerHTML = "<strong>Title: </strong>" + data.jobTitle;
    const email = document.createElement('p');
    email.innerHTML = "<strong>Mail: </strong>" + data.mail;
    const phone = document.createElement('p');
    phone.innerHTML = "<strong>Phone: </strong>" + data.businessPhones[0];
    const address = document.createElement('p');
    address.innerHTML = "<strong>Location: </strong>" + data.officeLocation;
    profileDiv.appendChild(title);
    profileDiv.appendChild(email);
    profileDiv.appendChild(phone);
    profileDiv.appendChild(address);

  } else if (endpoint === graphConfig.graphMailEndpoint) {
      if (data.value.length < 1) {
        alert("Your mailbox is empty!")
      } else {
        const tabList = document.getElementById("list-tab");
        tabList.innerHTML = ''; // clear tabList at each readMail call
        const tabContent = document.getElementById("nav-tabContent");

        data.value.map((d, i) => {
          // Keeping it simple
          if (i < 10) {
            const listItem = document.createElement("a");
            listItem.setAttribute("class", "list-group-item list-group-item-action")
            listItem.setAttribute("id", "list" + i + "list")
            listItem.setAttribute("data-toggle", "list")
            listItem.setAttribute("href", "#list" + i)
            listItem.setAttribute("role", "tab")
            listItem.setAttribute("aria-controls", i)
            listItem.innerHTML = d.subject;
            tabList.appendChild(listItem)

            const contentItem = document.createElement("div");
            contentItem.setAttribute("class", "tab-pane fade")
            contentItem.setAttribute("id", "list" + i)
            contentItem.setAttribute("role", "tabpanel")
            contentItem.setAttribute("aria-labelledby", "list" + i + "list")
            contentItem.innerHTML = "<strong> from: " + d.from.emailAddress.address + "</strong><br><br>" + d.bodyPreview + "...";
            tabContent.appendChild(contentItem);
          }
        });
      }
  }
}



function date_Submit() {
  const mon = document.getElementById("month");
  const dy = document.getElementById("day");
  const yr = document.getElementById("year");
  var tc;
  fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + yr.value + "-" + mon.value + "-" + dy.value + "%2000%3A00%3A01%2B05%3A30&end_time=" + yr.value + "-" + mon.value + "-" + dy.value + "%2023%3A23%3A59%2B05%3A30", {
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
      on_sub.innerHTML = "Total calls on " + dy.value + "/" + mon.value + "/" + yr.value + ": <strong>" + data['meta']['total_count'] + "</strong>"; 
      tc = data['meta']['total_count'];
      fetch("https://kpi.knowlarity.com/Basic/v1/account/calllog?start_time=" + yr.value + "-" + mon.value + "-" + dy.value + "%2000%3A00%3A01%2B05%3A30&end_time=" + yr.value + "-" + mon.value + "-" + dy.value + "%2023%3A23%3A59%2B05%3A30&limit=" + tc.toString(), {
        method: 'GET',
        headers: {
          "Accept": "application/json",
          "x-api-key": "xihMXYtXYY0E1v8Vkwai7WW4YmLgCGN5PyN3i8R6",
          "Authorization": "07a30c67-cd45-4fe9-a874-347260404af9"
        }
      })
        .then(response => { 
          // console.log(response);
          return response.json();
        })
        .then(data => { 
          table_div.classList.remove('d-none');
          var i;
          for (i = 0; i < data["objects"].length; i++) {
            const nr = document.createElement('tr');
            nr.innerHTML = "<td>" + data["objects"][i]["id"] + "</td>" + "<td>" + data["objects"][i]["start_time"] + "</td>" + "<td>" + data["objects"][i]["agent_number"] + "</td>" + "<td>" + data["objects"][i]["customer_number"] + "</td>" + "<td><a href='" + data["objects"][i]["call_recording"] + "'>click here</a></td>";
            table_data.appendChild(nr);
          }
        });
    });
}