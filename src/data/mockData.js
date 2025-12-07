// src/data/mockData.js

export const MOCK_DB_INITIAL = [
    {
      id: 1,
      name: "El Fogón Tradicional",
      description: "La mejor comida casera y cortes de carne.",
      phone: "5551234567",
      coords: "19.432608,-99.133209", // CDMX coordenadas ejemplo
      address: "Calle Principal #123",
      schedule: "Lunes a Viernes: 9am - 6pm",
      menu: [
        { id: 1, name: "Arrachera", price: 250 },
        { id: 2, name: "Sopa Azteca", price: 90 }
      ],
      ownerId: "user1"
    },
    {
      id: 2,
      name: "Sushi Express",
      description: "Rollos frescos y comida japonesa rápida.",
      phone: "5559876543",
      coords: "19.432608,-99.133209",
      address: "Av. Reforma #400",
      schedule: "Diario: 12pm - 10pm",
      menu: [
        { id: 1, name: "California Roll", price: 120 },
        { id: 2, name: "Ramen", price: 150 }
      ],
      ownerId: "admin"
    }
  ];