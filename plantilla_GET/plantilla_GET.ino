/**
 * Redes Avanzadas
 * Modelo para peticiones GET y POST
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h> // Include the ArduinoJson library

String serverName = "Servidor destino"; // Replace with your server's address
const char* ssid     = "DESKTOP-HLBC9U2-0531"; // Replace with your WiFi SSID
const char* password = "6i3A745%"; // Replace with your WiFi password
String nombreNodo = ""; // You might use this later

void setup() {
  Serial.begin(9600);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print('.');
  }

  Serial.println("");
  Serial.print("Iniciado STA:\t");
  Serial.println(ssid);
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());
}

void loop() {
  WiFiClient client;
  HTTPClient http;

  String serverPath = "http://192.168.137.1:3001/record"; // Replace with your server path

  http.begin(client, serverPath.c_str());

  String postData;

  // Create a JSON document
  JsonDocument doc;
  doc["id_nodo"] = "8";
  doc["temperatura"] = "24";
  doc["humedad"] = "24";
  doc["co2"] = "24";
  doc["volatiles"] = "24";

  // Serialize the JSON document to a string
  serializeJson(doc, postData);

  http.addHeader("Content-Type", "application/json"); // Important for JSON

  int httpResponseCode = http.POST(postData);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] POST... code: %d\n", httpResponseCode);
    if (httpResponseCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("received payload:\n");
      Serial.println(payload);
    }
  } else {
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end(); // Free resources

  delay(5000); // Adjust delay as needed
}