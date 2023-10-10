#!/bin/bash

rm ./pass_123456.keys
touch ./pass_123456.keys

for i in {1..100}
do
    ./bin/cli -p 123456 -a set -alias test$i -user example$1@mail.com -pass 1234567890asbcedfghijklmnñopqrstuvwxyz  -f ./pass_123456.keys
done