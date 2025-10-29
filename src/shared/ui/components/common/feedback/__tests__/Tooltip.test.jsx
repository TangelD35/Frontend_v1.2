import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Tooltip, { SimpleTooltip, HelpTooltip, InfoTooltip } from '../Tooltip';

// Mock framer-motion para evitar problemas en tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock del hook useTooltip
const mockUseTooltip = vi.fn();
vi.mock('../../../../hooks/useTooltip', () => ({
    useTooltip: mockUseTooltip,
}));

describe('Tooltip Component', () => {
    const defaultMockReturn = {
        isVisible: false,
        position: { x: 0, y: 0 },
        actualPlacement: 'top',
        targetRef: { current: null },
        tooltipRef: { current: null },
        handlers: {
            onMouseEnter: vi.fn(),
            onMouseLeave: vi.fn(),
            onClick: vi.fn(),
            onFocus: vi.fn(),
            onBlur: vi.fn(),
        },
    };

    beforeEach(() => {
        mockUseTooltip.mockReturnValue(defaultMockReturn);
        // Mock createPortal para renderizar en el mismo lugar
        vi.spyOn(require('react-dom'), 'createPortal').mockImplementation((children) => children);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Renderizado básico', () => {
        test('renderiza el elemento trigger correctamente', () => {
            render(
                <Tooltip content="Test tooltip">
                    <button>Hover me</button>
                </Tooltip>
            );

            expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
        });

        test('no renderiza el tooltip cuando no está visible', () => {
            render(
                <Tooltip content="Test tooltip">
                    <button>Hover me</button>
                </Tooltip>
            );

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        test('renderiza el tooltip cuando está visible', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test tooltip">
                    <button>Hover me</button>
                </Tooltip>
            );

            expect(screen.getByRole('tooltip')).toBeInTheDocument();
            expect(screen.getByText('Test tooltip')).toBeInTheDocument();
        });
    });

    describe('Configuración del hook useTooltip', () => {
        test('pasa las props correctas al hook useTooltip', () => {
            render(
                <Tooltip
                    content="Test"
                    placement="bottom"
                    trigger="click"
                    delay={500}
                    hideDelay={200}
                    offset={12}
                >
                    <button>Test</button>
                </Tooltip>
            );

            expect(mockUseTooltip).toHaveBeenCalledWith({
                delay: 500,
                hideDelay: 200,
                placement: 'bottom',
                trigger: 'click',
                offset: 12,
            });
        });

        test('usa valores por defecto cuando no se proporcionan props', () => {
            render(
                <Tooltip content="Test">
                    <button>Test</button>
                </Tooltip>
            );

            expect(mockUseTooltip).toHaveBeenCalledWith({
                delay: 300,
                hideDelay: 100,
                placement: 'top',
                trigger: 'hover',
                offset: 8,
            });
        });
    });

    describe('Handlers de eventos', () => {
        test('aplica los handlers del hook al elemento trigger', () => {
            const mockHandlers = {
                onMouseEnter: vi.fn(),
                onMouseLeave: vi.fn(),
                onClick: vi.fn(),
                onFocus: vi.fn(),
                onBlur: vi.fn(),
            };

            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                handlers: mockHandlers,
            });

            render(
                <Tooltip content="Test">
                    <button>Test button</button>
                </Tooltip>
            );

            const trigger = screen.getByRole('button');

            fireEvent.mouseEnter(trigger);
            expect(mockHandlers.onMouseEnter).toHaveBeenCalled();

            fireEvent.mouseLeave(trigger);
            expect(mockHandlers.onMouseLeave).toHaveBeenCalled();

            fireEvent.click(trigger);
            expect(mockHandlers.onClick).toHaveBeenCalled();

            fireEvent.focus(trigger);
            expect(mockHandlers.onFocus).toHaveBeenCalled();

            fireEvent.blur(trigger);
            expect(mockHandlers.onBlur).toHaveBeenCalled();
        });
    });

    describe('Accesibilidad', () => {
        test('configura aria-describedby cuando el tooltip está visible', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test tooltip" id="custom-tooltip">
                    <button>Test</button>
                </Tooltip>
            );

            const trigger = screen.getByRole('button');
            expect(trigger).toHaveAttribute('aria-describedby', 'custom-tooltip');
        });

        test('no configura aria-describedby cuando el tooltip no está visible', () => {
            render(
                <Tooltip content="Test tooltip">
                    <button>Test</button>
                </Tooltip>
            );

            const trigger = screen.getByRole('button');
            expect(trigger).not.toHaveAttribute('aria-describedby');
        });

        test('configura tabIndex para triggers de focus y click', () => {
            render(
                <Tooltip content="Test" trigger="focus">
                    <div>Focus trigger</div>
                </Tooltip>
            );

            const trigger = screen.getByText('Focus trigger');
            expect(trigger).toHaveAttribute('tabIndex', '0');
        });

        test('configura aria-expanded para trigger de click', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" trigger="click">
                    <button>Click trigger</button>
                </Tooltip>
            );

            const trigger = screen.getByRole('button');
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });

        test('maneja navegación por teclado para trigger de click', () => {
            const mockHandlers = {
                ...defaultMockReturn.handlers,
                onClick: vi.fn(),
            };

            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                handlers: mockHandlers,
            });

            render(
                <Tooltip content="Test" trigger="click">
                    <button>Click trigger</button>
                </Tooltip>
            );

            const trigger = screen.getByRole('button');

            // Test Enter key
            fireEvent.keyDown(trigger, { key: 'Enter' });
            expect(mockHandlers.onClick).toHaveBeenCalled();

            // Test Space key
            fireEvent.keyDown(trigger, { key: ' ' });
            expect(mockHandlers.onClick).toHaveBeenCalledTimes(2);
        });

        test('maneja tecla Escape para cerrar tooltip', () => {
            const mockHandlers = {
                ...defaultMockReturn.handlers,
                onBlur: vi.fn(),
            };

            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
                handlers: mockHandlers,
            });

            render(
                <Tooltip content="Test">
                    <button>Test</button>
                </Tooltip>
            );

            const trigger = screen.getByRole('button');
            fireEvent.keyDown(trigger, { key: 'Escape' });
            expect(mockHandlers.onBlur).toHaveBeenCalled();
        });
    });

    describe('Variantes y estilos', () => {
        test('aplica la variante por defecto', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test">
                    <button>Test</button>
                </Tooltip>
            );

            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toHaveClass('bg-gray-900', 'dark:bg-gray-700', 'text-white');
        });

        test('aplica variantes personalizadas', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" variant="info">
                    <button>Test</button>
                </Tooltip>
            );

            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toHaveClass('bg-blue-600', 'text-white');
        });

        test('renderiza icono cuando se proporciona', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" icon="info">
                    <button>Test</button>
                </Tooltip>
            );

            // Verificar que el icono está presente (lucide-react renderiza SVG)
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip.querySelector('svg')).toBeInTheDocument();
        });

        test('renderiza flecha cuando arrow es true', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" arrow={true}>
                    <button>Test</button>
                </Tooltip>
            );

            const tooltip = screen.getByRole('tooltip');
            const arrow = tooltip.querySelector('.border-4');
            expect(arrow).toBeInTheDocument();
        });

        test('no renderiza flecha cuando arrow es false', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" arrow={false}>
                    <button>Test</button>
                </Tooltip>
            );

            const tooltip = screen.getByRole('tooltip');
            const arrow = tooltip.querySelector('.border-4');
            expect(arrow).not.toBeInTheDocument();
        });
    });

    describe('Contenido rico', () => {
        test('renderiza contenido de texto simple', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Simple text content">
                    <button>Test</button>
                </Tooltip>
            );

            expect(screen.getByText('Simple text content')).toBeInTheDocument();
        });

        test('renderiza contenido JSX complejo', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            const complexContent = (
                <div>
                    <h4>Title</h4>
                    <p>Description</p>
                    <button>Action</button>
                </div>
            );

            render(
                <Tooltip content={complexContent}>
                    <button>Test</button>
                </Tooltip>
            );

            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
        });
    });

    describe('Componente deshabilitado', () => {
        test('no renderiza tooltip cuando está deshabilitado', () => {
            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" disabled={true}>
                    <button>Test</button>
                </Tooltip>
            );

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        test('renderiza solo el children cuando está deshabilitado', () => {
            render(
                <Tooltip content="Test" disabled={true}>
                    <button>Test button</button>
                </Tooltip>
            );

            expect(screen.getByRole('button', { name: 'Test button' })).toBeInTheDocument();
        });
    });

    describe('Portal rendering', () => {
        test('usa portal por defecto', () => {
            const createPortalSpy = vi.spyOn(require('react-dom'), 'createPortal');

            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test">
                    <button>Test</button>
                </Tooltip>
            );

            expect(createPortalSpy).toHaveBeenCalled();
        });

        test('no usa portal cuando portal=false', () => {
            const createPortalSpy = vi.spyOn(require('react-dom'), 'createPortal');

            mockUseTooltip.mockReturnValue({
                ...defaultMockReturn,
                isVisible: true,
            });

            render(
                <Tooltip content="Test" portal={false}>
                    <button>Test</button>
                </Tooltip>
            );

            expect(createPortalSpy).not.toHaveBeenCalled();
        });
    });
});

describe('SimpleTooltip Component', () => {
    beforeEach(() => {
        mockUseTooltip.mockReturnValue(defaultMockReturn);
    });

    test('renderiza correctamente con texto simple', () => {
        render(
            <SimpleTooltip text="Simple tooltip">
                <button>Test</button>
            </SimpleTooltip>
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});

describe('HelpTooltip Component', () => {
    beforeEach(() => {
        mockUseTooltip.mockReturnValue(defaultMockReturn);
    });

    test('renderiza icono de ayuda', () => {
        render(<HelpTooltip text="Help text" />);

        // Verificar que el icono SVG está presente
        expect(document.querySelector('svg')).toBeInTheDocument();
    });
});

describe('InfoTooltip Component', () => {
    beforeEach(() => {
        mockUseTooltip.mockReturnValue(defaultMockReturn);
    });

    test('renderiza icono de información', () => {
        render(<InfoTooltip text="Info text" />);

        // Verificar que el icono SVG está presente
        expect(document.querySelector('svg')).toBeInTheDocument();
    });
});