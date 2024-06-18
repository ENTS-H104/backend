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
    # Use a specific version of Node.js as the base image
    FROM node:18.20.0
    
    # Set the working directory in the container
    WORKDIR /backend
    
    # Copy the rest of the application code
    COPY . .
    
    # Install dependencies
    RUN npm install
    
    # Command to run the application
    CMD ["npm", "run", "start"]
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

You can follow this doccumentation to fill your .env https://docs.google.com/document/d/1Q70D-KnAJGSdM9TPFKGYCdj54mO05VXS9CVa8LrxTH8/edit?usp=sharing

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

