```
mkdir function-dir
cd function-dir
npx gts init
npm install @google-cloud/functions-framework
npm install @types/express concurrently nodemon --save-dev
```

```
  "scripts": {
    "start": "functions-framework --source=build/src/ --target=function-name",
    "watch": "concurrently \"tsc -w\" \"nodemon --watch ./build/ --exec npm run start\"",
    ...
  }
```
