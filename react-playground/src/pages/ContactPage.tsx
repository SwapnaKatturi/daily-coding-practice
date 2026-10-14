import { useState } from "react";
import ContactForm, { type ContactFormvalues } from "../tasks/day-02-contact-form/ContactForm";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState<ContactFormvalues | null>(null);

    return (
        <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1>Contact Us</h1>
            <ContactForm onSubmit={setSubmitted} />

            {submitted && (
                <div style={{ marginTop: 24, padding: 12, background: '#f4f4f4' }}>
                    <h2>Last submission</h2>
                    <p><strong>Name:</strong>{submitted.name}</p>
                    <p><strong>Email:</strong>{submitted.email}</p>
                    <p><strong>Message:</strong>{submitted.message}</p>
                </div>
            )}
        </div>
    )
}