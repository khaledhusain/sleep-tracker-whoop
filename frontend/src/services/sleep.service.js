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