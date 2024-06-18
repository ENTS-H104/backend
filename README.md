# Express.js App on Google Cloud Platform (GCP) with ACL and Third-Party API Integration

This guide will help you replicate an Express.js application on Google Cloud Platform (GCP), configure Access Control Lists (ACL), and integrate a third-party API.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting Up GCP](#setting-up-gcp)
- [Deploying the Express.js App](#deploying-the-expressjs-app)
- [Integrating a Third-Party API](#integrating-a-third-party-api)
- [Configuring ACL](#configuring-acl)
- [Testing the Deployment](#testing-the-deployment)

## Prerequisites

Before you begin, ensure you have the following:

- A Google Cloud Platform (GCP) account
- Node.js and npm installed
- Google Cloud SDK installed and configured
- Basic knowledge of Express.js and GCP

## Setting Up GCP

1. **Create a new project:**
    - Go to the [GCP Console](https://console.cloud.google.com/).
    - Click on the project drop-down and select "New Project".
    - Name your project and click "Create".

2. **Enable required APIs:**
    - Enable the following APIs:
        - Cloud Build API
        - Cloud Run API
    - You can do this through the API library in the GCP Console.

3. **Install Google Cloud SDK:**
    - Download and install the Google Cloud SDK from [here](https://cloud.google.com/sdk/docs/install).
    - Initialize the SDK with `gcloud init` and follow the prompts to log in and set the project.

## Deploying the Express.js App

1. **Create an Express.js app:**
    - Initialize a new Express.js application or use an existing one.
    ```bash
    npx express-generator my-express-app
    cd my-express-app
    npm install
    ```

2. **Dockerize the app:**
    - Create a `Dockerfile` in the root of your project:
    ```dockerfile
    # Use the official Node.js image.
    FROM node:14

    # Create and change to the app directory.
    WORKDIR /usr/src/app

    # Copy application dependency manifests to the container image.
    COPY package*.json ./

    # Install production dependencies.
    RUN npm install

    # Copy local code to the container image.
    COPY . .

    # Run the web service on container startup.
    CMD [ "npm", "start" ]
    ```

3. **Build the Docker image:**
    ```bash
    docker build -t gcr.io/[YOUR_PROJECT_ID]/my-express-app .
    ```

4. **Push the Docker image to Container Registry:**
    ```bash
    docker push gcr.io/[YOUR_PROJECT_ID]/my-express-app
    ```

5. **Deploy to Cloud Run:**
    ```bash
    gcloud run deploy --image gcr.io/[YOUR_PROJECT_ID]/my-express-app --platform managed
    ```

    - Follow the prompts to select your region and allow unauthenticated invocations if desired.

## Integrating a Third-Party API

1. **Choose a third-party API:**
    - Decide which third-party API you want to integrate. For this example, we'll use the OpenWeatherMap API.

2. **Sign up and get an API key:**
    - Sign up on [OpenWeatherMap](https://openweathermap.org/) and obtain your API key.

3. **Install Axios:**
    - Install Axios to handle HTTP requests.
    ```bash
    npm install axios
    ```

4. **Create a route to call the API:**
    - Add the following code to your `app.js` or create a new route file (e.g., `routes/weather.js`).
    ```javascript
    const express = require('express');
    const axios = require('axios');
    const router = express.Router();

    const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
    const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

    router.get('/weather/:city', async (req, res) => {
        const city = req.params.city;
        try {
            const response = await axios.get(`${BASE_URL}?q=${city}&appid=${API_KEY}`);
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching weather data' });
        }
    });

    module.exports = router;
    ```

5. **Use the new route in your app:**
    - Include the new route in your main `app.js` file.
    ```javascript
    const weatherRouter = require('./routes/weather');
    app.use('/api', weatherRouter);
    ```

## Configuring ACL

1. **Set up ACLs for your GCP resources:**
    - Navigate to the IAM & Admin section in the GCP Console.
    - Select "IAM" and click on the "Add" button to add new members.
    - Assign roles and set permissions for users or service accounts as needed.

2. **Control access to Cloud Run services:**
    - In the Cloud Run section, select your service.
    - Go to the "Permissions" tab and click "Add member".
    - Add the members and assign roles such as Cloud Run Invoker to control access.

## Testing the Deployment

1. **Access your deployed service:**
    - Once deployed, Cloud Run will provide a URL for your service.
    - Open the URL in your browser to see your running Express.js application.

2. **Test the API integration:**
    - Test the API endpoint by navigating to `http://YOUR_CLOUD_RUN_URL/api/weather/{city}`.

3. **Verify ACLs:**
    - Test access by logging in with different accounts to ensure ACLs are configured correctly.

## Conclusion

You have successfully deployed an Express.js application on Google Cloud Platform with ACL configurations and integrated a third-party API. For more details on managing ACLs and other advanced configurations, refer to the [GCP documentation](https://cloud.google.com/docs).

## References

- [Google Cloud Platform](https://cloud.google.com/)
- [Express.js](https://expressjs.com/)
- [Docker](https://www.docker.com/)
- [OpenWeatherMap API](https://openweathermap.org/api)
