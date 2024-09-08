export function formatWalletAddress(address: string): string {
  const prefix = address.slice(0, 4); // "0x" plus first two characters
  const suffix = address.slice(-4);   // Last four characters

  return `${prefix}...${suffix}`;
}