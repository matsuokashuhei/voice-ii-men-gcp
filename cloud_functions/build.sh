#!/bin/sh

current=$(pwd)

echo create-article
cd create-article
npm run clean
npm run compile
cd $current

# cd convert-text-to-speech
# npm run clean
# npm run compile
# cd $current

# cd extract-article
# npm run clean
# npm run compile
# cd $current

echo get-articles
cd get-articles
npm run clean
npm run compile
cd $current
