import React from 'react';

const RockPaperPlusPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rock Paper Scissors Plus</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4">Make Your Choice</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-colors">
              Rock
            </button>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors">
              Paper
            </button>
            <button className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
              Scissors
            </button>
            <button className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors">
              Lizard
            </button>
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 transition-colors">
              Spock
            </button>
          </div>
          {/* Game result will be displayed here */}
        </div>
      </div>
    </div>
  );
};

export default RockPaperPlusPage;
