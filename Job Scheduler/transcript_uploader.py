import requests
import csv
import json
import os
from datetime import datetime, timedelta
import pytz
from utils import Utils


class Transcript:
    def __init__(self):
        self.utils = Utils()

    def update_outputfile(self, records, filename):
        print("\n" + " Checking video status from Vimeo ".center(100, ":"))

        with open(os.path.abspath("Job Scheduler/" + filename), mode="w") as f:
            writer = csv.writer(f)
            writer.writerow(self.utils.CSV_HEADER)

            for record in records:
                writer.writerow(self.utils.get_record_row(record))

        return records

    def find_transcript_record(self, records, meeting):
        sub_str = "?type=cc"
        transcript = {}
        for record in records:
            if (
                record["meeting_uuid"] == meeting
                and record["file_extension"] == "VTT"
                and not sub_str in record["download_url"]
            ):
                return record
            elif (
                record["meeting_uuid"] == meeting
                and record["file_extension"] == "VTT"
                and sub_str in record["download_url"]
            ):
                transcript = record
        return transcript

    def get_transcript(self, url, filename):
        query = {"access_token": self.utils.zoom_token}
        response = requests.request("GET", url, params=query)
        if response.status_code == 200:
            return response.content
        else:
            print(
                "\n"
                + " Failed to Download {filename}. Response Status Code : {status}".format(
                    filename=filename, status=response.status_code
                ).center(
                    100, ":"
                )
            )
            return 0

    def upload_zoom_transcript(self, records):
        print("\n" + " Backup transcript files from Zoom ".center(100, ":"))
        url = "https://api.vimeo.com"
        headers = {
            "Authorization": "Bearer " + self.utils.vimeo_token,
            "Content-Type": "application/json",
            "Accept": "*/*",
        }
        failed_list = []
        for record in records:
            if record["file_extension"] == "MP4":
                if record["vimeo_status"] == "pending":
                    failed_list.append(
                        {
                            "email": record["email"],
                            "topic": record["topic"],
                            "meeting_id": record["meeting_id"],
                            "success": False,
                        }
                    )
                    print(
                        "\n"
                        + "No Transcript to upload for {filename} ! ".format(
                            filename=record["file_name"]
                        )
                    )
                    continue
                transcript_record = self.find_transcript_record(
                    records, record["meeting_uuid"]
                )
                if transcript_record:
                    if transcript_record["vimeo_status"] == "active":
                        continue
                    transcript = self.get_transcript(
                        transcript_record["download_url"],
                        transcript_record["file_name"],
                    )
                    if transcript:
                        if record["vimeo_id"]:
                            _url = url + "/videos/" + record["vimeo_id"]
                            response = requests.request("GET", _url, headers=headers)
                            json_response = json.loads(response.text)
                            texttracks_uri = json_response["metadata"]["connections"][
                                "texttracks"
                            ]["uri"]

                            print(
                                "\n"
                                + " Uploading {filename} ".format(
                                    filename=transcript_record["file_name"]
                                ).center(100, ":")
                            )
                            body = {}

                            body["type"] = "subtitles"
                            body["language"] = "en"
                            body["name"] = transcript_record["file_name"]

                            _url = url + texttracks_uri
                            response = requests.request(
                                "POST", _url, headers=headers, data=json.dumps(body)
                            )

                            if response.status_code == 201:
                                json_response = json.loads(response.text)
                                upload_link = json_response["link"]
                                patch_link = url + json_response["uri"]
                                response = requests.request(
                                    "PUT", upload_link, headers=headers, data=transcript
                                )

                                if response.status_code == 200:
                                    response = requests.request(
                                        "PATCH",
                                        patch_link,
                                        headers=headers,
                                        data=json.dumps({"active": True}),
                                    )
                                    if response.status_code == 200:
                                        transcript_record["vimeo_status"] = "active"
                                        print(
                                            " Successfully Uploaded {filename}".format(
                                                filename=transcript_record["file_name"]
                                            )
                                        )
                                    else:
                                        transcript_record["vimeo_status"] = "not active"
                                        print(
                                            "\n"
                                            + " Failed to Activate {filename}. Response Status Code : {status}".format(
                                                filename=transcript_record["file_name"],
                                                status=response.status_code,
                                            ).center(
                                                100, ":"
                                            )
                                        )

                                else:
                                    print(
                                        "\n"
                                        + " Failed to Upload {filename}. Response Status Code : {status}".format(
                                            filename=transcript_record["file_name"],
                                            status=response.status_code,
                                        ).center(
                                            100, ":"
                                        )
                                    )

                            else:
                                print(
                                    "\n"
                                    + " Failed Post request to texttracks_uri {filename}. Response Status Code : {status}".format(
                                        filename=transcript_record["file_name"],
                                        status=response.status_code,
                                    ).center(
                                        100, ":"
                                    )
                                )

                        else:
                            failed_list.append(
                                {
                                    "email": record["email"],
                                    "topic": record["topic"],
                                    "meeting_id": record["meeting_id"],
                                    "success": True,
                                }
                            )
                            print(
                                "\n"
                                + "Record {filename} needs to be uploaded first! ".format(
                                    filename=record["file_name"]
                                )
                            )

                else:
                    if (
                        record["vimeo_status"] == "available"
                        or record["vimeo_status"] == "transcoding"
                    ):
                        failed_list.append(
                            {
                                "email": record["email"],
                                "topic": record["topic"],
                                "meeting_id": record["meeting_id"],
                                "success": True,
                            }
                        )
                        print(
                            "\n"
                            + "No Transcript to upload for {filename} ! ".format(
                                filename=record["file_name"]
                            )
                        )
                    else:
                        failed_list.append(
                            {
                                "email": record["email"],
                                "topic": record["topic"],
                                "meeting_id": record["meeting_id"],
                                "success": False,
                            }
                        )
                        print(
                            "\n"
                            + "No Transcript to upload for {filename} ! ".format(
                                filename=record["file_name"]
                            )
                        )

        if failed_list:
            with open(os.path.abspath("Job Scheduler/error.txt"), "a") as f:
                IST = pytz.timezone("Asia/Kolkata")
                date = str(datetime.now(IST) - timedelta(days=1)).split(" ")[0]
                f.write(
                    (" Transcript upload Failed " + date + " !! ").center(100, ":")
                    + "\n"
                )
                for line in failed_list:
                    f.write(
                        str(line["email"])
                        + "\t"
                        + str(line["topic"])
                        + "\t"
                        + str(line["meeting_id"])
                        + " (UPLOADED)"
                        + "\n"
                    ) if line["success"] else f.write(
                        str(line["email"])
                        + "\t"
                        + str(line["topic"])
                        + "\t"
                        + str(line["meeting_id"])
                        + "\n"
                    )

        return records
