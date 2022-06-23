from dotenv import load_dotenv
import os
import json
import requests
import datetime

load_dotenv()
vimeo_token = os.environ.get("vimeo-token")
vimeo_userid = os.environ.get("vimeo-user-id")


def get_vimeo_folders():
    print("\n" + " Getting video folders ".center(100, ":"))
    headers = headers = {"authorization": "Bearer " + vimeo_token}
    url = "https://api.vimeo.com/users/{user_id}/projects".format(user_id=vimeo_userid)
    folders = []
    folders_counter = 0
    counter = 1

    while True:
        query = {"per_page": 50, "page": counter}

        response = requests.get(url, headers=headers, params=query)
        json_response = json.loads(response.content)

        if json_response["total"] > 0:
            for record in json_response["data"]:
                folders.append(
                    {
                        "id": record["uri"][
                            record["uri"].rindex("/") + 1 : len(record["uri"])
                        ],
                        "name": record["name"],
                        "privacy": record["privacy"]["view"],
                        "modified_time": record["created_time"],
                    }
                )

        folders_counter += len(json_response["data"])
        print(
            "IN PROGRESS !! {folders} folders fetched out of {total_folders}".format(
                folders=folders_counter, total_folders=json_response["total"]
            )
        )
        counter += 1

        if folders_counter >= json_response["total"]:
            break

    return folders


def filter_oldfolders(folders):
    records = []
    for folder_details in folders:
        date_now = datetime.datetime.now(datetime.timezone.utc)
        folder_modified = datetime.datetime.fromisoformat(
            folder_details["modified_time"]
        )
        if (date_now - folder_modified).days >= 310:
            # if folder_details["privacy"] == "nobody":
            records.append(folder_details)
    return records


def delete_folder_videos(folder_details):
    videos = []
    videos_counter = 0
    counter = 1
    headers = headers = {"authorization": "Bearer " + vimeo_token}
    while True:
        query = {"per_page": 50, "page": counter}
        videos_url = (
            "https://api.vimeo.com/users/{user_id}/projects/{project_id}/videos".format(
                user_id=vimeo_userid, project_id=folder_details["id"]
            )
        )
        response = requests.get(videos_url, headers=headers)
        json_response = json.loads(response.text)

        if json_response["total"] > 0:
            print(
                "\n"
                + "Fetching Videos In {folders}".format(folders=folder_details["name"])
            )
            for record in json_response["data"]:
                videos.append(record["uri"].split("/")[2])

        videos_counter += len(json_response["data"])
        counter += 1

        if videos_counter >= json_response["total"]:
            break

    print(
        "\n"
        + "Deleting videos from folders {folders}".format(
            folders=folder_details["name"]
        )
    )
    headers = headers = {"authorization": "Bearer " + vimeo_token}
    url = "https://api.vimeo.com/videos/"
    for video_id in videos:
        response = requests.delete(url + video_id, headers=headers)
        if response.status_code != 200 and response.status_code != 204:
            print(
                "Error Status: {status} \nFailed To Delete Video Id:  {video_id} !!".format(
                    video_id=video_id, status=response.status_code
                )
            )
            return False

    return True


def delete_vimeo_folders(records):
    print("\n" + " Deleting video folders ".center(100, ":") + "\n")
    headers = headers = {"authorization": "Bearer " + vimeo_token}
    url = "https://api.vimeo.com/users/{user_id}/projects/".format(user_id=vimeo_userid)

    for folder_details in records:
        query = {"should_delete_clips": "true"}
        print(
            "\n"
            + " Deleting Folder {folders} ".format(
                folders=folder_details["name"]
            ).center(100, ":")
        )
        if delete_folder_videos(folder_details):
            response = requests.delete(
                url + folder_details["id"], headers=headers, params=query
            )

            if response.status_code == 200 or response.status_code == 204:
                print(
                    "\n"
                    + "Successfully Deleted Folder {folders} !!".format(
                        folders=folder_details["name"]
                    )
                )
            else:
                print(
                    "Error Status: {status} \nFailed To Deleted Folder {folders} !!".format(
                        folders=folder_details["name"], status=response.status_code
                    )
                )
        else:
            print(
                "\n"
                + "Failed To Delete Videos !!{folders} Folder Skipped".format(
                    folders=folder_details["name"]
                )
            )
    return


if __name__ == "__main__":
    folders = get_vimeo_folders()
    records = filter_oldfolders(folders)
    if records:
        print(len(records))
        delete_vimeo_folders(records)
        # with open("json_data.json", "w") as outfile:
        #     for json_string in records:
        #         json.dump(json_string, outfile)
    else:
        print("\n" + " No Folders To Be Deleted !! All Cleaned Up ".center(100, ":"))
