# Daily SCP
This is a Twitter Bot (@ScpDaily) that Tweet on a daily basis a SCP story
It will Tweet every day at 20.00pm a new SCP with her name, class, an image (if there is one) and the url of the wiki page.
https://twitter.com/ScpDaily

## Necessary file (will be automatically created)
generatedSCP.csv (%ROOT%/backup/generatedSCP.csv)
nextSCP.csv (%ROOT%/temp/nextSCP.csv)
nextSCPImage.png (%ROOT%/temp/nextSCPImage.png)
nextSCPImage.bin (%ROOT%/temp/nextSCPImage.bin)
with %ROOT% corresponding of your project folder (%ROOT% is handle by the app and will be automatically replace by your project folder)

## Environment Variables
DATABASE_URL={YOUR_DATABASE_URL_HERE}
BACKUP_DATABASE_FILEPATH={YOUR_BACKUP_OF_DATABASE_FILEPATH_HERE}
NEXTSCP_FILEPATH={YOUR_NEXTSCP_FILEPATH_HERE}
NEXTSCP_IMAGE_FILEPATH={YOUR_NEXTSCP_IMAGE_FILEPATH_HERE}
NEXTSCP_IMAGE_BIN_FILEPATH={YOUR_NEXTSCP_BINARY_IMAGE_FILEPATH_HERE}
CHROME_EXECUTABLE_PATH={YOUR_CHROME_EXECUTABLE_PATH_HERE}
TWITTER_API_KEY={YOUR_TWITTER_API_KEY_HERE}
TWITTER_API_KEY_SECRET={YOUR_TWITTER_API_KEY_SECRET_HERE}
TWITTER_API_ACCESS_TOKEN={YOUR_TWITTER_API_ACCESS_TOKEN_HERE}
TWITTER_API_ACCESS_TOKEN_SECRET={YOUR_TWITTER_API_ACCESS_TOKEN_SECRET_HERE}  
  
The chrome executable path is refering of the path of chrome.exe, for me (windows 10) it was:  
C:/Users/{ME}/AppData/Roaming/npm/node_modules/puppeteer/.local-chromium/win64-800071/chrome-win/chrome.exe