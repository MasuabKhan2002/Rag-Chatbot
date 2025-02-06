import requests
import json
import datetime

def scrape_events_from_url(url):
    response = requests.get(url)
    
    if response.status_code == 200:
        parsed_data = json.loads(response.text)
        json_data = json.dumps(parsed_data, indent=4)

        return(json_data)
    else:
        print(f"Failed to scrape data from {url}. Status code: {response.status_code}")
        return None

url = "https://dci2.ttl.ai/config/dcu/"

scraped_data = scrape_events_from_url(url)

if scraped_data:
    with open("scraped_data.json", "w") as json_file:
        json_file.write(scraped_data)
    
    print("JSON data has been stored in scraped_data.json")
