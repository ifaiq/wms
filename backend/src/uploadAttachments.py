import requests
from requests.auth import HTTPDigestAuth
import json
import sys
import os

environments = {
    'local': 'http://localhost:3000/',
    'dev': 'https://dev.retailo.me/wmsbackend/',
    'stage': 'https://stage.retailo.me/wmsbackend/',
    'prod': 'https://prod.retailo.me/wmsbackend/',
}

# Replace with the correct URL
loginUrl = f"{environments[sys.argv[4]]}auth/login"
attachmentUrl = f"{environments[sys.argv[4]]}admin/attach"

# login using provided credentials
myResponse = requests.post(loginUrl, {
  'email': sys.argv[1],
  'password': sys.argv[2]
})

# For successful API call, response code will be 200 (OK)
if(myResponse.ok):
    jData = json.loads(myResponse.content)
    accessToken = jData['access_token']
    
    # assign directory
    directory = sys.argv[3]

    # loop through directory
    for filename in os.scandir(directory):
        # check if its a file
        if filename.is_file():
            files = {'file': open(filename.path, 'rb')}
            # make api call
            r = requests.post(attachmentUrl, files=files, headers = {"Authorization": f"Bearer {accessToken}"})
else:
  # If response code is not ok (200), print the resulting http error code with description
    myResponse.raise_for_status()