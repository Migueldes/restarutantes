// src/pages/LoginView.jsx
import React, { useState, useEffect } from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Importamos la config que creaste
import Button from '../components/Button';
import InputGroup from '../components/InputGroup';

const LoginView = ({ onLogin, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Teléfono, 2: Código
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null); // Objeto para confirmar el código

  // Formatear a +52 (México) si no tiene código de país
  const formatPhone = (p) => {
    if (p.startsWith('+')) return p;
    return `+52${p}`; 
  };

  // Inicializar Recaptcha Invisible (Requisito de Google)
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved automatically
        }
      });
    }
  }, []);

  // --- PASO 1: PEDIR EL SMS A GOOGLE ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    if(phone.length < 10) return alert("Número inválido");
    
    setLoading(true);
    const phoneNumber = formatPhone(phone);

    try {
      const appVerifier = window.recaptchaVerifier;
      // Esta función de Firebase envía el SMS real
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setConfirmObj(confirmation); // Guardamos la "promesa" de confirmación
      setStep(2);
      alert("SMS enviado. Revisa tu celular.");
    } catch (error) {
      console.error("Error SMS:", error);
      alert("Error enviando SMS: " + error.message);
      // Si falla, reseteamos el captcha
      if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  // --- PASO 2: VERIFICAR EL CÓDIGO CON GOOGLE ---
  const handleVerify = async (e) => {
    e.preventDefault();
    if(!otp || !confirmObj) return;
    
    setLoading(true);
    try {
      // Le preguntamos a Firebase si el código es correcto
      const result = await confirmObj.confirm(otp);
      
      // Si llegamos aquí, ¡es correcto!
      const user = result.user;
      console.log("Usuario verificado:", user);
      
      // Iniciamos sesión en TU app
      onLogin(user.phoneNumber); 
    } catch (error) {
      alert("Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-orange-100 rounded-full mb-2">
          {step === 1 ? <User className="w-8 h-8 text-orange-600" /> : <ShieldCheck className="w-8 h-8 text-green-600"/>}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {step === 1 ? 'Acceso Telefónico' : 'Verificar Identidad'}
        </h2>
        <p className="text-sm text-gray-500">Powered by Firebase Auth</p>
      </div>

      {/* Contenedor invisible para el Recaptcha */}
      <div id="recaptcha-container"></div>

      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <InputGroup 
            label="Celular (10 dígitos)" 
            placeholder="Ej: 5512345678" 
            value={phone} 
            onChange={e => setPhone(e.target.value.replace(/\D/,''))} 
            type="tel"
            required
          />
          <div className="flex gap-2 flex-col">
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? 'Enviando...' : 'Enviar SMS'}
             </Button>
             <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
               Cancelar
             </Button>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Podrías recibir un desafío de "No soy un robot".
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <p className="mb-4 text-sm text-center text-gray-600">
            Ingresa el código enviado a {formatPhone(phone)}
          </p>
          <InputGroup 
            label="Código de 6 dígitos" 
            placeholder="123456" 
            value={otp} 
            onChange={e => setOtp(e.target.value)} 
            type="number"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </Button>
          <button 
            type="button" 
            onClick={() => { setStep(1); setOtp(''); }} 
            className="mt-4 text-sm text-orange-600 hover:underline w-full text-center"
          >
            ¿Número equivocado?
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginView;