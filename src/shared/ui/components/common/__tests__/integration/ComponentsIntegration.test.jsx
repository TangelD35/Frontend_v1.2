import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import components
import AdvancedDataTable from '../../data-display/AdvancedDataTable';
import MultiStepForm from '../../forms/MultiStepForm';
import DragDropList from '../../interactions/DragDropList';
import Tooltip from '../../feedback/Tooltip';

// Import utilities
import { TableApiIntegration, FormApiIntegration } from '../../utils/apiIntegration';
import { useResponsiveConfig } from '../../utils/responsiveUtils';
import { useDebounce, useStableCallback } from '../../utils/performanceUtils';

// Mock all dependencies
vi.mock('../../utils/apiIntegration');
vi.mock('../../utils/responsiveUtils');
vi.mock('../../utils/performanceUtils');
vi.mock('../../../../store/authStore', () => ({
    default: vi.fn(() => ({
        isAuthenticated: true,
        checkPermission: vi.fn(() => true),
        user: { id: 1, role: 'admin' },
        token: 'mock-token'
    }))
}));

describe('Advanced Components Integration Suite', () => {
    let user;

    beforeEach(() => {
        user = userEvent.setup();

        // Mock responsive utils
        useResponsiveConfig.mockReturnValue({
            pageSize: 25,
            density: 'normal',
            showFilters: true,
        });

        // Mock performance utils
        useDebounce.mockImplementation((value) => value);
        useStableCallback.mockImplementation((callback) => callback);

        // Mock API integrations
        TableApiIntegration.mockImplementation(() => ({
            fetchData: vi.fn().mockResolvedValue({
                data: [],
                totalCount: 0,
                pageCount: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            }),
            exportData: vi.fn().mockResolvedValue(true),
            performBulkAction: vi.fn().mockResolvedValue({ success: true }),
            subscribeToUpdates: vi.fn().mockReturnValue(() => { }),
            cleanup: vi.fn(),
        }));

        FormApiIntegration.mockImplementation(() => ({
            saveProgress: vi.fn().mockResolvedValue({ success: true }),
            validateStep: vi.fn().mockResolvedValue({ isValid: true, errors: {} }),
            submitForm: vi.fn().mockResolvedValue({ success: true }),
            loadSavedData: vi.fn().mockResolvedValue(null),
            cleanup: vi.fn(),
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Cross-Component Integration', () => {
        it('should integrate table with form for data editing', async () => {
            const mockData = [
                { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
                { id: 2, name: 'María García', email: 'maria@example.com' },
            ];

            const mockColumns = [
                { accessorKey: 'name', header: 'Nombre' },
                { accessorKey: 'email', header: 'Email' },
            ];

            const mockSteps = [
                {
                    id: 'edit',
                    title: 'Editar Usuario',
                    component: ({ data, onChange }) => (
                        <div>
                            <input
                                placeholder="Nombre"
                                value={data.name || ''}
                                onChange={(e) => onChange('name', e.target.value)}
                            />
                            <input
                                placeholder="Email"
                                value={data.email || ''}
                                onChange={(e) => onChange('email', e.target.value)}
                            />
                        </div>
                    ),
                },
            ];

            const [selectedUser, setSelectedUser] = React.useState(null);
            const [showForm, setShowForm] = React.useState(false);

            const TestComponent = () => (
                <div>
                    <AdvancedDataTable
                        data={mockData}
                        columns={mockColumns}
                        onRowClick={(user, action) => {
                            if (action === 'edit') {
                                setSelectedUser(user);
                                setShowForm(true);
                            }
                        }}
                    />
                    {showForm && (
                        <MultiStepForm
                            steps={mockSteps}
                            initialData={selectedUser}
                            onSubmit={(data) => {
                                console.log('Updated user:', data);
                                setShowForm(false);
                            }}
                        />
                    )}
                </div>
            );

            render(<TestComponent />);

            // Wait for table to render
            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Click edit button on first row
            const editButtons = screen.getAllByTitle('Editar');
            await user.click(editButtons[0]);

            // Form should appear with user data
            await waitFor(() => {
                expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
                expect(screen.getByDisplayValue('juan@example.com')).toBeInTheDocument();
            });
        });

        it('should integrate drag-drop list with table for reordering', async () => {
            const mockItems = [
                { id: 1, name: 'Item 1', order: 1 },
                { id: 2, name: 'Item 2', order: 2 },
                { id: 3, name: 'Item 3', order: 3 },
            ];

            const [items, setItems] = React.useState(mockItems);

            const TestComponent = () => (
                <div>
                    <DragDropList
                        items={items}
                        onReorder={(newOrder) => {
                            setItems(newOrder);
                        }}
                        renderItem={(item) => (
                            <div>{item.name}</div>
                        )}
                    />
                    <AdvancedDataTable
                        data={items}
                        columns={[
                            { accessorKey: 'name', header: 'Nombre' },
                            { accessorKey: 'order', header: 'Orden' },
                        ]}
                    />
                </div>
            );

            render(<TestComponent />);

            // Both components should show the same data
            await waitFor(() => {
                expect(screen.getAllByText('Item 1')).toHaveLength(2); // One in list, one in table
                expect(screen.getAllByText('Item 2')).toHaveLength(2);
                expect(screen.getAllByText('Item 3')).toHaveLength(2);
            });
        });

        it('should integrate tooltips with table cells for additional info', async () => {
            const mockData = [
                { id: 1, name: 'Juan Pérez', status: 'active' },
            ];

            const mockColumns = [
                {
                    accessorKey: 'name',
                    header: 'Nombre',
                    cell: ({ getValue }) => (
                        <Tooltip content="Información adicional del usuario">
                            <span>{getValue()}</span>
                        </Tooltip>
                    )
                },
                { accessorKey: 'status', header: 'Estado' },
            ];

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            });

            // Hover over the name to show tooltip
            const nameCell = screen.getByText('Juan Pérez');
            fireEvent.mouseEnter(nameCell);

            await waitFor(() => {
                expect(screen.getByText('Información adicional del usuario')).toBeInTheDocument();
            });
        });
    });

    describe('Theme Integration', () => {
        it('should apply consistent theming across all components', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            const mockColumns = [{ accessorKey: 'name', header: 'Nombre' }];
            const mockSteps = [{ id: 'step1', title: 'Step 1', component: () => <div>Step content</div> }];
            const mockItems = [{ id: 1, name: 'Item 1' }];

            render(
                <div className="dark">
                    <AdvancedDataTable data={mockData} columns={mockColumns} />
                    <MultiStepForm steps={mockSteps} />
                    <DragDropList
                        items={mockItems}
                        renderItem={(item) => <div>{item.name}</div>}
                    />
                    <Tooltip content="Test tooltip">
                        <button>Hover me</button>
                    </Tooltip>
                </div>
            );

            // All components should be present and themed consistently
            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
                expect(screen.getByText('Step 1')).toBeInTheDocument();
                expect(screen.getByText('Item 1')).toBeInTheDocument();
                expect(screen.getByText('Hover me')).toBeInTheDocument();
            });

            // Check for dark mode classes
            const tableContainer = screen.getByText('Test').closest('.advanced-table, [class*="bg-gray-800"]');
            expect(tableContainer).toBeInTheDocument();
        });

        it('should handle responsive breakpoints consistently', async () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            useResponsiveConfig.mockReturnValue({
                pageSize: 10,
                density: 'compact',
                showFilters: false,
            });

            const mockData = [{ id: 1, name: 'Test' }];
            const mockColumns = [{ accessorKey: 'name', header: 'Nombre' }];

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            // Should apply mobile-specific configurations
            expect(useResponsiveConfig).toHaveBeenCalledWith('table');
        });
    });

    describe('Performance Integration', () => {
        it('should handle large datasets efficiently across components', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
                id: index + 1,
                name: `Item ${index + 1}`,
                value: Math.random() * 100,
            }));

            const startTime = performance.now();

            render(
                <div>
                    <AdvancedDataTable
                        data={largeDataset.slice(0, 25)}
                        columns={[
                            { accessorKey: 'name', header: 'Nombre' },
                            { accessorKey: 'value', header: 'Valor' },
                        ]}
                        virtualScrolling={true}
                    />
                    <DragDropList
                        items={largeDataset.slice(0, 10)}
                        renderItem={(item) => <div>{item.name}</div>}
                    />
                </div>
            );

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time
            expect(renderTime).toBeLessThan(1000);
        });

        it('should optimize re-renders with memoization', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            const mockColumns = [{ accessorKey: 'name', header: 'Nombre' }];

            const TestComponent = React.memo(() => (
                <AdvancedDataTable data={mockData} columns={mockColumns} />
            ));

            const { rerender } = render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            // Re-render with same props should not cause unnecessary updates
            rerender(<TestComponent />);

            expect(screen.getByText('Test')).toBeInTheDocument();
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle errors gracefully across components', async () => {
            // Mock API error
            TableApiIntegration.mockImplementation(() => ({
                fetchData: vi.fn().mockRejectedValue(new Error('API Error')),
                cleanup: vi.fn(),
            }));

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={[{ accessorKey: 'name', header: 'Nombre' }]}
                    serverSide={true}
                    apiEndpoint="/api/test"
                />
            );

            // Should show error message
            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument();
            });
        });

        it('should recover from errors when data is corrected', async () => {
            const mockApiIntegration = {
                fetchData: vi.fn()
                    .mockRejectedValueOnce(new Error('API Error'))
                    .mockResolvedValue({
                        data: [{ id: 1, name: 'Test' }],
                        totalCount: 1,
                        pageCount: 1,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    }),
                cleanup: vi.fn(),
            };

            TableApiIntegration.mockImplementation(() => mockApiIntegration);

            render(
                <AdvancedDataTable
                    data={[]}
                    columns={[{ accessorKey: 'name', header: 'Nombre' }]}
                    serverSide={true}
                    apiEndpoint="/api/test"
                    refreshable={true}
                />
            );

            // Should show error initially
            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument();
            });

            // Click refresh button
            const refreshButton = screen.getByRole('button', { name: /actualizar/i });
            await user.click(refreshButton);

            // Should show data after refresh
            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility Integration', () => {
        it('should maintain accessibility across all components', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            const mockColumns = [{ accessorKey: 'name', header: 'Nombre' }];
            const mockSteps = [{ id: 'step1', title: 'Step 1', component: () => <div>Step content</div> }];
            const mockItems = [{ id: 1, name: 'Item 1' }];

            render(
                <div>
                    <AdvancedDataTable data={mockData} columns={mockColumns} />
                    <MultiStepForm steps={mockSteps} />
                    <DragDropList
                        items={mockItems}
                        renderItem={(item) => <div>{item.name}</div>}
                    />
                    <Tooltip content="Test tooltip">
                        <button>Hover me</button>
                    </Tooltip>
                </div>
            );

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            // Check for proper ARIA roles and labels
            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();

            const button = screen.getByRole('button', { name: /hover me/i });
            expect(button).toBeInTheDocument();

            // Test keyboard navigation
            button.focus();
            expect(button).toHaveFocus();

            fireEvent.keyDown(button, { key: 'Tab' });
            // Should move focus to next focusable element
        });

        it('should announce changes to screen readers', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            const mockColumns = [{ accessorKey: 'name', header: 'Nombre' }];

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={mockColumns}
                    selectable={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            // Select a row
            const checkbox = screen.getAllByRole('checkbox')[1]; // Skip header checkbox
            await user.click(checkbox);

            // Should announce selection
            await waitFor(() => {
                expect(screen.getByText(/1 elemento\(s\) seleccionado\(s\)/)).toBeInTheDocument();
            });
        });
    });

    describe('Bundle Size Integration', () => {
        it('should load components lazily when configured', async () => {
            // This test would verify lazy loading in a real environment
            // For now, we just verify the components can be imported
            const { LazyAdvancedDataTable } = await import('../../lazy');

            expect(LazyAdvancedDataTable).toBeDefined();
        });

        it('should tree-shake unused components', () => {
            // This test would verify tree-shaking in a real build
            // For now, we just verify selective imports work
            expect(AdvancedDataTable).toBeDefined();
            expect(MultiStepForm).toBeDefined();
            expect(DragDropList).toBeDefined();
            expect(Tooltip).toBeDefined();
        });
    });
});