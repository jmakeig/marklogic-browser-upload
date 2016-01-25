Experimental browser-based ingestion. (Mostly an excuse to learn [Redux](https://github.com/rackt/redux).)

## Set-up
1. Install all of the dependencies with `npm install`
1. Build the front-end JavaScript with `npm run-script build` or `./node_modules/.bin/webpack --watch` to build continuously in the background.
1. In [MarkLogic](http://developer.marklogic.com/products) (8.0+), create a new app server. Point its root to this repository’s top-level folder. 
1. Navigate to [http://localhost:8112/browser/index.html](http://localhost:8112/browser/index.html), substituting `localhost` with your hostname and `8112` with the app server’s port configured above.

<img width="1534" alt="query console file upload-options" src="https://cloud.githubusercontent.com/assets/176233/10629975/37a68916-7788-11e5-8ad2-72442ed7270f.png">

