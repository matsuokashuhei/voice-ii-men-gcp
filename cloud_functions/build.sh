#!/bin/sh

current=$(pwd)

cd convert-text-to-speech
npm run clean
npm run compile
cd $current

cd extract-article
npm run clean
npm run compile
cd $current
