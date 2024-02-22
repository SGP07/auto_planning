from utils import get_planning, get_css, add_class_to_td
from fastapi import FastAPI, File, UploadFile
from typing import List
from tempfile import TemporaryDirectory

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your website's URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"HealthCheck": "OK"}

@app.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...),  groups: List[str] = ['TPD', 'TDC']):

    print(groups)
    with TemporaryDirectory() as temp:
        file_path = f"{temp}/planning.xlsx"
        
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        new_df = get_planning(file_path, groups)

    html_table = new_df.to_html()
    html_table = add_class_to_td(html_table)
    css = get_css()

    return {"html": html_table, "css":css}
