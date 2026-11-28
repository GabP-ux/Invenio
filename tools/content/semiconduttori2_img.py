# Foto del pacchetto "Semiconduttori e circuiti integrati" (controllate con tools/contact_sheet.py)
from lib import img

IMAGES = {
    "zener": [img("1N829 Zener Diode.jpg", "Un diodo Zener in vetro: la fascia indica il catodo")],
    "optoaccoppiatore": [img("Opto-isolator 4n25.jpg", "Optoaccoppiatori 4N25, interi e tagliati: dentro, LED e fototransistor uno di fronte all'altro")],
    "amplificatore-operazionale": [img("Ua741 opamp.jpg", "µA741, uno dei primi amplificatori operazionali (1972)"),
                                   img("LM358 SMD operational amplifier IMG 0990.JPG", "LM358 in versione SMD su una scheda")],
    "timer-555": [img("NE555 DIP & SOIC.jpg", "Due NE555: a piedini passanti (DIP) e da saldare in superficie (SOIC)"),
                  img("555 timer circuit perforated board.jpg", "Un circuito con il 555 montato su basetta millefori")],
    "porte-logiche": [img("NXP 74HC00 (5275301026).jpg", "Il chip di silicio di un 74HC00 visto al microscopio, senza contenitore: qui dentro ci sono quattro porte NAND"),
                      img("TexasInstruments 7400 chip, view and element placement.jpg", "Il classico 7400 e come sono disposte le quattro porte all'interno", fit="contain", bg="#fff")],
}
