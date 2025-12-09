// src/pages/LoginView.jsx
import React, { useState, useEffect } from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Importamos tu configuración
import Button from '../components/Button';
import InputGroup from '../components/InputGroup';

const LoginView = ({ onLogin, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Teléfono, 2: Código
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);

  // Formato obligatorio para Firebase: +52 para México
  const formatPhone = (p) => {
    if (p.startsWith('+')) return p;
    return `+52${p}`; 
  };

  // Configurar el ReCaptcha invisible (Requisito de seguridad de Google)
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // Captcha resuelto automáticamente
        }
      });
    }
  }, []);

  // --- ENVIAR SMS ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    if(phone.length < 10) return alert("Número inválido (mínimo 10 dígitos)");
    
    setLoading(true);
    const phoneNumber = formatPhone(phone);

    try {
      const appVerifier = window.recaptchaVerifier;
      // Google envía el SMS aquí
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setConfirmObj(confirmation);
      setStep(2); // Pasamos a pedir el código
      alert("SMS enviado. Revisa tu celular.");
    } catch (error) {
      console.error("Error Firebase:", error);
      alert("No se pudo enviar el SMS. Verifica que el número sea correcto y tengas internet.");
      
      // Resetear captcha si falla
      if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFICAR CÓDIGO ---
  const handleVerify = async (e) => {
    e.preventDefault();
    if(!otp) return;
    
    setLoading(true);
    try {
      // Google verifica si el código es real
      const result = await confirmObj.confirm(otp);
      
      // Si pasa, obtenemos el usuario
      const user = result.user;
      console.log("Usuario verificado:", user);
      
      // ¡Login exitoso! Entramos a la app
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
        <p className="text-sm text-gray-500">Verificación segura con Google</p>
      </div>

      {/* Este div es invisible pero necesario para el Captcha */}
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
            Podrías recibir un desafío visual de "No soy un robot".
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