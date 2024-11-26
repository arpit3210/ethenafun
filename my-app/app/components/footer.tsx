import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">EthenaFun</h3>
            <p className="text-gray-400">Play, Win, and Earn</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-400">Privacy</a>
            <a href="#" className="hover:text-blue-400">Contact</a>
          </div>
        </div>
        <div className="mt-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EthenaFun. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
