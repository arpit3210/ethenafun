export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string): string => {
  const number = parseFloat(balance);
  if (isNaN(number)) return '0';
  return number.toFixed(4);
};
