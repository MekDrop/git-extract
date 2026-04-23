const BASE = 'https://api.github.com'

export async function fetchCurrentUser(token) {
  const res = await fetch(`${BASE}/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  return res.json()
}
