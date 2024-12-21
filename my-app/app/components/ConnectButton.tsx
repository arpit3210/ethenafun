'use client';

import { useState, useEffect } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Power } from 'lucide-react';
import { truncateAddress } from '../utils/format';

const ConnectButton = () => {
  const {
    account,
    balance,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork
  } = useWeb3Context();

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
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Balance: </span>
        <span className="font-medium">{balance} USDe</span>
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
  );
};

export default ConnectButton;
