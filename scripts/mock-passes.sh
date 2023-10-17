#!/bin/bash

# Check if the user provided the number of iterations as the first argument
if [ $# -lt 1 ]; then
    echo "Usage: $0 <number_of_iterations>"
    exit 1
fi

# Store the number of iterations from the first argument
filename="./pass_123456.keys"
num_iterations="$1"

touch "$filename"

# Loop 'num_iterations' times, replacing {index} with the current index
for ((i = 1; i <= num_iterations; i++)); do
    alias="test${i}"
    user="example${i}@mail.com"
    pass="1234567890asbcedfghijklmnñopqrstuvwxyz"

    # Execute the desired command with the updated values
    ./bin/mykeys-cli -p 123456 -a set -alias "$alias" -user "$user" -pass "$pass" -f "$filename"
done