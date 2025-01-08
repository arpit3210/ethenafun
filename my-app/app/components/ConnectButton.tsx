'use client';

import { useState, useEffect } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Power } from 'lucide-react';
import { truncateAddress } from '../utils/format';
import { formatUSDe } from '../frontend_files_for_contract_integration/contractConfig';

const ConnectButton = () => {
  const {
    account,
    balance,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork
  } = useWeb3Context();



  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!account) {
      intervalId = setInterval(() => {
        try {
          connect();
          console.log("Attempting to connect wallet...");
        } catch (error) {
          console.error("Connection attempt failed:", error);
        }
      }, 3000); // Retry every 3 seconds
    }

    // Clear interval when account is connected or component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [account, connect]);


  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
    }
  };

  const openEtherscan = () => {
    if (account) {
      window.open(`https://testnet.explorer.ethena.fi/address/${account}`, '_blank');
    }
  };

  if (!account) {
    return (
      <Button onClick={connect} variant="outline" className="gap-2">
        <Power className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Button onClick={switchNetwork} variant="destructive" className="gap-2">
        Switch to Ethena Network
      </Button>
    );
  }

  return (
    <div>
      <div className="hidden lg:block">
        <div className="flex lg:flex items-center gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground ">Balance: </span>
            <span className="font-medium">{formatUSDe(balance)} USDe</span>
          </div>
          <Button variant="outline" className="gap-2" onClick={copyAddress}>
            <Copy className="h-4 w-4" />
            {truncateAddress(account)}
          </Button>
          <Button variant="ghost" size="icon" onClick={openEtherscan}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={disconnect}>
            <Power className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className='lg:hidden'>
      <div className="flex lg:flex items-center gap-2">
          <div className="text-sm">
            {/* <span className="text-muted-foreground text-sm ">Balance: </span> */}
            <span className="font-medium">{balance} USDe</span>
          </div>
          {/* <Button variant="outline" className="gap-2" onClick={copyAddress}>
            <Copy className="h-2 w-2" />
            {truncateAddress(account)}
          </Button> */}
          {/* <Button variant="ghost" size="icon" onClick={openEtherscan}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={disconnect}>
            <Power className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

    </div>
  );
};

export default ConnectButton;
