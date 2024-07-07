# NodeTS PostgreSQL REST APIs

serviceName : "contactIdentifierAPI"


## Authors

- Md Husain Thekiya
    - [hussainthekiya@gmail.com](mailto:hussainthekiya@gmail.com)
    - [https://github.com/MdHusainThekiya/](https://github.com/MdHusainThekiya/)
    - [https://www.linkedin.com/in/md-husain-thekiya/](https://github.com/MdHusainThekiya/)

### TESTING CURL REQUEST
```bash
curl --location 'https://contact-identifier-api.vercel.app/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email" : "hussainthekiya@gmail.com",
    "phoneNumber" : null
}'
```


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
