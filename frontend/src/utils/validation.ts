export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'Por favor ingresa tu correo electrónico';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El correo electrónico no es válido';
  }
  
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.trim() === '') {
    return 'La contraseña es obligatoria';
  }
  
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const missing = [];
  if (!hasUppercase) missing.push('una mayúscula');
  if (!hasLowercase) missing.push('una minúscula');
  if (!hasNumber) missing.push('un número');
  if (!hasSpecial) missing.push('un carácter especial (!@#$%^&*)');
  
  if (missing.length > 0) {
    return `La contraseña debe incluir al menos: ${missing.join(', ')}`;
  }
  
  return null;
}

export function validateName(name: string, fieldName: string): string | null {
  if (!name || name.trim() === '') {
    return `El ${fieldName} es obligatorio`;
  }
  
  if (name.length < 2) {
    return `El ${fieldName} debe tener al menos 2 caracteres`;
  }
  
  if (name.length > 50) {
    return `El ${fieldName} no debe exceder 50 caracteres`;
  }
  
  const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!validNameRegex.test(name)) {
    return `El ${fieldName} contiene caracteres inválidos`;
  }
  
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') {
    return 'El teléfono es obligatorio';
  }
  
  // Remove all non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');
  
  if (numericPhone.length < 10) {
    return 'El teléfono debe tener al menos 10 dígitos';
  }
  
  if (numericPhone.length > 15) {
    return 'El teléfono no debe exceder 15 dígitos';
  }
  
  return null;
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return 'Por favor confirma tu contraseña';
  }
  
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  
  return null;
}
