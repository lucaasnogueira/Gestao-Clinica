import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InlinePatientForm } from './InlinePatientForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients';
import { insuranceService } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mocks
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/hooks/usePatients', () => ({
  useCreatePatient: vi.fn(),
  useUpdatePatient: vi.fn(),
}));

vi.mock('@/lib/services', () => ({
  insuranceService: {
    list: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock MaskedInput to avoid complex input issues in unit tests
vi.mock('@/components/shared/masked-input', () => ({
  MaskedInput: require('react').forwardRef(({ ...props }: any, ref: any) => (
    <input {...props} ref={ref} />
  )),
}));

describe('InlinePatientForm', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreatePatient as any).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    });
    (useUpdatePatient as any).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    });
    (useQuery as any).mockReturnValue({
      data: [{ id: 'ins1', name: 'Unimed' }],
    });
  });

  it('renders the first step correctly', () => {
    render(<InlinePatientForm onClose={mockOnClose} />);
    expect(screen.getByText('Novo Paciente')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument();
  });

  it('navigates through steps correctly with validation', async () => {
    render(<InlinePatientForm onClose={mockOnClose} />);
    
    // Step 1: Fill required fields
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '12345678900' } });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { value: '1990-01-01' } });
    
    fireEvent.click(screen.getByText(/Próximo/i));

    // Should be on Step 2
    await waitFor(() => {
      expect(screen.getByText('Contato')).toBeInTheDocument();
      expect(screen.getByLabelText(/Telefone Principal/i)).toBeInTheDocument();
    });

    // Step 2: Fill phone
    fireEvent.change(screen.getByLabelText(/Telefone Principal/i), { target: { value: '11999999999' } });
    
    fireEvent.click(screen.getByText(/Próximo/i));

    // Should be on Step 3
    await waitFor(() => {
      expect(screen.getByText('Saúde')).toBeInTheDocument();
      expect(screen.getByText(/Finalizar Cadastro/i)).toBeInTheDocument();
    });
  });

  it('submits the form correctly on the last step', async () => {
    mockCreateMutate.mockResolvedValue({});
    render(<InlinePatientForm onClose={mockOnClose} />);
    
    // Fill Step 1
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '12345678900' } });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { value: '1990-01-01' } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // Fill Step 2
    await waitFor(() => screen.getByLabelText(/Telefone Principal/i));
    fireEvent.change(screen.getByLabelText(/Telefone Principal/i), { target: { value: '11999999999' } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // Fill Step 3 & Submit
    await waitFor(() => screen.getByText(/Finalizar Cadastro/i));
    fireEvent.click(screen.getByText(/Finalizar Cadastro/i));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Paciente cadastrado com sucesso!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
