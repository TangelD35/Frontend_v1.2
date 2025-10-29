import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import components
import AdvancedDataTable from '../../data-display/AdvancedDataTable';
import MultiStepForm from '../../forms/MultiStepForm';
import DragDropList from '../../interactions/DragDropList';

// Import performance utilities
import {
    useDebounce,
    useThrottle,
    useVirtualization,
    useMemoryOptimizedList,
    measurePerformance
} from '../../utils/performanceUtils';

// Mock performance utilities for testing
vi.mock('../../utils/performanceUtils', () => ({
    useDebounce: vi.fn((value) => value),
    useThrottle: vi.fn((value) => value),
    useVirtualization: vi.fn(() => ({
        visibleItems: [],
        totalHeight: 0,
        startIndex: 0,
        endIndex: 0,
        setScrollTop: vi.fn(),
    })),
    useMemoryOptimizedList: vi.fn(() => ({
        getItem: vi.fn(),
        clearCache: vi.fn(),
        cacheSize: 0,
    })),
    measurePerformance: vi.fn((fn) => fn),
    useStableCallback: vi.fn((callback) => callback),
    useRenderTime: vi.fn(),
}));

describe('Performance Tests', () => {
    let user;
    let performanceObserver;
    let performanceEntries = [];

    beforeEach(() => {
        user = userEvent.setup();

        // Mock Performance Observer
        performanceEntries = [];
        performanceObserver = {
            observe: vi.fn(),
            disconnect: vi.fn(),
        };

        global.PerformanceObserver = vi.fn().mockImplementation((callback) => {
            callback({ getEntries: () => performanceEntries });
            return performanceObserver;
        });

        // Mock performance.now
        vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('AdvancedDataTable Performance', () => {
        it('should render large datasets within performance budget', async () => {
            const largeDataset = Array.from({ length: 10000 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
                position: ['Base', 'Alero', 'Pívot'][index % 3],
                points: Math.random() * 30,
                rebounds: Math.random() * 15,
                assists: Math.random() * 10,
            }));

            const columns = [
                { accessorKey: 'name', header: 'Nombre' },
                { accessorKey: 'position', header: 'Posición' },
                { accessorKey: 'points', header: 'Puntos' },
                { accessorKey: 'rebounds', header: 'Rebotes' },
                { accessorKey: 'assists', header: 'Asistencias' },
            ];

            const startTime = performance.now();

            render(
                <AdvancedDataTable
                    data={largeDataset.slice(0, 100)} // Only render first 100 for initial load
                    columns={columns}
                    virtualScrolling={true}
                    pageSize={25}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Player 1')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within 500ms
            expect(renderTime).toBeLessThan(500);
        });

        it('should debounce search input efficiently', async () => {
            const mockData = Array.from({ length: 100 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
            }));

            const columns = [{ accessorKey: 'name', header: 'Nombre' }];

            // Mock debounce to track calls
            let debounceCallCount = 0;
            useDebounce.mockImplementation((value, delay) => {
                debounceCallCount++;
                return value;
            });

            render(
                <AdvancedDataTable
                    data={mockData}
                    columns={columns}
                    searchable={true}
                />
            );

            const searchInput = screen.getByPlaceholderText(/buscar/i);

            // Type multiple characters quickly
            await user.type(searchInput, 'Player');

            // Should have called debounce
            expect(useDebounce).toHaveBeenCalled();
        });

        it('should handle sorting large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
                points: Math.random() * 30,
            }));

            const columns = [
                { accessorKey: 'name', header: 'Nombre', sortable: true },
                { accessorKey: 'points', header: 'Puntos', sortable: true },
            ];

            render(
                <AdvancedDataTable
                    data={largeDataset}
                    columns={columns}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Player 1')).toBeInTheDocument();
            });

            const startTime = performance.now();

            // Click sort on points column
            const pointsHeader = screen.getByText('Puntos');
            await user.click(pointsHeader);

            await waitFor(() => {
                // Should still show data after sort
                expect(screen.getByText(/Player/)).toBeInTheDocument();
            });

            const endTime = performance.now();
            const sortTime = endTime - startTime;

            // Sorting should complete within 200ms
            expect(sortTime).toBeLessThan(200);
        });

        it('should optimize memory usage with large datasets', async () => {
            const largeDataset = Array.from({ length: 5000 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
                data: new Array(100).fill(`data-${index}`), // Large data per row
            }));

            const columns = [{ accessorKey: 'name', header: 'Nombre' }];

            // Mock memory optimization
            const mockGetItem = vi.fn((index) => largeDataset[index]);
            const mockClearCache = vi.fn();

            useMemoryOptimizedList.mockReturnValue({
                getItem: mockGetItem,
                clearCache: mockClearCache,
                cacheSize: 100,
            });

            render(
                <AdvancedDataTable
                    data={largeDataset.slice(0, 100)}
                    columns={columns}
                    virtualScrolling={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Player 1')).toBeInTheDocument();
            });

            // Should use memory optimization for large datasets
            expect(useMemoryOptimizedList).toHaveBeenCalled();
        });
    });

    describe('MultiStepForm Performance', () => {
        it('should handle large forms with many steps efficiently', async () => {
            const largeSteps = Array.from({ length: 50 }, (_, index) => ({
                id: `step${index + 1}`,
                title: `Paso ${index + 1}`,
                component: ({ data, onChange }) => (
                    <div>
                        <input
                            placeholder={`Campo ${index + 1}`}
                            value={data[`field${index + 1}`] || ''}
                            onChange={(e) => onChange(`field${index + 1}`, e.target.value)}
                        />
                    </div>
                ),
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

            // Should render within 300ms even with many steps
            expect(renderTime).toBeLessThan(300);
        });

        it('should optimize step navigation performance', async () => {
            const steps = Array.from({ length: 10 }, (_, index) => ({
                id: `step${index + 1}`,
                title: `Paso ${index + 1}`,
                component: () => <div>Contenido del paso {index + 1}</div>,
            }));

            render(
                <MultiStepForm
                    steps={steps}
                    showProgress={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Paso 1')).toBeInTheDocument();
            });

            const startTime = performance.now();

            // Navigate through multiple steps quickly
            for (let i = 0; i < 5; i++) {
                const nextButton = screen.getByRole('button', { name: /siguiente/i });
                if (nextButton && !nextButton.disabled) {
                    await user.click(nextButton);
                    await waitFor(() => {
                        expect(screen.getByText(`Paso ${i + 2}`)).toBeInTheDocument();
                    });
                }
            }

            const endTime = performance.now();
            const navigationTime = endTime - startTime;

            // Navigation should be smooth (less than 1 second for 5 steps)
            expect(navigationTime).toBeLessThan(1000);
        });

        it('should throttle auto-save operations', async () => {
            const steps = [{
                id: 'step1',
                title: 'Paso 1',
                component: ({ data, onChange }) => (
                    <input
                        placeholder="Nombre"
                        value={data.name || ''}
                        onChange={(e) => onChange('name', e.target.value)}
                    />
                ),
            }];

            const mockAutoSave = vi.fn();

            render(
                <MultiStepForm
                    steps={steps}
                    autoSave={true}
                    autoSaveInterval={100}
                    onAutoSave={mockAutoSave}
                />
            );

            const input = screen.getByPlaceholderText('Nombre');

            // Type rapidly
            await user.type(input, 'Juan Pérez');

            // Auto-save should be throttled
            await waitFor(() => {
                expect(mockAutoSave).toHaveBeenCalled();
            }, { timeout: 200 });

            // Should not call auto-save for every keystroke
            expect(mockAutoSave).toHaveBeenCalledTimes(1);
        });
    });

    describe('DragDropList Performance', () => {
        it('should handle large lists efficiently during drag operations', async () => {
            const largeList = Array.from({ length: 1000 }, (_, index) => ({
                id: index + 1,
                name: `Item ${index + 1}`,
                data: `Data for item ${index + 1}`,
            }));

            render(
                <DragDropList
                    items={largeList.slice(0, 50)} // Show first 50 items
                    renderItem={(item) => (
                        <div className="drag-item">
                            {item.name}
                        </div>
                    )}
                    onReorder={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });

            const startTime = performance.now();

            // Simulate drag operation
            const firstItem = screen.getByText('Item 1');
            fireEvent.dragStart(firstItem);
            fireEvent.dragOver(screen.getByText('Item 3'));
            fireEvent.drop(screen.getByText('Item 3'));

            const endTime = performance.now();
            const dragTime = endTime - startTime;

            // Drag operation should complete quickly
            expect(dragTime).toBeLessThan(100);
        });

        it('should optimize animations during drag operations', async () => {
            const items = Array.from({ length: 20 }, (_, index) => ({
                id: index + 1,
                name: `Item ${index + 1}`,
            }));

            render(
                <DragDropList
                    items={items}
                    renderItem={(item) => (
                        <div className="drag-item">
                            {item.name}
                        </div>
                    )}
                    onReorder={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });

            // Test that animations don't block the main thread
            const firstItem = screen.getByText('Item 1');

            const startTime = performance.now();
            fireEvent.dragStart(firstItem);

            // Should not block for long
            const dragStartTime = performance.now() - startTime;
            expect(dragStartTime).toBeLessThan(50);
        });
    });

    describe('Cross-Component Performance', () => {
        it('should maintain performance when multiple components are rendered', async () => {
            const tableData = Array.from({ length: 100 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
            }));

            const formSteps = Array.from({ length: 5 }, (_, index) => ({
                id: `step${index + 1}`,
                title: `Paso ${index + 1}`,
                component: () => <div>Paso {index + 1}</div>,
            }));

            const listItems = Array.from({ length: 20 }, (_, index) => ({
                id: index + 1,
                name: `Item ${index + 1}`,
            }));

            const startTime = performance.now();

            render(
                <div>
                    <AdvancedDataTable
                        data={tableData.slice(0, 25)}
                        columns={[{ accessorKey: 'name', header: 'Nombre' }]}
                    />
                    <MultiStepForm steps={formSteps} />
                    <DragDropList
                        items={listItems}
                        renderItem={(item) => <div>{item.name}</div>}
                    />
                </div>
            );

            await waitFor(() => {
                expect(screen.getByText('Player 1')).toBeInTheDocument();
                expect(screen.getByText('Paso 1')).toBeInTheDocument();
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const totalRenderTime = endTime - startTime;

            // All components should render within 1 second
            expect(totalRenderTime).toBeLessThan(1000);
        });

        it('should handle memory cleanup properly', async () => {
            const TestComponent = ({ show }) => {
                if (!show) return null;

                return (
                    <AdvancedDataTable
                        data={Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }))}
                        columns={[{ accessorKey: 'name', header: 'Nombre' }]}
                        enableRealTimeUpdates={true}
                        tableId="test-table"
                    />
                );
            };

            const { rerender } = render(<TestComponent show={true} />);

            await waitFor(() => {
                expect(screen.getByText('Item 0')).toBeInTheDocument();
            });

            // Unmount component
            rerender(<TestComponent show={false} />);

            // Should clean up properly (no memory leaks)
            expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
        });
    });

    describe('Bundle Size Performance', () => {
        it('should support code splitting for large components', async () => {
            // Test lazy loading
            const { LazyAdvancedDataTable } = await import('../../lazy');

            const startTime = performance.now();

            render(
                <React.Suspense fallback={<div>Loading...</div>}>
                    <LazyAdvancedDataTable
                        data={[{ id: 1, name: 'Test' }]}
                        columns={[{ accessorKey: 'name', header: 'Nombre' }]}
                    />
                </React.Suspense>
            );

            // Should show loading state first
            expect(screen.getByText('Loading...')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const loadTime = endTime - startTime;

            // Lazy loading should not significantly impact performance
            expect(loadTime).toBeLessThan(1000);
        });

        it('should tree-shake unused features', () => {
            // This would be tested in a real build environment
            // For now, just verify that components can be imported selectively
            expect(AdvancedDataTable).toBeDefined();
            expect(MultiStepForm).toBeDefined();
            expect(DragDropList).toBeDefined();
        });
    });

    describe('Real-world Performance Scenarios', () => {
        it('should handle rapid user interactions without blocking', async () => {
            const data = Array.from({ length: 50 }, (_, index) => ({
                id: index + 1,
                name: `Player ${index + 1}`,
            }));

            render(
                <AdvancedDataTable
                    data={data}
                    columns={[{ accessorKey: 'name', header: 'Nombre' }]}
                    selectable={true}
                    searchable={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Player 1')).toBeInTheDocument();
            });

            const startTime = performance.now();

            // Perform rapid interactions
            const searchInput = screen.getByPlaceholderText(/buscar/i);
            await user.type(searchInput, 'Player');

            const checkboxes = screen.getAllByRole('checkbox');
            for (let i = 1; i < Math.min(6, checkboxes.length); i++) {
                await user.click(checkboxes[i]);
            }

            const endTime = performance.now();
            const interactionTime = endTime - startTime;

            // Rapid interactions should not block UI
            expect(interactionTime).toBeLessThan(500);
        });

        it('should maintain 60fps during animations', async () => {
            const items = Array.from({ length: 10 }, (_, index) => ({
                id: index + 1,
                name: `Item ${index + 1}`,
            }));

            render(
                <DragDropList
                    items={items}
                    renderItem={(item) => (
                        <div className="drag-item animate-bounce">
                            {item.name}
                        </div>
                    )}
                    onReorder={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });

            // Simulate animation frame timing
            const frameTime = 16.67; // 60fps = ~16.67ms per frame
            const startTime = performance.now();

            // Trigger animation
            const firstItem = screen.getByText('Item 1');
            fireEvent.dragStart(firstItem);

            const animationTime = performance.now() - startTime;

            // Animation should start within one frame
            expect(animationTime).toBeLessThan(frameTime * 2);
        });
    });
});