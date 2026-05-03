// Validation utilities
export const validationRules = {
    required: (value) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'This field is required';
        }
        return null;
    },

    minLength: (min) => (value) => {
        if (value && value.length < min) {
            return `Must be at least ${min} characters`;
        }
        return null;
    },

    maxLength: (max) => (value) => {
        if (value && value.length > max) {
            return `Must be no more than ${max} characters`;
        }
        return null;
    },

    date: (value) => {
        if (!value) return null; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Invalid date format';
        }
        return null;
    },

    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Invalid email address';
        }
        return null;
    },

    password: (value) => {
        if (!value) return null;
        if (value.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return null;
    },
};

export const validateForm = (formData, rules) => {
    const errors = {};

    Object.keys(rules).forEach(fieldName => {
        const fieldValue = formData[fieldName];
        const fieldRules = rules[fieldName];

        if (Array.isArray(fieldRules)) {
            for (const rule of fieldRules) {
                const error = rule(fieldValue);
                if (error) {
                    errors[fieldName] = error;
                    break; // Stop at first error for this field
                }
            }
        } else {
            // Single rule
            const error = fieldRules(fieldValue);
            if (error) {
                errors[fieldName] = error;
            }
        }
    });

    return errors;
};