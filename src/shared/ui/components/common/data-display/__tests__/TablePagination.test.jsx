import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TablePagination from '../TablePagination';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
}));

describe('TablePagination Component', () => {
    const defaultProps = {
        currentPage: 1,
        totalPages: 10,
        totalItems: 250,
        pageSize: 25,
        onPageChange: vi.fn(),
        onPageSizeChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Renderizado básico', () => {
        test('renderiza información de paginación', () => {
            render(<TablePagination {...defaultProps} />);

            expect(screen.getByText('Mostrando 1 - 25 de 250 resultados')).toBeInTheDocument();
            expect(screen.getByText('Página 1 de 10')).toBeInTheDocument();
        });

        test('renderiza selector de tamaño de página', () => {
            render(<TablePagination {...defaultProps} showPageSizeSelector={true} />);

            expect(screen.getByText('Mostrar')).toBeInTheDocument();
            expect(screen.getByText('por página')).toBeInTheDocument();
            expect(screen.getByDisplayValue('25')).toBeInTheDocument();
        });

        test('oculta selector de tamaño cuando showPageSizeSelector es false', () => {
            render(<TablePagination {...defaultProps} showPageSizeSelector={false} />);

            expect(screen.queryByText('Mostrar')).not.toBeInTheDocument();
            expect(screen.queryByText('por página')).not.toBeInTheDocument();
        });

        test('no renderiza nada cuando hay una sola página y no hay selector de tamaño', () => {
            const { container } = render(
                <TablePagination
                    {...defaultProps}
                    totalPages={1}
                    showPageSizeSelector={false}
                />
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe('Navegación de páginas', () => {
        test('deshabilita botones de primera página y anterior en la primera página', () => {
            render(<TablePagination {...defaultProps} currentPage={1} />);

            const firstPageButton = screen.getByTitle('Primera página');
            const prevPageButton = screen.getByTitle('Página anterior');

            expect(firstPageButton).toBeDisabled();
            expect(prevPageButton).toBeDisabled();
        });

        test('deshabilita botones de última página y siguiente en la última página', () => {
            render(<TablePagination {...defaultProps} currentPage={10} totalPages={10} />);

            const lastPageButton = screen.getByTitle('Última página');
            const nextPageButton = screen.getByTitle('Página siguiente');

            expect(lastPageButton).toBeDisabled();
            expect(nextPageButton).toBeDisabled();
        });

        test('llama onPageChange cuando se hace clic en botones de navegación', async () => {
            const user = userEvent.setup();
            const mockOnPageChange = vi.fn();

            render(
                <TablePagination
                    {...defaultProps}
                    currentPage={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const firstPageButton = screen.getByTitle('Primera página');
            const prevPageButton = screen.getByTitle('Página anterior');
            const nextPageButton = screen.getByTitle('Página siguiente');
            const lastPageButton = screen.getByTitle('Última página');

            await user.click(firstPageButton);
            expect(mockOnPageChange).toHaveBeenCalledWith(1);

            await user.click(prevPageButton);
            expect(mockOnPageChange).toHaveBeenCalledWith(4);

            await user.click(nextPageButton);
            expect(mockOnPageChange).toHaveBeenCalledWith(6);

            await user.click(lastPageButton);
            expect(mockOnPageChange).toHaveBeenCalledWith(10);
        });

        test('llama onPageChange cuando se hace clic en números de página', async () => {
            const user = userEvent.setup();
            const mockOnPageChange = vi.fn();

            render(
                <TablePagination
                    {...defaultProps}
                    currentPage={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const pageButton = screen.getByText('3');
            await user.click(pageButton);

            expect(mockOnPageChange).toHaveBeenCalledWith(3);
        });
    });

    describe('Selector de tamaño de página', () => {
        test('llama onPageSizeChange cuando se cambia el tamaño de página', async () => {
            const user = userEvent.setup();
            const mockOnPageSizeChange = vi.fn();

            render(
                <TablePagination
                    {...defaultProps}
                    onPageSizeChange={mockOnPageSizeChange}
                    showPageSizeSelector={true}
                />
            );

            const select = screen.getByDisplayValue('25');
            await user.selectOptions(select, '50');

            expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
        });

        test('muestra opciones de tamaño de página personalizadas', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    pageSizeOptions={[5, 15, 30]}
                    showPageSizeSelector={true}
                />
            );

            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('15')).toBeInTheDocument();
            expect(screen.getByText('30')).toBeInTheDocument();
        });
    });

    describe('Salto rápido a página', () => {
        test('muestra campo de salto rápido cuando showQuickJumper es true', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    totalPages={20}
                    showQuickJumper={true}
                />
            );

            expect(screen.getByText('Ir a:')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
        });

        test('oculta campo de salto rápido cuando showQuickJumper es false', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    showQuickJumper={false}
                />
            );

            expect(screen.queryByText('Ir a:')).not.toBeInTheDocument();
        });

        test('navega a página específica al enviar formulario de salto', async () => {
            const user = userEvent.setup();
            const mockOnPageChange = vi.fn();

            render(
                <TablePagination
                    {...defaultProps}
                    totalPages={20}
                    onPageChange={mockOnPageChange}
                    showQuickJumper={true}
                />
            );

            const jumpInput = screen.getByPlaceholderText('1');
            await user.type(jumpInput, '7');
            await user.keyboard('{Enter}');

            expect(mockOnPageChange).toHaveBeenCalledWith(7);
        });

        test('no navega a página inválida', async () => {
            const user = userEvent.setup();
            const mockOnPageChange = vi.fn();

            render(
                <TablePagination
                    {...defaultProps}
                    totalPages={10}
                    onPageChange={mockOnPageChange}
                    showQuickJumper={true}
                />
            );

            const jumpInput = screen.getByPlaceholderText('1');
            await user.type(jumpInput, '15');
            await user.keyboard('{Enter}');

            expect(mockOnPageChange).not.toHaveBeenCalled();
        });
    });

    describe('Números de página visibles', () => {
        test('muestra todos los números cuando hay pocas páginas', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    totalPages={5}
                    maxVisiblePages={7}
                />
            );

            for (let i = 1; i <= 5; i++) {
                expect(screen.getByText(i.toString())).toBeInTheDocument();
            }
        });

        test('muestra elipsis cuando hay muchas páginas', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    currentPage={10}
                    totalPages={20}
                    maxVisiblePages={7}
                />
            );

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('20')).toBeInTheDocument();
            // Should show ellipsis (represented by MoreHorizontal icon)
        });

        test('resalta la página actual', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    currentPage={3}
                />
            );

            const currentPageButton = screen.getByText('3');
            expect(currentPageButton).toHaveClass('bg-blue-600');
        });
    });

    describe('Información de elementos', () => {
        test('calcula correctamente el rango de elementos mostrados', () => {
            render(
                <TablePagination
                    currentPage={3}
                    totalPages={10}
                    totalItems={250}
                    pageSize={25}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByText('Mostrando 51 - 75 de 250 resultados')).toBeInTheDocument();
        });

        test('maneja correctamente la última página parcial', () => {
            render(
                <TablePagination
                    currentPage={11}
                    totalPages={11}
                    totalItems={253}
                    pageSize={25}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByText('Mostrando 251 - 253 de 253 resultados')).toBeInTheDocument();
        });

        test('oculta información cuando showPageInfo es false', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    showPageInfo={false}
                />
            );

            expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
        });
    });

    describe('Tamaños de componente', () => {
        test('aplica clases de tamaño pequeño', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    size="small"
                />
            );

            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toHaveClass('text-xs');
        });

        test('aplica clases de tamaño grande', () => {
            render(
                <TablePagination
                    {...defaultProps}
                    size="large"
                />
            );

            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toHaveClass('text-base');
        });
    });

    describe('Casos edge', () => {
        test('maneja totalItems de 0', () => {
            render(
                <TablePagination
                    currentPage={1}
                    totalPages={1}
                    totalItems={0}
                    pageSize={25}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
        });

        test('no permite navegación fuera de rango', async () => {
            const user = userEvent.setup();
            const mockOnPageChange = vi.fn();

            render(
                <TablePagination
                    {...defaultProps}
                    currentPage={5}
                    onPageChange={mockOnPageChange}
                />
            );

            // Try to navigate to same page
            const currentPageButton = screen.getByText('5');
            await user.click(currentPageButton);

            expect(mockOnPageChange).not.toHaveBeenCalled();
        });
    });
});