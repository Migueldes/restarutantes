// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Plus, LogOut, Search } from 'lucide-react';
import { MOCK_DB_INITIAL } from './data/mockData';
import Button from './components/Button';
import RestaurantCard from './components/RestaurantCard';
import LoginView from './pages/LoginView';
import RestaurantForm from './pages/RestaurantForm';
import RestaurantDetail from './pages/RestaurantDetail';

export default function App() {
  const [view, setView] = useState('catalog'); 
  const [restaurants, setRestaurants] = useState([]);
  const [user, setUser] = useState(null); 
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('restaurants');
    if (saved) {
      setRestaurants(JSON.parse(saved));
    } else {
      setRestaurants(MOCK_DB_INITIAL);
      localStorage.setItem('restaurants', JSON.stringify(MOCK_DB_INITIAL));
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const updateRestaurantsPersistence = (newData) => {
    setRestaurants(newData);
    localStorage.setItem('restaurants', JSON.stringify(newData));
  };

  const handleLogin = (phone) => {
    const newUser = { phone, id: 'user_' + phone };
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setView('catalog');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setView('catalog');
  };

  const handleSaveRestaurant = (data) => {
    let updatedList;
    if (data.id) {
      updatedList = restaurants.map(r => r.id === data.id ? data : r);
    } else {
      const newRestaurant = { ...data, id: Date.now(), ownerId: user.id };
      updatedList = [...restaurants, newRestaurant];
    }
    updateRestaurantsPersistence(updatedList);
    setView('catalog');
  };

  const handleDeleteRestaurant = (id) => {
    if(confirm("¿Estás seguro de que quieres eliminar este restaurante permanentemente?")) {
      const updatedList = restaurants.filter(r => r.id !== id);
      updateRestaurantsPersistence(updatedList);
      setView('catalog');
    }
  };

  const openDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setView('details');
  };

  const startEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setView('register');
  };

  const startCreate = () => {
    setSelectedRestaurant(null);
    setView('register');
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setView('catalog')}>
              <div className="bg-orange-500 p-2 rounded-lg mr-2">
                <MenuIcon className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800">Gastro<span className="text-orange-600">Catálogo</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden md:block text-sm text-gray-600">Hola, {user.phone}</span>
                  <Button onClick={startCreate} size="sm" className="hidden md:flex">
                    <Plus size={16}/> Registrar Restaurante
                  </Button>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2">
                    <LogOut size={20}/>
                  </button>
                </div>
              ) : (
                <Button onClick={() => setView('login')} variant="outline">
                  Soy Dueño
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'catalog' && (
          <>
            <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Descubre sabores locales</h1>
                <p className="text-gray-500">Los mejores restaurantes a un clic de distancia.</p>
              </div>
              
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Buscar antojitos, lugares..." 
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"/>
              </div>
            </div>

            {user && (
              <div className="md:hidden mb-6">
                 <Button onClick={startCreate} className="w-full">
                    <Plus size={16}/> Registrar Restaurante
                  </Button>
              </div>
            )}

            {filteredRestaurants.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                 <p className="text-gray-400">No encontramos restaurantes con esa búsqueda.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map(rest => (
                  <RestaurantCard key={rest.id} data={rest} onClick={() => openDetails(rest)} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'login' && (
          <LoginView onLogin={handleLogin} onCancel={() => setView('catalog')} />
        )}

        {view === 'register' && user && (
          <RestaurantForm 
            initialData={selectedRestaurant} 
            onSave={handleSaveRestaurant} 
            onCancel={() => setView('catalog')} 
          />
        )}

        {view === 'details' && selectedRestaurant && (
          <RestaurantDetail 
            restaurant={selectedRestaurant} 
            onBack={() => setView('catalog')}
            isOwner={user && (user.id === selectedRestaurant.ownerId || user.id === 'user_' + user.phone)}
            onEdit={startEdit}
            onDelete={handleDeleteRestaurant}
          />
        )}

      </main>
    </div>
  );
}