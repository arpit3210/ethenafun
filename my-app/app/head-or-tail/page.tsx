import React from 'react';

const HeadOrTailPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Head or Tail Game</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4">Choose Your Side</h2>
          <div className="flex justify-center gap-4 mb-6">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors">
              Head
            </button>
            <button className="bg-purple-500 text-white px-8 py-3 rounded-full hover:bg-purple-600 transition-colors">
              Tail
            </button>
          </div>
          {/* Result display will go here */}
        </div>
      </div>
    </div>
  );
};

export default HeadOrTailPage;
