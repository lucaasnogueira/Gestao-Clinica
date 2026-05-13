import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/services', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

describe('LoginPage', () => {
  const mockPush = vi.fn();
  const mockSetAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ replace: mockPush });
    (useAuthStore as any).mockReturnValue(mockSetAuth);
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByText('ClinicaOS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
      expect(screen.getByText('Senha obrigatória')).toBeInTheDocument();
    });
  });

  it('calls login service and redirects on success', async () => {
    const mockResult = {
      user: { id: '1', email: 'test@test.com', role: 'ADMIN' },
      accessToken: 'access',
      refreshToken: 'refresh',
    };
    (authService.login as any).mockResolvedValue(mockResult);

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockSetAuth).toHaveBeenCalledWith(
        { id: '1', email: 'test@test.com', role: 'ADMIN' },
        'access',
        'refresh'
      );
      expect(toast.success).toHaveBeenCalledWith('Bem-vindo(a) de volta!');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error toast on login failure', async () => {
    (authService.login as any).mockRejectedValue({
      response: { data: { message: 'Credenciais inválidas' } }
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Credenciais inválidas');
    });
  });
});
