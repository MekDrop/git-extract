import { box } from 'tweetnacl'

export async function encryptForGitHub(base64PublicKey, secretValue) {
  const repoKey = Uint8Array.from(atob(base64PublicKey), (c) => c.charCodeAt(0))
  const ephemeral = box.keyPair()
  const nonce = crypto.getRandomValues(new Uint8Array(24))
  const msg = new TextEncoder().encode(secretValue)
  const sealed = box(msg, nonce, repoKey, ephemeral.secretKey)
  const out = new Uint8Array(ephemeral.publicKey.length + nonce.length + sealed.length)
  out.set(ephemeral.publicKey, 0)
  out.set(nonce, ephemeral.publicKey.length)
  out.set(sealed, ephemeral.publicKey.length + nonce.length)
  return btoa(String.fromCharCode(...out))
}
