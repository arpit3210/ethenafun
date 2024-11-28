'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Power } from 'lucide-react';
import { truncateAddress } from '../utils/format';
import { ethers } from 'ethers';
import { USD_TOKEN_ABI } from '../constants/usdTokenAbi';

const ConnectButton = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const USD_TOKEN_ADDRESS = '0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            handleAccountsChanged(accounts);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance('0');
    } else {
      setAccount(accounts[0]);
      await getBalance(accounts[0]);
      await updateChainId();
    }
  };

  const handleChainChanged = async () => {
    await updateChainId();
    if (account) {
      await getBalance(account);
    }
  };

  const getBalance = async (address: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(USD_TOKEN_ADDRESS, USD_TOKEN_ABI, signer);
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(address);
        const formattedBalance = ethers.formatUnits(balance, decimals);
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error('Error getting USD token balance:', error);
      setBalance('0');
    }
  };

  const updateChainId = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (error) {
      console.error('Error updating chain ID:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setChainId(null);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  const openExplorer = () => {
    if (account) {
      // Replace with your network's explorer URL
      const explorerUrl = `https://testnet.explorer.ethena.fi//address/${account}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (!account) {
    return (
      <Button 
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-4 lg:px-6 transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={connectWallet}
      >
        CONNECT WALLET
      </Button>
    );
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-2 lg:gap-4`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
        <div className="flex items-center gap-2">
          <span>{parseFloat(balance).toFixed(2)} USD</span>
          <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />
        </div>
        <div className="text-sm text-zinc-400 hidden lg:block">
          {chainId === 52085143 ? 'Ethena Network Testnet' : 'Unknown Network'}
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
        <span className="text-sm">{truncateAddress(account)}</span>
        <button onClick={copyAddress} className="hover:text-purple-500">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={openExplorer} className="hover:text-purple-500">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <Button 
        variant="ghost" 
        size="icon"
        onClick={disconnectWallet}
        className="hover:text-red-500"
      >
        <Power className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default ConnectButton;
