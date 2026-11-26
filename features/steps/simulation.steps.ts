// features/steps/simulation.steps.ts – Datum/Zeitraffer im Simulations-Panel
import { expect } from '@playwright/test';
import { When, Then } from '../support/fixtures';
import { parseDatum } from '../support/astro-uhr';

When('ich die Simulation starte', async ({ uhr }) => {
  await uhr.starteSimulation();
});

When('ich die Simulation anhalte', async ({ uhr }) => {
  await uhr.halteSimulationAn();
});

When('ich die Simulation zurücksetze', async ({ uhr }) => {
  await uhr.setzeSimulationZurueck();
});

When('ich die Geschwindigkeit auf {float} stelle', async ({ uhr }, faktor: number) => {
  await uhr.stelleGeschwindigkeitEin(faktor);
});

Then('zeigt die Simulation den Zeitpunkt {string}', async ({ uhr }, zeitpunkt: string) => {
  const soll = parseDatum(zeitpunkt).getTime();
  await expect.poll(async () => (await uhr.angezeigterZeitpunkt()).getTime(), { message: zeitpunkt }).toBe(soll);
});

Then('zeigt die Simulation weiterhin den Zeitpunkt {string}', async ({ uhr }, zeitpunkt: string) => {
  // Kurz abwarten, ob eine (unerwünschte) Übernahme doch noch ankommt
  const { nachher } = await uhr.beobachteZeitpunkt(300);
  expect(nachher.getTime()).toBe(parseDatum(zeitpunkt).getTime());
});

Then('läuft die simulierte Zeit vorwärts', async ({ uhr }) => {
  const start = (await uhr.angezeigterZeitpunkt()).getTime();
  await expect
    .poll(async () => (await uhr.angezeigterZeitpunkt()).getTime() - start, { message: 'simulierte Zeit läuft nicht' })
    .toBeGreaterThan(10 * 60 * 1000); // mehr als 10 simulierte Minuten
});

Then('bleibt die simulierte Zeit stehen', async ({ uhr }) => {
  const { vorher, nachher } = await uhr.beobachteZeitpunkt(1000);
  expect(nachher.getTime()).toBe(vorher.getTime());
});

Then('ist der Zeitraffer angehalten', async ({ uhr }) => {
  await expect(uhr.startStopButton).toContainText('Start');
});

Then('ist der Zeitraffer gestartet', async ({ uhr }) => {
  await expect(uhr.startStopButton).toContainText('Stop');
});

Then('steht die Geschwindigkeit auf {string}', async ({ uhr }, anzeige: string) => {
  await expect(uhr.simulation.getByText(/Geschwindigkeit|Speed/)).toContainText(anzeige);
});

Then('hält der Zeitraffer beim Zeitpunkt {string} an', async ({ uhr }, zeitpunkt: string) => {
  // Erst warten, bis die Zeit das Ende erreicht hat – der Knopf zeigt „Start“
  // auch schon, bevor der Zeitraffer überhaupt angelaufen ist (Wettlauf).
  const soll = parseDatum(zeitpunkt).getTime();
  await expect.poll(async () => (await uhr.angezeigterZeitpunkt()).getTime(), { timeout: 20_000 }).toBe(soll);
  await expect(uhr.startStopButton, 'Zeitraffer läuft weiter').toContainText('Start');
  // … und bleibt dort stehen
  const { nachher } = await uhr.beobachteZeitpunkt(800);
  expect(nachher.getTime()).toBe(parseDatum(zeitpunkt).getTime());
});

Then('meldet der Kalender kein ungültiges Jahr', async ({ uhr }) => {
  await expect(uhr.kalenderPanel).not.toContainText(/Ungültiges Jahr|Invalid year/);
});

Then('lautet die Zeitanzeige der Simulation {string}', async ({ uhr }, text: string) => {
  // innerText mit normalisierten Leerräumen: Zeilenumbruch vor der Zeitzone = ein Leerzeichen
  await expect(uhr.liveAnzeige).toHaveText(text, { useInnerText: true });
});
