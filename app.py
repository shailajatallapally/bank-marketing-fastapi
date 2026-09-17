
import pickle
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

# ==========================================
# 1. LOAD MODEL AND PREPROCESSING
# ==========================================

model = joblib.load("bank_marketing_final_xgb_model.pkl")
threshold = joblib.load("bank_marketing_xgb_threshold.pkl")
encoder = joblib.load("encoder.pkl")
scaler = joblib.load("scaler.pkl")

with open("bank_marketing_VAR2.pkl", "rb") as file:
    var_model = pickle.load(file)


# ==========================================
# 2. CREATE FASTAPI APP
# ==========================================

app = FastAPI(
    title="Bank Marketing Prediction & Forecast API",
    description="XGBoost prediction and VAR(2) forecasting API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 3. FEATURE COLUMNS
# ==========================================

selected_features = [
    "age",
    "balance",
    "day",
    "duration_minutes",
    "campaign",
    "previous",
    "pdays",
    "job",
    "marital",
    "education",
    "default_status",
    "housing",
    "loan",
    "contact",
    "month",
    "poutcome",
    "previously_contacted"
]

numeric_cols = [
    "age",
    "balance",
    "day",
    "duration_minutes",
    "campaign",
    "previous",
    "pdays",
    "previously_contacted"
]

categorical_cols = [
    "job",
    "marital",
    "education",
    "default_status",
    "housing",
    "loan",
    "contact",
    "month",
    "poutcome"
]


# ==========================================
# 4. INPUT DATA
# ==========================================

class BankMarketingInput(BaseModel):

    age: float
    balance: float
    day: float
    duration_minutes: float
    campaign: float
    previous: float
    pdays: float

    job: str
    marital: str
    education: str
    default_status: str
    housing: str
    loan: str
    contact: str
    month: str
    poutcome: str

class ForecastInput(BaseModel):
    steps: int = 3


# ==========================================
# 5. HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Bank Marketing ML API is running",
        "status": "success"
    }


# ==========================================
# 6. HEALTH CHECK
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True,
        "threshold": threshold
    }


# ==========================================
# 7. PREDICT
# ==========================================

@app.post("/predict")
def predict(data: BankMarketingInput):
    input_dict = {
        "age": data.age,
        "balance": data.balance,
        "day": data.day,
        "duration_minutes": data.duration_minutes,
        "campaign": data.campaign,
        "previous": data.previous,
        "pdays": data.pdays,
        "job": data.job,
        "marital": data.marital,
        "education": data.education,
        "default_status": data.default_status,
        "housing": data.housing,
        "loan": data.loan,
        "contact": data.contact,
        "month": data.month,
        "poutcome": data.poutcome
    }

    # Create DataFrame

    input_df = pd.DataFrame([input_dict])


    # ======================================
    # CREATE previously_contacted
    # ======================================

    input_df["previously_contacted"] = (
        input_df["pdays"] != -1
    ).astype(int)


    # ======================================
    # EXACT FEATURE ORDER
    # ======================================

    input_df = input_df[selected_features]


    # ======================================
    # ONE-HOT ENCODING
    # ======================================

    X_cat = encoder.transform(
        input_df[categorical_cols]
    )

    X_cat = pd.DataFrame(
        X_cat,
        columns=encoder.get_feature_names_out(
            categorical_cols
        )
    )


    # ======================================
    # COMBINE FEATURES
    # ======================================

    X_final = pd.concat(
        [
            input_df[numeric_cols].reset_index(drop=True),
            X_cat.reset_index(drop=True)
        ],
        axis=1
    )


    # ======================================
    # SCALING
    # ======================================

    X_scaled = scaler.transform(X_final)

    X_scaled = pd.DataFrame(
        X_scaled,
        columns=X_final.columns
    )


    # ======================================
    # PREDICTION PROBABILITY
    # ======================================

    probability = float(
        model.predict_proba(X_scaled)[0][1]
    )


    # ======================================
    # APPLY THRESHOLD
    # ======================================

    prediction = int(
        probability >= threshold
    )


    # ======================================
    # RETURN RESULT
    # ======================================

    return {
        "prediction": "yes" if prediction == 1 else "no",
        "probability": round(probability, 4),
        "threshold": threshold
    }
@app.post("/forecast")
def forecast(data: ForecastInput):

    if data.steps < 1:
        raise HTTPException(
            status_code=400,
            detail="steps must be at least 1"
        )

    last_2_values = var_model.endog[-2:]

    future_forecast = var_model.forecast(
        y=last_2_values,
        steps=data.steps
    )

    forecast_results = []

    for row in future_forecast:
        forecast_results.append({
            "Expected_Total_Customers": round(float(row[0]), 2),
            "Expected_Subscription_Rate": round(float(row[1]), 2)
        })

    return {
        "model": "VAR(2)",
        "steps": data.steps,
        "forecast": forecast_results
    }
