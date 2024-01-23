void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    String message = Serial.readStringUntil('\n');
    int length = message.length();

    Serial.print("Response: ");
    // Echoing the text in reverse order
    for (int i = length - 1; i >= 0; i--) {
      Serial.print(message.charAt(i));
    }
    
    // Printing the total number of characters
    Serial.print(" (");
    Serial.print(length);
    Serial.print(")");
  }
}