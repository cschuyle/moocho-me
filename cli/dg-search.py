#!/usr/bin/env python3
import subprocess
import json
import os
import argparse
from tabulate import tabulate
from urllib.parse import quote

def get_json_data(cmd):
        
    try:
        # Execute the command and capture output
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        # Parse JSON response
        data = json.loads(result.stdout)
        return data
        
    except subprocess.CalledProcessError as e:
        print(f"Command failed with return code {e.returncode}")
        print(f"Error: {e.stderr}")
        return None
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        print(f"Raw output: {result.stdout}")
        return None

# Parse command line arguments
parser = argparse.ArgumentParser(description='List troves')
parser.add_argument('query', help='Search query')
parser.add_argument('-s', '--sort', help='Sort parameter', choices=['title', 'trove', 'score'])
parser.add_argument('-r', '--reverse', help='Reverse sort order', action='store_true')
parser.add_argument('-t', '--troves', help='Comma-separated list of troves to search', default='*')
args = parser.parse_args()

api_key = os.environ.get('MOOCHO_API_KEY')
if not api_key:
    raise ValueError("MOOCHO_API_KEY environment variable not set")

# curl -H "X-API-KEY: $MOOCHO_API_KEY" -v http://moocho.me/search\?troves\=\*\&query\=$query\&maxResults\=3000
data = get_json_data([
        'curl', 
        '-H', f'X-API-KEY: {api_key}',
        '-s',
        '-v',  # silent mode
        f'http://moocho.me/search?troves={quote(args.troves)}&query={quote(args.query)}&maxResults=3000'
    ])

# {
#   "troveHits": [
#     {
#       "troveId": "dvdinbox",
#       "name": "DVDInbox Queue",
#       "shortName": "DVDInbox",
#       "totalCount": 624,
#       "hitType": "primary",
#       "hitCount": 2
#     }
#   ],
#   "searchResults": [
#     {
#       "primaryHit": {
#         "doc": 37317,
#         "score": 1.0,
#         "troveId": "spotify",
#         "title": "Surfing with the Alien"
#       },
#       "secondaryHits": [],
#       "score": 1.0
#     }
#   ]
# }

if data:
    trove_list = [
        [
            searchResult.get('primaryHit').get('troveId'), 
            searchResult.get('primaryHit').get('title'), 
            searchResult.get('primaryHit').get('score'), 
        ] 
        for searchResult in data.get('searchResults')
    ]
    
    match args.sort:
        case 'trove':
            trove_list.sort(key=lambda x: x[0], reverse=args.reverse)
        case 'title':
            trove_list.sort(key=lambda x: x[1], reverse=args.reverse)
        case 'score':
            trove_list.sort(key=lambda x: x[2], reverse=args.reverse)

    print(tabulate(trove_list, headers=['Trove ID', 'Title', 'Score'], tablefmt='plain'))


