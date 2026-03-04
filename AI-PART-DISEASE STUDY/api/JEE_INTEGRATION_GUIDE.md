# JEE Integration Guide for MedCare

This guide explains how to connect your **Java Enterprise (JEE)** application to the **Python Disease Prediction API**.

## 1. Architecture Overview
*   **Python API**: Runs on `http://localhost:8000`. Acts as the "Prediction Engine".
*   **JEE Backend**: Runs on your server (e.g., Tomcat/GlassFish). Acts as the "Client".

## 2. API Endpoint Details
**Updated for Modular Structure:**
*   **URL**: `http://localhost:8000/disease/predict`
*   **Method**: `POST`
*   **ContentType**: `application/json`

### Chatbot Endpoint
*   **URL**: `http://localhost:8000/chat/message`
*   **Method**: `POST`
*   **Headers**: `x-api-key: YOUR_GEMINI_KEY`
*   **Body**: 
    ```json
    {
      "message": "What should I eat?",
      "context": "Diagnosis: Influenza" 
    }
    ```
    *(Note: The 'context' field is optional. The Java app should fill this with the prediction result.and the user's infos)*

### Cancer Detection Endpoint (Deep Learning)
*   **URL**: `http://localhost:8000/cancer/scan`
*   **Method**: `POST`
*   **ContentType**: `multipart/form-data`
*   **Body**: Binary Image File (Key: `file`)

### JSON Request Format (For Disease Prediction)
Your Java app must send a JSON object with this exact structure:

```json
{
  "Age": 45,
  "Sex": "Male",
  "Blood_Type": "A+",
  "Body_Temperature": 38.5,
  "Heart_Rate": 95,
  "Systolic_BP": 120,
  "Diastolic_BP": 80,
  "BMI": 24.5,
  "Symptom_Cough": 1,
  "Symptom_Fatigue": 1,
  "Symptom_Sore_Throat": 0,
  "Symptom_Shortness_of_Breath": 0,
  "Symptom_Headache": 1
}
```

### JSON Response Format
The API will reply with:

```json
{
  "prediction": "Influenza",
  "confidence": 0.9412,
  "input_received": { ... }
}
```

## 3. Java Implementation Code (Example)
Use the standard `java.net.http.HttpClient` (Java 11+) or libraries like `Gson` / `Jackson` for JSON processing.

### Step-by-Step Java Code:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;

public class MedicalPredictionService {

    private static final String API_URL = "http://localhost:8000/disease/predict";

    public String getPrediction(String jsonPayload) {
        try {
            // 1. Create Client
            HttpClient client = HttpClient.newHttpClient();

            // 2. Build Request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            // 3. Send & Receive
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return response.body(); // Returns: {"prediction": "Influenza", ...}
            } else {
                return "Error: API returned " + response.statusCode();
            }

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return "Error: Connection failed";
        }
    }
}

### Java Code for Image Upload (Cancer Detection)
Uploading files in Java can be tricky with the standard library. We recommend using **Apache HttpClient** or **OkHttp**.

**Using Apache HttpClient (Standard in JEE):**

```java
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.client.methods.CloseableHttpResponse;
import java.io.File;

public String scanXRay(File imageFile) {
    try (CloseableHttpClient client = HttpClients.createDefault()) {
        HttpPost post = new HttpPost("http://localhost:8000/cancer/scan");

        // Build the multipart entity
        var entity = MultipartEntityBuilder.create()
                .addBinaryBody("file", imageFile)
                .build();

        post.setEntity(entity);

        try (CloseableHttpResponse response = client.execute(post)) {
            return new String(response.getEntity().getContent().readAllBytes());
        }
    } catch (Exception e) {
        return "Error: " + e.getMessage();
    }
}
```

## 4. How to Run
1.  **Start Python API**:
    Open a terminal in the `api/` folder and run:
    ```bash
    python main.py
    ```
    You will see: `Uvicorn running on http://0.0.0.0:8000`

2.  **Start JEE Server**:
    Deploy your Java WAR as usual. It will now be able to talk to the running Python service.
