// src/pages/LoginView.jsx
import React, { useState } from 'react';
import { User } from 'lucide-react';
import Button from '../components/Button';
import InputGroup from '../components/InputGroup';

const LoginView = ({ onLogin, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Teléfono, 2: Código
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const handleSendCode = (e) => {
    e.preventDefault();
    if(phone.length < 10) return alert("Ingresa un número válido de 10 dígitos");
    alert(`SIMULACIÓN SMS: Tu código de verificación es 123456`);
    setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if(code === '123456') {
      onLogin(phone);
    } else {
      alert("Código incorrecto (Usa 123456)");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-orange-100 rounded-full mb-2">
          <User className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Acceso a Socios</h2>
        <p className="text-sm text-gray-500">Administra tu restaurante</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <InputGroup 
            label="Número Celular" 
            placeholder="Ej: 5512345678" 
            value={phone} 
            onChange={e => setPhone(e.target.value.replace(/\D/,''))} 
            type="tel"
            required
          />
          <div className="flex gap-2 flex-col">
             <Button type="submit" className="w-full">Enviar Código SMS</Button>
             <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <p className="mb-4 text-sm text-center text-gray-600">Hemos enviado un código al {phone}</p>
          <InputGroup 
            label="Código de Verificación" 
            placeholder="123456" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            type="number"
            required
          />
          <Button type="submit" className="w-full">Verificar y Entrar</Button>
          <button type="button" onClick={() => setStep(1)} className="mt-4 text-sm text-orange-600 hover:underline w-full text-center">Cambiar número</button>
        </form>
      )}
    </div>
  );
};

export default LoginView;