import { synchronize } from '@nozbe/watermelondb/sync';

let inProgress = false;

async function mySync() {
  if (inProgress) {
    return;
  }
  inProgress = true;

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await fetch(`https://my.backend/sync?last_pulled_at=${lastPulledAt}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const response = await fetch(`https://my.backend/sync?last_pulled_at=${lastPulledAt}`, {
        method: 'POST',
        body: JSON.stringify(changes),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
  });
}
