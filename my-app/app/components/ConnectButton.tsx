'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Power } from 'lucide-react';
import { truncateAddress } from '../utils/format';
import { ethers } from 'ethers';
import { USD_TOKEN_ABI } from '../constants/usdTokenAbi';
import dynamic from 'next/dynamic';

const ConnectButton = () => {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const USD_TOKEN_ADDRESS = '0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE';

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
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
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [mounted]);

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
      if (typeof window !== 'undefined' && window.ethereum) {
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
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (error) {
      console.error('Error updating chain ID:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
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
    console.log('Disconnecting wallet...');
    setAccount(null);
    setBalance('0');
    setChainId(null);
  };

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        alert('Address copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const openExplorer = () => {
    if (account) {
      const explorerUrl = `https://testnet.explorer.ethena.fi/address/${account}`;
      window.open(explorerUrl, '_blank');
    }
  };

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) return null;

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
        <div className="text-sm text-zinc-400">
          Ethena Testnet Chain
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg hover:bg-zinc-800"
          onClick={copyAddress}
        >
          <span className="text-sm">{truncateAddress(account)}</span>
          <Copy className="w-4 h-4 cursor-pointer" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-zinc-800"
          onClick={openExplorer}
        >
          <ExternalLink className="w-4 h-4 cursor-pointer" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-zinc-800"
          onClick={disconnectWallet}
        >
          <Power className="w-5 h-5 cursor-pointer" />
        </Button>
      </div>
    </div>
  );
};

// Export as a dynamic component with SSR disabled
export default dynamic(() => Promise.resolve(ConnectButton), {
  ssr: false
});
