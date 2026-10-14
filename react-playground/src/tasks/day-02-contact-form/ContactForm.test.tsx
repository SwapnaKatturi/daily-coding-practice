import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
    it('shows no errors on first render', () => {
        render(<ContactForm onSubmit={vi.fn()} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('submitting empty shows all three errors and moves focus to the summary', async () => {
        const user = userEvent.setup();
        render(<ContactForm onSubmit={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /send/i }));

        const summary = await screen.findByRole('alert');
        expect(summary).toBeInTheDocument();
        expect(screen.getByText(/there are 3 problems/i)).toBeInTheDocument();

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();

        expect(screen.getByRole('textbox', { name: /name/i })).toHaveAttribute(
            'aria-invalid',
            'true'
        );
        expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute(
            'aria-invalid',
            'true'
        );
        expect(screen.getByRole('textbox', { name: /message/i })).toHaveAttribute(
            'aria-invalid',
            'true'
        );

        const heading = screen.getByRole('heading', { name: /problems/i });
        expect(heading).toHaveFocus();
    });

    it('shows the email error for an invalid email format', async () => {
        const user = userEvent.setup();
        render(<ContactForm onSubmit={vi.fn()} />);

        const emailInput = screen.getByRole('textbox', { name: /email/i });
        await user.type(emailInput, 'not-an-email');
        await user.tab(); // blur

        expect(
            await screen.findByText(/enter a valid email address/i)
        ).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('submits valid data, calls onSubmit, clears the form, and shows success', async () => {
        const user = userEvent.setup();
        const handleSubmit = vi.fn();
        render(<ContactForm onSubmit={handleSubmit} />);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const messageInput = screen.getByRole('textbox', { name: /message/i });

        await user.type(nameInput, 'Ada Lovelace');
        await user.type(emailInput, 'ada@example.com');
        await user.type(messageInput, 'This is a sufficiently long message.');

        await user.click(screen.getByRole('button', { name: /send/i }));

        expect(handleSubmit).toHaveBeenCalledWith({
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            message: 'This is a sufficiently long message.',
        });

        const status = await screen.findByRole('status');
        expect(status).toHaveTextContent(/thanks/i);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(messageInput).toHaveValue('');

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('supports a full keyboard-only flow', async () => {
        const user = userEvent.setup();
        const handleSubmit = vi.fn();
        render(<ContactForm onSubmit={handleSubmit} />);

        await user.tab(); // focus Name
        await user.keyboard('Ada Lovelace');
        await user.tab(); // focus Email
        await user.keyboard('ada@example.com');
        await user.tab(); // focus Message
        await user.keyboard('This is a sufficiently long message.');
        await user.tab(); // focus Send button
        await user.keyboard('{Enter}');

        expect(handleSubmit).toHaveBeenCalledTimes(1);
        expect(await screen.findByRole('status')).toBeInTheDocument();
    });
});