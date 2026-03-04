import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create visuals directory
os.makedirs("visuals", exist_ok=True)

# Load data
df = pd.read_csv("medical_dataset.csv")

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)

print("Generating visualizations...")

# 1. Class Distribution
plt.figure(figsize=(8, 5))
sns.countplot(data=df, x='Disease', palette='viridis', order=df['Disease'].value_counts().index)
plt.title("Disease Class Distribution")
plt.xlabel("Disease")
plt.ylabel("Count")
plt.savefig("visuals/class_distribution.png")
plt.close()
print("- Saved class_distribution.png")

# 2. Correlation Heatmap
# Select only numeric columns for correlation
numeric_df = df.select_dtypes(include=['float64', 'int64'])
plt.figure(figsize=(12, 10))
sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f", linewidths=0.5)
plt.title("Feature Correlation Matrix")
plt.savefig("visuals/correlation_heatmap.png")
plt.close()
print("- Saved correlation_heatmap.png")

# 3. Numerical Features by Disease (Boxplots)
numerical_features = ['Body_Temperature', 'Heart_Rate', 'Systolic_BP', 'Diastolic_BP', 'BMI', 'Age']

for feature in numerical_features:
    plt.figure(figsize=(10, 6))
    sns.boxplot(data=df, x='Disease', y=feature, palette='Set2')
    plt.title(f"{feature} Distribution by Disease")
    plt.savefig(f"visuals/boxplot_{feature}.png")
    plt.close()
    print(f"- Saved boxplot_{feature}.png")

# 4. Symptom Frequency vs Disease (Heatmap of means)
symptom_cols = [col for col in df.columns if 'Symptom' in col]
symptom_data = df.groupby('Disease')[symptom_cols].mean()

plt.figure(figsize=(10, 6))
sns.heatmap(symptom_data, annot=True, cmap='YlGnBu', fmt=".2f")
plt.title("Symptom Probability by Disease")
plt.savefig("visuals/symptom_heatmap.png")
plt.close()
print("- Saved symptom_heatmap.png")

print("All visualizations generated in 'visuals/' folder.")
