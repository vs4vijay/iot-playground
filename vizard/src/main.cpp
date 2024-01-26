#include <Arduino.h>
#include <BleKeyboard.h>

#define LED_PIN 2

BleKeyboard bleKeyboard;

void setup() {
  Serial.begin(115200);
  Serial.println("[+] Starting project");


  pinMode(LED_PIN, OUTPUT);
  bleKeyboard.begin();
}

void loop() {
  // if (Serial.available()) {
  //   String message = Serial.readStringUntil('\n');
  //   int length = message.length();

  //   Serial.print("Response: ");
  //   // Echoing the text in reverse order
  //   for (int i = length - 1; i >= 0; i--) {
  //     Serial.print(message.charAt(i));
  //   }
    
  //   // Printing the total number of characters
  //   Serial.print(" (");
  //   Serial.print(length);
  //   Serial.print(")");
  // }

  if(bleKeyboard.isConnected()) {
    Serial.println("[+] Connected");
    
    digitalWrite(LED_PIN, HIGH);
    bleKeyboard.print("Hello from ESP32");
    digitalWrite(LED_PIN, LOW);


    delay(1000);


    digitalWrite(LED_PIN, HIGH);
    Serial.println("Sending Enter key...");
    bleKeyboard.write(KEY_RETURN);
    digitalWrite(LED_PIN, LOW);


    delay(1000);


    digitalWrite(LED_PIN, HIGH);
    bleKeyboard.println("Great work!!!");
    digitalWrite(LED_PIN, LOW);
  }
  
  Serial.println("Waiting 5 seconds to connection...");
  delay(5000);
}

