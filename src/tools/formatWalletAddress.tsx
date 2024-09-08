export function formatWalletAddress(address: string, size?: number): string {
  if (!size) {
    size = 4;
  }

  const prefix = address.slice(0, size); // "0x" plus first two characters
  const suffix = address.slice(-size);   // Last four characters

  return `${prefix}...${suffix}`;
}