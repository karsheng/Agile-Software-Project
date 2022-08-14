from firebase_admin import credentials
import firebase_admin
import os

from dotenv import load_dotenv

load_dotenv()


def init_firebase():
    cred_dict = {
        'type': os.environ['type'],
        'project_id': os.environ['project_id'],
        'private_key_id': os.environ['private_key_id'],
        'private_key': os.environ.get('private_key').encode('latin1').decode('unicode_escape'),
        'client_email': os.environ['client_email'],
        'client_id': os.environ['client_id'],
        'auth_uri': os.environ['auth_uri'],
        'token_uri': os.environ['token_uri'],
        'auth_provider_x509_cert_url': os.environ['auth_provider_x509_cert_url'],
        'client_x509_cert_url': os.environ['client_x509_cert_url']
    }

    cred = credentials.Certificate(cred_dict)

    firebase_admin.initialize_app(cred, {
        'databaseURL': os.environ['databaseURL']
    })
