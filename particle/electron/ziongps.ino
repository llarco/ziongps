/*
 * ZionGPS
 * Author: Luis Larco <luis@luislarco.com>
 * Purpose: To publish a GPS location from a GPS tracker.
 * Language:  C++ for Particle Electron.
 */

// This #include statement was automatically added by the Spark IDE.

#include "TinyGPS/TinyGPS.h"
TinyGPS gps;
char szInfo[64];
// Every 0.1 minutes 
int sleep = 0.1 * 60 * 1000;
int GPS_POWER = D6;
float current_lat = 0.0;
float current_lon = 0.0;

void setup(){
    Serial.begin(9600);
    Serial1.begin(9600);
    pinMode(GPS_POWER, OUTPUT);
    digitalWrite(GPS_POWER, LOW);
    Serial.println("Started!");
}

void loop(){
    bool isValidGPS = false;
    bool newGPS = false;
    Serial.println("Trying to adquire signal...");
    for (unsigned long start = millis(); millis() - start < 1000;){
        // Check GPS data is available
        while (Serial1.available()){
            char c = Serial1.read();
            // parse GPS data
            if (gps.encode(c)) {
                isValidGPS = true;
            }
        }
    }

    // If we have a valid GPS location then publish it
    if (isValidGPS){
        Serial.println("GPS signal valid!");
        float lat, lon;
        unsigned long age;
    
        gps.f_get_position(&lat, &lon, &age);
        
        // TODO(llarco): finish implementation to only publish new
        // gps location.
        if (current_lat != lat && current_lon != lon) {
            newGPS = true;
            current_lat = lat;
            current_lon = lon;
        }
        
        sprintf(szInfo, "{\"lat\": %.6f, \"lon\": %.6f, \"age\": %lu}",
            (lat == TinyGPS::GPS_INVALID_F_ANGLE ? 0.0 : lat),
            (lon == TinyGPS::GPS_INVALID_F_ANGLE ? 0.0 : lon), age);
    }
    else{
        Serial.println("GPS signal invalid!");
        // Not a valid GPS location, just pass 0.0,0.0
        // This is not correct because 0.0,0.0 is a valid GPS location, we have to pass a invalid GPS location
        // and check it at the client side
        sprintf(szInfo, "0.0,0.0");
    }
    
    if (newGPS) {
        Particle.publish("gps_location", szInfo, 60 /* TTL */, PRIVATE);
    }
    Serial.println(szInfo);
    
    // Sleep for some time
    // TODO(llarco): investigate trade-offs of turning off GPS.
    // digitalWrite(GPS_POWER, HIGH);
    delay(sleep);
}