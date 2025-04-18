#include <Firebase_ESP_Client.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include "time.h"
#include <ArduinoJson.h>

// Firebase includes
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Pin Definitions
#define ONE_WIRE_BUS 4  // DS18B20 Temperature Sensor
#define EC_PIN 34       // EC & TDS Sensor
#define TURBIDITY_PIN 35 // Turbidity Sensor
#define PH_PIN 32       // pH Sensor
const int motorPin1 = 26;  // L298N IN1 (Motor A)
const int motorPin2 = 27;  // L298N IN2 (Motor A)
const int pwmPin = 14;     // L298N ENA (PWM for Motor A)

// Constants for sensors
const float VREF = 3.3;
const int ADC_RESOLUTION = 4095;
const float TURBIDITY_VREF = 5.0;
const float PH_VREF = 3.3;
const float CLEAR_WATER_VOLTAGE = 3.3;
const float MAX_TURBIDITY_VOLTAGE = 1.0;
const float MAX_NTU = 500.0;
const float TDS_CONVERSION_FACTOR = 0.5;

// Motor control constants
const int pwmFreq = 5000;     // PWM frequency (5 kHz)
const int pwmResolution = 8;  // 8-bit resolution (0-255)
const int motorSpeed = 255;   // PWM duty cycle value (0-255)
const int pwmChannel = 0;     // PWM channel for the motor
const unsigned long motorRunTime = 600000;  // 10 minutes

// Firebase settings
#define API_KEY "AIzaSyDUqlpTWmXr4vicykOx0dBqlVnJQyVkZDI"
#define USER_EMAIL "test123@gmail.com"
#define USER_PASSWORD "123456"
#define DATABASE_URL "https://thesis-app-3b413-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Global variables
String uid;
String databasePath;
String lastMotorActivationTime = "";
bool manualMotorActive = false;
bool firebaseReconnectNeeded = false;
bool wasWiFiConnected = false;
unsigned long lastTokenRefresh = 0;
unsigned long tokenExpirationTime = 0;
const unsigned long TOKEN_REFRESH_INTERVAL = 3600000; // 1 hour
unsigned long lastThresholdCheck = 0;

//Motor control
enum MotorState { MOTOR_OFF, MOTOR_AUTO_RUNNING, MOTOR_MANUAL_RUNNING };
MotorState motorState = MOTOR_OFF;
unsigned long motorStartTime = 0;
bool motorIsRunning = false;
bool motorUpdateInProgress = false;

// Timing variables
unsigned long lastRealTimeUpdate = 0;
const unsigned long REALTIME_UPDATE_INTERVAL = 60000;  // 1 minute

unsigned long lastSensorDataSend = 0;
const unsigned long SENSOR_DATA_INTERVAL = 3600000;  // 1 hour in milliseconds (1*60*60*1000)

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
FirebaseJson json;

// Sensor objects
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Function prototypes
void tokenStatusCallback(TokenInfo info);
unsigned long getTime();
// String calculateOxygenStatus(float ec, float tds, float temp, float ph, float turbidity);
void runMotor();
void checkMotorTimers();
void startMotorManual();
void stopMotorManual();
void checkManualMotor();
void updateRealTimeData(float temp, float ph, float ec, float tds, float turbidity);
void sendSensorData(float temp, float ph, float ec, float tds, float turbidity);
void createNotification(const char* type, const char* message, FirebaseJson* details = NULL);
void checkSensorThresholds(float temp, float ph, float ec, float tds, float turbidity);

// Time and sensor functions
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return 0;
  }
  time(&now);
  return now;
}

// String calculateOxygenStatus(float ec, float tds, float temperature, float ph, float turbidity) {
//   if (temperature > 30 || ph < 6.5 || ph > 8.5 || ec > 800 || tds > 500 || turbidity > 1000) {
//     return "Low";
//   } else if (temperature < 25 && ph >= 6.5 && ph <= 8.5 && ec < 200 && tds < 150 && turbidity < 500) {
//     return "High";
//   } else {
//     return "Normal";
//   }
// }

void createNotification(const char* type, const char* message, FirebaseJson* details) {
  if(!Firebase.ready()) {
    Serial.println("Firebase not ready");
    return;
  }

  unsigned long timestamp = getTime();
  String notificationPath = "/BANGUS/" + uid + "/notifications/" + String(timestamp);

  FirebaseJson notificationJson;
  notificationJson.set("type", type);
  notificationJson.set("message", message);
  notificationJson.set("timestamp", timestamp * 1000);
  notificationJson.set("read", false);

  if (details != NULL) {
    notificationJson.set("details", *details);
  }

  if(Firebase.RTDB.setJSON(&fbdo, notificationPath.c_str(), &notificationJson)) {
    Serial.println("Notification created: " + String(message)); 
  } else {
    Serial.println("Failed to create notification: " + fbdo.errorReason());
  }
}

void checkSensorThresholds(float temp, float ph, float ec, float tds, float turbidity) {
 if(!Firebase.ready()) {
    Serial.println("Firebase not ready");
    return;
  }

  String thresholdsPath = "/BANGUS/" + uid + "/settings";

  if(Firebase.RTDB.getJSON(&fbdo, thresholdsPath.c_str())) {
    String jsonStr = fbdo.payload(); 
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, jsonStr);

    if(!error) {
      if (doc.containsKey("temperature")) {
        float minTemp = doc["temperature"]["Minimum"].as<float>();
        float maxTemp = doc["temperature"]["Maximum"].as<float>();
        
        if (temp < minTemp) {
          FirebaseJson details;
          details.set("sensor", "temperature");
          details.set("value", temp);
          details.set("threshold", minTemp);
          details.set("status", "below");
          createNotification("sensor_alert", "Temperature below optimal range", &details);
        } 
        else if (temp > maxTemp) {
          FirebaseJson details;
          details.set("sensor", "temperature");
          details.set("value", temp);
          details.set("threshold", maxTemp);
          details.set("status", "above");
          createNotification("sensor_alert", "Temperature above optimal range", &details);
        }
      }

      if(doc.containsKey("pH")) {
        float minPH = doc["pH"]["Minimum"].as<float>();
        float maxPH = doc["pH"]["Maximum"].as<float>();
        
        if(ph < minPH) {
          FirebaseJson details;
          details.set("sensor", "pH");
          details.set("value", ph);
          details.set("threshold", minPH);
          details.set("status", "below");
          createNotification("sensor_alert", "pH below optimal range", &details);
        } else if (ph > maxPH) {
          FirebaseJson details;
          details.set("sensor", "pH");
          details.set("value", ph);
          details.set("threshold", maxPH);
          details.set("status", "above");
          createNotification("sensor_alert", "pH above optimal range", &details);
        }
      }

      if (doc.containsKey("ec")) {
        float minEc = doc["ec"]["Minimum"].as<float>();
        float maxEc = doc["ec"]["Maximum"].as<float>();
        
        if (ec < minEc) {
          FirebaseJson details;
          details.set("sensor", "EC");
          details.set("value", ec);
          details.set("threshold", minEc);
          details.set("status", "below");
          createNotification("sensor_alert", "Conductivity below optimal range", &details);
        } 
        else if (ec > maxEc) {
          FirebaseJson details;
          details.set("sensor", "EC");
          details.set("value", ec);
          details.set("threshold", maxEc);
          details.set("status", "above");
          createNotification("sensor_alert", "Conductivity above optimal range", &details);
        }
      }

      if (doc.containsKey("tds")) {
        float minTds = doc["tds"]["Minimum"].as<float>();
        float maxTds = doc["tds"]["Maximum"].as<float>();
        
        if (tds < minTds) {
          FirebaseJson details;
          details.set("sensor", "TDS");
          details.set("value", tds);
          details.set("threshold", minTds);
          details.set("status", "below");
          createNotification("sensor_alert", "TDS below optimal range", &details);
        } 
        else if (tds > maxTds) {
          FirebaseJson details;
          details.set("sensor", "TDS");
          details.set("value", tds);
          details.set("threshold", maxTds);
          details.set("status", "above");
          createNotification("sensor_alert", "TDS above optimal range", &details);
        }
      }

      if (doc.containsKey("turbidity")) {
        float minTurb = doc["turbidity"]["Minimum"].as<float>();
        float maxTurb = doc["turbidity"]["Maximum"].as<float>();
        
        if (turbidity < minTurb) {
          FirebaseJson details;
          details.set("sensor", "turbidity");
          details.set("value", turbidity);
          details.set("threshold", minTurb);
          details.set("status", "below");
          createNotification("sensor_alert", "Turbidity below optimal range", &details);
        } 
        else if (turbidity > maxTurb) {
          FirebaseJson details;
          details.set("sensor", "turbidity");
          details.set("value", turbidity);
          details.set("threshold", maxTurb);
          details.set("status", "above");
          createNotification("sensor_alert", "Turbidity above optimal range", &details);
        }
      }
    } else {
      Serial.println("Failed to parse thresholds JSON: " + String(error.c_str()));
    }
  } else {
    Serial.println("Failed to get thresholds from Firebase: " + fbdo.errorReason());
  }
}

void runMotor() {
  // Ensure motor control pins are outputs
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);

  ledcAttach(pwmPin, pwmFreq, pwmResolution);

  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, HIGH);
  ledcWrite(pwmPin, motorSpeed);

  Serial.println("Motor started");

  // unsigned long startMillis = millis();
  // while (millis() - startMillis < motorRunTime) {
  //   delay(100);
  // }

  // Stop the motor
  // ledcWrite(pwmPin, 0);
  // digitalWrite(motorPin1, LOW);
  // digitalWrite(motorPin2, LOW);
  // Serial.println("Motor stopped");

  // ledcDetach(pwmPin);

  motorStartTime = millis();
  motorIsRunning = true;
}

void stopMotor() {
  ledcWrite(pwmChannel, 0);
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  ledcDetach(pwmPin);
  Serial.println("Motor stopped");
  motorIsRunning = false;
  createNotification("feeding_complete", "Scheduled feeding session completed");
}

void checkMotorTimers() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }
  char currentTime[6];
  snprintf(currentTime, sizeof(currentTime), "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);
  String currentTimeStr = String(currentTime);

  if (currentTimeStr == lastMotorActivationTime) {
    return;
  }

  String timersPath = "/BANGUS/" + uid + "/timers";
  if (Firebase.RTDB.getJSON(&fbdo, timersPath.c_str())) {
    String jsonStr = fbdo.payload();
  
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, jsonStr);
    
    if (!error) {
      JsonObject timers = doc.as<JsonObject>();
      for (JsonPair timer : timers) {
        JsonObject timerData = timer.value().as<JsonObject>();
        if (timerData.containsKey("start")) {
          const char* scheduledStart = timerData["start"];
          if (String(scheduledStart) == currentTimeStr) {
            Serial.print("Scheduled motor activation at ");
            Serial.println(scheduledStart);
            String timerId = String(timer.key().c_str());
            runMotor();
            lastMotorActivationTime = currentTimeStr;
            break;
          }
        }
      }
    } else {
      Serial.println("Failed to parse timers JSON: " + String(error.c_str()));
    }
  } else {
    Serial.println("Failed to get timers from Firebase: " + fbdo.errorReason());
  }
}

// Function to start the motor using the new LEDC API
void startMotorManual() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);

  // Attach PWM to the pin using the new API
  ledcAttach(pwmPin, pwmFreq, pwmResolution);

  // Set motor direction (adjust polarity as needed)
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, HIGH);
  ledcWrite(pwmPin, motorSpeed);
  Serial.println("Manual motor started");
}
// Function to stop the motor using the new LEDC API
void stopMotorManual() {
  ledcWrite(pwmPin, 0);
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  ledcDetach(pwmPin);
  Serial.println("Manual motor stopped");
  createNotification("feeding_complete", "Manual feeding session completed");
}

// Function to check the "feednow" field in Firebase for manual control
void checkManualMotor() {
  String feednowPath = "/BANGUS/" + uid + "/feedNow";
  if (Firebase.RTDB.getBool(&fbdo, feednowPath.c_str())) {
    bool feednow = fbdo.boolData();

    if (feednow && !manualMotorActive) {
      startMotorManual();
      manualMotorActive = true;
    }
    else if (!feednow && manualMotorActive) {
      stopMotorManual();
      manualMotorActive = false;
    }
  } else {
    Serial.println("Failed to read feednow value from Firebase");
  }
}

void updateRealTimeData(float temp, float ph, float ec, float tds, float turbidity) {
  String realTimePath = "/BANGUS/" + uid + "/real-time";
  
  FirebaseJson rtJson;
  rtJson.set("/temperature", temp);
  rtJson.set("/pH", ph);
  rtJson.set("/EC", ec);
  rtJson.set("/turbidity", turbidity);
  rtJson.set("/TDS", tds);
  
  if (Firebase.RTDB.setJSON(&fbdo, realTimePath.c_str(), &rtJson)) {
    Serial.println("Real-time data updated");
  } else {
    Serial.println("Failed to update real-time data: " + fbdo.errorReason());
  }
}

void sendSensorData(float temp, float ph, float ec, float tds, float turbidity) {
  int timestamp = getTime();
  String parentReadingPath = databasePath + "/" + String(timestamp);
  
  FirebaseJson historyJson;
  historyJson.set("temperature", temp);
  historyJson.set("pH", ph);
  historyJson.set("EC", ec);
  historyJson.set("TDS", tds);
  historyJson.set("turbidity", turbidity);
  historyJson.set("timestamp", String(timestamp));
  
  if (Firebase.RTDB.setJSON(&fbdo, parentReadingPath.c_str(), &historyJson)) {
    Serial.println("Historical sensor data sent (1-hour interval)");
  } else {
    Serial.println("Failed to send historical data: " + fbdo.errorReason());
  }
}

// Main setup function
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Setup Starting....");

  // Initialize sensors
  sensors.begin();

  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  ledcAttach(pwmPin, pwmFreq, pwmResolution);
  ledcWrite(pwmPin, 0);
  
  // Initialize WiFiManager
  WiFiManager wm;
  
  // Uncomment to reset saved settings during testing
  wm.resetSettings();
  
  // Set a custom AP name and password for configuration mode
  bool res = wm.autoConnect("BANGUS", "bangus123");
  
  if (!res) {
    Serial.println("Failed to connect to WiFi");
    delay(3000);
    ESP.restart();
  } 
  else {
    Serial.println("Connected to WiFi: " + WiFi.localIP().toString());
    
    // Configure time after WiFi connection
    configTime(8 * 3600, 0, "time.nist.gov");
    
    // Initialize Firebase
    config.api_key = API_KEY;
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
    config.database_url = DATABASE_URL;
    config.token_status_callback = tokenStatusCallback;
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    unsigned long start = millis();
    while (!Firebase.ready() && (millis() - start < 15000)) {
      delay(100);
    }

    if (Firebase.ready()) {
      uid = auth.token.uid.c_str();
      databasePath = "/BANGUS/" + uid + "/readings";
    }
    
    // Initialize timing variables
    lastRealTimeUpdate = 0;
    lastSensorDataSend = 0;
  }
}

// Main loop function
void loop() {
  bool isWiFiConnected = (WiFi.status() == WL_CONNECTED);
  unsigned long currentMillis = millis();
  static unsigned long lastMotorCheck = 0;
  static unsigned long lastSensorRead = 0;
  const unsigned long SENSOR_READ_INTERVAL = 1000;
  const unsigned long THRESHOLD_CHECK_INTERVAL = 60000;

  // Check if WiFi is connected
  if (!isWiFiConnected) {
    Serial.println("WiFi disconnected. Waiting for reconnection...");
    delay(1000);
    return;
  }

  // Handle Firebase reconnection and token refresh
  if (!Firebase.ready() || (millis() - lastTokenRefresh > TOKEN_REFRESH_INTERVAL)) {
    Serial.println("Refreshing Firebase connection...");
    
    Firebase.refreshToken(&config);
    lastTokenRefresh = millis();
    
    if (Firebase.ready()) {
      uid = auth.token.uid.c_str();
      databasePath = "/BANGUS/" + uid + "/readings";
    }
  }

  // Motor control checks every 100ms
  if (currentMillis - lastMotorCheck >= 100) {
    lastMotorCheck = currentMillis;
    
    // Check if motor should be stopped based on run time
    if(motorIsRunning && (currentMillis - motorStartTime >= motorRunTime)) {
      stopMotor();
    }
    
    // Only check for new motor activations if motor is not already running
    if(!motorIsRunning) {
      checkMotorTimers();
      checkManualMotor();
    }
  }
  
  // Read sensors at regular intervals, separate from motor control
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    lastSensorRead = currentMillis;
    
    // Read sensors
    sensors.requestTemperatures();
    float temperatureC = sensors.getTempCByIndex(0);
    
    int ecRaw = analogRead(EC_PIN);
    float ecVoltage = ecRaw * (VREF / ADC_RESOLUTION);
    float ecValue = (ecVoltage / VREF) * 800.0;
    float tdsValue = ecValue * TDS_CONVERSION_FACTOR;
    
    int phRaw = analogRead(PH_PIN);
    float phVoltage = phRaw * (PH_VREF / ADC_RESOLUTION);
    float phValue = 10.0 + ((2.5 - phVoltage) * 3.5);
    
    int turbidityRaw = analogRead(TURBIDITY_PIN);
    float turbidityVoltage = turbidityRaw * (TURBIDITY_VREF / ADC_RESOLUTION);
    
    float turbidityNTU = 0.0;
    if (turbidityVoltage >= CLEAR_WATER_VOLTAGE) {
      turbidityNTU = 15;  // Minimum NTU for brackish water
    } else if (turbidityVoltage <= MAX_TURBIDITY_VOLTAGE) {
      turbidityNTU = MAX_NTU;  // Very turbid water
    } else {
      turbidityNTU = 15 + ((CLEAR_WATER_VOLTAGE - turbidityVoltage) * 
                           ((MAX_NTU - 15) / (CLEAR_WATER_VOLTAGE - MAX_TURBIDITY_VOLTAGE)));
    }
    turbidityNTU = fmax(15.0, turbidityNTU);
    
    // Print sensor values
    Serial.printf("Temperature: %.2f °C\n", temperatureC);
    Serial.printf("Conductivity: %.2f µS/cm\n", ecValue);
    Serial.printf("TDS: %.2f ppm\n", tdsValue);
    Serial.printf("pH: %.2f\n", phValue);
    Serial.printf("Turbidity: %.2f NTU\n", turbidityNTU);
    Serial.printf("Motor status: %s\n", motorIsRunning ? "Running" : "Stopped");
    
    // Update real-time data at the specified interval
    if (currentMillis - lastRealTimeUpdate >= REALTIME_UPDATE_INTERVAL) {
      lastRealTimeUpdate = currentMillis;
      updateRealTimeData(temperatureC, phValue, ecValue, tdsValue, turbidityNTU);
    }
    
    // Send historical sensor data every 1 hour
    if (currentMillis - lastSensorDataSend >= SENSOR_DATA_INTERVAL) {
      lastSensorDataSend = currentMillis;
      sendSensorData(temperatureC, phValue, ecValue, tdsValue, turbidityNTU);
      Serial.println("1-hour interval reached - sent historical data to Firebase");
    }

    // Check sensor thresholds every 1 minute
    if(currentMillis - lastThresholdCheck >= THRESHOLD_CHECK_INTERVAL) {
      lastThresholdCheck = currentMillis;
      checkSensorThresholds(temperatureC, phValue, ecValue, tdsValue, turbidityNTU);
    }
  }
  
  // Short delay to prevent CPU hogging
  delay(10);
}