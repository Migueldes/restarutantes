import React, { useState } from 'react';
import { User } from 'lucide-react';
import Button from '../components/Button';
import InputGroup from '../components/InputGroup';

const LoginView = ({ onLogin, onCancel }) => {
  const [step, setStep] = useState(1); 
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // IMPORTANTE: Twilio necesita el formato internacional
  // Si escribes 10 dígitos, asumimos que es México (+52). 
  // Si eres de otro país, cambia el +52 por tu código.
  const formatPhone = (p) => {
    if (p.startsWith('+')) return p;
    return `+52${p}`; 
  };

  // --- PASO 1: ENVIAR EL CÓDIGO (Conectando al Servidor Real) ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    if(phone.length < 10) return alert("Ingresa un número válido");
    
    setLoading(true);

    try {
      // Aquí hacemos la petición real a tu servidor
      const res = await fetch('http://localhost:3001/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatPhone(phone) })
      });
      
      const data = await responseTimeout(res); // Pequeña ayuda por si tarda
      
      if (data.success) {
        setStep(2); // Si Twilio dijo "OK", pasamos a pedir el código
      } else {
        alert("Error enviando SMS: " + (data.error || "Revisa el número"));
      }
    } catch (err) {
      console.error(err);
      alert("Error: Asegúrate que el servidor (node index.js) esté encendido.");
    } finally {
      setLoading(false);
    }
  };

  // --- PASO 2: VERIFICAR EL CÓDIGO ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatPhone(phone), code })
      });

      const data = await responseTimeout(res);

      if (data.success) {
        onLogin(formatPhone(phone)); // ¡Login Real Exitoso!
      } else {
        alert("Código incorrecto o expirado.");
      }
    } catch (err) {
      alert("Error al verificar código.");
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para leer la respuesta de forma segura
  const responseTimeout = async (res) => {
      const data = await res.json();
      return data;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-orange-100 rounded-full mb-2">
          <User className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Acceso Dueños</h2>
        <p className="text-sm text-gray-500">Sistema de Verificación Real</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <InputGroup 
            label="Número Celular (10 dígitos)" 
            placeholder="Ej: 5512345678" 
            value={phone} 
            onChange={e => setPhone(e.target.value.replace(/\D/,''))} 
            type="tel"
            required
          />
          <div className="flex gap-2 flex-col">
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? 'Enviando a Twilio...' : 'Enviar Código SMS'}
             </Button>
             <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <p className="mb-4 text-sm text-center text-gray-600">
            Ingresa el código enviado a {formatPhone(phone)}
          </p>
          <InputGroup 
            label="Código de Verificación" 
            placeholder="Ej: 123456" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            type="number"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar y Entrar'}
          </Button>
          <button type="button" onClick={() => setStep(1)} className="mt-4 text-sm text-orange-600 hover:underline w-full text-center">Cambiar número</button>
        </form>
      )}
    </div>
  );
};

export default LoginView;