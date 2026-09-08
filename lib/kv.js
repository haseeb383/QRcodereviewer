export async function getKV() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  if (!url || !token) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set');
  }
  
  return { url, token };
}

export async function kvGet(key) {
  const { url, token } = await getKV();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

export async function kvSet(key, value) {
  const { url, token } = await getKV();
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(value)
  });
  return res.ok;
}

export async function kvDel(key) {
  const { url, token } = await getKV();
  const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok;
}

export async function kvKeys(pattern = '*') {
  const { url, token } = await getKV();
  const res = await fetch(`${url}/keys/${encodeURIComponent(pattern)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.result || [];
}