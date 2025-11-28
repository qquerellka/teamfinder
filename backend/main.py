from backend.presentations.app import create_app
from fastapi import FastAPI

app: FastAPI = create_app()
