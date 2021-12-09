#!/bin/sh

current=$(pwd)

# for function_dir in "parse-article create-article get-articles"
# do
#     echo $function_dir
#     cd $function_dir
#     npm run clean
#     npm run compile
#     cd $current
# done

echo parse-article
cd parse-article
npm run clean
npm run compile
cd $current

echo create-article
cd create-article
npm run clean
npm run compile
cd $current

echo add-audio
cd add-audio
npm run clean
npm run compile
cd $current

echo get-article
cd get-article
npm run clean
npm run compile
cd $current

echo get-articles
cd get-articles
npm run clean
npm run compile
cd $current
