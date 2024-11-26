import React from 'react';

const SingleDicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Single Dice Game</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4">Roll the Dice</h2>
          {/* Game implementation will go here */}
          <button className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors">
            Roll Dice
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleDicePage;
