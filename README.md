# Parking Reservation System

A backend application for managing parking spots and reservations. This system allows users to reserve parking spots, check parking availability, and manage reservations. The app is built using **NestJS**, **PostgreSQL**, **RabbitMQ** and **Docker**.

## Table of Contents

1. [Project Setup](#project-setup)
   - [Prerequisites](#prerequisites)
   - [Install Dependencies](#install-dependencies)
   - [Start Application](#start-application)
2. [API Documentation](#api-documentation)
   - [Parking Endpoints](#parking-endpoints)
   - [Reservation Endpoints](#reservation-endpoints)
4. [Docker Setup](#docker-setup)
   - [Build Docker Image](#build-docker-image)
   - [Start Docker Containers](#start-docker-containers)
5. [Environment Variables](#environment-variables)

## Project Setup

### Prerequisites

Before running the application, make sure you have the following tools installed on your machine:

- **Node.js** (version >= 16)
- **npm** (Node package manager)
- **Docker** (if running via Docker)

You also need access to a PostgreSQL instance, either locally or via Docker.

### Install Dependencies

1. Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/parking-reservation-backend.git
cd parking-reservation-backend
```
2. Install the required dependencies:

```bash
npm install
```
### Start Application
To start the application locally:

1. Set up environment variables (see Environment Variables section below).
2. Run the application:

```bash
npm run start
```
This will start the client on http://localhost:3000 and admin on http://localhost:3005 by default. 

## API Documentation

### Client Endpoints

#### 1. Get All Parking Spots
- **URL**: `/reservation/status`
- **Method**: `GET`
- **Description**: Fetches the status of all parking spots (available or occupied).
- **Response**:
```json
[
    {   
        "id": 1,
        "spotId": "A1",
        "column": 1,
        "row": "A",
        "type": "electric",
        "status": "free"
    },
    {
        "id": 2,
        "spotId": "A2",
        "column": 2,
        "row": "A",
        "type": "combustion",
        "status": "free"
    },
]
```
#### 2. Reserve a Parking Spot
- **URL**: `/reservation/reserve`
- **Method**: `POST`
- **Description**: Fetches the status of all parking spots (available or occupied).
- **Request Body**:
```json
{
  "userId": "1",
  "spotId": "B1",
  "name": "Jhon",
  "surname": "Doe",
  "vehicleType": "electric",
  "startTime": "2024-12-24T23:00:00Z",
  "endTime": "2024-12-24T23:10:00Z",
  "licensePlate": "FZ 12345"  
}
```
- **Response**:
```json
[
{
    "userId": "1",
    "name": "Jhon",
    "surname": "Doe",
    "startTime": "2024-12-24T23:00:00Z",
    "endTime": "2024-12-24T23:10:00Z",
    "status": "pending",
    "licensePlate": "FZ 12345",
    "parkingSpot": {
        "id": 6,
        "spotId": "B1",
        "column": 1,
        "row": "B",
        "type": "electric",
        "status": "free"
    },
    "id": "239739f7-ea98-4286-9122-6819b0813e44",
    "createdAt": "2024-11-30T21:05:53.264Z"
}
]
```
### Admin Endpoints

#### 1. Get Reservations
- **URL**: `/admin/reservations/pending`
- **Method**: `GET`
- **Description**: Fetches all the reservations.
- **Response**:
```json
[
    {
        "id": "239739f7-ea98-4286-9122-6819b0813e44",
        "userId": "1",
        "name": "Jhon",
        "surname": "Doe",
        "startTime": "2024-12-24T23:00:00Z",
        "endTime": "2024-12-24T23:10:00Z",
        "status": "pending",
        "licensePlate": "FZ 12345",
        "createdAt": "2024-11-30T21:05:53.264Z",
        "parkingSpot": {
            "id": 6,
            "spotId": "B1",
            "column": 1,
            "row": "B",
            "type": "electric",
            "status": "pending"
        }
    }
]
```

#### 2. Confirm Reservation
- **URL**: `admin/reservations/confirm/:reservationId`
- **Method**: `PATCH`
- **Description**: Confirm reservation.
- **Response**:
```json
[
    {
    "id": "239739f7-ea98-4286-9122-6819b0813e44",
    "userId": "1",
    "name": "Jhon",
    "surname": "Doe",
    "startTime": "2024-12-24T23:00:00Z",
    "endTime": "2024-12-24T23:10:00Z",
    "status": "reserved",
    "licensePlate": "FZ 12345",
    "createdAt": "2024-11-30T21:05:53.264Z",
    "parkingSpot": {
        "id": 6,
        "spotId": "B1",
        "column": 1,
        "row": "B",
        "type": "electric",
        "status": "reserved"
    }
}
]
```
#### 2. Reject Reservation
- **URL**: `admin/reservations/reject/:reservationId`
- **Method**: `PATCH`
- **Description**: Reject reservation.
- **Response**:
```json
[
{
    "id": "79c27120-867c-439a-b92c-59d6191afede",
    "userId": "1",
    "name": "D",
    "surname": "M",
    "startTime": "2024-12-03T23:00:00.000Z",
    "endTime": "2024-12-03T23:10:00.000Z",
    "status": "rejected",
    "licensePlate": "FZ 12345",
    "createdAt": "2024-12-02T21:13:20.976Z",
    "parkingSpot": {
        "id": 6,
        "spotId": "B1",
        "column": 1,
        "row": "B",
        "type": "electric",
        "status": "free"
    }
}
]
```
#### 3. Logs
- **URL**: `admin/logs`
- **Method**: `Get`
- **Description**: Gets logs what users are doing .
- **Response**:
```json
[
    {
        "id": "a9dfe5da-b58f-4319-a76f-23c874c6399a",
        "method": "POST",
        "url": "/reservation/reserve",
        "body": {
            "userId": "1",
            "spotId": "B1",
            "name": "D",
            "surname": "M",
            "vehicleType": "electric",
            "startTime": "2024-12-03T23:00:00Z",
            "endTime": "2024-12-03T23:10:00Z",
            "licensePlate": "FZ 12345"
        },
        "params": {},
        "query": {},
        "timestamp": "2024-12-02T21:20:50.430Z"
    },
    {
        "id": "3b97f30f-3842-41ad-969a-34452dd40211",
        "method": "POST",
        "url": "/reservation/reserve",
        "body": {
            "userId": "1",
            "spotId": "B2",
            "name": "D",
            "surname": "M",
            "vehicleType": "electric",
            "startTime": "2024-12-03T23:00:00Z",
            "endTime": "2024-12-03T23:10:00Z",
            "licensePlate": "FZ 12345"
        },
        "params": {},
        "query": {},
        "timestamp": "2024-12-02T21:20:53.483Z"
    }
]
```

## Environment Variables
To configure the application, you'll need to provide the following environment variables in a .env file:

```bash
POSTGRES_PASSWORD=""
POSTGRES_HOSTNAME=""
POSTGRES_DATABASE=""
POSTGRES_USERNAME=""
```