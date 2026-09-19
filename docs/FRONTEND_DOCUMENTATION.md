# Frontend Documentation

## 1. Project Overview

The frontend is the user interface for the Bank Marketing Prediction & Forecast application.

It allows users to:

- Sign up and sign in
- Enter customer information
- Request a deposit prediction
- Request a campaign forecast
- View prediction history
- View forecast history
- Access their profile

## 2. Frontend Technology

The frontend was developed using Google AI Studio Build mode.

It integrates with:

- FastAPI backend
- Firebase Authentication
- Firebase Cloud Firestore
- Machine learning prediction services
- Forecasting services

## 3. Main Pages

### Home

Introduces the Bank Marketing Prediction & Forecast application and its main services.

### Sign Up

Allows new users to create an account using:

- Email and password
- Google Sign-In

### Sign In

Allows registered users to access the application.

### Dashboard

Provides access to the application's main services and displays system status.

### Deposit Prediction

Allows users to enter the required customer information and receive a term deposit subscription prediction.

### Campaign Forecast

Allows users to request future campaign forecasts.

### History

Displays the authenticated user's previous prediction and forecast records.

### Profile

Displays the user's account information.

### About

Provides information about the application and how its services work.

### Contact

Provides application support/contact information.

## 4. Backend Integration

The frontend communicates with the deployed FastAPI backend.

Backend URL:

https://bank-marketing-fastapi.onrender.com

### Prediction

POST /predict

### Forecast

POST /forecast

### Health Check

GET /health

## 5. Deposit Prediction Flow

User enters customer information.

↓

Frontend validates the input.

↓

Frontend sends the required information to `/predict`.

↓

FastAPI processes the request.

↓

The trained machine learning model generates the prediction.

↓

The frontend displays the prediction result.

## 6. Campaign Forecast Flow

User selects the required forecast period.

↓

Frontend validates the request.

↓

Frontend sends the request to `/forecast`.

↓

The forecasting model generates future values.

↓

The frontend displays the forecast results.

## 7. Firebase Authentication

Firebase Authentication is used for user account management.

Supported methods:

- Email/Password
- Google Sign-In

## 8. Firestore

Cloud Firestore stores user-specific prediction and forecast history.

Records are associated with the authenticated user's UID.

Stored information includes:

- Service/model type
- Input information
- Output/result
- Timestamp
- Status

Passwords are not stored in Firestore.

## 9. User History

The History page displays records belonging to the currently authenticated user.

Users can:

- View previous records
- Inspect record details
- Delete individual records
- Clear their history

## 10. Customer Segmentation

Customer segmentation is included as an analytical component of the project.

The clustering component produces a CSV file containing cluster assignments.

It is not exposed as a real-time API.

## 11. Responsive Design

The frontend is designed to work across:

- Desktop
- Tablet
- Mobile

## 12. Data Privacy

The application does not display or expose the original raw customer dataset to users.

The prediction interface collects only the information required by the prediction service.

## 13. Application Architecture

User

↓

Frontend

↓

Firebase Authentication

↓

FastAPI Backend

↓

Machine Learning / Forecasting Model

↓

Result

↓

Frontend

Prediction and forecast history are stored in Firestore for the authenticated user.
