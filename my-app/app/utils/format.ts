import { ethers } from 'ethers';

export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string): string => {
  const number = parseFloat(balance);
  if (isNaN(number)) return '0';
  return number.toFixed(4);
};

export const formatNumberForContract = (value: string | number, decimals: number = 18): string => {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    return ethers.parseUnits(numValue.toString(), decimals).toString();
  } catch (error) {
    console.error('Error formatting number for contract:', error);
    return '0';
  }
};
