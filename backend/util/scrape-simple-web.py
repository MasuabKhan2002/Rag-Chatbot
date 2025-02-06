import requests

def scrape_webpage(url, output_file):
    try:
        # Send a GET request to the webpage
        response = requests.get(url)
        
        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Extract the content from the response
            content = response.text
            
            # Write the content to the output file
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"Webpage content scraped successfully and stored in '{output_file}'.")
        else:
            print(f"Failed to scrape webpage. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error occurred while scraping webpage: {e}")

# Example usage:
scrape_webpage("https://www.dcu.ie/library/z-library-databases", "library-database.txt")
