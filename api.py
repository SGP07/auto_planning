from utils import get_planning, get_css, add_class_to_td
from fastapi import FastAPI, File, UploadFile
from typing import Optional
from tempfile import TemporaryDirectory
from json import loads

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
async def upload_file(file: UploadFile = File(...),  tp: Optional[str] = 'TPD', td:Optional[str] = 'TDC', selected_week:int = 0, flip:bool= False):
    groups = [tp, td]
    print(groups)
    with TemporaryDirectory() as temp:
        file_path = f"{temp}/planning.xlsx"
        
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        new_df = get_planning(file_path, groups, selected_week, flip)

    html_table = new_df.to_html()
    html_table = add_class_to_td(html_table)
    result = new_df.to_json(orient="columns")
    parsed = loads(result)
    css = get_css()

    return {"html": html_table, "css":css, "data":parsed}
