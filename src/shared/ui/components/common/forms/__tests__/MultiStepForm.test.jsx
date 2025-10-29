import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MultiStepForm from '../MultiStepForm';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock del hook useMultiStepForm
const mockUseMultiStepForm = vi.fn();
vi.mock('../../../../hooks/useMultiStepForm', () => ({
    useMultiStepForm: mockUseMultiStepForm,
}));

describe('MultiStepForm Component', () => {
    const mockSteps = [
        {
            id: 'step1',
            title: 'Paso 1',
            description: 'Primer paso del formulario',
            component: ({ data, onChange }) => (
                <div>
                    <input
                        data-testid="step1-input"
                        value={data.field1 || ''}
                        onChange={(e) => onChange('field1', e.target.value)}
                    />
                </div>
            ),
        },
        {
            id: 'step2',
            title: 'Paso 2',
            description: 'Segundo paso del formulario',
            component: ({ data, onChange }) => (
                <div>
                    <input
                        data-testid="step2-input"
                        value={data.field2 || ''}
                        onChange={(e) => onChange('field2', e.target.value)}
                    />
                </div>
            ),
        },
        {
            id: 'step3',
            title: 'Paso 3',
            description: 'Tercer paso del formulario',
            component: ({ data, onChange }) => (
                <div>
                    <input
                        data-testid="step3-input"
                        value={data.field3 || ''}
                        onChange={(e) => onChange('field3', e.target.value)}
                    />
                </div>
            ),
        },
    ];

    const defaultMockReturn = {
        currentStep: mockSteps[0],
        currentStepIndex: 0,
        formData: {},
        progress: {
            currentStep: 1,
            totalSteps: 3,
            percentage: 33.33,
            isFirstStep: true,
            isLastStep: false,
        },
        isSubmitting: false,
        stepErrors: {},
        getCurrentStepErrors: vi.fn(() => ({})),
        goToNextStep: vi.fn(() => Promise.resolve(true)),
        goToPreviousStep: vi.fn(),
        goToStep: vi.fn(() => Promise.resolve(true)),
        updateFormData: vi.fn(),
        updateField: vi.fn(),
        validateStep: vi.fn(() => Promise.resolve({ isValid: true, errors: {} })),
        validateAllSteps: vi.fn(() => Promise.resolve({ isValid: true, errors: {} })),
        submitForm: vi.fn(() => Promise.resolve(true)),
        resetForm: vi.fn(),
        isStepCompleted: vi.fn(() => false),
        canNavigateToStep: vi.fn(() => true),
    };

    beforeEach(() => {
        mockUseMultiStepForm.mockReturnValue(defaultMockReturn);
    });

    afterEach(() => {
        vi.clearAllMocks();
    }); describ
    e('Renderizado básico', () => {
        test('renderiza el formulario con el primer paso', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByText('Paso 1')).toBeInTheDocument();
            expect(screen.getByText('Primer paso del formulario')).toBeInTheDocument();
            expect(screen.getByTestId('step1-input')).toBeInTheDocument();
        });

        test('muestra la barra de progreso cuando showProgress es true', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    showProgress={true}
                />
            );

            expect(screen.getByText('1 de 3')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument(); // Step number
        });

        test('oculta la barra de progreso cuando showProgress es false', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    showProgress={false}
                />
            );

            expect(screen.queryByText('1 de 3')).not.toBeInTheDocument();
        });

        test('muestra indicador de auto-guardado cuando autoSave es true', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    autoSave={true}
                />
            );

            expect(screen.getByText('Auto-guardado')).toBeInTheDocument();
        });
    });

    describe('Navegación entre pasos', () => {
        test('llama a goToNextStep cuando se hace clic en Siguiente', async () => {
            const user = userEvent.setup();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            const nextButton = screen.getByText('Siguiente');
            await user.click(nextButton);

            expect(defaultMockReturn.goToNextStep).toHaveBeenCalled();
        });

        test('llama a goToPreviousStep cuando se hace clic en Anterior', async () => {
            const user = userEvent.setup();

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 1,
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 2,
                    isFirstStep: false,
                    isLastStep: false,
                },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    allowBackNavigation={true}
                />
            );

            const prevButton = screen.getByText('Anterior');
            await user.click(prevButton);

            expect(defaultMockReturn.goToPreviousStep).toHaveBeenCalled();
        });

        test('no muestra botón Anterior cuando allowBackNavigation es false', () => {
            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 1,
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 2,
                    isFirstStep: false,
                },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    allowBackNavigation={false}
                />
            );

            expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
        });

        test('permite navegación directa a pasos haciendo clic en los números', async () => {
            const user = userEvent.setup();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            const step2Button = screen.getByText('2');
            await user.click(step2Button);

            expect(defaultMockReturn.goToStep).toHaveBeenCalledWith(1);
        });
    });

    describe('Validación', () => {
        test('muestra errores de validación', () => {
            const mockErrors = { field1: 'Campo requerido' };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                getCurrentStepErrors: vi.fn(() => mockErrors),
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByText('Por favor corrige los siguientes errores:')).toBeInTheDocument();
            expect(screen.getByText('• Campo requerido')).toBeInTheDocument();
        });

        test('deshabilita botón Siguiente cuando hay errores', () => {
            const mockErrors = { field1: 'Campo requerido' };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                getCurrentStepErrors: vi.fn(() => mockErrors),
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            const nextButton = screen.getByText('Siguiente');
            expect(nextButton).toBeDisabled();
        });

        test('muestra indicador de validación cuando showStepValidation es true', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    showStepValidation={true}
                />
            );

            expect(screen.getByText('Paso válido')).toBeInTheDocument();
        });

        test('muestra indicadores de error en los pasos del progress', () => {
            const mockStepErrors = {
                0: { field1: 'Error en paso 1' },
                1: {},
                2: {},
            };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                stepErrors: mockStepErrors,
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    showStepValidation={true}
                />
            );

            // Debería mostrar indicador de error en el primer paso
            const step1Button = screen.getByText('1').closest('button');
            expect(step1Button).toHaveClass('ring-2', 'ring-red-400');
        });
    }); d
    escribe('Envío del formulario', () => {
        test('muestra botón Finalizar en el último paso', () => {
            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 2,
                currentStep: mockSteps[2],
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 3,
                    isFirstStep: false,
                    isLastStep: true,
                },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByText('Finalizar')).toBeInTheDocument();
            expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
        });

        test('llama a submitForm cuando se hace clic en Finalizar', async () => {
            const user = userEvent.setup();
            const mockOnSubmit = vi.fn();

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 2,
                currentStep: mockSteps[2],
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 3,
                    isFirstStep: false,
                    isLastStep: true,
                },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={mockOnSubmit}
                />
            );

            const submitButton = screen.getByText('Finalizar');
            await user.click(submitButton);

            expect(defaultMockReturn.submitForm).toHaveBeenCalledWith(mockOnSubmit);
        });

        test('muestra estado de carga durante el envío', () => {
            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 2,
                currentStep: mockSteps[2],
                isSubmitting: true,
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 3,
                    isFirstStep: false,
                    isLastStep: true,
                },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByText('Enviando...')).toBeInTheDocument();
            const submitButton = screen.getByText('Enviando...');
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Funcionalidades adicionales', () => {
        test('muestra botón de omitir cuando allowSkip es true', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    allowSkip={true}
                />
            );

            expect(screen.getByText('Omitir')).toBeInTheDocument();
        });

        test('llama a handleSkip cuando se hace clic en Omitir', async () => {
            const user = userEvent.setup();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    allowSkip={true}
                />
            );

            const skipButton = screen.getByText('Omitir');
            await user.click(skipButton);

            expect(defaultMockReturn.goToStep).toHaveBeenCalledWith(1);
        });

        test('muestra botón de cancelar cuando onCancel está definido', () => {
            const mockOnCancel = vi.fn();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByText('Cancelar')).toBeInTheDocument();
        });

        test('llama a onCancel cuando se hace clic en Cancelar', async () => {
            const user = userEvent.setup();
            const mockOnCancel = vi.fn();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    onCancel={mockOnCancel}
                />
            );

            const cancelButton = screen.getByText('Cancelar');
            await user.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalled();
        });

        test('muestra botón de reiniciar', () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByText('Reiniciar')).toBeInTheDocument();
        });

        test('llama a resetForm cuando se hace clic en Reiniciar', async () => {
            const user = userEvent.setup();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            const resetButton = screen.getByText('Reiniciar');
            await user.click(resetButton);

            expect(defaultMockReturn.resetForm).toHaveBeenCalled();
        });
    });

    describe('Resumen del formulario', () => {
        test('muestra resumen en el último paso cuando showSummary es true', () => {
            const mockFormData = { field1: 'value1', field2: 'value2' };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 2,
                currentStep: { ...mockSteps[2], component: null }, // Sin componente para mostrar resumen
                formData: mockFormData,
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 3,
                    isFirstStep: false,
                    isLastStep: true,
                },
            });

            render(
                <MultiStepForm
                    steps={[...mockSteps.slice(0, 2), { ...mockSteps[2], component: null }]}
                    onSubmit={vi.fn()}
                    showSummary={true}
                />
            );

            expect(screen.getByText('Resumen')).toBeInTheDocument();
            expect(screen.getByText(JSON.stringify(mockFormData, null, 2))).toBeInTheDocument();
        });

        test('no muestra resumen cuando showSummary es false', () => {
            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                currentStepIndex: 2,
                currentStep: { ...mockSteps[2], component: null },
                progress: {
                    ...defaultMockReturn.progress,
                    currentStep: 3,
                    isFirstStep: false,
                    isLastStep: true,
                },
            });

            render(
                <MultiStepForm
                    steps={[...mockSteps.slice(0, 2), { ...mockSteps[2], component: null }]}
                    onSubmit={vi.fn()}
                    showSummary={false}
                />
            );

            expect(screen.queryByText('Resumen')).not.toBeInTheDocument();
        });
    });

    describe('Auto-guardado', () => {
        test('llama a onAutoSave cuando autoSave está habilitado', async () => {
            const mockOnAutoSave = vi.fn();
            const mockFormData = { field1: 'value1' };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                formData: mockFormData,
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    autoSave={true}
                    autoSaveInterval={100}
                    onAutoSave={mockOnAutoSave}
                />
            );

            // Esperar a que se ejecute el auto-guardado
            await waitFor(() => {
                expect(mockOnAutoSave).toHaveBeenCalledWith(mockFormData, 0);
            }, { timeout: 200 });
        });
    });

    describe('Callbacks', () => {
        test('llama a onStepChange cuando cambia el paso', () => {
            const mockOnStepChange = vi.fn();
            const mockFormData = { field1: 'value1' };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                formData: mockFormData,
                currentStepIndex: 1,
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                    onStepChange={mockOnStepChange}
                />
            );

            expect(mockOnStepChange).toHaveBeenCalledWith(1, mockFormData, mockSteps[0]);
        });
    });

    describe('Interacción con componentes de paso', () => {
        test('pasa las props correctas a los componentes de paso', () => {
            const mockFormData = { field1: 'test value' };

            mockUseMultiStepForm.mockReturnValue({
                ...defaultMockReturn,
                formData: mockFormData,
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            const input = screen.getByTestId('step1-input');
            expect(input).toHaveValue('test value');
        });

        test('actualiza datos cuando el componente de paso cambia', async () => {
            const user = userEvent.setup();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    onSubmit={vi.fn()}
                />
            );

            const input = screen.getByTestId('step1-input');
            await user.type(input, 'new value');

            expect(defaultMockReturn.updateField).toHaveBeenCalledWith('field1', 'new value');
        });
    });
});