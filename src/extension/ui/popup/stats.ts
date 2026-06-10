import { $ } from './dom';
import type { StatsResponse } from './types';

export async function fetchStats(
  hiddenCountEl: HTMLElement,
  notOnJobsPageEl: HTMLElement
): Promise<void> {
  const cooldownRow = $<HTMLElement>('cooldown-row');
  const cooldownValue = $<HTMLElement>('cooldown-value');

  try {
    const tabs = await chrome.tabs.query({
      url: ['https://www.linkedin.com/jobs', 'https://www.linkedin.com/jobs/*'],
    });
    const tab = tabs.find((t) => t.id !== undefined);
    if (!tab?.id) {
      hiddenCountEl.textContent = '-';
      notOnJobsPageEl.style.display = 'block';
      if (cooldownRow) cooldownRow.style.display = 'none';
      return;
    }

    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: 'get-stats',
    })) as StatsResponse;

    if (response?.isJobsPage) {
      hiddenCountEl.textContent = String(response.hiddenCount);
      notOnJobsPageEl.style.display = 'none';

      if (cooldownRow && cooldownValue) {
        if (response.cooldownSecondsLeft > 0) {
          cooldownRow.style.display = 'flex';
          cooldownValue.textContent = `${response.cooldownSecondsLeft}s`;
        } else {
          cooldownRow.style.display = 'none';
        }
      }
    } else {
      hiddenCountEl.textContent = '-';
      notOnJobsPageEl.style.display = 'block';
      if (cooldownRow) cooldownRow.style.display = 'none';
    }
  } catch {
    hiddenCountEl.textContent = '-';
    notOnJobsPageEl.style.display = 'block';
    if (cooldownRow) cooldownRow.style.display = 'none';
  }
}
