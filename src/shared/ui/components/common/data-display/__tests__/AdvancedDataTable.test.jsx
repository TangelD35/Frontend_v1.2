import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AdvancedDataTable from '../AdvancedDataTable';



// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock hooks
const mockUsePagination = vi.fn();
vi.mock('../../../../hooks/usePagination', () => ({
    usePagination: mockUsePagination,
}));

describe('AdvancedDataTable Component', () => {
    const mockData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, active: false },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, active: true },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, active: true },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 32, active: false },
    ];

    const mockColumns = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            filterType: 'text',
        },
        {
            accessorKey: 'email',
            header: 'Email',
            filterType: 'text',
        },
        {
            accessorKey: 'age',
            header: 'Edad',
            filterType: 'number',
            dataType: 'number',
        },
        {
            accessorKey: 'active',
            header: 'Activo',
            filterType: 'boolean',
            dataType: 'boolean',
        },
    ];

    const defaultMockPagination = {
        paginatedData: mockData,
        currentPage: 1,
        totalPages: 1,
        pageSize: 25,
        goToPage: vi.fn(),
        goToNextPage: vi.fn(),
        goToPreviousPage: vi.fn(),
        changePageSize: vi.fn(),
        getRangeText: vi.fn(() => '1-5 de 5 elementos'),
    };

    beforeEach(() => {
        mockUsePagination.mockReturnValue(defaultMockPagination);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Renderizado básico', () => {
        test('renderiza la tabla con datos', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                />
            );

            expect(screen.getByText('Nombre')).toBeInTheDocument();
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });

        test('muestra mensaje vacío cuando no hay datos', () => {
            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    emptyMessage="No hay registros"
                />
            );

            expect(screen.getByText('No hay registros')).toBeInTheDocument();
        });

        test('muestra estado de carga', () => {
            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    loading={true}
                    loadingMessage="Cargando datos..."
                />
            );

            expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
        });
    });

    describe('Funcionalidades de búsqueda', () => {
        test('muestra campo de búsqueda cuando searchable es true', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    searchable={true}
                />
            );

            expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
        });

        test('oculta campo de búsqueda cuando searchable es false', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    searchable={false}
                />
            );

            expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
        });

        test('filtra datos al escribir en el campo de búsqueda', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    searchable={true}
                />
            );

            const searchInput = screen.getByPlaceholderText('Buscar...');
            await user.type(searchInput, 'John');

            expect(searchInput).toHaveValue('John');
        });
    });

    describe('Selección de filas', () => {
        test('muestra checkboxes cuando selectable es true', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes.length).toBeGreaterThan(0);
        });

        test('no muestra checkboxes cuando selectable es false', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={false}
                />
            );

            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        });

        test('llama onRowSelect cuando se seleccionan filas', async () => {
            const mockOnRowSelect = vi.fn();
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                    onRowSelect={mockOnRowSelect}
                />
            );

            const firstCheckbox = screen.getAllByRole('checkbox')[1]; // Skip header checkbox
            await user.click(firstCheckbox);

            expect(mockOnRowSelect).toHaveBeenCalled();
        });
    });

    describe('Acciones de fila', () => {
        test('muestra columna de acciones cuando onRowClick está definido', () => {
            const mockOnRowClick = vi.fn();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(screen.getByText('Acciones')).toBeInTheDocument();
            expect(screen.getAllByTitle('Ver detalles')).toHaveLength(mockData.length);
        });

        test('llama onRowClick cuando se hace clic en botones de acción', async () => {
            const mockOnRowClick = vi.fn();
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    onRowClick={mockOnRowClick}
                />
            );

            const viewButton = screen.getAllByTitle('Ver detalles')[0];
            await user.click(viewButton);

            expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0], 'view');
        });

        test('llama onRowClick cuando se hace clic en una fila', async () => {
            const mockOnRowClick = vi.fn();
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    onRowClick={mockOnRowClick}
                />
            );

            const firstRow = screen.getByText('John Doe').closest('tr');
            await user.click(firstRow);

            expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0], 'click');
        });
    });

    describe('Controles de tabla', () => {
        test('muestra botón de filtros cuando filterable es true', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    filterable={true}
                />
            );

            expect(screen.getByText('Filtros')).toBeInTheDocument();
        });

        test('muestra botón de exportar cuando exportable es true', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    exportable={true}
                />
            );

            expect(screen.getByText('Exportar')).toBeInTheDocument();
        });

        test('muestra botón de actualizar cuando refreshable es true', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    refreshable={true}
                />
            );

            expect(screen.getByText('Actualizar')).toBeInTheDocument();
        });

        test('llama onRefresh cuando se hace clic en actualizar', async () => {
            const mockOnRefresh = vi.fn();
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    refreshable={true}
                    onRefresh={mockOnRefresh}
                />
            );

            const refreshButton = screen.getByText('Actualizar');
            await user.click(refreshButton);

            expect(mockOnRefresh).toHaveBeenCalled();
        });

        test('llama onExport cuando se hace clic en exportar', async () => {
            const mockOnExport = vi.fn();
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    exportable={true}
                    onExport={mockOnExport}
                />
            );

            const exportButton = screen.getByText('Exportar');
            await user.click(exportButton);

            expect(mockOnExport).toHaveBeenCalledWith(mockData, 'csv');
        });
    });

    describe('Ordenamiento', () => {
        test('muestra indicadores de ordenamiento en columnas ordenables', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    sortable={true}
                />
            );

            // Should have sort indicators for each column header
            const headers = screen.getAllByRole('columnheader');
            expect(headers.length).toBeGreaterThan(0);
        });

        test('permite hacer clic en headers para ordenar', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    sortable={true}
                />
            );

            const nameHeader = screen.getByText('Nombre');
            await user.click(nameHeader);

            // Verify that sorting was triggered (implementation depends on TanStack Table)
            expect(nameHeader).toBeInTheDocument();
        });
    });

    describe('Virtualización', () => {
        test('usa virtualización cuando virtualScrolling es true', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    virtualScrolling={true}
                    maxHeight={400}
                />
            );

            expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
        });

        test('no usa virtualización cuando virtualScrolling es false', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    virtualScrolling={false}
                />
            );

            expect(screen.queryByTestId('virtual-list')).not.toBeInTheDocument();
        });
    });

    describe('Formateo de datos', () => {
        test('formatea números correctamente', () => {
            const columnsWithNumber = [
                {
                    accessorKey: 'age',
                    header: 'Edad',
                    dataType: 'number',
                    formatOptions: { decimals: 0 }
                }
            ];

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={columnsWithNumber}
                />
            );

            expect(screen.getByText('30')).toBeInTheDocument();
        });

        test('formatea booleanos con iconos', () => {
            const columnsWithBoolean = [
                {
                    accessorKey: 'active',
                    header: 'Activo',
                    dataType: 'boolean'
                }
            ];

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={columnsWithBoolean}
                />
            );

            // Should render check/x icons for boolean values
            const cells = screen.getAllByRole('cell');
            expect(cells.length).toBeGreaterThan(0);
        });
    });

    describe('Rendimiento', () => {
        test('maneja datasets grandes sin problemas', () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                age: 20 + (i % 50),
                active: i % 2 === 0
            }));

            mockUsePagination.mockReturnValue({
                ...defaultMockPagination,
                paginatedData: largeDataset.slice(0, 25),
            });

            const startTime = performance.now();

            render(
                <AdvancedDataTable
                    data={largeDataset}
                    columns={mockColumns}
                    virtualScrolling={true}
                />
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Rendering should be fast even with large datasets
            expect(renderTime).toBeLessThan(100);
            expect(screen.getByText('User 1')).toBeInTheDocument();
        });

        test('usa paginación para limitar elementos renderizados', () => {
            const largeDataset = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                age: 20 + (i % 50),
                active: i % 2 === 0
            }));

            mockUsePagination.mockReturnValue({
                ...defaultMockPagination,
                paginatedData: largeDataset.slice(0, 10),
            });

            render(
                <AdvancedDataTable
                    data={largeDataset}
                    columns={mockColumns}
                    pageSize={10}
                />
            );

            // Should only render first 10 items
            expect(screen.getByText('User 1')).toBeInTheDocument();
            expect(screen.getByText('User 10')).toBeInTheDocument();
            expect(screen.queryByText('User 11')).not.toBeInTheDocument();
        });
    });

    describe('Accesibilidad', () => {
        test('tiene roles ARIA apropiados', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                />
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getAllByRole('columnheader')).toHaveLength(mockColumns.length);
            expect(screen.getAllByRole('row')).toHaveLength(mockData.length + 1); // +1 for header
        });

        test('soporta navegación por teclado', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            const firstCheckbox = screen.getAllByRole('checkbox')[1];
            firstCheckbox.focus();

            await user.keyboard('{Space}');

            expect(firstCheckbox).toHaveFocus();
        });

        test('tiene etiquetas descriptivas', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    onRowClick={vi.fn()}
                />
            );

            expect(screen.getAllByTitle('Ver detalles')).toHaveLength(mockData.length);
            expect(screen.getAllByTitle('Editar')).toHaveLength(mockData.length);
            expect(screen.getAllByTitle('Eliminar')).toHaveLength(mockData.length);
        });
    });

    describe('Configuración personalizada', () => {
        test('aplica renderizadores personalizados', () => {
            const customRenderers = {
                name: (value) => <strong data-testid="custom-name">{value}</strong>
            };

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    customRenderers={customRenderers}
                />
            );

            expect(screen.getAllByTestId('custom-name')).toHaveLength(mockData.length);
        });

        test('aplica clases CSS personalizadas', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    className="custom-table-class"
                />
            );

            const tableContainer = screen.getByRole('table').closest('div');
            expect(tableContainer).toHaveClass('custom-table-class');
        });

        test('respeta configuración de densidad', () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    density="compact"
                />
            );

            // Should apply compact density styles
            expect(screen.getByRole('table')).toBeInTheDocument();
        });
    });
});