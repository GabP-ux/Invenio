// Registro degli schemi: la chiave è quella scritta nella scheda (campo "diagram").
// mode="auto" nel feed (si anima da solo), mode="play" nella scheda (interattivo se previsto).
import { Fig } from './kit'
import { LidarAnim, LidarSim, UltrasoundAnim, PirAnim, HallAnim, HallSim, HumidityAnim, HumiditySim, StepperAnim, SolenoidAnim, HBridgeSim, CAPTION } from './index'
import * as Co from './componenti'
import * as Se from './sensori2'
import * as At from './attuatori2'

const anim = (A, cap, Sim) => ({ C: ({ mode }) => (mode === 'play' && Sim) ? <Sim /> : <Fig caption={cap}><A /></Fig>, interactive: !!Sim })
const vis = (C, interactive = false) => ({ C, interactive })

export const VIS = {
  lidar: anim(LidarAnim, CAPTION.lidar, LidarSim),
  ultrasuoni: anim(UltrasoundAnim, CAPTION.ultrasuoni),
  pir: anim(PirAnim, CAPTION.pir),
  hall: anim(HallAnim, CAPTION.hall, HallSim),
  humidity: anim(HumidityAnim, CAPTION.humidity, HumiditySim),
  stepper: anim(StepperAnim, CAPTION.stepper),
  solenoid: anim(SolenoidAnim, CAPTION.solenoid),
  hbridge: { C: ({ mode }) => <HBridgeSim auto={mode === 'auto'} />, interactive: true },
  // componenti di base
  resistore: vis(Co.Resistore, true),
  condensatore: vis(Co.Condensatore, true),
  induttore: vis(Co.Induttore),
  diodo: vis(Co.Diodo, true),
  led: vis(Co.Led),
  bjt: vis(Co.Bjt, true),
  mosfet: vis(Co.Mosfet, true),
  potenziometro: vis(Co.Potenziometro, true),
  quarzo: vis(Co.Quarzo),
  fusibile: vis(Co.Fusibile, true),
  // sensori
  accelerometro: vis(Se.Accelerometro),
  ldr: vis(Se.Ldr, true),
  fotodiodo: vis(Se.Fotodiodo),
  ntc: vis(Se.Ntc, true),
  termocoppia: vis(Se.Termocoppia, true),
  encoder: vis(Se.Encoder, true),
  fsr: vis(Se.Fsr, true),
  estensimetro: vis(Se.Estensimetro, true),
  gps: vis(Se.Gps),
  // attuatori
  'motore-dc': vis(At.MotoreDc),
  bldc: vis(At.Bldc),
  servo: vis(At.Servo, true),
  rele: vis(At.Rele, true),
  vibrazione: vis(At.Vibrazione),
  lineare: vis(At.Lineare, true),
  piezo: vis(At.Piezo),
  'memoria-forma': vis(At.MemoriaForma, true),
  elettrovalvola: vis(At.Elettrovalvola),
  altoparlante: vis(At.Altoparlante),
  peltier: vis(At.Peltier, true)
}

export function Visual ({ k, mode }) {
  const v = VIS[k]
  if (!v) return null
  const C = v.C
  return <C mode={mode} />
}
