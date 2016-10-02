# twitter-stream
A private Twitter newsfeed streaming server. Great for news you love.

![Image of twitter-stream](https://github.com/jamesmawm/twitter-stream/blob/master/screenshots/screenshot02.png)

# Requirements
- NodeJS or npm

# Installing Dependencies
- From the root directory (where `package.json` is) run `npm install`. This will install all required `node` modules.

# Configuration
Before starting the server, remember to edit your `dashboard.js` file and note the following variables:
- Your Twitter credentials (consumer key, access token and secret keys) *This step is important!!!*
- Host and port configuration
- Specify the words that you want to track in the `track_list` variable of `dashboard.js`.

# Start the Server
- From command promopt (or Terminal), `cd` to the root directory and run `node dashboard.js`.
- From your browser, navigate to `http://localhost:8081`. And enjoy!

Tip
- Click on a news row to 'lock' and display on the top panel.
- Nothing is streaming? Check your Twitter credentials again.