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
    New features
        * Add support for retrieving RPR ratings and calculasting stats like count, range median and mean
        * Add support for retreiving POST DATA Favourite
        * Add support for retreiving the horse that have been tiopped by others
        * Post data to Google Sheets for storage in cloud - append to existing Sheet

    Tech Debt
        * Properly format this README
        * Create Runner file that accepts scraping logic function, and file name
                The runner should incapsulate the common tasks such as setup ands writing to files
        * Rename folder / git repo to horse-racing-scrapers
        * Add this further work section to github issues for tracking

Note"
     Only tested on MacOS - need to add support for windows file system conventions ("C:\...")
        This problem goes away if data posted to google sheets instead of written to local FS 