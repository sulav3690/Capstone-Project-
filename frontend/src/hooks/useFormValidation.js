import { useState } from 'react';

/**
 * Custom hook for standardizing form validation across the app.
 * Handles validation logic, error states, and CSS animation triggers (shake).
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function returning an object of errors
 */
export default function useFormValidation(initialValues, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeField, setShakeField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const triggerShake = (fieldName) => {
    setShakeField(fieldName);
    setTimeout(() => setShakeField(null), 400); // 400ms matches animate-input-shake duration
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validationErrors = validateFn(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Trigger shake animation on the first error field
      triggerShake(Object.keys(validationErrors)[0]);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    className: `${shakeField === name ? 'animate-input-shake border-red-500 ring-red-500/20' : ''} ${errors[name] ? 'border-red-500' : ''}`
  });

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    getInputProps,
    setValues,
    setErrors
  };
}
