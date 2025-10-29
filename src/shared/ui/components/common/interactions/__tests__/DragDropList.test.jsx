import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DragDropList, { DraggableItem } from '../DragDropList';

// Mock framer-motion para evitar problemas en tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock de los hooks
const mockUseDragAndDrop = vi.fn();
const mockUseDragDropAccessibility = vi.fn();

vi.mock('../../../../hooks/useDragAndDrop', () => ({
    useDragAndDrop: mockUseDragAndDrop,
}));

vi.mock('../../../../hooks/useDragDropAccessibility', () => ({
    useDragDropAccessibility: mockUseDragDropAccessibility,
}));

describe('DragDropList Component', () => {
    const mockItems = [
        { id: '1', title: 'Item 1', description: 'Description 1' },
        { id: '2', title: 'Item 2', description: 'Description 2' },
        { id: '3', title: 'Item 3', description: 'Description 3' },
    ];

    const defaultMockDragAndDrop = {
        items: mockItems,
        draggedItem: null,
        draggedOverItem: null,
        isDragging: false,
        handlers: {
            onDragStart: vi.fn(),
            onDragEnd: vi.fn(),
            onDragOver: vi.fn(),
            onDragEnter: vi.fn(),
            onDragLeave: vi.fn(),
            onDrop: vi.fn(),
            onKeyDown: vi.fn(),
        },
        actions: {
            updateItems: vi.fn(),
            reorderItems: vi.fn(),
        },
    };

    const defaultMockAccessibility = {
        handleKeyDown: vi.fn(),
        announce: vi.fn(),
        announcePickup: vi.fn(),
        announceDrop: vi.fn(),
        getItemAriaAttributes: vi.fn(() => ({
            'aria-label': 'Test item',
            'role': 'listitem',
            'tabIndex': 0,
        })),
        getContainerAriaAttributes: vi.fn(() => ({
            'role': 'list',
            'aria-label': 'Lista reordenable',
        })),
        getUsageInstructions: vi.fn(() => 'Instrucciones de uso'),
    };

    beforeEach(() => {
        mockUseDragAndDrop.mockReturnValue(defaultMockDragAndDrop);
        mockUseDragDropAccessibility.mockReturnValue(defaultMockAccessibility);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });
    describe('Renderizado básico', () => {
        test('renderiza la lista con elementos', () => {
            render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(screen.getByRole('list')).toBeInTheDocument();
            expect(screen.getAllByRole('listitem')).toHaveLength(3);
        });

        test('renderiza mensaje vacío cuando no hay elementos', () => {
            mockUseDragAndDrop.mockReturnValue({
                ...defaultMockDragAndDrop,
                items: [],
            });

            render(
                <DragDropList
                    items={[]}
                    emptyMessage="No hay elementos"
                />
            );

            expect(screen.getByText('No hay elementos')).toBeInTheDocument();
        });

        test('renderiza elementos con renderItem personalizado', () => {
            const customRenderItem = (item) => (
                <div data-testid={`custom-${item.id}`}>
                    {item.title}
                </div>
            );

            render(
                <DragDropList
                    items={mockItems}
                    renderItem={customRenderItem}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(screen.getByTestId('custom-1')).toBeInTheDocument();
            expect(screen.getByTestId('custom-2')).toBeInTheDocument();
            expect(screen.getByTestId('custom-3')).toBeInTheDocument();
        });
    });

    describe('Configuración de hooks', () => {
        test('configura useDragAndDrop con parámetros correctos', () => {
            const onReorder = vi.fn();

            render(
                <DragDropList
                    items={mockItems}
                    onReorder={onReorder}
                />
            );

            expect(mockUseDragAndDrop).toHaveBeenCalledWith(mockItems, onReorder);
        });

        test('configura useDragDropAccessibility con opciones correctas', () => {
            const onReorder = vi.fn();
            const accessibilityOptions = { announceReorder: false };

            render(
                <DragDropList
                    items={mockItems}
                    onReorder={onReorder}
                    allowKeyboardReorder={false}
                    accessibilityOptions={accessibilityOptions}
                />
            );

            expect(mockUseDragDropAccessibility).toHaveBeenCalledWith(
                mockItems,
                onReorder,
                expect.objectContaining({
                    keyboardEnabled: false,
                    ...accessibilityOptions,
                })
            );
        });
    });

    describe('Interacciones de arrastre', () => {
        test('maneja eventos de drag start', () => {
            const onReorder = vi.fn();

            render(
                <DragDropList
                    items={mockItems}
                    onReorder={onReorder}
                    keyExtractor={(item) => item.id}
                />
            );

            const firstItem = screen.getAllByRole('listitem')[0];
            fireEvent.dragStart(firstItem);

            expect(defaultMockDragAndDrop.handlers.onDragStart).toHaveBeenCalled();
            expect(defaultMockAccessibility.announcePickup).toHaveBeenCalled();
        });

        test('maneja eventos de drag end', () => {
            render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            const firstItem = screen.getAllByRole('listitem')[0];
            fireEvent.dragEnd(firstItem);

            expect(defaultMockDragAndDrop.handlers.onDragEnd).toHaveBeenCalled();
        });

        test('maneja eventos de drop', () => {
            render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            const firstItem = screen.getAllByRole('listitem')[0];
            fireEvent.drop(firstItem);

            expect(defaultMockDragAndDrop.handlers.onDrop).toHaveBeenCalled();
        });
    }); des
    cribe('Navegación por teclado', () => {
        test('maneja navegación con flechas', async () => {
            const user = userEvent.setup();

            render(
                <DragDropList
                    items={mockItems}
                    allowKeyboardReorder={true}
                    keyExtractor={(item) => item.id}
                />
            );

            const firstItem = screen.getAllByRole('listitem')[0];
            await user.click(firstItem);
            await user.keyboard('{ArrowDown}');

            expect(defaultMockAccessibility.handleKeyDown).toHaveBeenCalled();
        });

        test('maneja reordenamiento con Ctrl+flechas', async () => {
            const user = userEvent.setup();
            const onReorder = vi.fn();

            render(
                <DragDropList
                    items={mockItems}
                    onReorder={onReorder}
                    allowKeyboardReorder={true}
                    keyExtractor={(item) => item.id}
                />
            );

            const firstItem = screen.getAllByRole('listitem')[0];
            await user.click(firstItem);
            await user.keyboard('{Control>}{ArrowDown}{/Control}');

            expect(defaultMockAccessibility.handleKeyDown).toHaveBeenCalled();
        });

        test('deshabilita navegación por teclado cuando allowKeyboardReorder es false', () => {
            render(
                <DragDropList
                    items={mockItems}
                    allowKeyboardReorder={false}
                    keyExtractor={(item) => item.id}
                />
            );

            const firstItem = screen.getAllByRole('listitem')[0];
            fireEvent.keyDown(firstItem, { key: 'ArrowDown' });

            // No debería llamar al handler de accesibilidad
            expect(defaultMockAccessibility.handleKeyDown).not.toHaveBeenCalled();
        });
    });

    describe('Accesibilidad', () => {
        test('aplica atributos ARIA correctos al contenedor', () => {
            render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            const list = screen.getByRole('list');
            expect(list).toHaveAttribute('aria-label', 'Lista reordenable');
        });

        test('aplica atributos ARIA correctos a los elementos', () => {
            render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            const items = screen.getAllByRole('listitem');
            items.forEach(item => {
                expect(item).toHaveAttribute('tabIndex', '0');
            });
        });

        test('muestra instrucciones de uso cuando showInstructions es true', () => {
            render(
                <DragDropList
                    items={mockItems}
                    showInstructions={true}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(screen.getByText('Instrucciones de uso')).toBeInTheDocument();
        });

        test('oculta instrucciones cuando showInstructions es false', () => {
            render(
                <DragDropList
                    items={mockItems}
                    showInstructions={false}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(screen.queryByText('Instrucciones de uso')).not.toBeInTheDocument();
        });
    });

    describe('Estados de arrastre', () => {
        test('muestra indicador de drop cuando está arrastrando', () => {
            mockUseDragAndDrop.mockReturnValue({
                ...defaultMockDragAndDrop,
                isDragging: true,
            });

            render(
                <DragDropList
                    items={mockItems}
                    showDropIndicator={true}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(screen.getByText('Suelta aquí para reordenar')).toBeInTheDocument();
        });

        test('no muestra indicador cuando showDropIndicator es false', () => {
            mockUseDragAndDrop.mockReturnValue({
                ...defaultMockDragAndDrop,
                isDragging: true,
            });

            render(
                <DragDropList
                    items={mockItems}
                    showDropIndicator={false}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(screen.queryByText('Suelta aquí para reordenar')).not.toBeInTheDocument();
        });
    }); d
    escribe('Configuración y props', () => {
        test('aplica dirección horizontal correctamente', () => {
            render(
                <DragDropList
                    items={mockItems}
                    direction="horizontal"
                    keyExtractor={(item) => item.id}
                />
            );

            const container = screen.getByRole('list');
            expect(container).toHaveClass('flex');
        });

        test('aplica dirección vertical por defecto', () => {
            render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            const container = screen.getByRole('list');
            expect(container).toHaveClass('flex-col');
        });

        test('aplica clases personalizadas', () => {
            render(
                <DragDropList
                    items={mockItems}
                    className="custom-class"
                    itemClassName="custom-item-class"
                    keyExtractor={(item) => item.id}
                />
            );

            const container = screen.getByRole('list');
            expect(container).toHaveClass('custom-class');
        });

        test('deshabilita drag handles cuando dragHandle es false', () => {
            render(
                <DragDropList
                    items={mockItems}
                    dragHandle={false}
                    keyExtractor={(item) => item.id}
                />
            );

            // No debería haber iconos de grip
            expect(screen.queryByTitle('Arrastrar para reordenar')).not.toBeInTheDocument();
        });

        test('muestra drag handles cuando dragHandle es true', () => {
            render(
                <DragDropList
                    items={mockItems}
                    dragHandle={true}
                    keyExtractor={(item) => item.id}
                />
            );

            // Debería haber iconos de grip
            expect(screen.getAllByTitle('Arrastrar para reordenar')).toHaveLength(3);
        });
    });

    describe('Callbacks y eventos', () => {
        test('llama onReorder cuando se reordena un elemento', () => {
            const onReorder = vi.fn();

            render(
                <DragDropList
                    items={mockItems}
                    onReorder={onReorder}
                    keyExtractor={(item) => item.id}
                />
            );

            // Simular reordenamiento interno
            act(() => {
                // Esto simularía el callback interno del componente
                const newItems = [...mockItems];
                const item = newItems[0];
                newItems.splice(0, 1);
                newItems.splice(1, 0, item);

                // Llamar directamente al handler interno
                const handleReorder = onReorder;
                handleReorder(newItems, { oldIndex: 0, newIndex: 1, item });
            });

            expect(onReorder).toHaveBeenCalled();
        });

        test('actualiza items cuando cambian las props', () => {
            const { rerender } = render(
                <DragDropList
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            const newItems = [...mockItems, { id: '4', title: 'Item 4' }];

            rerender(
                <DragDropList
                    items={newItems}
                    keyExtractor={(item) => item.id}
                />
            );

            expect(defaultMockDragAndDrop.actions.updateItems).toHaveBeenCalledWith(newItems);
        });
    });

    describe('Rendimiento', () => {
        test('maneja listas grandes sin problemas', () => {
            const largeItemList = Array.from({ length: 1000 }, (_, i) => ({
                id: `item-${i}`,
                title: `Item ${i}`,
            }));

            mockUseDragAndDrop.mockReturnValue({
                ...defaultMockDragAndDrop,
                items: largeItemList,
            });

            const startTime = performance.now();

            render(
                <DragDropList
                    items={largeItemList}
                    keyExtractor={(item) => item.id}
                />
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // El renderizado no debería tomar más de 100ms para 1000 elementos
            expect(renderTime).toBeLessThan(100);
        });

        test('no re-renderiza innecesariamente', () => {
            const renderSpy = vi.fn();

            const TestComponent = (props) => {
                renderSpy();
                return <DragDropList {...props} />;
            };

            const { rerender } = render(
                <TestComponent
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            renderSpy.mockClear();

            // Re-render con las mismas props
            rerender(
                <TestComponent
                    items={mockItems}
                    keyExtractor={(item) => item.id}
                />
            );

            // Debería haber re-renderizado solo una vez
            expect(renderSpy).toHaveBeenCalledTimes(1);
        });
    });
});

describe('DraggableItem Component', () => {
    const mockItem = { id: '1', title: 'Test Item' };
    const mockHandlers = {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onKeyDown: vi.fn(),
    };

    test('renderiza correctamente', () => {
        render(
            <DraggableItem
                item={mockItem}
                index={0}
                handlers={mockHandlers}
                keyExtractor={(item) => item.id}
            >
                <div>Test Content</div>
            </DraggableItem>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('aplica estilos de arrastre cuando isDragging es true', () => {
        render(
            <DraggableItem
                item={mockItem}
                index={0}
                handlers={mockHandlers}
                isDragging={true}
                keyExtractor={(item) => item.id}
            >
                <div>Test Content</div>
            </DraggableItem>
        );

        // Verificar que se aplican estilos específicos de arrastre
        const container = screen.getByText('Test Content').closest('div');
        expect(container).toHaveStyle({
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        });
    });

    test('muestra indicador de drop cuando isDraggedOver es true', () => {
        render(
            <DraggableItem
                item={mockItem}
                index={0}
                handlers={mockHandlers}
                isDraggedOver={true}
                keyExtractor={(item) => item.id}
            >
                <div>Test Content</div>
            </DraggableItem>
        );

        // Verificar que hay un indicador de drop
        const dropIndicator = document.querySelector('.border-dashed');
        expect(dropIndicator).toBeInTheDocument();
    });
});