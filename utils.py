import pandas as pd
from bs4 import BeautifulSoup
import datetime
import re

input_file = "input.xlsx"

def current_week():
    today = datetime.date.today()
    week_num = today.isocalendar()[1] - 5
    return week_num


def get_planning(input_file, groups, selected_week = 0, flip=False):

    df = pd.read_excel(input_file)  
    groups = [g.upper() for g in groups]  
    regex_pattern = '|'.join([re.escape(group[:2]) + r'(?:\s?GR)?' + re.escape(group[2:]) for group in groups])
    regex_pattern += "|CM"

    df = df.drop(df.columns[0], axis=1)
    df = df.drop(index=range(6))
    df = df.fillna('')
    df = df.reset_index(drop=True)
    df = df.rename(columns={'Unnamed: 1': 'Day', 'Unnamed: 2': 'Time'})

    df['Day'][0] = df['Day'][1] = 'x'


    for i in range(len(df)):
        if df['Day'][i] == "":
            df['Day'][i] = df['Day'][i - 1]

    prev_col = 'Day'
    for col in df.columns:
        
        if df[col][0] == '':
            df[col][0] = df[prev_col][0]
        prev_col = col
            
    times = ['08H30-10H20', '10H30-12H20', '14H00-15H50', '16H00-17H50']
    days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

    new_df = pd.DataFrame(index=times, columns=days)

    current_week = update_week() + selected_week
    print(f"current_week : {current_week}")
    week_columns = [col for col in df.columns if df[col][0] == current_week]


    for i in range(len(df)):
        if df['Day'][i] == "":
            df['Day'][i] = df['Day'][i - 1]

    prev_col = 'Day'
    for col in df.columns:
        
        if df[col][0] == '':
            df[col][0] = df[prev_col][0]
        prev_col = col
            
    for i in range(len(df)):
        for col in week_columns[:7]:
            cours = df[col][i]
            if isinstance(cours, str) and re.match(regex_pattern, cours):
                day = df['Day'][i]
                time = df['Time'][i].strip()
                if day == 'Vendredi' and time in ['14H30-16H20', '16H30-18H20']:  # Adjust time for Friday
                    time = '14H00-15H50' if time == '14H30-16H20' else '16H00-17H50'
                new_df.loc[time, day] = cours

    new_df = new_df.fillna('')

    pd.set_option("display.max_column", None)
    pd.set_option("display.max_colwidth", None)
    pd.set_option('display.width', -1)
    pd.set_option('display.max_rows', None)

    return new_df.transpose() if flip else new_df



def get_css():
    
    css = """
<style>
table {
  font-family: Arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
th {
  background-color: #f2f2f2;
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}
td {
  border: 1px solid black;
  text-align: left;
  padding: 8px;
}

</style>
    """
    return css

def add_class_to_td(html_code):
    # Parse the HTML code
    soup = BeautifulSoup(html_code, 'html.parser')
    
    # Find all td tags and add a class based on the first two characters inside them
    for td in soup.find_all('td'):
        if td.text:
            first_two_chars = td.text[:2]
            td['class'] = first_two_chars
    
    # Return the modified HTML code
    return str(soup)

