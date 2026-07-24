import { useEffect, useRef, useState } from 'react';

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
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeField, setShakeField] = useState(null);
  const shakeTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(shakeTimerRef.current);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors.form;

      if (touched[name] || previousErrors[name]) {
        const fieldError = validateFn(nextValues)[name];
        if (fieldError) {
          nextErrors[name] = fieldError;
        } else {
          delete nextErrors[name];
        }
      }

      return nextErrors;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((previous) => ({ ...previous, [name]: true }));

    const fieldError = validateFn(values)[name];
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      if (fieldError) {
        nextErrors[name] = fieldError;
      } else {
        delete nextErrors[name];
      }
      return nextErrors;
    });
  };

  const triggerShake = (fieldName) => {
    clearTimeout(shakeTimerRef.current);
    setShakeField(fieldName);
    shakeTimerRef.current = setTimeout(() => setShakeField(null), 400);
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const validationErrors = validateFn(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched((previous) => ({
        ...previous,
        ...Object.fromEntries(Object.keys(validationErrors).map((name) => [name, true])),
      }));
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
    onBlur: handleBlur,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    className: `${shakeField === name ? 'animate-input-shake border-red-500 ring-red-500/20' : ''} ${errors[name] ? 'border-red-500' : ''}`
  });

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    getInputProps,
    setValues,
    setErrors
  };
}
