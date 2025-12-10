// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Plus, LogOut, Search, User, Store } from 'lucide-react';
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
  
  // Nuevo estado: Controla si estamos viendo "Solo Míos" o "Todos"
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const API_URL = 'http://localhost:3001/api/restaurants';

  const fetchRestaurants = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setRestaurants(data))
      .catch(err => console.error("Error conectando al servidor:", err));
  };

  useEffect(() => {
    fetchRestaurants();
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser) {
      setUser(JSON.parse(savedUser));
      // Si hay usuario guardado, activamos "Mis Restaurantes" por defecto
      setShowOnlyMine(true);
    }
  }, []);

  const handleLogin = (phone) => {
    // AQUI ESTA LA MAGIA: El ID del usuario AHORA ES SU TELEFONO
    const newUser = { phone, id: phone }; 
    
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setShowOnlyMine(true); // Al entrar, mostrar solo mis restaurantes
    setView('catalog');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setShowOnlyMine(false); // Al salir, mostrar todo el catálogo
    setView('catalog');
  };

  const handleSaveRestaurant = (data) => {
    const payload = { ...data, ownerId: user.id };
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `${API_URL}/${data.id}` : API_URL;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if(res.ok) {
            fetchRestaurants();
            setView('catalog');
        } else {
            alert("Error al guardar");
        }
    });
  };

  const handleDeleteRestaurant = (id) => {
    if(confirm("¿Estás seguro de eliminar tu restaurante?")) {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(res => {
          if(res.ok) {
              fetchRestaurants(); 
              setView('catalog');
          }
      });
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

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showOnlyMine && user) {
      const ownerIdDB = String(r.owner_id || '').replace(/\D/g, '');
      const userIdApp = String(user.id || '').replace(/\D/g, '');
      return matchesSearch && (ownerIdDB === userIdApp);
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => { setView('catalog'); setShowOnlyMine(false); }}>
              <div className="bg-orange-500 p-2 rounded-lg mr-2">
                <MenuIcon className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800">Gastro<span className="text-orange-600">Catálogo</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <User size={14}/> {user.phone}
                  </span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2" title="Cerrar Sesión">
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
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {showOnlyMine ? 'Mis Restaurantes' : 'Descubre sabores locales'}
                  </h1>
                  <p className="text-gray-500">
                    {showOnlyMine ? 'Gestiona tus locales desde aquí.' : 'Los mejores restaurantes a un clic de distancia.'}
                  </p>
                </div>
                
                <div className="relative w-full md:w-96">
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"/>
                </div>
              </div>

              {/* BARRA DE CONTROL PARA DUEÑOS */}
              {user && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <button 
                    onClick={() => setShowOnlyMine(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!showOnlyMine ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                  >
                    Ver Todo el Catálogo
                  </button>
                  <button 
                    onClick={() => setShowOnlyMine(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${showOnlyMine ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                  >
                    <Store size={16}/> Ver Mis Restaurantes
                  </button>
                  <div className="flex-1"></div>
                  <Button onClick={startCreate} className="whitespace-nowrap">
                    <Plus size={16}/> Nuevo Restaurante
                  </Button>
                </div>
              )}
            </div>

            {filteredRestaurants.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
                 <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                    <Store className="text-gray-300 w-8 h-8"/>
                 </div>
                 <p className="text-gray-500 font-medium">No se encontraron restaurantes.</p>
                 {showOnlyMine && (
                   <p className="text-sm text-gray-400 mt-1">Aún no has registrado ningún restaurante con el número {user.phone}.</p>
                 )}
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

        {view === 'login' && <LoginView onLogin={handleLogin} onCancel={() => setView('catalog')} />}

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
            isOwner={user && String(user.id) === String(selectedRestaurant.owner_id)}
            onEdit={startEdit}
            onDelete={handleDeleteRestaurant}
          />
        )}
      </main>
    </div>
  );
}