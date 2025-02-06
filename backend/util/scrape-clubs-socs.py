import requests
import json
import datetime

def scrape_events_from_url(url):
    response = requests.get(url)
    
    if response.status_code == 200:
        parsed_data = json.loads(response.text)

        for event in parsed_data["result"]:
            start_timestamp = event["start"] / 1000
            end_timestamp = event["end"] / 1000

            start_timestamp += 3600
            end_timestamp += 3600
            
            start_datetime = datetime.datetime.utcfromtimestamp(start_timestamp)
            end_datetime = datetime.datetime.utcfromtimestamp(end_timestamp)
            
            start_irish_time = start_datetime.strftime('%Y-%m-%d %H:%M:%S')
            end_irish_time = end_datetime.strftime('%Y-%m-%d %H:%M:%S')
            
            event["start"] = start_irish_time
            event["end"] = end_irish_time
        json_data = json.dumps(parsed_data, indent=4)

        return(json_data)
    else:
        print(f"Failed to scrape data from {url}. Status code: {response.status_code}")
        return None

url = "https://dcuclubsandsocs.ie/ajax/calendar_events?beginner_friendly=0&sensory_friendly=0&commuter_friendly=0&wheelchair_friendly=0&from=1711926000000&to=1714518000000&utc_offset_from=-60&utc_offset_to=-60"

scraped_data = scrape_events_from_url(url)

if scraped_data:
    with open("scraped_data.json", "w") as json_file:
        json_file.write(scraped_data)
    
    print("JSON data has been stored in scraped_data.json")
