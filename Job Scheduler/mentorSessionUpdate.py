	
try:
	import pymongo
	from pymongo import MongoClient
	import pandas as pd
	import json
	import requests
	from bson.objectid import ObjectId
	import numpy as np
except Exception as e:
	print("Some Modules are Missing ")

zoom_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IlJIUUhDZkRpUkp1QTZhdWczT0xiVGciLCJleHAiOjI1MzQ2NTM4MDAsImlhdCI6MTYxOTQ3ODMxMn0.Lf_3TmayahoiinSwAXBj-qAKq7hu2sq-6AjTDPa-Oh4'

class MongoDB(object):

	def __init__(self, dBName=None, collectionName=None):

		self.dBName = dBName
		self.collectionName = collectionName

		self.client = MongoClient("mongodb+srv://testuser:testuser@practeeusers.iwbdk.mongodb.net/users?retryWrites=true&w=majority",
								  27017, maxPoolSize=50)

		self.DB = self.client[self.dBName]
		self.collection = self.DB[self.collectionName]

	def InsertData(self, data):
		"""
		:param records: Array of Records
		:return: None
		"""

		self.collection.insert_many(data, ordered=False)
		print("All the Data has been Exported to Mongo DB Server .... ")

	def FetchData(self):
		"""
		:param : None
		:return: records
		"""

		records = self.collection.find ({})
		return list(records)

def GetMentorRecords():
	mentors = MongoDB(dBName = 'users', collectionName='mentors')
	MentorData = mentors.FetchData()
	records = []
	
	for item in MentorData:
		print(' Fetching Meeting Files '.center(100,':'))
		meetingID = []
		url = "https://api.zoom.us/v2/users/"+item["zoomID"]+"/meetings"
		query = {"page_size":"50", "type":"upcoming"}
		headers = headers = {'authorization': 'Bearer '+ zoom_token}
		data = {
			"email": item["email"],
			"zoomID": item["zoomID"],
			"date": [],
			"T1": [],
			"T2": [],
			"T3": [],
			"T8": []
		}
		while True:
			response = requests.request("GET", url, headers=headers, params=query)
			json_response = json.loads(response.content)
			if 'meetings' in json_response.keys():
				for meeting in json_response['meetings']:
					if meeting['type'] != 8 :
						continue

					if meeting['id'] in meetingID:
						for item in data['T8']:
							if meeting['id'] == item['id']:
								item['end_time'] = meeting['start_time']

						if meeting['start_time'].split("T")[0] not in data['date']:
							data['date'].append(meeting['start_time'].split("T")[0])

					else:
						meeting['end_time'] = meeting['start_time']
						data['T8'].append(meeting)
						if meeting['start_time'].split("T")[0] not in data['date']:
							data['date'].append(meeting['start_time'].split("T")[0])
						meetingID.append(meeting['id'])

				if json_response["next_page_token"] == '':
					break
				else: query["next_page_token"] = json_response["next_page_token"]
			else:
				break
		records.append(data)
	return records

if __name__ == "__main__":
	mongodb = MongoDB(dBName = 'users', collectionName='mentorslots')
	records = GetMentorRecords()
	print("records are ready !!")
	mongodb.InsertData(records)