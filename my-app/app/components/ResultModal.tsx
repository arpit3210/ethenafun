import React from 'react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    isWin: boolean | undefined;
    amount: string;
    multiplier: number;
    fulfilled: boolean;
  } | null;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const winAmount = parseFloat(result.amount) * result.multiplier;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="text-center">
          {!result.fulfilled ? (
            <div className="animate-pulse">
              <div className="text-6xl mb-4">🎲</div>
              <h2 className="text-3xl font-bold mb-4 text-blue-500">Processing...</h2>
              <p className="text-gray-300">Please wait while we confirm your result</p>
            </div>
          ) : (
            <>
              <div className={`text-6xl mb-4 ${result.isWin === true ? 'text-green-500' : result.isWin === false ? 'text-red-500' : 'text-gray-500'}`}>
                {result.isWin === true ? '🎉' : result.isWin === false ? '😢' : '❓'}
              </div>
              <h2 className={`text-3xl font-bold mb-4 ${result.isWin === true ? 'text-green-500' : result.isWin === false ? 'text-red-500' : 'text-gray-500'}`}>
                {result.isWin === true ? 'You Won!' : result.isWin === false ? 'You Lost' : 'Result Pending'}
              </h2>
              <div className="text-gray-300 mb-6">
                {result.isWin === true ? (
                  <div>
                    <p className="text-xl">You won {winAmount.toFixed(2)} USDe</p>
                    <p className="text-sm text-gray-400">({result.multiplier}x multiplier)</p>
                  </div>
                ) : result.isWin === false ? (
                  <p className="text-xl">You lost {result.amount} USDe</p>
                ) : (
                  <p className="text-xl text-gray-500">Waiting for game result...</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {result.isWin === undefined ? 'Cancel' : 'Play Again'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
