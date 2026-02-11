// import { TypedJSON } from 'typedjson';
import {
  Exploitant,
  ExploitatieLocatie,
  Proces,
  Emissiepunt,
  Apparaat,
  Installatie,
  ProcesVariabele,
} from '../index';

const D = (s: string) => new Date(s);

// Exploitant
export const staalfabriek = new Exploitant();
staalfabriek.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/exploitant/0400123123';
staalfabriek.benaming = 'Staalfabriek NV';
//staalfabriek.type = ['https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant'];
staalfabriek.aangemaaktOp = D('2020-07-30T10:00:00Z');
staalfabriek.geldigVan = D('2020-07-30');

// ExploitatieLocatie
export const hoofdZetel = new ExploitatieLocatie();
hoofdZetel.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/exploitatielocatie/0400123123_6851234567';
hoofdZetel.benaming = 'Hoofdzetel Staalfabriek NV';
hoofdZetel.aangemaaktOp = D('2020-07-30T10:00:00Z');
hoofdZetel.geldigVan = D('2020-07-30');
hoofdZetel.toegewezenAan = staalfabriek;

// Emissiepunten
export const emissiepunt1 = new Emissiepunt();
emissiepunt1.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000001';
emissiepunt1.benaming = 'Schouw 1';
emissiepunt1.aangemaaktOp = D('2020-07-30T10:00:00Z');
emissiepunt1.geldigVan = D('2020-07-30');
emissiepunt1.locatie = hoofdZetel;

export const emissiepunt2 = new Emissiepunt();
emissiepunt2.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000002';
emissiepunt2.benaming = 'Schouw 2';
emissiepunt2.aangemaaktOp = D('2020-07-30T10:00:00Z');
emissiepunt2.geldigVan = D('2020-07-30');
emissiepunt2.locatie = hoofdZetel;

export const emissiepunt3 = new Emissiepunt();
emissiepunt3.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000003';
emissiepunt3.benaming = 'Schouw 3';
emissiepunt3.aangemaaktOp = D('2020-07-30T10:00:00Z');
emissiepunt3.geldigVan = D('2020-07-30');
emissiepunt3.locatie = hoofdZetel;

export const emissiepunt4 = new Emissiepunt();
emissiepunt4.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000004';
emissiepunt4.benaming = 'Schoorsteen Ketels';
emissiepunt4.aangemaaktOp = D('2020-07-30T10:00:00Z');
emissiepunt4.geldigVan = D('2020-07-30');
emissiepunt4.locatie = hoofdZetel;

export const emissiepunt5 = new Emissiepunt();
emissiepunt5.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000005';
emissiepunt5.benaming = 'Schouw 5';
emissiepunt5.aangemaaktOp = D('2020-07-30T10:00:00Z');
emissiepunt5.geldigVan = D('2020-07-30');
emissiepunt5.locatie = hoofdZetel;

// Apparaten
export const apparaat1 = new Apparaat();
apparaat1.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0001';
apparaat1.benaming = 'Stroomboogoven';
apparaat1.aangemaaktOp = D('2020-07-30T10:00:00Z');
apparaat1.geldigVan = D('2020-07-30');
apparaat1.locatie = hoofdZetel;

export const apparaat2 = new Apparaat();
apparaat2.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0002';
apparaat2.benaming = 'Gieterijmachine';
apparaat2.aangemaaktOp = D('2020-07-30T10:00:00Z');
apparaat2.geldigVan = D('2020-07-30');
apparaat2.locatie = hoofdZetel;

// Installaties
export const installatie1 = new Installatie();
installatie1.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/installatie/0400123123_6851234567_0000001';
installatie1.benaming = 'Stroomboogoven';
installatie1.aangemaaktOp = D('2020-01-01T00:00:00Z');
installatie1.geldigVan = D('2020-07-30');
installatie1.locatie = hoofdZetel;
installatie1.heeftSubSysteem = [
  emissiepunt1,
  emissiepunt2,
  apparaat1,
];

export const installatie2 = new Installatie();
installatie2.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/installatie/0400123123_6851234567_0000002';
installatie2.benaming = 'Gieterij';
installatie2.aangemaaktOp = D('2020-01-01T00:00:00Z');
installatie2.geldigVan = D('2020-07-30');
installatie2.locatie = hoofdZetel;
installatie2.heeftSubSysteem = [emissiepunt5, apparaat2];

// Procesvariabelen (stoffen)
const baseStof = 'https://data.riepr.omgeving.vlaanderen.be/id/stof/';
export const ijzererts = new ProcesVariabele();
ijzererts.uri = baseStof + 'ijzererts';
ijzererts.benaming = 'IJzererts';
ijzererts.aangemaaktOp = D('2020-07-30T10:00:00Z');
ijzererts.geldigVan = D('2020-07-30');

export const rookgas = new ProcesVariabele();
rookgas.uri = baseStof + 'rookgas';
rookgas.benaming = 'Rookgas';
rookgas.aangemaaktOp = D('2020-07-30T10:00:00Z');
rookgas.geldigVan = D('2020-07-30');

export const staalplaat = new ProcesVariabele();
staalplaat.uri = baseStof + 'staalplaat';
staalplaat.benaming = 'Staalplaat';
staalplaat.aangemaaktOp = D('2020-07-30T10:00:00Z');
staalplaat.geldigVan = D('2020-07-30');

// Voorbeeld hoofdproces en enkele stappen
export const procesHoofd = new Proces();
procesHoofd.uri = 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1';
procesHoofd.benaming = 'Staalproductieproces';
procesHoofd.aangemaaktOp = D('2020-07-30T10:00:00Z');
procesHoofd.geldigVan = D('2020-07-30');
procesHoofd.locatie = hoofdZetel;
procesHoofd.heeftInvoer = [ijzererts];
procesHoofd.heeftUitvoer = [staalplaat];

const grondstoffenMix = new ProcesVariabele();
grondstoffenMix.uri = baseStof + 'grondstoffenMix';
grondstoffenMix.benaming = 'Grondstoffenmix';
grondstoffenMix.aangemaaktOp = D('2020-07-30T10:00:00Z');
grondstoffenMix.geldigVan = D('2020-07-30');

export const proces1 = new Proces();
proces1.uri =
  'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0001';
proces1.benaming = 'Toevoeging van grondstoffen';
proces1.aangemaaktOp = D('2020-07-30T10:00:00Z');
proces1.geldigVan = D('2020-07-30');
proces1.locatie = hoofdZetel;
proces1.heeftInvoer = [ijzererts];
proces1.heeftUitvoer = [grondstoffenMix];
proces1.onderdeelVan = procesHoofd;

export const processen = [procesHoofd, proces1];

export const alleEmissiepunten = [
  emissiepunt1,
  emissiepunt2,
  emissiepunt3,
  emissiepunt4,
  emissiepunt5,
];

export const alleApparaten = [apparaat1, apparaat2];
export const alleInstallaties = [installatie1, installatie2];
export const alleProcesVariabelen = [ijzererts, rookgas, staalplaat];

// Gebruik typedjson en serialiseer naar JSON
// const json = TypedJSON.stringify(staalfabriek, Exploitant);
// fs.writeFileSync('staalfabriek.json', json!, 'utf-8');

export default staalfabriek;
