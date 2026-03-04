import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, Input
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import joblib
import os

# --- Configuration ---
DATA_DIR = r"C:\Users\oussa\OneDrive\Desktop\DISEASE STUDY\DEEP LEARNING\DataBase"
# Colab user: change this to "./DataBase"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20  # Increased epochs, but EarlyStopping will stop it if it's done

print(f"TensorFlow Version: {tf.__version__}")
print(f"Loading data from: {DATA_DIR}")

# 1. Advanced Data Augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# 2. PRO MODE: Transfer Learning (MobileNetV2)
# We download a brain that has already seen 1.4 million images (ImageNet)
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Freeze the base model (don't retrain the basic "vision" capability)
base_model.trainable = False

# Add our own "Head" (Result layers)
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.4)(x)  # Drop 40% of neurons to prevent memorization
predictions = Dense(3, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

print("\nModel Architecture (Transfer Learning):")
# model.summary() # Commented out to save scroll space

# 3. Callbacks (Smart Training)
callbacks = [
    EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, verbose=1)
]

# 4. Train
print("\nStarting Transfer Learning...")
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=callbacks
)

# 5. Save
model_path = "lung_cancer_model.h5"  # Short path for Colab convenience
model.save(model_path)
print(f"\nModel saved to: {model_path}")

indices_path = "class_indices.pkl"
joblib.dump(train_generator.class_indices, indices_path)
print(f"Class indices saved to: {indices_path}")
