const axios = require('axios');
const Vimeo = require('../models/Vimeo');

async function update_VimeoFolder(res) {
    await Vimeo.deleteMany({}).then(function (params) {
        console.log('All Records Are Deleted !!')
    }).catch(function (err) {
        return {
            message: "Records Deletion Failed !! TypeError :" + err,
            failed_folders : "None",
            success: false
          };
    });    
    console.log("FETCHING FOLDERS FROM VIMEO");
    const headers = { "Accept": "application/json", 'authorization': 'Bearer ' + process.env.vimeo_token };
    const url = 'https://api.vimeo.com/users/' + process.env.vimeo_user_id + '/projects';
    var folder_data = [];
    var failed = [];
    var folders_counter = 0;
    var counter = 1;

    while (true) {
        var query = { 'per_page': 50, 'page': counter };
        var json_response;
        await axios({
                method: 'get',
                url: url,
                headers: headers,
                params: query
            }).then(function(response) {
                // handle success
                json_response = response['data'];
            })
            .catch(function(error) {
                // handle error
                console.log(error);
                return {
                    message: "API request error !! TypeError :" + error,
                    failed_folders : "None",
                    success: false
                  };
            });

        if (json_response['total'] > 0) {
            json_response['data'].forEach(async record => {
                try {
                    if ((record['name']).includes("@")){
                        var folder = new Vimeo({
                            "student_email": (((record['name'].split("(")[1]).split(")")[0]).trim()).toLowerCase(),
                            "student_name": (record['name'].split("(")[0]).trim(),
                            "privacy": record['privacy']['view'],
                            "folder_id": record['uri'].substring(record['uri'].lastIndexOf('/') + 1, (record['uri']).length)
                        });
                        const savedFolder = await folder.save()
                        folder_data.push(savedFolder);
                    }
                } catch (error) {
                    failed.push(record['name']);
                    console.log(record['name']);
                }
            });
        }
        folders_counter += (json_response['data']).length;
        counter += 1;

        if (folders_counter >= json_response['total']) {
            break;
        }
    }
    return {
        message: "Database Has Been Updated !!",
        failed_folders : failed,
        success: true
      }
}

module.exports = {
    update_VimeoFolder
}