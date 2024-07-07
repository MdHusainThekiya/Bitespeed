# Backend Service: Identity Reconciliation
### (NodeTS, REST APIs, Postgres SQL)

## Authors

- Md Husain Thekiya
    - [hussainthekiya@gmail.com](mailto:hussainthekiya@gmail.com)
    - [https://github.com/MdHusainThekiya/](https://github.com/MdHusainThekiya/)
    - [https://www.linkedin.com/in/md-husain-thekiya/](https://github.com/MdHusainThekiya/)


## Overview

This project implements a web service that helps [amazon.in] link different orders made with various contact information to the same customer. By using different email addresses and phone numbers for each purchase, a customer like Doc makes it challenging to track his identity. The service reconciles this information to provide a personalized customer experience.


## Local Environment Setup

    0. if not using docker-compose, requied node.js version 16, postgres 13
    1. run following commands

### 1. Clone project
```bash
git clone git@github.com:MdHusainThekiya/contactIdentifierAPI.git

cd contactIdentifierAPI
```
### 2. create environment variables
To run this project, you will need to add the following environment variables to your .env file

refer `.sample.env` file
```bash
cp .sample.env .env
vim .env
```
modify ```.env``` as per your values and execute below commands

### with docker
```bash
docker compose up -d
```

### without docker
required postgresDB to be up and running
```bash
npm install
npm run build
npm start
```

service will be up and running on post 4040
```
curl http://127.0.0.1:4040/
```

### .env contails following
```bash
# SERVICE CONFIGS
PORT=4040
ENABLE_LOGS=true
ALLOWED_LOG_LEVELS='all'
ENABLE_LOG_LOCATION=true

# PG CONFIGS
POSTGRES_URL="postgres://postgresUser:postgresPass@0.0.0.0:5432/postgresDB"
POSTGRES_HOST='0.0.0.0'
POSTGRES_PORT=5432
POSTGRES_USER=postgresUser
POSTGRES_PASSWORD=postgresPass
POSTGRES_DB_NAME=postgresDB
```

## Usage

Once the server is running, you can use the `/identify` endpoint to link customer identities.

### API Endpoint

#### `POST /identify`

**Request Body:**

```json
{
  "email": "string?",
  "phoneNumber": "number?"
}
```

**Response:**

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
```

- If the contact already exists, the response will include the consolidated contact information.
- If the contact does not exist, a new entry will be created with `linkPrecedence="primary"`.

## Database Schema

The database contains a table named `Contact` with the following columns:

```json
{
  "id": "Int",
  "phoneNumber": "String?",
  "email": "String?",
  "linkedId": "Int?",
  "linkPrecedence": "String", // "primary" or "secondary"
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "deletedAt": "DateTime?"
}
```

- **Primary Contact:** The oldest contact entry with `linkPrecedence="primary"`.
- **Secondary Contact:** Contacts linked to the primary contact.

### Example Scenarios

#### Example 1:
Existing Contact:
```json
{
  "id": 1,
  "phoneNumber": "123456",
  "email": "hussainthekiya@gmail.com",
  "linkedId": null,
  "linkPrecedence": "primary",
  "createdAt": "2023-04-01 00:00:00.374+00",
  "updatedAt": "2023-04-01 00:00:00.374+00",
  "deletedAt": null
}
```

New Request:
```json
{
  "email": "dev.ht@google.com",
  "phoneNumber": "123456"
}
```

Database State After Request:
```json
{
  "id": 1,
  "phoneNumber": "123456",
  "email": "hussainthekiya@gmail.com",
  "linkedId": null,
  "linkPrecedence": "primary",
  "createdAt": "2023-04-01 00:00:00.374+00",
  "updatedAt": "2023-04-01 00:00:00.374+00",
  "deletedAt": null
},
{
  "id": 23,
  "phoneNumber": "123456",
  "email": "dev.ht@google.com",
  "linkedId": 1,
  "linkPrecedence": "secondary",
  "createdAt": "2023-04-20 05:30:00.11+00",
  "updatedAt": "2023-04-20 05:30:00.11+00",
  "deletedAt": null
}
```

#### Example 2:
Request:
```json
{
  "email": "john.doe@outlook.com",
  "phoneNumber": "717171"
}
```

Database State After Request:
```json
{
  "id": 11,
  "phoneNumber": "919191",
  "email": "john.doe@outlook.com",
  "linkedId": null,
  "linkPrecedence": "primary",
  "createdAt": "2023-04-11 00:00:00.374+00",
  "updatedAt": "2023-04-11 00:00:00.374+00",
  "deletedAt": null
},
{
  "id": 27,
  "phoneNumber": "717171",
  "email": "husain@mit.edu",
  "linkedId": 11,
  "linkPrecedence": "secondary",
  "createdAt": "2023-04-21 05:30:00.11+00",
  "updatedAt": "2023-04-28 06:40:00.23+00",
  "deletedAt": null
}
```

## Hosting

The application is hosted on [Vercel.com](https://contact-identifier-api.vercel.app). You can access the `/identify` endpoint at the following URL:

```
curl --location 'https://contact-identifier-api.vercel.app/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email" : "hussainthekiya@gmail.com",
    "phoneNumber" : null
}'
```