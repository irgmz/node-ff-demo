const express = require("express");
const { GrowthBook } = require("@growthbook/growthbook");
const Rollbar = require('rollbar');

const app = express();
const port = 3000;

const rollbar = new Rollbar({
  accessToken: 'fe6f4278ef9e4e04a6de03cca85a89b2',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

app.use(function(req, res, next) {
  // Create a GrowthBook Context
  req.growthbook = new GrowthBook({
    apiHost: "https://cdn.growthbook.io",
    clientKey: "sdk-f0iMJiWKlh8vGlTF",
    enableDevMode: true,
    trackingCallback: (experiment, result) => {
      // TODO: Use your real analytics tracking system
      console.log("Viewed Experiment", {
        experimentId: experiment.key,
        variationId: result.key
      });
    }
  });

  // Clean up at the end of the request
  res.on('close', () => req.growthbook.destroy());

  // Wait for features to load (will be cached in-memory for future requests)
  req.growthbook.loadFeatures()
    .then(() => next())
    .catch((e) => {
      console.error("Failed to load features from GrowthBook", e);
      next();
    })
})

app.get("/", (req, res) => {
    if (req.growthbook.isOn("button-counter")) {
        // log an error to Rollbar
        rollbar.error("Uh oh, something broke!!");

        // send error message
        res.send("Uh oh, something broke!");
    }
    else {
        res.send("A wonderful and stable application");
    }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
rollbar.log('Hello world!')