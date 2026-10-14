import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type FieldName = 'name' | 'email' | 'message';

export interface ContactFormvalues {
    name: string;
    email: string;
    message: string;
}

type FormErrors = Partial<Record<FieldName, string>>;
type TouchedFields = Partial<Record<FieldName, boolean>>;

export interface ContactFormProps {
    onSubmit?: (values: ContactFormvalues) => void;
}

const FIELD_LABELS: Record<FieldName, string> = {
    name: 'Name',
    email: 'Email',
    message: 'Message'
}

function validate(values: ContactFormvalues): FormErrors {
    const errors: FormErrors = {};

    if (!values.name.trim()) {
        errors.name = 'Name is required';
    }

    if (!values.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        errors.email = 'Enter a valid email address';
    }

    if (!values.message.trim()) {
        errors.message = 'Message is required';
    } else if (values.message.trim().length < 10) {
        errors.message = 'Message must be atleast 10 characters';
    }
    return errors;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
    const [values, setValues] = useState<ContactFormvalues>({
        name: '',
        message: '',
        email: ''
    });
    const [touched, setTouched] = useState<TouchedFields>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const summaryRef = useRef<HTMLHeadingElement>(null);
    const fieldRefs: Record<FieldName, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
        name: useRef<HTMLInputElement>(null),
        email: useRef<HTMLInputElement>(null),
        message: useRef<HTMLInputElement>(null)
    }

    function handleChange(field: FieldName) {
        return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValues = { ...values, [field]: e.target.value };
            setValues(newValues);

            if (touched[field] || submitAttempted) {
                setErrors(validate(newValues));
            }
        };
    }

    function handleBlur(field: FieldName) {
        return () => {
            setTouched((t) => ({ ...t, [field]: true }));
            setErrors(validate(values));
        }
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const newErrors = validate(values);
        setErrors(newErrors);
        setTouched({ name: true, email: true, message: true });
        setSubmitAttempted(true);

        const errorFields = Object.keys(newErrors) as FieldName[];

        if (errorFields.length > 0) {
            setSuccessMessage('');
            requestAnimationFrame(() => {
                summaryRef.current?.focus();
            })
            return;
        }

        onSubmit?.({ ...values });
        setValues({ name: '', email: '', message: '' })
        setTouched({});
        setErrors({});
        setSubmitAttempted(false);
        setSuccessMessage('Thanks! Your message has been sent!');
    }

    const errorFields = Object.keys(errors) as FieldName[];
    const hasErrors = submitAttempted && errorFields.length > 0;

    function jumpToField(field: FieldName) {
        return (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            fieldRefs[field].current?.focus();
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            {hasErrors && (
                <div role="alert" style={{
                    border: '1px solid #c00',
                    padding: '12px',
                    marginBottom: '16px'

                }}>
                    <h2 tabIndex={-1} ref={summaryRef} style={{ margin: 0 }}>
                        There {errorFields.length === 1 ? 'is' : 'are'} {errorFields.length}{' '}
                        problem{errorFields.length === 1 ? '' : 's'}
                    </h2>
                    <ul>
                        {errorFields.map((field) => (
                            <li key={field} >
                                <a href={`#${field}`} onClick={jumpToField(field)}>
                                    {FIELD_LABELS[field]}:{errors[field]}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )
            }

            {successMessage && (
                <div role="status" style={{ color: 'green', marginBottom: '16px' }}>
                    {successMessage}
                </div>
            )}

            <div style={{ marginBottom: '12px' }}>
                <label htmlFor="name">Name</label>
                <br />
                <input
                    id="name"
                    ref={fieldRefs.name as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={values.name}
                    onChange={handleChange('name')}
                    onBlur={handleBlur('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                    <p id="name-error" style={{ color: '#c00', margin: '4px 0 0' }}>
                        {errors.name}
                    </p>
                )}
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label htmlFor="email">Email</label>
                <br />
                <input
                    type="email"
                    id="email"
                    ref={fieldRefs.email as React.RefObject<HTMLInputElement>}
                    value={values.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                    <p id="email-error" style={{ color: '#c00', margin: '4px 0 0' }}>{errors.email}</p>
                )}
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label htmlFor="message">Message</label>
                <br />
                <textarea
                    id="message"
                    ref={fieldRefs.message as React.RefObject<HTMLTextAreaElement>}
                    value={values.message}
                    onChange={handleChange('message')}
                    onBlur={handleBlur('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                    <p style={{ color: '#c00', margin: '4px 0 0' }}>
                        {errors.message}
                    </p>
                )}
            </div>
            <button type="submit">Send</button>
        </form >
    );
}