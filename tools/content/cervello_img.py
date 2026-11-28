# Foto del pacchetto "Pensare e comunicare" (controllate con tools/contact_sheet.py)
from lib import img

IMAGES = {
    "microcontrollore": [img("ATMEGA328P-PU.jpg", "ATmega328P, il microcontrollore di Arduino Uno"),
                         img("Raspberry Pi Pico oblique.jpg", "Raspberry Pi Pico: scheda con il microcontrollore RP2040")],
    "adc": [img("Linear AD converter ideal characteristic.png", "La scala a gradini di un convertitore: ogni intervallo di tensione diventa un numero", fit="contain", bg="#fff")],
    "pwm": [img("Pwm 5steps.gif", "Un segnale PWM: impulsi di larghezza diversa danno medie diverse", fit="contain", bg="#fff")],
    "uart": [img("NS16550AFN UART chip.jpg", "Un chip UART storico, usato nelle porte seriali dei computer")],
    "i2c": [img("I2C analyze.jpg", "Una trama I²C decodificata con un analizzatore logico")],
    "spi": [img("Serial Peripheral Interface Animation.gif", "Animazione dello scambio di bit in SPI tra controllore e dispositivo", fit="contain", bg="#fff")],
    "esp32": [img("Espressif ESP-WROOM-32 Wi-Fi & Bluetooth Module.jpg", "Modulo ESP-WROOM-32 aperto su una scheda: il chip ESP32 e, a lato, la zona dell'antenna stampata"),
              img("ESP32-C3 with Traffic Light Module from Above.jpg", "Una scheda ESP32-C3 su breadboard con un modulo semaforo")],
    "led-indirizzabili": [img("12664-01a.jpg", "Anello di 16 LED indirizzabili: ognuno ha il suo chip e si comanda con un solo filo")],
}
