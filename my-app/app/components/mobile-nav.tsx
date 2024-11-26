import React, { useState } from 'react';
import Link from 'next/link';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <nav className="flex flex-col p-4">
            <Link href="/" className="py-2 text-gray-700 hover:text-blue-500">
              Home
            </Link>
            <Link href="/single-dice" className="py-2 text-gray-700 hover:text-blue-500">
              Single Dice
            </Link>
            <Link href="/double-dice" className="py-2 text-gray-700 hover:text-blue-500">
              Double Dice
            </Link>
            <Link href="/head-or-tail" className="py-2 text-gray-700 hover:text-blue-500">
              Head or Tail
            </Link>
            <Link href="/rock-paper" className="py-2 text-gray-700 hover:text-blue-500">
              Rock Paper Scissors
            </Link>
            <Link href="/rock-paper-plus" className="py-2 text-gray-700 hover:text-blue-500">
              Rock Paper Scissors Plus
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
