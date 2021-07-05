import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
import pytz
from utils import Utils

class Mailer:

	def send_mail(self, email_send):
		IST = pytz.timezone('Asia/Kolkata')
		utils = Utils()
		email_user = utils.report_mailer["mail-id"]
		email_password = utils.report_mailer["mail-password"]
		subject = str(datetime.now(IST)).split(" ")[0]+'ZOOM RECORDINGS UPLOAD REPORT'

		msg = MIMEMultipart()
		msg['From'] = email_user
		if isinstance(email_send,list):
			msg['To'] = ','.join(email_send)
		else :
			msg['To'] = email_send
		msg['Subject'] = subject

		body = 'Successfully Uploaded Zoom recordings to Vimeo.The generated reportfile is attached below.'
		msg.attach(MIMEText(body, 'plain'))

		if os.path.isfile('error.txt'):
			files=['outputfile.csv','error.txt']
			for f in files:
				part = MIMEBase('application', 'octet-stream')
				part.set_payload(open(os.path.abspath("Job Scheduler/"+f),"rb").read())
				encoders.encode_base64(part)
				part.add_header('Content-Disposition',
							'attachment; filename="%s"' % os.path.abspath("Job Scheduler/"+f))
				msg.attach(part)
		else:
			f='outputfile.csv'
			part = MIMEBase('application', 'octet-stream')
			part.set_payload(open(os.path.abspath("Job Scheduler/"+f),"rb").read())
			encoders.encode_base64(part)
			part.add_header('Content-Disposition',
						'attachment; filename="%s"' % os.path.abspath("Job Scheduler/"+f))
			msg.attach(part)

		text = msg.as_string()
		server = smtplib.SMTP('smtp.gmail.com', 587)
		server.starttls()
		server.login(email_user, email_password)

		server.sendmail(email_user, email_send, text)
		print('\n'+' Mail Has Been Sent To {filename} '.format(filename=email_send).center(100,':'))

		server.quit()