# racing-priofits-daily-naps-scraper

Requirements
    Node
    Chromium

Installation
    Dependencies
        `$ npm install`

    install scrapers as CLI
           `$ npm install -g`

Execution
    naps: `$ naps`
    forecasts `$ forecasts`
    all : `$ selections`

Output
    Scraped data will be in csv files in the following files
        '/Users/{user}/Documents/Selections/naps.csv'
        '/Users/{user}/Documents/Selections/forecasts.csv'

Further Work
    1) Color outputs
    2) Post data to Google Sheets for storage in cloud - append to existing Sheet.
    3) Properly format this README
    4) Create Runner file that accepts scraping logic function, and file name. 
            The runner should incapsulate the common tasks such as setup ands writing to files.
    5) Rename folder / git repo to horse-racing-scrapers

Notes
     Only tested on MacOS