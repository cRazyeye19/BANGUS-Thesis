#include <Firebase_ESP_Client.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <WiFiManager.h>
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
const unsigned long motorRunTime = 120000;  // 2 minutes

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

//Motor control
enum MotorState { MOTOR_OFF, MOTOR_AUTO_RUNNING, MOTOR_MANUAL_RUNNING };
MotorState motorState = MOTOR_OFF;
unsigned long motorStartTime = 0;
bool motorIsRunning = false;
bool motorUpdateInProgress = false;

// Timing variables
unsigned long lastRealTimeUpdate = 0;
const unsigned long REALTIME_UPDATE_INTERVAL = 1000;  // 1 second

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
String calculateOxygenStatus(float ec, float tds, float temp, float ph, float turbidity);
void runMotor();
void checkMotorTimers();
void startMotorManual();
void stopMotorManual();
void checkManualMotor();
void updateRealTimeData(float temp, float ph, float ec, float tds, float turbidity, String oxygenStatus);
void sendSensorData(float temp, float ph, float ec, float tds, float turbidity, String oxygenStatus);

// Time and sensor functions
/**
 * Gets the current Unix timestamp from NTP server
 * @return Unix timestamp (seconds since epoch) or 0 if failed
 */
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return 0;
  }
  time(&now);
  return now;
}

/**
 * Calculates oxygen status based on water parameters
 * @param ec Electrical conductivity in µS/cm
 * @param tds Total dissolved solids in ppm
 * @param temperature Water temperature in °C
 * @param ph pH value of water
 * @param turbidity Turbidity in NTU
 * @return String indicating oxygen status: "Low", "Normal", or "High"
 */
String calculateOxygenStatus(float ec, float tds, float temperature, float ph, float turbidity) {
  if (temperature > 30 || ph < 6.5 || ph > 8.5 || ec > 800 || tds > 500 || turbidity > 1000) {
    return "Low";
  } else if (temperature < 25 && ph >= 6.5 && ph <= 8.5 && ec < 200 && tds < 150 && turbidity < 500) {
    return "High";
  } else {
    return "Normal";
  }
}

/**
 * Starts the feeding motor for scheduled feeding
 * Motor will run for the duration set by motorRunTime
 */
void runMotor() {
  // Ensure motor control pins are outputs
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);

  ledcAttach(pwmPin, pwmFreq, pwmResolution);

  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, HIGH);
  ledcWrite(pwmPin, motorSpeed);

  Serial.println("Motor started");

  motorStartTime = millis();
  motorIsRunning = true;
}

/**
 * Stops the feeding motor
 */
void stopMotor() {
  ledcWrite(pwmChannel, 0);
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  ledcDetach(pwmPin);
  Serial.println("Motor stopped");

  motorIsRunning = false;
}

/**
 * Checks if any scheduled feeding times match the current time
 * Activates the motor if a match is found
 */
void checkMotorTimers() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }
  char currentTime[6];
  snprintf(currentTime, sizeof(currentTime), "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);
  String currentTimeStr = String(currentTime);

  // Prevent multiple activations in the same minute
  if (currentTimeStr == lastMotorActivationTime) {
    return;
  }

  // Check all possible timer slots (0-99)
  for (int i = 0; i < 100; i++) {
    String timerPath = "/BANGUS/" + uid + "/timers/timer" + String(i);
    if (Firebase.RTDB.getString(&fbdo, timerPath.c_str())) {
      String timerStr = fbdo.stringData();
      DynamicJsonDocument doc(256);
      DeserializationError error = deserializeJson(doc, timerStr);
      if (!error && doc.containsKey("start")) {
        const char *scheduledStart = doc["start"];
        if (String(scheduledStart) == currentTimeStr) {
          Serial.print("Scheduled motor activation at ");
          Serial.println(scheduledStart);
          runMotor();
          lastMotorActivationTime = currentTimeStr;
        }
      } else {
        Serial.println("Failed to parse timer JSON or missing 'start' field.");
      }
    }
  }
}

/**
 * Starts the motor for manual feeding (triggered by app)
 */
void startMotorManual() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);

  // Attach PWM to the pin using the LEDC API
  ledcAttach(pwmPin, pwmFreq, pwmResolution);

  // Set motor direction (adjust polarity as needed)
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, HIGH);
  ledcWrite(pwmPin, motorSpeed);
  Serial.println("Manual motor started");
}

/**
 * Stops the motor for manual feeding
 */
void stopMotorManual() {
  ledcWrite(pwmPin, 0);
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  // Detach PWM from the pin
  ledcDetach(pwmPin);
  Serial.println("Manual motor stopped");
}

/**
 * Checks if manual feeding has been triggered from the app
 * Reads the "feedNow" field in Firebase
 */
void checkManualMotor() {
  // Construct the path to the feedNow value
  String feednowPath = "/BANGUS/" + uid + "/feedNow";
  if (Firebase.RTDB.getBool(&fbdo, feednowPath.c_str())) {
    bool feednow = fbdo.boolData();

    // If feedNow is true and manual mode isn't already active, start the motor
    if (feednow && !manualMotorActive) {
      startMotorManual();
      manualMotorActive = true;
    }
    // If feedNow is false and manual mode is active, stop the motor
    else if (!feednow && manualMotorActive) {
      stopMotorManual();
      manualMotorActive = false;
    }
  } else {
    Serial.println("Failed to read feedNow value from Firebase");
  }
}

/**
 * Updates real-time sensor data in Firebase
 * Called every REALTIME_UPDATE_INTERVAL (1 second)
 * 
 * @param temp Temperature in °C
 * @param ph pH value
 * @param ec Electrical conductivity in µS/cm
 * @param tds Total dissolved solids in ppm
 * @param turbidity Turbidity in NTU
 * @param oxygenStatus Calculated oxygen status
 */
void updateRealTimeData(float temp, float ph, float ec, float tds, float turbidity, String oxygenStatus) {
  String realTimePath = "/BANGUS/" + uid + "/real-time";
  
  FirebaseJson rtJson;
  rtJson.set("/temperature", temp);
  rtJson.set("/pH", ph);
  rtJson.set("/EC", ec);
  rtJson.set("/turbidity", turbidity);
  rtJson.set("/TDS", tds);
  rtJson.set("/oxygenStatus", oxygenStatus);
  
  if (Firebase.RTDB.setJSON(&fbdo, realTimePath.c_str(), &rtJson)) {
    Serial.println("Real-time data updated");
  } else {
    Serial.println("Failed to update real-time data: " + fbdo.errorReason());
  }
}

/**
 * Sends historical sensor data to Firebase
 * Called every SENSOR_DATA_INTERVAL (1 hour)
 * Data is stored with timestamp for historical tracking
 * 
 * @param temp Temperature in °C
 * @param ph pH value
 * @param ec Electrical conductivity in µS/cm
 * @param tds Total dissolved solids in ppm
 * @param turbidity Turbidity in NTU
 * @param oxygenStatus Calculated oxygen status
 */
void sendSensorData(float temp, float ph, float ec, float tds, float turbidity, String oxygenStatus) {
  int timestamp = getTime();
  String parentReadingPath = databasePath + "/" + String(timestamp);
  
  FirebaseJson historyJson;
  historyJson.set("temperature", temp);
  historyJson.set("pH", ph);
  historyJson.set("EC", ec);
  historyJson.set("TDS", tds);
  historyJson.set("turbidity", turbidity);
  historyJson.set("oxygenStatus", oxygenStatus);
  historyJson.set("timestamp", String(timestamp));
  
  if (Firebase.RTDB.setJSON(&fbdo, parentReadingPath.c_str(), &historyJson)) {
    Serial.println("Historical sensor data sent (1-hour interval)");
  } else {
    Serial.println("Failed to send historical data: " + fbdo.errorReason());
  }
}

/**
 * Main setup function - runs once at startup
 * Initializes hardware, WiFi, and Firebase connection
 */
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Setup Starting....");

  // Initialize temperature sensor
  sensors.begin();
  
  // Initialize WiFiManager for easy WiFi configuration
  WiFiManager wm;
  
  // Uncomment to reset saved settings during testing
  wm.resetSettings();
  
  // Set a custom AP name and password for configuration mode
  // If WiFi connection fails, ESP32 will create an access point with these credentials
  bool res = wm.autoConnect("BANGUS", "bangus123");
  
  if (!res) {
    Serial.println("Failed to connect to WiFi");
    delay(3000);
    ESP.restart();
  } 
  else {
    Serial.println("Connected to WiFi: " + WiFi.localIP().toString());
    
    // Configure time after WiFi connection - set to Philippines timezone (UTC+8)
    configTime(8 * 3600, 0, "time.nist.gov");
    
    // Initialize Firebase with authentication
    config.api_key = API_KEY;
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
    config.database_url = DATABASE_URL;
    config.token_status_callback = tokenStatusCallback;
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Wait for Firebase connection (max 15 seconds)
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

/**
 * Main loop function - runs repeatedly after setup
 * Handles sensor readings, motor control, and data transmission
 */
void loop() {
  bool isWiFiConnected = (WiFi.status() == WL_CONNECTED);
  unsigned long currentMillis = millis();
  static unsigned long lastMotorCheck = 0;

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
    checkMotorTimers();    // Check for scheduled feedings
    checkManualMotor();    // Check for manual feeding command
  }

  // Stop motor after running for the specified duration
  if(motorIsRunning && (currentMillis - motorStartTime >= motorRunTime)) {
    stopMotor();
  }
  
  // Read sensors
  // Temperature sensor (DS18B20)
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);
  
  // EC (Electrical Conductivity) and TDS (Total Dissolved Solids) sensor
  int ecRaw = analogRead(EC_PIN);
  float ecVoltage = ecRaw * (VREF / ADC_RESOLUTION);
  float ecValue = (ecVoltage / VREF) * 800.0;  // Cap EC at 800 µS/cm
  float tdsValue = ecValue * TDS_CONVERSION_FACTOR;
  
  // pH sensor
  int phRaw = analogRead(PH_PIN);
  float phVoltage = phRaw * (PH_VREF / ADC_RESOLUTION);
  float phValue = 10.0 + ((2.5 - phVoltage) * 3.5);
  
  // Turbidity sensor
  int turbidityRaw = analogRead(TURBIDITY_PIN);
  float turbidityVoltage = turbidityRaw * (TURBIDITY_VREF / ADC_RESOLUTION);
  
  // Calculate turbidity in NTU (Nephelometric Turbidity Units)
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
  
  // Calculate oxygen status based on all sensor readings
  String oxygenStatus = calculateOxygenStatus(ecValue, tdsValue, temperatureC, phValue, turbidityNTU);
  
  // Print sensor values to Serial Monitor for debugging
  Serial.printf("Temperature: %.2f °C\n", temperatureC);
  Serial.printf("Conductivity: %.2f µS/cm\n", ecValue);
  Serial.printf("TDS: %.2f ppm\n", tdsValue);
  Serial.printf("pH: %.2f\n", phValue);
  Serial.printf("Turbidity: %.2f NTU\n", turbidityNTU);
  Serial.printf("Oxygen Status: %s\n", oxygenStatus.c_str());

  // Update real-time data every second
  if (currentMillis - lastRealTimeUpdate >= REALTIME_UPDATE_INTERVAL) {
    lastRealTimeUpdate = currentMillis;
    updateRealTimeData(temperatureC, phValue, ecValue, tdsValue, turbidityNTU, oxygenStatus);
  }
  
  // Send historical sensor data every 1 hour
  if (currentMillis - lastSensorDataSend >= SENSOR_DATA_INTERVAL) {
    lastSensorDataSend = currentMillis;
    sendSensorData(temperatureC, phValue, ecValue, tdsValue, turbidityNTU, oxygenStatus);
    Serial.println("1-hour interval reached - sent historical data to Firebase");
  }
  
  delay(10); // Short delay to prevent CPU hogging
}