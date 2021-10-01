import os
import sys
import json
import csv
import requests
import pytz
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from datetime import timedelta

class Utils:
	ZOOM_REPORT_HEADER = ["HOST", "EMAIL", "ACTUAL SESSIONS", "BLANK SESSIONS", "TOTAL ACTUAL SESSIONS"]

	def __init__(self):
		self.load_config()

	def load_config(self):
		with open(os.path.abspath("Zoom Attendance/config.json")) as json_data_file:
			data = json.load(json_data_file)

		self.zoom_token = data['zoom-token']
		self.report_mailer = data["report-mailer"]

	def get_record_row(self, record):
		row = []
		for record_name in self.ZOOM_REPORT_HEADER:
			row.append(record[record_name.lower().replace(' ','_')])
		return row

	def save_csv(self, fileobject, filename):
		print('\n'+' Saving report {filename} '.format(filename=filename).center(100,':'))

		with open(os.path.abspath("Zoom Attendance/"+filename), 'w', newline='') as f: #'a'
			writer = csv.writer(f)
			writer.writerow(self.ZOOM_REPORT_HEADER)

			for record in fileobject:
				writer.writerow(self.get_record_row(record))

	def send_mail(self, email_send):
		IST = pytz.timezone('Asia/Kolkata')
		email_user = self.report_mailer["mail-id"]
		email_password = self.report_mailer["mail-password"]
		subject = str(datetime.now(IST)).split(" ")[0]+'ZOOM ATTENDANCE REPORT'

		msg = MIMEMultipart()
		msg['From'] = email_user
		if isinstance(email_send,list):
			msg['To'] = ','.join(email_send)
		else :
			msg['To'] = email_send
		msg['Subject'] = subject

		body = 'Successfully Uploaded Zoom recordings to Vimeo.The generated reportfile is attached below.'
		msg.attach(MIMEText(body, 'plain'))

		f='Zoom_Attandance_file.csv'
		part = MIMEBase('application', 'octet-stream')
		part.set_payload(open(os.path.abspath("Zoom Attendance/"+f),"rb").read())
		encoders.encode_base64(part)
		part.add_header('Content-Disposition',
					'attachment; filename="%s"' % f)
		msg.attach(part)

		text = msg.as_string()
		server = smtplib.SMTP('smtp.gmail.com', 587)
		server.starttls()
		server.login(email_user, email_password)

		server.sendmail(email_user, email_send, text)
		print('\n'+' Mail Has Been Sent To {filename} '.format(filename=email_send).center(100,':'))

		server.quit()

	def get_zoom_attendace(self, start_date):
		print(' Getting meetings list '.center(100,':'))

		url = "https://api.zoom.us/v2/metrics/meetings"
		query = {"page_size":"100"}
		headers = {'Authorization': 'Bearer '+self.zoom_token}

		end_date = datetime.strptime(start_date, '%Y-%m-%d').date()
		meetings_list = []
		emails_list = []

		from_date = datetime.strptime(start_date, '%Y-%m-%d').date()  #date(2020, 01, 01)

		query["from"] = str(from_date)
		query["to"] = str(from_date)

		print(' [{start_date}] - [{end_date}] '.format(start_date=start_date, end_date=end_date).center(100,':'))
		# print(' ['+str(from_date)+'] - ['+str(to_date)+'] ')
		
		while True:
			query["type"] = "past"

			response = requests.request("GET", url, headers=headers, params=query)
			json_response = json.loads(response.content)
			print(len(json_response['meetings']))
			
			if json_response['total_records'] > 0:
				for meeting in json_response['meetings']:
					if '@' in meeting['topic'] and '(' in meeting['topic']:
						if meeting['email'] in emails_list:
							for record in meetings_list:
								if meeting['email'] == record['email']:
									record['actual_sessions'] += (meeting['topic'].split('(')[0]).strip()+', '
									record['total_actual_sessions'] += 1
						else:
							item = {}
							emails_list.append(meeting['email'])
							item['host'] = meeting['host']
							item['email'] = meeting['email']
							item['actual_sessions'] = (meeting['topic'].split('(')[0]).strip()+', '
							item['blank_sessions'] = ''
							item['total_actual_sessions'] = 1
							meetings_list.append(item)

			if json_response["next_page_token"] == '':
				break
			else: query["next_page_token"] = json_response["next_page_token"]
		
		# print(meetings_list)
		if "next_page_token" in query.keys() :
			del query["next_page_token"]

		while True:
			query["type"] = "pastOne"
			response = requests.request("GET", url, headers=headers, params=query)
			json_response = json.loads(response.content)
			print(len(json_response['meetings']))
			
			if json_response['total_records'] > 0:
				for meeting in json_response['meetings']:
					if '@' in meeting['topic'] and '(' in meeting['topic']:
						if meeting['email'] in emails_list:
							for record in meetings_list:
								if meeting['email'] == record['email']:
									if not (meeting['topic'].split('(')[0]).strip()+', ' in record['actual_sessions']:
										record['blank_sessions'] += (meeting['topic'].split('(')[0]).strip()+', '
						else:
							item = {}
							emails_list.append(meeting['email'])
							item['host'] = meeting['host']
							item['email'] = meeting['email']
							item['actual_sessions'] = ''
							item['blank_sessions'] = (meeting['topic'].split('(')[0]).strip()+', '
							item['total_actual_sessions'] = 0
							meetings_list.append(item)

			if json_response["next_page_token"] == '':
				break
			else: query["next_page_token"] = json_response["next_page_token"]

		print(emails_list)
		return meetings_list



if __name__ == "__main__":
	IST = pytz.timezone('Asia/Kolkata')
	date = str(datetime.now(IST)-timedelta(days=1)).split(" ")[0]

	utils = Utils()

	files = utils.get_zoom_attendace(date)
	utils.save_csv(files, "Zoom_Attandance_file.csv")

	if (utils.report_mailer["active"]):
		try:
			utils.send_mail(utils.report_mailer["mail-to"])
		except Exception as e:
			print(' MAIL FAILED '.center(100,':'))
			print(e)