/**
 * User-friendly validation error messages
 * Converts validation errors into readable, helpful messages for customers
 */

export const validationMessages = {
  // Email validation
  email: {
    required: 'Por favor ingresa tu correo electrónico',
    invalid: 'El correo electrónico no es válido',
  },

  // Password validation
  password: {
    required: 'La contraseña es obligatoria',
    tooShort: 'La contraseña debe tener al menos 8 caracteres',
    noUppercase: 'Incluye al menos una mayúscula',
    noLowercase: 'Incluye al menos una minúscula',
    noNumber: 'Incluye al menos un número',
    noSpecial: 'Incluye al menos un carácter especial (!@#$%^&*)',
    weak: 'La contraseña es demasiado débil',
    requirements: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales',
  },

  // Confirm password
  confirmPassword: {
    required: 'Por favor confirma tu contraseña',
    noMatch: 'Las contraseñas no coinciden',
  },

  // Name validation
  firstName: {
    required: 'El nombre es obligatorio',
    tooShort: 'El nombre debe tener al menos 2 caracteres',
    tooLong: 'El nombre no debe exceder 50 caracteres',
    invalid: 'El nombre contiene caracteres inválidos',
  },

  lastName: {
    required: 'El apellido es obligatorio',
    tooShort: 'El apellido debe tener al menos 2 caracteres',
    tooLong: 'El apellido no debe exceder 50 caracteres',
    invalid: 'El apellido contiene caracteres inválidos',
  },

  // Phone validation
  phone: {
    required: 'El teléfono es obligatorio',
    tooShort: 'El teléfono debe tener al menos 10 dígitos',
    invalid: 'El número de teléfono no es válido',
  },

  // General validation
  required: 'Este campo es obligatorio',
  invalid: 'El valor ingresado no es válido',
  tooLong: 'El texto es demasiado largo',
  tooShort: 'El texto es muy corto',
};

/**
 * Extract user-friendly error message from various error formats
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error) {
    return 'Algo salió mal. Por favor intenta de nuevo.';
  }

  // If it's a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an object
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Handle Zod validation errors (array format)
    if (Array.isArray(err)) {
      const messages = err
        .map((e: unknown) => {
          if (typeof e === 'object' && e !== null && 'message' in e) {
            return (e as { message: string }).message;
          }
          return String(e);
        })
        .filter((msg: string) => msg && typeof msg === 'string');
      if (messages.length > 0) {
        return messages[0]; // Return first error
      }
    }

    // Handle error.response.data format
    const response = err.response as Record<string, unknown> | undefined;
    if (response) {
      const data = response.data as Record<string, unknown> | undefined;
      if (data) {
        const errorData = data.error as Record<string, unknown> | undefined;
        if (errorData?.message && typeof errorData.message === 'string') {
          return errorData.message;
        }

        if (data.message && typeof data.message === 'string') {
          return data.message;
        }

        if (data.details) {
          const details = data.details;
          if (Array.isArray(details) && details.length > 0) {
            const firstDetail = details[0];
            if (typeof firstDetail === 'object' && firstDetail !== null && 'message' in firstDetail) {
              return (firstDetail as { message: string }).message;
            }
            return String(firstDetail);
          }
          if (typeof details === 'string') {
            return details;
          }
        }
      }
    }

    // Handle message property
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }

    // Handle direct error object with validation issues
    if (err.error) {
      return getUserFriendlyErrorMessage(err.error);
    }
  }

  return 'Algo salió mal. Por favor intenta de nuevo.';
}

/**
 * Convert validation error object to user-friendly message
 */
export function formatValidationError(
  field: string,
  type: string
): string {
  const fieldMessages = validationMessages[field as keyof typeof validationMessages] as Record<string, string> | undefined;

  if (fieldMessages && fieldMessages[type]) {
    return fieldMessages[type];
  }

  // Fallback to generic message
  if (validationMessages[type as keyof typeof validationMessages]) {
    const typeMessages = validationMessages[type as keyof typeof validationMessages] as Record<string, string> | undefined;
    return typeMessages?.required || validationMessages.required;
  }

  return `${field}: ${type}`;
}
