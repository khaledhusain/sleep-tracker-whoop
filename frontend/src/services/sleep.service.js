const API_URL = 'http://localhost:3333';

export const fetchSleepData = async (token, startDate, endDate) => {
  const url = new URL(`${API_URL}/sleep`);
  if (startDate) url.searchParams.append('start_date', startDate.toISOString());
  if (endDate) url.searchParams.append('end_date', endDate.toISOString());

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sleep data');
  }
  return await response.json();
};

/** Minimal manual entry: `date`, `bedtime`, `wake_time` as ISO strings (see POST /sleep). */
export const createManualSleep = async (token, payload) => {
  const response = await fetch(`${API_URL}/sleep`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error_message || 'Failed to save sleep entry');
  }
  return body;
};

export const fetchWhoopSleepHistory = async (token) => {
  const url = new URL(`${API_URL}/whoop/sleep-history`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch WHOOP sleep history');
  }
  return await response.json();
};

export const fetchWhoopStatus = async (token) => {
  const response = await fetch(`${API_URL}/whoop/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch WHOOP status');
  }
  return await response.json();
};

/** Requires app login. Returns WHOOP OAuth URL to open (same browser). */
export const fetchWhoopConnectUrl = async (token) => {
  const response = await fetch(`${API_URL}/whoop/connect`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    }
  });
  if (!response.ok) {
    throw new Error('Failed to start WHOOP connection');
  }
  return await response.json();
};

/** Sync always pulls the last 30 days from WHOOP (server-defined window). */
export const syncWhoopData = async (token) => {
  const response = await fetch(`${API_URL}/whoop/sleep`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    }
  });

  if (!response.ok) {
    throw new Error('Failed to sync WHOOP sleep data');
  }
  return await response.json(); 
};

/** Deletes every sleep row for the logged-in user (WHOOP sync can repopulate). */
export const resetAllSleepData = async (token) => {
  const response = await fetch(`${API_URL}/sleep/reset`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error_message || 'Failed to reset sleep data');
  }
  return body;
};