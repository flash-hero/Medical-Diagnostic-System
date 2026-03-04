# Data Visualization Report

Here is the analysis of the generated `medical_dataset.csv`.

## 1. Class Distribution
This chart shows the number of patients for each disease. As expected, "Healthy" is the majority class, with other diseases evenly distributed (~15% each).

![Class Distribution](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/class_distribution.png)

## 2. Feature Correlations
This heatmap shows how features correlate with each other. Use this to verify that our synthetic rules are working (e.g., Body Temp should not be strongly correlated with Sex).

![Correlation Heatmap](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/correlation_heatmap.png)

## 3. Symptom Probability
Probability of having a symptom given the disease. (1.0 = Always has it, 0.0 = Never).
*   **Influenza**: High fever (Temp), Fatigue, Headache.
*   **Covid-19**: Cough, Shortness of Breath.
*   **Common Cold**: Sore Throat.

![Symptom Heatmap](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/symptom_heatmap.png)

## 4. Vitals Distribution (Boxplots)
Detailed view of how vital signs differ across diseases.

![Body Temperature](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/boxplot_Body_Temperature.png)
![Heart Rate](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/boxplot_Heart_Rate.png)
![Blood Pressure (Systolic)](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/boxplot_Systolic_BP.png)
![Age](c:/Users/oussa/OneDrive/Desktop/DISEASE STUDY/MACHINE LEARNING/visuals/data_visuals/boxplot_Age.png)
