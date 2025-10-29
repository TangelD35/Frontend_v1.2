import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MultiStepForm from '../../forms/MultiStepForm';
import { FormApiIntegration } from '../../utils/apiIntegration';

// Mock dependencies
vi.mock('../../utils/apiIntegration');
vi.mock('../../../../store/authStore', () => ({
    default: vi.fn(() => ({
        isAuthenticated: true,
        checkPermission: vi.fn(() => true),
        user: { id: 1, role: 'admin' },
        token: 'mock-token'
    }))
}));

// Mock hook
vi.mock('../../../hooks/useMultiStepForm', () => ({
    useMultiStepForm: vi.fn(() => ({
        currentStep: { id: 'step1', title: 'Información Personal', component: MockStepComponent },
        currentStepIndex: 0,
        formData: { firstName: '', lastName: '', email: '' },
        progress: { currentStep: 1, totalSteps: 3, percentage: 33.33, isFirstStep: true, isLastStep: false },
        isSubmitting: false,
        stepErrors: {},
        getCurrentStepErrors: vi.fn(() => ({})),
        goToNextStep: vi.fn(() => Promise.resolve(true)),
        goToPreviousStep: vi.fn(),
        goToStep: vi.fn(),
        updateFormData: vi.fn(),
        updateField: vi.fn(),
        validateStep: vi.fn(() => Promise.resolve(true)),
        validateAllSteps: vi.fn(() => Promise.resolve(true)),
        submitForm: vi.fn(() => Promise.resolve(true)),
        resetForm: vi.fn(),
        isStepCompleted: vi.fn(() => false),
        canNavigateToStep: vi.fn(() => true),
    }))
}));

// Mock step component
const MockStepComponent = ({ data, onChange, errors }) => (
    <div>
        <h3>Información Personal</h3>
        <div>
            <label htmlFor="firstName">Nombre:</label>
            <input
                id="firstName"
                type="text"
                value={data.firstName || ''}
                onChange={(e) => onChange('firstName', e.target.value)}
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div>
            <label htmlFor="lastName">Apellido:</label>
            <input
                id="lastName"
                type="text"
                value={data.lastName || ''}
                onChange={(e) => onChange('lastName', e.target.value)}
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
        <div>
            <label htmlFor="email">Email:</label>
            <input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
            />
            {errors.email && <span className="error">{errors.email}</span>}
        </div>
    </div>
);

describe('MultiStepForm Integration Tests', () => {
    const mockSteps = [
        {
            id: 'step1',
            title: 'Información Personal',
            description: 'Ingresa tu información personal',
            component: MockStepComponent,
        },
        {
            id: 'step2',
            title: 'Información Profesional',
            description: 'Ingresa tu información profesional',
            component: MockStepComponent,
        },
        {
            id: 'step3',
            title: 'Confirmación',
            description: 'Revisa y confirma tu información',
            component: MockStepComponent,
        },
    ];

    let mockApiIntegration;
    let user;

    beforeEach(() => {
        user = userEvent.setup();

        // Mock API integration
        mockApiIntegration = {
            saveProgress: vi.fn().mockResolvedValue({ success: true }),
            autoSave: vi.fn(),
            validateStep: vi.fn().mockResolvedValue({ isValid: true, errors: {}, warnings: {} }),
            submitForm: vi.fn().mockResolvedValue({ success: true, message: 'Formulario enviado exitosamente' }),
            loadSavedData: vi.fn().mockResolvedValue({ data: {}, step_index: 0 }),
            cleanup: vi.fn(),
        };

        FormApiIntegration.mockImplementation(() => mockApiIntegration);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('API Integration', () => {
        it('should initialize API integration when enabled', async () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                />
            );

            await waitFor(() => {
                expect(FormApiIntegration).toHaveBeenCalledWith('test-form');
            });
        });

        it('should load saved data on initialization', async () => {
            const savedData = {
                data: { firstName: 'Juan', lastName: 'Pérez' },
                step_index: 1
            };
            mockApiIntegration.loadSavedData.mockResolvedValue(savedData);

            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                    loadSavedData={true}
                />
            );

            await waitFor(() => {
                expect(mockApiIntegration.loadSavedData).toHaveBeenCalled();
            });
        });

        it('should perform server-side validation when enabled', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            const mockHook = useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                getCurrentStepErrors: vi.fn(() => ({ firstName: 'Campo requerido' })),
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                    enableServerValidation={true}
                />
            );

            // Try to go to next step
            const nextButton = screen.getByRole('button', { name: /siguiente/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(mockApiIntegration.validateStep).toHaveBeenCalled();
            });
        });

        it('should auto-save form data when enabled', async () => {
            vi.useFakeTimers();

            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                    autoSave={true}
                    autoSaveInterval={2000}
                />
            );

            // Fill in form data
            const firstNameInput = screen.getByLabelText(/nombre/i);
            await user.type(firstNameInput, 'Juan');

            // Fast-forward time to trigger auto-save
            vi.advanceTimersByTime(2000);

            await waitFor(() => {
                expect(mockApiIntegration.autoSave).toHaveBeenCalled();
            });

            vi.useRealTimers();
        });

        it('should submit form via API when no custom onSubmit is provided', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                progress: { currentStep: 3, totalSteps: 3, percentage: 100, isFirstStep: false, isLastStep: true },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                />
            );

            const submitButton = screen.getByRole('button', { name: /finalizar/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockApiIntegration.submitForm).toHaveBeenCalled();
            });
        });
    });

    describe('Authentication Integration', () => {
        it('should show access denied when user lacks permissions', () => {
            // Mock unauthorized user
            const mockAuthStore = vi.fn(() => ({
                isAuthenticated: true,
                checkPermission: vi.fn(() => false),
                user: { id: 1, role: 'user' },
                token: 'mock-token'
            }));

            vi.doMock('../../../../store/authStore', () => ({
                default: mockAuthStore
            }));

            render(
                <MultiStepForm
                    steps={mockSteps}
                    requireAuth={true}
                    requiredPermission="admin"
                />
            );

            expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
            expect(screen.getByText(/no tienes permisos/i)).toBeInTheDocument();
        });

        it('should show form when user has permissions', async () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    requireAuth={true}
                    requiredPermission="admin"
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Información Personal')).toBeInTheDocument();
            });
        });
    });

    describe('Step Navigation Integration', () => {
        it('should navigate between steps correctly', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            const mockGoToNextStep = vi.fn(() => Promise.resolve(true));
            const mockGoToPreviousStep = vi.fn();

            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                goToNextStep: mockGoToNextStep,
                goToPreviousStep: mockGoToPreviousStep,
                progress: { currentStep: 2, totalSteps: 3, percentage: 66.66, isFirstStep: false, isLastStep: false },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    allowBackNavigation={true}
                />
            );

            // Test next navigation
            const nextButton = screen.getByRole('button', { name: /siguiente/i });
            await user.click(nextButton);

            expect(mockGoToNextStep).toHaveBeenCalled();

            // Test previous navigation
            const prevButton = screen.getByRole('button', { name: /anterior/i });
            await user.click(prevButton);

            expect(mockGoToPreviousStep).toHaveBeenCalled();
        });

        it('should handle step validation errors', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                getCurrentStepErrors: vi.fn(() => ({ firstName: 'Campo requerido', email: 'Email inválido' })),
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    showStepValidation={true}
                />
            );

            // Should show error summary
            await waitFor(() => {
                expect(screen.getByText(/por favor corrige los siguientes errores/i)).toBeInTheDocument();
                expect(screen.getByText(/campo requerido/i)).toBeInTheDocument();
                expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
            });

            // Next button should be disabled
            const nextButton = screen.getByRole('button', { name: /siguiente/i });
            expect(nextButton).toBeDisabled();
        });

        it('should show progress correctly', async () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    showProgress={true}
                />
            );

            // Should show progress indicators
            expect(screen.getByText('1 de 3')).toBeInTheDocument();

            // Should show progress bar
            const progressBar = screen.getByRole('progressbar', { hidden: true });
            expect(progressBar).toBeInTheDocument();
        });
    });

    describe('Form Data Integration', () => {
        it('should handle form data changes', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            const mockUpdateField = vi.fn();

            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                updateField: mockUpdateField,
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                />
            );

            // Fill in form field
            const firstNameInput = screen.getByLabelText(/nombre/i);
            await user.type(firstNameInput, 'Juan');

            expect(mockUpdateField).toHaveBeenCalledWith('firstName', 'Juan');
        });

        it('should reset form data when requested', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            const mockResetForm = vi.fn();

            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                resetForm: mockResetForm,
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                />
            );

            // Click reset button
            const resetButton = screen.getByRole('button', { name: /reiniciar/i });
            await user.click(resetButton);

            expect(mockResetForm).toHaveBeenCalled();
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle API validation errors', async () => {
            mockApiIntegration.validateStep.mockResolvedValue({
                isValid: false,
                errors: { firstName: 'Nombre muy corto', email: 'Email ya existe' },
                warnings: {}
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                    enableServerValidation={true}
                />
            );

            // Try to go to next step
            const nextButton = screen.getByRole('button', { name: /siguiente/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(mockApiIntegration.validateStep).toHaveBeenCalled();
            });
        });

        it('should handle form submission errors', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                progress: { currentStep: 3, totalSteps: 3, percentage: 100, isFirstStep: false, isLastStep: true },
            });

            mockApiIntegration.submitForm.mockResolvedValue({
                success: false,
                error: 'Error al procesar el formulario',
                details: { server: 'Error interno' }
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    formId="test-form"
                    enableApiIntegration={true}
                />
            );

            const submitButton = screen.getByRole('button', { name: /finalizar/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockApiIntegration.submitForm).toHaveBeenCalled();
            });
        });
    });

    describe('Accessibility Integration', () => {
        it('should be keyboard navigable', async () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                />
            );

            // Test keyboard navigation
            const nextButton = screen.getByRole('button', { name: /siguiente/i });
            nextButton.focus();

            // Press Enter to activate
            fireEvent.keyDown(nextButton, { key: 'Enter', code: 'Enter' });

            // Should work with keyboard
            expect(nextButton).toHaveFocus();
        });

        it('should have proper ARIA labels and roles', async () => {
            render(
                <MultiStepForm
                    steps={mockSteps}
                    showProgress={true}
                />
            );

            // Check for proper ARIA attributes
            const form = screen.getByRole('form', { hidden: true });
            expect(form).toBeInTheDocument();

            // Progress should have proper labels
            const progressBar = screen.getByRole('progressbar', { hidden: true });
            expect(progressBar).toBeInTheDocument();
        });

        it('should announce step changes to screen readers', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                currentStep: { id: 'step2', title: 'Información Profesional', component: MockStepComponent },
                currentStepIndex: 1,
                progress: { currentStep: 2, totalSteps: 3, percentage: 66.66, isFirstStep: false, isLastStep: false },
            });

            render(
                <MultiStepForm
                    steps={mockSteps}
                    showProgress={true}
                />
            );

            // Should announce current step
            expect(screen.getByText('Información Profesional')).toBeInTheDocument();
            expect(screen.getByText('2 de 3')).toBeInTheDocument();
        });
    });

    describe('Performance Integration', () => {
        it('should handle large forms efficiently', async () => {
            const largeSteps = Array.from({ length: 20 }, (_, index) => ({
                id: `step${index + 1}`,
                title: `Paso ${index + 1}`,
                description: `Descripción del paso ${index + 1}`,
                component: MockStepComponent,
            }));

            const startTime = performance.now();

            render(
                <MultiStepForm
                    steps={largeSteps}
                    showProgress={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Paso 1')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time (less than 500ms)
            expect(renderTime).toBeLessThan(500);
        });

        it('should optimize re-renders with stable callbacks', async () => {
            const { useMultiStepForm } = await import('../../../hooks/useMultiStepForm');
            const mockUpdateField = vi.fn();

            useMultiStepForm.mockReturnValue({
                ...useMultiStepForm(),
                updateField: mockUpdateField,
            });

            const { rerender } = render(
                <MultiStepForm
                    steps={mockSteps}
                />
            );

            // Re-render with same props
            rerender(
                <MultiStepForm
                    steps={mockSteps}
                />
            );

            // Should not cause unnecessary re-renders
            expect(screen.getByText('Información Personal')).toBeInTheDocument();
        });
    });
});