from re import L
import mailchimp_transactional as MailchimpTransactional
from mailchimp_transactional.api_client import ApiClientError
import email_template

mchimp_API_KEY = "RkbQIiPIhHFY0XH1gssLwA"

message = {
        "message": {"subject": email_template.email_subject(),
        "from_email": "hello@moneymoodapp.com",
        "to": email_template.email_receipent(),
        "text": email_template.email_body()
        }
}
try:
  mailchimp = MailchimpTransactional.Client(mchimp_API_KEY)
  response = mailchimp.messages.send(message)
  print('API called successfully: {}'.format(response))
except ApiClientError as error:
  print('An exception occurred: {}'.format(error.text))
