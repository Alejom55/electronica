import network
import json
from machine import Pin
from utime import sleep
import requests
import gc

import urequests
import ujson

ledWIFI = Pin(25, Pin.OUT)
ledEnvio = Pin(27, Pin.OUT)
button = Pin(26, Pin.IN, Pin.PULL_UP)
boton_presionado = False
ledWIFI.off()

class HTTPSender:
    def __init__(self, settings = ""):
        self.host = settings["host"]
        self.url = "https://4ae5-2800-e2-1e80-1497-1973-6fd8-b1f8-b3f9.ngrok-free.app/habilitar-boton"
        self.header = {"Content-Type": "application/json"}
        
        
    def postTrue(self):
        data = ujson.dumps({"habilitar": True})
        print("Enviando:", data)
        response = urequests.post(self.url, data=data, headers=self.header)
        print("Respuesta del servidor al habilitar botón:", response.text)
        response.close()

def connect_wifi (ssid, password):
    nic = network.WLAN(network.STA_IF)
    nic.active(True)
    #print(nic.scan())
    nic.connect(ssid, password)
    while not nic.isconnected():
        sleep(1)
        ledWIFI.on()
        print ("[INFO] Connecting to wifi...")
        sleep(0.5)
        ledWIFI.off()
    print("[INFO] WIFI connected", "ip: ", nic.ipconfig('addr4'))
    ledWIFI.on()
                
if __name__ == "__main__":
    with open ("settings.json","r") as f:
        settings = json.loads(f.read())
    print(settings["ssid"], settings["password"])
    connect_wifi(settings["ssid"], settings["password"])
    http = HTTPSender(settings = settings)
    while True:
        ledEnvio.off()
        if button.value() == 0:
            ledEnvio.on()
            http.postTrue()
            sleep(5)
        sleep(0.1)