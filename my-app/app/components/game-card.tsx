import React from 'react';
import Link from 'next/link';

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
}

const GameCard = ({ title, description, href, imageUrl }: GameCardProps) => {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {imageUrl && (
          <div className="h-48 w-full overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
          <div className="mt-4">
            <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
              Play Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
