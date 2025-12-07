// src/pages/RestaurantDetail.jsx
import React from 'react';
import { MapPin, Phone, Clock, Edit, Trash2, ChevronLeft } from 'lucide-react';
import Button from '../components/Button';

const RestaurantDetail = ({ restaurant, onBack, isOwner, onEdit, onDelete }) => {
  if (!restaurant) return null;

  const handleCall = () => {
    window.location.href = `tel:${restaurant.phone}`;
  };

  const handleMap = () => {
    const query = restaurant.coords ? restaurant.coords : restaurant.address;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button onClick={onBack} className="mb-4 flex items-center text-gray-500 hover:text-orange-600 transition">
        <ChevronLeft size={20}/> Volver al catálogo
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="h-48 bg-gray-800 relative">
          <img src={`https://source.unsplash.com/800x400/?restaurant,food`} alt="Cover" className="w-full h-full object-cover opacity-60" />
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-200">{restaurant.description}</p>
          </div>
        </div>
        
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100">
          <Button onClick={handleCall} className="flex-1 md:flex-none">
            <Phone size={18}/> Llamar
          </Button>
          <Button onClick={handleMap} variant="outline" className="flex-1 md:flex-none">
            <MapPin size={18}/> Ubicación
          </Button>
          
          {isOwner && (
            <div className="ml-auto flex gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
              <Button onClick={() => onEdit(restaurant)} variant="secondary" className="flex-1">
                <Edit size={16}/> Editar
              </Button>
              <Button onClick={() => onDelete(restaurant.id)} variant="danger" className="flex-1">
                <Trash2 size={16}/> Borrar
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                <Clock size={18} className="text-orange-500"/> Horarios
              </h3>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{restaurant.schedule}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-orange-500"/> Dirección
              </h3>
              <p className="text-gray-600 text-sm">{restaurant.address}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Menú</h2>
            <div className="space-y-4">
              {restaurant.menu && restaurant.menu.length > 0 ? (
                restaurant.menu.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                    </div>
                    <div className="text-orange-600 font-bold text-lg">
                      ${item.price}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">Menú no disponible por el momento.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;