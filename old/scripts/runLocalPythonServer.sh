#!/bin/bash
cd $(dirname $0)
cd ../
echo $PWD
python3 -m http.server 8080
