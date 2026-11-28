# Foto del pacchetto "Fondamenti e strumenti" (controllate con tools/contact_sheet.py)
from lib import img

IMAGES = {
    "serie-parallelo": [img("Battery Series and Parallel Bulb.jpg", "Disegno a mano di una pila con tre lampadine, in parte in serie e in parte in parallelo")],
    "trasformatore": [img("Small 1.5VA EI transformer (Транслед ТПГ-1) 01(DXO).jpg", "Piccolo trasformatore a lamierini E-I"),
                      img("Small audio transformer cross section.jpg", "Trasformatore tagliato a metà: le spire di rame intorno al nucleo di ferro"),
                      img("40VA toroid transformer (Торэл ТТП-40) 02(DXO).jpg", "Trasformatore toroidale")],
    "multimetro": [img("UT61D digital multimeter front.jpg", "Multimetro digitale: manopola delle misure e boccole COM, VΩ, mA e A")],
    "oscilloscopio": [img("RIGOL DS1054Z Digital Storage Oscilloscope.jpg", "Oscilloscopio digitale da banco a 4 canali")],
    "saldatore": [img("SH72 soldering iron with pen and ruler for scale.jpg", "Saldatore a stilo con temperatura regolabile, accanto a una penna per confronto"),
                  img("Circuit Soldering.gif", "Animazione ravvicinata di saldature su un circuito stampato")],
    "pulsante": [img("Tactile switches.jpg", "Pulsanti tattili, i classici da breadboard"),
                 img("Tact switch cross section.jpg", "Pulsante tattile tagliato a metà: la cupola di metallo che fa contatto")],
    "alimentatore-banco": [img("Bench power supply.jpg", "Alimentatore da banco con display di tensione e corrente")],
}
