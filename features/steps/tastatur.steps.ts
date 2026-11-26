// features/steps/tastatur.steps.ts – Bedienung mit der Tab-Taste
import { expect } from '@playwright/test';
import { Then } from '../support/fixtures';

const TABS = 25;

Then('erreicht die Tab-Taste nur sichtbare Bedienelemente', async ({ uhr }) => {
  const reihe = await uhr.tabReihenfolge(TABS);
  const unsichtbar = reihe.filter((e) => !e.sichtbar).map((e) => e.name);
  expect(unsichtbar, 'per Tab erreichbar, aber nicht zu sehen').toEqual([]);
});

Then('erreicht die Tab-Taste {string}', async ({ uhr }, name: string) => {
  const reihe = await uhr.tabReihenfolge(TABS);
  expect(reihe.filter((e) => e.sichtbar).map((e) => e.name)).toContainEqual(expect.stringContaining(name));
});

Then('erreicht die Tab-Taste {string} nicht', async ({ uhr }, name: string) => {
  const reihe = await uhr.tabReihenfolge(TABS);
  expect(reihe.map((e) => e.name)).not.toContainEqual(expect.stringContaining(name));
});
