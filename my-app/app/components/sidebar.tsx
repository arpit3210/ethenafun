import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800 text-white h-screen fixed">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">EthenaFun</h2>
        <nav className="space-y-4">
          <Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded">
            Home
          </Link>
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2">Games</h3>
            <Link href="/single-dice" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Single Dice
            </Link>
            <Link href="/double-dice" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Double Dice
            </Link>
            <Link href="/head-or-tail" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Head or Tail
            </Link>
            <Link href="/rock-paper" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Rock Paper Scissors
            </Link>
            <Link href="/rock-paper-plus" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Rock Paper Scissors Plus
            </Link>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2">Account</h3>
            <Link href="/transactions" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Transaction History
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
