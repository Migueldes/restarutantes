// src/pages/RestaurantForm.jsx
import React, { useState } from 'react';
import { MapPin, Menu as MenuIcon, Plus, Trash2, X, Clock, Search } from 'lucide-react';
import Button from '../components/Button';
import InputGroup from '../components/InputGroup';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationFound, setLocationFound] = useState(false);

  const [scheduleData, setScheduleData] = useState(() => {
    return DAYS.map(day => ({
      day,
      open: '09:00',
      close: '18:00',
      isOpen: true
    }));
  });

  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if(field === 'address') setLocationFound(false);
  };

  const handleSearchLocation = async () => {
    if(!formData.address) return alert("Escribe una dirección primero.");
    
    setSearchingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      const data = await response.json();

      if(data && data.length > 0) {
        const bestMatch = data[0];
        const coords = `${bestMatch.lat},${bestMatch.lon}`;
        
        setFormData(prev => ({ ...prev, coords: coords }));
        setLocationFound(true);
        alert(`Ubicación encontrada!\nLat: ${bestMatch.lat}\nLon: ${bestMatch.lon}`);
      } else {
        alert("No pudimos encontrar esa dirección. Intenta ser más específico (Calle, Número, Ciudad, País).");
        setLocationFound(false);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servicio de mapas.");
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...scheduleData];
    newSchedule[index][field] = value;
    setScheduleData(newSchedule);
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
    const scheduleString = scheduleData.map(d => {
        if (!d.isOpen) return `${d.day.substring(0,3)}: Cerrado`;
        return `${d.day.substring(0,3)}: ${d.open}-${d.close}`;
    }).join(', ');

    onSave({ ...formData, schedule: scheduleString });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md pb-24">
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
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física *</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={formData.address} 
                    onChange={e => handleChange('address', e.target.value)} 
                    placeholder="Ej: Av. Reforma 222, CDMX, Mexico"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                />
                <button 
                    type="button" 
                    onClick={handleSearchLocation}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-colors ${locationFound ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={searchingLocation}
                >
                    {searchingLocation ? 'Buscando...' : <><Search size={18}/> {locationFound ? 'Verificado' : 'Validar'}</>}
                </button>
            </div>
            {/* EMOJI ELIMINADO AQUÍ TAMBIÉN */}
            {locationFound && <p className="text-xs text-green-600 mt-1 font-medium">Coordenadas GPS detectadas: {formData.coords}</p>}
        </div>

        <div className="mb-6 border rounded-lg overflow-hidden">
            <div className="bg-orange-50 p-3 border-b flex items-center gap-2">
                <Clock size={18} className="text-orange-600"/>
                <h3 className="font-bold text-orange-800">Horarios de Apertura</h3>
            </div>
            <div className="p-4 bg-white max-h-60 overflow-y-auto">
                <div className="grid gap-2">
                    {scheduleData.map((item, index) => (
                        <div key={item.day} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0">
                            <span className="w-24 font-medium text-gray-700">{item.day}</span>
                            {item.isOpen ? (
                                <div className="flex items-center gap-2">
                                    <input type="time" value={item.open} onChange={(e) => handleScheduleChange(index, 'open', e.target.value)} className="border rounded px-2 py-1 text-sm bg-white"/>
                                    <span className="text-gray-400">-</span>
                                    <input type="time" value={item.close} onChange={(e) => handleScheduleChange(index, 'close', e.target.value)} className="border rounded px-2 py-1 text-sm bg-white"/>
                                </div>
                            ) : (
                                <span className="text-gray-400 italic text-sm flex-1 text-center">-- Cerrado --</span>
                            )}
                            <label className="flex items-center gap-2 cursor-pointer ml-4 w-24 justify-end">
                                <span className={`text-xs font-bold ${item.isOpen ? 'text-green-600' : 'text-red-500'}`}>{item.isOpen ? 'ABIERTO' : 'CERRADO'}</span>
                                <input type="checkbox" checked={item.isOpen} onChange={(e) => handleScheduleChange(index, 'isOpen', e.target.checked)} className="accent-orange-600 w-4 h-4"/>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MenuIcon size={20}/> Menú Digital</h3>
          <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
            <input placeholder="Nombre del platillo" className="flex-1 p-2 border rounded" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}/>
            <input placeholder="Precio ($)" type="number" className="w-24 p-2 border rounded" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}/>
            <button type="button" onClick={addMenuItem} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><Plus size={20}/></button>
          </div>
          <div className="space-y-2">
            {formData.menu.length === 0 && <p className="text-gray-400 text-sm italic">No has agregado platillos aún.</p>}
            {formData.menu.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                <div><span className="font-medium">{item.name}</span><span className="text-orange-600 font-bold ml-2">${item.price}</span></div>
                <button type="button" onClick={() => removeMenuItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
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