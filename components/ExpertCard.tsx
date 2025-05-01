import React from 'react';

interface Expert {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  image: string;
}

interface ExpertCardProps {
  expert: Expert;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img src={expert.image} alt={expert.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{expert.name}</h2>
        <p className="text-gray-700 mb-4">{expert.description}</p>
        <div className="text-sm text-gray-500">
          <p>Latitude: {expert.location.lat}</p>
          <p>Longitude: {expert.location.lng}</p>
        </div>
      </div>
    </div>
  );
};
