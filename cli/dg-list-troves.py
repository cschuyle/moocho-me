#!/usr/bin/env python3
import subprocess
import json
import os
import argparse
from tabulate import tabulate

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
parser.add_argument('-s', '--sort', help='Sort parameter', choices=['count', 'id', 'name'])
parser.add_argument('-r', '--reverse', help='Reverse sort order', default=False, action='store_true')
args = parser.parse_args()


sort_param = args.sort
sort_dir = args.reverse

api_key = os.environ.get('MOOCHO_API_KEY')
if not api_key:
    raise ValueError("MOOCHO_API_KEY environment variable not set")

data = get_json_data([
        'curl', 
        '-H', f'X-API-KEY: {api_key}',
        '-s',  # silent mode
        'http://moocho.me/troves/summary'
    ])

if data:
    trove_list = [[item.get('itemCount', 0), item.get('troveId', 'unknown'), item.get('shortName', 'Unknown')] for item in data]
    
    match sort_param:
        case 'count':
            trove_list.sort(key=lambda x: x[0], reverse=sort_dir)  # Sort by itemCount
        case 'id':
            trove_list.sort(key=lambda x: x[1], reverse=sort_dir)  # Sort by troveId
        case 'name':
            trove_list.sort(key=lambda x: x[2], reverse=sort_dir)  # Sort by shortName

    print(tabulate(trove_list, headers=['Item Count', 'Trove ID', 'Name'], tablefmt='plain'))


