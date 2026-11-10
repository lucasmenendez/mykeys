export function tryDecrypt(encryptedData, passphrase) {
  const result = window.MyKeysCLI.list(encryptedData, passphrase);
  if (result.error) return { error: result.error };
  try {
    return { data: JSON.parse(result.data) };
  } catch (e) {
    return { error: 'Failed to parse decrypted data.' };
  }
}

export function trySet(encryptedData, passphrase, alias, username, password) {
  return window.MyKeysCLI.set(encryptedData, passphrase, alias, username, password);
}

export async function waitForWasm(timeout = 10000) {
  const start = Date.now();
  while (!window.MyKeysCLI) {
    if (Date.now() - start > timeout) {
      throw new Error('WASM module failed to load. Please reload the page.');
    }
    await new Promise(r => setTimeout(r, 50));
  }
}
