import pandas as pd
import numpy as np
import random

def generate_medical_data(n_samples=5000):
    """
    Generates a synthetic medical dataset for disease prediction.
    """
    
    # Seeds for reproducibility
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    # Define diseases and their basic expected patterns (probabilistic)
    # This is a simplification for synthetic data
    diseases = ['Healthy', 'Influenza', 'Covid-19', 'Common Cold', 'Hypertension']
    
    for _ in range(n_samples):
        # --- Base Demographics ---
        age = random.randint(18, 90)
        sex = random.choice(['Male', 'Female'])
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        blood_type = random.choice(blood_types)
        
        # --- Base Random Vitals (Healthy Baseline) ---
        # Adjust these baselines later based on disease
        body_temp = round(np.random.normal(36.6, 0.4), 1) # Normal ~36.6
        heart_rate = int(np.random.normal(75, 10))        # Normal ~75
        systolic_bp = int(np.random.normal(120, 10))      # Normal ~120
        diastolic_bp = int(np.random.normal(80, 8))       # Normal ~80
        bmi = round(np.random.normal(25, 4), 1)           # Normal-ish distribution
        
        # Symptoms (0 = No, 1 = Yes)
        cough = 0
        fatigue = 0
        sore_throat = 0
        shortness_of_breath = 0
        headache = 0
        
        # --- Assign Disease & Apply Patterns ---
        # Randomly assign a disease state to simulate
        disease = np.random.choice(diseases, p=[0.4, 0.15, 0.15, 0.15, 0.15])
        
        if disease == 'Healthy':
            # Mostly normal values, occasional outliers
            if random.random() < 0.1: fatigue = 1
            
        elif disease == 'Influenza':
            # High fever, aches, fatigue
            body_temp += round(np.random.uniform(1.5, 3.0), 1) # Fever
            heart_rate += random.randint(10, 30)
            cough = 1 if random.random() < 0.8 else 0
            fatigue = 1
            headache = 1 if random.random() < 0.7 else 0
            
        elif disease == 'Covid-19':
            # Fever, cough, shortness of breath
            body_temp += round(np.random.uniform(1.0, 2.5), 1)
            cough = 1
            shortness_of_breath = 1 if random.random() < 0.6 else 0
            fatigue = 1
            
        elif disease == 'Common Cold':
            # Mild fever or normal, sore throat, runny nose (not in feature list but implied)
            if random.random() < 0.3: body_temp += round(np.random.uniform(0.5, 1.0), 1)
            sore_throat = 1
            cough = 1 if random.random() < 0.5 else 0
            
        elif disease == 'Hypertension':
            # High BP, often asymptomatic or headaches
            systolic_bp += random.randint(20, 50)  # > 140
            diastolic_bp += random.randint(10, 30) # > 90
            if random.random() < 0.4: headache = 1
            if age > 50: 
                # Older people slightly higher risk of higher BP
                systolic_bp += 10
        
        # --- Value Clamping (Sanity Checks) ---
        body_temp = max(35.0, min(42.0, body_temp))
        heart_rate = max(40, min(180, heart_rate))
        systolic_bp = max(90, min(220, systolic_bp))
        diastolic_bp = max(60, min(140, diastolic_bp))
        
        # Append record
        data.append({
            'Age': age,
            'Sex': sex,
            'Blood_Type': blood_type,
            'Body_Temperature': body_temp,
            'Heart_Rate': heart_rate,
            'Systolic_BP': systolic_bp,
            'Diastolic_BP': diastolic_bp,
            'BMI': bmi,
            'Symptom_Cough': cough,
            'Symptom_Fatigue': fatigue,
            'Symptom_Sore_Throat': sore_throat,
            'Symptom_Shortness_of_Breath': shortness_of_breath,
            'Symptom_Headache': headache,
            'Disease': disease
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating synthetic medical dataset...")
    df = generate_medical_data(5000)
    
    output_file = "medical_dataset.csv"
    df.to_csv(output_file, index=False)
    
    print(f"Success! Dataset saved to {output_file}")
    print(f"Shape: {df.shape}")
    print("\nSample Preview:")
    print(df.head())
    print("\nClass Distribution:")
    print(df['Disease'].value_counts())
