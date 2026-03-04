import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Load Data
print("Loading dataset...")
df = pd.read_csv("medical_dataset.csv")

# 2. Preprocessing
# Encode categorical variables (Sex, Blood_Type)
le_sex = LabelEncoder()
df['Sex'] = le_sex.fit_transform(df['Sex'])

le_blood = LabelEncoder()
df['Blood_Type'] = le_blood.fit_transform(df['Blood_Type'])

# Separate Features (X) and Target (y)
X = df.drop('Disease', axis=1)
y = df['Disease']

# Split Data (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"Training on {len(X_train)} samples, Testing on {len(X_test)} samples.")

# 3. Model Training
# using class_weight='balanced' to handle the dataset imbalance
print("Training Random Forest Classifier...")
rf_model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
rf_model.fit(X_train, y_train)

# 4. Evaluation
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy:.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Confusion Matrix Visualization
plt.figure(figsize=(10, 8))
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=rf_model.classes_, yticklabels=rf_model.classes_)
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.savefig("visuals/confusion_matrix.png")
print("Confusion Matrix saved to 'visuals/confusion_matrix.png'")

# Feature Importance
feature_importances = pd.Series(rf_model.feature_importances_, index=X.columns).sort_values(ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(x=feature_importances, y=feature_importances.index, palette='viridis')
plt.title("Feature Importance")
plt.xlabel("Importance Score")
plt.tight_layout()
plt.savefig("visuals/feature_importance.png")
print("Feature Importance saved to 'visuals/feature_importance.png'")

# 5. Save Model
joblib.dump(rf_model, "disease_prediction_model.pkl")
# Also save encoders to process new user input later
joblib.dump(le_sex, "encoder_sex.pkl")
joblib.dump(le_blood, "encoder_blood.pkl")
print("Model and encoders saved successfully.")
