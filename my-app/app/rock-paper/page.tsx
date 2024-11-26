import React from 'react';

const RockPaperPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rock Paper Scissors</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4">Make Your Choice</h2>
          <div className="flex justify-center gap-4 mb-6">
            <button className="bg-gray-500 text-white px-8 py-3 rounded-full hover:bg-gray-600 transition-colors">
              Rock
            </button>
            <button className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors">
              Paper
            </button>
            <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition-colors">
              Scissors
            </button>
          </div>
          {/* Game result will be displayed here */}
        </div>
      </div>
    </div>
  );
};

export default RockPaperPage;
