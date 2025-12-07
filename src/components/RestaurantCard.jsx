// src/components/RestaurantCard.jsx
import React from 'react';
import { MapPin, Menu as MenuIcon } from 'lucide-react';

const RestaurantCard = ({ data, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
    <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 relative">
      <div className="absolute bottom-[-20px] left-4 bg-white p-2 rounded-lg shadow-sm">
        <div className="bg-orange-100 p-2 rounded-md">
           <MenuIcon className="w-6 h-6 text-orange-600" />
        </div>
      </div>
    </div>
    <div className="pt-8 p-4">
      <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{data.name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{data.description}</p>
      <div className="mt-4 flex gap-2 text-xs text-gray-400">
        <span className="flex items-center gap-1"><MapPin size={12}/> {data.address}</span>
      </div>
    </div>
  </div>
);

export default RestaurantCard;