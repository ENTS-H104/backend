# Express.js App on Google Cloud Platform (GCP) with ACL, Firebase Auth, OpenWeather, Midtrans, and API-ML

This guide will help you replicate an Express.js application on Google Cloud Platform (GCP), configure Access Control Lists (ACL), integrate Firebase Authentication, OpenWeather, Midtrans, and API-ML APIs, use Cloud SQL and Firestore.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting Up GCP](#setting-up-gcp)
- [Deploying the Express.js App](#deploying-the-expressjs-app)
- [Integrating APIs](#integrating-apis)
  - [Firebase Authentication](#firebase-authentication)
  - [OpenWeather API](#openweather-api)
  - [Midtrans API](#midtrans-api)
  - [API-ML](#api-ml)
- [Configuring ACL](#configuring-acl)
- [Using Cloud SQL](#using-cloud-sql)
- [Using Firestore](#using-firestore)
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
        - Cloud SQL API
        - Firestore API
        - Firebase Authentication API
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

## Integrating APIs

### Firebase Authentication

1. **Set up Firebase Authentication:**
    - Go to the Firebase Console and select your GCP project.
    - Navigate to the Authentication section and click "Get Started".

2. **Install Firebase Admin SDK:**
    ```bash
    npm install firebase-admin
    ```

3. **Initialize Firebase in your app:**
    ```javascript
    const admin = require('firebase-admin');
    const serviceAccount = require('PATH/TO/YOUR/SERVICE_ACCOUNT_KEY.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    async function verifyIdToken(idToken) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log('User ID:', decodedToken.uid);
        } catch (error) {
            console.error('Error verifying ID token:', error);
        }
    }
    ```

4. **Add authentication middleware:**
    ```javascript
    function authenticate(req, res, next) {
        const idToken = req.headers.authorization;
        if (!idToken) {
            return res.status(401).send('Unauthorized');
        }

        verifyIdToken(idToken)
            .then(() => next())
            .catch(() => res.status(401).send('Unauthorized'));
    }

    app.use(authenticate);
    ```

### OpenWeather API

1. **Sign up and get an API key:**
    - Sign up on [OpenWeatherMap](https://openweathermap.org/) and obtain your API key.

2. **Install Axios:**
    - Install Axios to handle HTTP requests.
    ```bash
    npm install axios
    ```

3. **Create a route to call the API:**
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

4. **Use the new route in your app:**
    - Include the new route in your main `app.js` file.
    ```javascript
    const weatherRouter = require('./routes/weather');
    app.use('/api', weatherRouter);
    ```

### Midtrans API

1. **Sign up and get an API key:**
    - Sign up on [Midtrans](https://midtrans.com/) and obtain your API key.

2. **Install Axios:**
    - Install Axios to handle HTTP requests.
    ```bash
    npm install axios
    ```

3. **Create a route to call the API:**
    - Add the following code to your `app.js` or create a new route file (e.g., `routes/payment.js`).
    ```javascript
    const express = require('express');
    const axios = require('axios');
    const router = express.Router();

    const MIDTRANS_SERVER_KEY = 'YOUR_MIDTRANS_SERVER_KEY';
    const MIDTRANS_API_URL = 'https://api.midtrans.com/v2/charge';

    router.post('/payment', async (req, res) => {
        const { order_id, gross_amount, payment_type } = req.body;

        const payload = {
            payment_type: payment_type,
            transaction_details: {
                order_id: order_id,
                gross_amount: gross_amount
            }
        };

        try {
            const response = await axios.post(MIDTRANS_API_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY).toString('base64')}`
                }
            });
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: 'Error processing payment' });
        }
    });

    module.exports = router;
    ```

4. **Use the new route in your app:**
    - Include the new route in your main `app.js` file.
    ```javascript
    const paymentRouter = require('./routes/payment');
    app.use('/api', paymentRouter);
    ```

### API-ML

1. **Sign up and get an API key:**
    - Sign up on [API-ML](https://api-ml.com/) and obtain your API key.

2. **Install Axios:**
    - Install Axios to handle HTTP requests.
    ```bash
    npm install axios
    ```

3. **Create a route to call the API:**
    - Add the following code to your `app.js` or create a new route file (e.g., `routes/ml.js`).
    ```javascript
    const express = require('express');
    const axios = require('axios');
    const router = express.Router();

    const API_ML_KEY = 'YOUR_API_ML_KEY';
    const API_ML_URL = 'https://api.api-ml.com/some-endpoint';

    router.post('/ml', async (req, res) => {
        const { inputData } = req.body;

        try {
            const response = await axios.post(API_ML_URL, { data: inputData }, {
                headers: {
                    'Authorization': `Bearer ${API_ML_KEY}`
                }
            });
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: 'Error processing machine learning data' });
        }
    });

    module.exports = router;
   ```markdown
    app.use('/api', mlRouter);
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

## Using Cloud SQL

1. **Create a Cloud SQL instance:**
    - Go to the SQL section in the GCP Console.
    - Click "Create Instance" and follow the prompts to set up your instance.

2. **Set up a database and user:**
    - Create a new database and user for your application.

3. **Connect to Cloud SQL from your app:**
    - Install the necessary package:
    ```bash
    npm install mysql
    ```
    - Add the connection code in your app:
    ```javascript
    const mysql = require('mysql');
    const connection = mysql.createConnection({
        host: 'YOUR_CLOUD_SQL_HOST',
        user: 'YOUR_DB_USER',
        password: 'YOUR_DB_PASSWORD',
        database: 'YOUR_DB_NAME'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }
        console.log('Connected to the Cloud SQL database.');
    });
    ```

## Using Firestore

1. **Set up Firestore:**
    - Go to the Firestore section in the GCP Console.
    - Click "Create Database" and select the appropriate mode (production or test).

2. **Install Firestore package:**
    ```bash
    npm install @google-cloud/firestore
    ```

3. **Add Firestore connection code:**
    ```javascript
    const { Firestore } = require('@google-cloud/firestore');
    const firestore = new Firestore();

    async function addDocument(collection, document) {
        const docRef = firestore.collection(collection).doc();
        await docRef.set(document);
        console.log('Document added with ID:', docRef.id);
    }
    ```

## Testing the Deployment

1. **Access your deployed service:**
    - Once deployed, Cloud Run will provide a URL for your service.
    - Open the URL in your browser to see your running Express.js app.

2. **Test API endpoints:**
    - Use a tool like Postman to test your API endpoints.
    - Ensure you include necessary authentication tokens for Firebase Authentication protected routes.

## References

- [Google Cloud Platform](https://cloud.google.com/)
- [Express.js](https://expressjs.com/)
- [Docker](https://www.docker.com/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Midtrans API](https://midtrans.com/)
- [API-ML](https://api-ml.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud SQL](https://cloud.google.com/sql/docs)
- [Firestore](https://cloud.google.com/firestore/docs)

