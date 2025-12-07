// src/pages/RestaurantForm.jsx
import React, { useState } from 'react';
import { MapPin, Menu as MenuIcon, Plus, Trash2, X } from 'lucide-react';
import Button from '../components/Button';
import InputGroup from '../components/InputGroup';

const RestaurantForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    phone: '',
    address: '',
    coords: '', 
    schedule: '',
    menu: []
  });

  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMenuItem = () => {
    if (!newItem.name || !newItem.price) return;
    setFormData(prev => ({
      ...prev,
      menu: [...prev.menu, { ...newItem, id: Date.now() }]
    }));
    setNewItem({ name: '', price: '' });
  };

  const removeMenuItem = (id) => {
    setFormData(prev => ({
      ...prev,
      menu: prev.menu.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Restaurante' : 'Registrar Nuevo Restaurante'}</h2>
        <button onClick={onCancel}><X className="text-gray-400 hover:text-gray-600"/></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Nombre del Restaurante" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
          <InputGroup label="Teléfono (Para pedidos)" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} type="tel" required />
        </div>
        
        <InputGroup label="Descripción Corta" value={formData.description} onChange={e => handleChange('description', e.target.value)} required />
        <InputGroup label="Dirección Física" value={formData.address} onChange={e => handleChange('address', e.target.value)} required />
        <InputGroup label="Horarios (Texto simple)" value={formData.schedule} onChange={e => handleChange('schedule', e.target.value)} placeholder="Ej: Lun-Vie 9am-6pm" required />
        
        <div className="p-4 bg-blue-50 rounded-lg mb-4 text-sm text-blue-800">
           <p className="font-bold flex items-center gap-2"><MapPin size={16}/> Ubicación (Simulada)</p>
           <p>En una app real, aquí aparecería un selector de mapa. Por ahora, usaremos coordenadas genéricas.</p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MenuIcon size={20}/> Menú Digital</h3>
          
          <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
            <input 
              placeholder="Nombre del platillo" 
              className="flex-1 p-2 border rounded"
              value={newItem.name}
              onChange={e => setNewItem({...newItem, name: e.target.value})}
            />
            <input 
              placeholder="Precio ($)" 
              type="number"
              className="w-24 p-2 border rounded"
              value={newItem.price}
              onChange={e => setNewItem({...newItem, price: e.target.value})}
            />
            <button type="button" onClick={addMenuItem} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
              <Plus size={20}/>
            </button>
          </div>

          <div className="space-y-2">
            {formData.menu.length === 0 && <p className="text-gray-400 text-sm italic">No has agregado platillos aún.</p>}
            {formData.menu.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-orange-600 font-bold ml-2">${item.price}</span>
                </div>
                <button type="button" onClick={() => removeMenuItem(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button type="submit" className="flex-1">Guardar Restaurante</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantForm;