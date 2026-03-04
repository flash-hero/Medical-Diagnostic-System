# Model Performance Report

We implemented a **Random Forest Classifier** with `class_weight='balanced'`.

## Accuracy
**Overall Accuracy: 97.8%**

## Classification Report
The model performs exceptionally well across all classes, including the minority diseases.

| Disease | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- |
| **Common Cold** | 1.00 | 1.00 | 1.00 |
| **Covid-19** | 0.93 | 0.94 | 0.93 |
| **Healthy** | 1.00 | 1.00 | 1.00 |
| **Hypertension** | 0.99 | 1.00 | 0.99 |
| **Influenza** | 0.94 | 0.93 | 0.94 |

## Confusion Matrix Analysis
As predicted during visualization, the only minor confusion exists between **Influenza** and **Covid-19** due to symptom overlap (Fever + Fatigue).

![Confusion Matrix](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/model_evaluation/confusion_matrix.png)

## Feature Importance
The model identified the most critical factors for prediction:
1.  **Body Temperature** (Top predictor for Flu/Covid)
2.  **Blood Pressure** (Top predictor for Hypertension)
3.  **Symptoms** (Cough, Sore Throat) help distinguish between respiratory illnesses.

![Feature Importance](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/model_evaluation/feature_importance.png)
