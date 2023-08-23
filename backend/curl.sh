#!/bin/bash

# File path
FILE_PATH=".nodes.json"

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
	echo '{"error": "File does not exist."}'
	exit 1
fi

# Extract endpoint and token from .nodes.json
endpoint=$(jq -r '.[0].endpoint' "$FILE_PATH")
token=$(jq -r '.[0].token' "$FILE_PATH")

# Append given path
full_endpoint="${endpoint}/$1"

# Fetch data using curl
data=$(curl -sk -H "Authorization: $token" "$full_endpoint")
echo "$data"
