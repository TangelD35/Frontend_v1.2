import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AdvancedDataTable from '../../data-display/AdvancedDataTable';
import { TableApiIntegration } from '../../utils/apiIntegration';
import websocketService from '../../../../services/websocketService';

// Mock dependencies
vi.mock('../../utils/apiIntegration');
vi.mock('../../../../services/websocketService');
vi.mock('../../../../store/authStore', () => ({
    default: vi.fn(() => ({
        isAuthenticated: true,
        checkPermission: vi.fn(() => true),
        user: { id: 1, role: 'admin' },
        token: 'mock-token'
    }))
}));

describe('AdvancedDataTable Integration Tests', () => {
    const mockData = [
        { id: 1, name: 'Juan Pérez', position: 'Base', team: 'Selección Nacional', points: 15.5 },
        { id: 2, name: 'Carlos Rodríguez', position: 'Alero', team: 'Selección Nacional', points: 12.3 },
        { id: 3, name: 'Miguel Santos', position: 'Pívot', team: 'Selección Nacional', points: 18.7 },
    ];

    const mockColumns = [
        { accessorKey: 'name', header: 'Nombre', sortable: true, filterable: true },
        { accessorKey: 'position', header: 'Posición', sortable: true, filterable: true },
        { accessorKey: 'team', header: 'Equipo', sortable: false, filterable: true },
        { accessorKey: 'points', header: 'Puntos', sortable: true, filterable: false, dataType: 'number' },
    ];

    let mockApiIntegration;
    let user;

    beforeEach(() => {
        user = userEvent.setup();

        // Mock API integration
        mockApiIntegration = {
            fetchData: vi.fn().mockResolvedValue({
                data: mockData,
                totalCount: mockData.length,
                pageCount: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            }),
            exportData: vi.fn().mockResolvedValue(true),
            performBulkAction: vi.fn().mockResolvedValue({ success: true }),
            subscribeToUpdates: vi.fn().mockReturnValue(() => { }),
            unsubscribeFromUpdates: vi.fn(),
            cleanup: vi.fn(),
        };

        TableApiIntegration.mockImplementation(() => mockApiIntegration);

        // Mock WebSocket service
        websocketService.on = vi.fn().mockReturnValue(() => { });
        websocketService.send = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('API Integration', () => {
        it('should fetch data from API when serverSide is enabled', async () => {
            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            await waitFor(() => {
                expect(mockApiIntegration.fetchData).toHaveBeenCalledWith({
                    page: 0,
                    pageSize: 25,
                    sortBy: [],
                    filters: {},
                    globalFilter: '',
                });
            });

            // Verify data is displayed
            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
                expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
                expect(screen.getByText('Miguel Santos')).toBeInTheDocument();
            });
        });

        it('should handle API errors gracefully', async () => {
            const errorMessage = 'Failed to fetch data';
            mockApiIntegration.fetchData.mockRejectedValue(new Error(errorMessage));

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument();
            });
        });

        it('should perform bulk actions via API', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Select first row
            const firstCheckbox = screen.getAllByRole('checkbox')[1]; // Skip header checkbox
            await user.click(firstCheckbox);

            // Verify selection
            await waitFor(() => {
                expect(screen.getByText(/1 elemento\(s\) seleccionado\(s\)/)).toBeInTheDocument();
            });
        });

        it('should export data via API', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    exportable={true}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Click export button
            const exportButton = screen.getByRole('button', { name: /exportar/i });
            await user.click(exportButton);

            await waitFor(() => {
                expect(mockApiIntegration.exportData).toHaveBeenCalledWith(
                    mockData,
                    'csv',
                    expect.stringMatching(/table-export-\d+/)
                );
            });
        });
    });

    describe('Real-time Updates', () => {
        it('should subscribe to WebSocket updates when enabled', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    enableRealTimeUpdates={true}
                    tableId="players-table"
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            await waitFor(() => {
                expect(mockApiIntegration.subscribeToUpdates).toHaveBeenCalledWith(
                    'players-table',
                    expect.any(Function)
                );
            });
        });

        it('should handle real-time data updates', async () => {
            let updateCallback;
            mockApiIntegration.subscribeToUpdates.mockImplementation((tableId, callback) => {
                updateCallback = callback;
                return () => { };
            });

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    enableRealTimeUpdates={true}
                    tableId="players-table"
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            // Wait for initial data
            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Simulate real-time update
            const updatedItem = { id: 1, name: 'Juan Pérez Updated', position: 'Base', team: 'Selección Nacional', points: 20.5 };
            updateCallback({
                type: 'update',
                item: updatedItem
            });

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez Updated')).toBeInTheDocument();
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
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    requireAuth={true}
                    requiredPermission="admin"
                />
            );

            expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
            expect(screen.getByText(/no tienes permisos/i)).toBeInTheDocument();
        });

        it('should show table when user has permissions', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    requireAuth={true}
                    requiredPermission="admin"
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });
        });
    });

    describe('Performance Integration', () => {
        it('should debounce search input', async () => {
            vi.useFakeTimers();

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    searchable={true}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            const searchInput = screen.getByPlaceholderText(/buscar/i);

            // Type in search input
            await user.type(searchInput, 'Juan');

            // Should not call API immediately
            expect(mockApiIntegration.fetchData).toHaveBeenCalledTimes(1); // Initial call only

            // Fast-forward time to trigger debounce
            vi.advanceTimersByTime(300);

            await waitFor(() => {
                expect(mockApiIntegration.fetchData).toHaveBeenCalledWith(
                    expect.objectContaining({
                        globalFilter: 'Juan'
                    })
                );
            });

            vi.useRealTimers();
        });

        it('should handle large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
                position: ['Base', 'Alero', 'Pívot'][index % 3],
                team: 'Selección Nacional',
                points: Math.random() * 30
            }));

            mockApiIntegration.fetchData.mockResolvedValue({
                data: largeDataset.slice(0, 25),
                totalCount: largeDataset.length,
                pageCount: 40,
                hasNextPage: true,
                hasPreviousPage: false,
            });

            const startTime = performance.now();

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    serverSide={true}
                    apiEndpoint="/api/players"
                    pageSize={25}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Player 1')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time (less than 1 second)
            expect(renderTime).toBeLessThan(1000);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle network errors', async () => {
            mockApiIntegration.fetchData.mockRejectedValue({
                status: 0,
                message: 'Error de conexión. Verifica tu conexión a internet.'
            });

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            await waitFor(() => {
                expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
            });
        });

        it('should handle 401 unauthorized errors', async () => {
            mockApiIntegration.fetchData.mockRejectedValue({
                status: 401,
                message: 'Token expirado o no válido'
            });

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            await waitFor(() => {
                expect(screen.getByText(/sesión expirada/i)).toBeInTheDocument();
            });
        });

        it('should handle 500 server errors', async () => {
            mockApiIntegration.fetchData.mockRejectedValue({
                status: 500,
                message: 'Error interno del servidor'
            });

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={mockColumns}
                    serverSide={true}
                    apiEndpoint="/api/players"
                />
            );

            await waitFor(() => {
                expect(screen.getByText(/error interno del servidor/i)).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Integration', () => {
        it('should adapt to mobile viewport', async () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Should have mobile-specific classes or behavior
            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();
        });

        it('should handle touch interactions', async () => {
            // Mock touch device
            Object.defineProperty(navigator, 'maxTouchPoints', {
                writable: true,
                configurable: true,
                value: 5,
            });

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Should handle touch events properly
            const firstRow = screen.getByText('Juan Pérez').closest('tr');
            fireEvent.touchStart(firstRow);
            fireEvent.touchEnd(firstRow);

            // Verify touch interaction works
            expect(firstRow).toBeInTheDocument();
        });
    });

    describe('Accessibility Integration', () => {
        it('should be keyboard navigable', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Test keyboard navigation
            const firstCheckbox = screen.getAllByRole('checkbox')[1];
            firstCheckbox.focus();

            // Press space to select
            fireEvent.keyDown(firstCheckbox, { key: ' ', code: 'Space' });

            await waitFor(() => {
                expect(firstCheckbox).toBeChecked();
            });
        });

        it('should have proper ARIA labels', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Check for proper ARIA attributes
            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();

            const columnHeaders = screen.getAllByRole('columnheader');
            expect(columnHeaders).toHaveLength(mockColumns.length + 1); // +1 for selection column
        });

        it('should announce changes to screen readers', async () => {
            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Select a row
            const firstCheckbox = screen.getAllByRole('checkbox')[1];
            await user.click(firstCheckbox);

            // Should announce selection
            await waitFor(() => {
                expect(screen.getByText(/1 elemento\(s\) seleccionado\(s\)/)).toBeInTheDocument();
            });
        });
    });
});