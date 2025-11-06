import os
from dotenv import load_dotenv

load_dotenv()

PG_USER = str(os.getenv('PG_APP__USERNAME'))
PG_PASSWORD = str(os.getenv('PG_APP__PASSWORD'))
PG_DATABASE = str(os.getenv('PG_APP__DATABASE'))
PG_HOST = str(os.getenv('PG_APP__HOST'))
PG_PORT = int(os.getenv('PG_APP__PORT'))
