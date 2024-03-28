#!/bin/sh
file=$(mktemp /tmp/tmp.XXXXXXXXXX.png)
convert "$1" -resize 25% "$file"
avifenc -s 0 -q 50 "$file" $2
rm "$file"