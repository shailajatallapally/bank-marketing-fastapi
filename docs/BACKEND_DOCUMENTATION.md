# Backend Documentation

## 1. Project Overview

The backend of the Bank Marketing Prediction & Forecast application is developed using FastAPI.

It provides services for:

- Term Deposit Prediction
- Campaign Forecasting

The backend loads the trained machine learning models and provides REST API endpoints for the frontend application.

## 2. Technology Stack

- Python
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- Statsmodels
- Joblib
- Pydantic

## 3. Machine Learning Services

### Deposit Prediction

Predicts whether a customer is likely to subscribe to a term deposit.

Model: XGBoost Classifier

Output:

- Prediction
- Probability
- Decision Threshold

### Campaign Forecasting

Forecasts future customer volume and subscription rate.

Model: VAR(2)

Output:

- Expected Total Customers
- Expected Subscription Rate

## 4. API Endpoints

### GET /

Checks whether the application is running.

### GET /health

Checks backend health and model status.

### POST /predict

Receives customer information and returns the term deposit prediction.

### POST /forecast

Receives the number of forecast periods and returns future campaign forecasts.

## 5. Prediction Input

The prediction service uses the following fields:

- age
- balance
- day
- duration_minutes
- campaign
- previous
- pdays
- job
- marital
- education
- default_status
- housing
- loan
- contact
- month
- poutcome

The backend derives `previously_contacted` from `pdays`.

## 6. Preprocessing

The prediction pipeline performs:

1. Feature selection
2. Derived feature creation
3. Categorical encoding
4. Numerical scaling
5. Model prediction
6. Threshold-based classification

Categorical variables are processed using OneHotEncoder.

Numerical variables are processed using StandardScaler.

## 7. Saved Model Files

- bank_marketing_final_xgb_model.pkl
- bank_marketing_xgb_threshold.pkl
- encoder.pkl
- scaler.pkl
- bank_marketing_VAR2.pkl

## 8. Deployment

The backend is deployed using Render.

Backend:

https://bank-marketing-fastapi.onrender.com

API documentation:

https://bank-marketing-fastapi.onrender.com/docs

Health check:

https://bank-marketing-fastapi.onrender.com/health

## 9. Frontend Integration

The frontend communicates with the backend through REST API requests.

Frontend → FastAPI → ML Model → Result → Frontend

## 10. Error Handling

Incoming API requests are validated using Pydantic.

The forecast service validates that the requested number of steps is at least 1.

## 11. Local Execution

Install dependencies:

```bash
pip install -r requirements.txt
