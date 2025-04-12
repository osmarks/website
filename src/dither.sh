#!/bin/sh
tmp1=$(mktemp /tmp/tmp.XXXXXXXXXX.png)
tmp2=$(mktemp /tmp/tmp.XXXXXXXXXX.png)
tmp3=$(mktemp /tmp/tmp.XXXXXXXXXX.png)
convert "$2" -resize "$1" "$tmp1"
#dither "$file" "$3" -c 12e193
dither "$tmp1" "$tmp2" -c B2D2FF
convert "$tmp2" -transparent black "$tmp3"
pngquant --force --strip --speed 1 "$tmp3" -o "$3"
rm "$tmp1"
rm "$tmp2"
rm "$tmp3"
