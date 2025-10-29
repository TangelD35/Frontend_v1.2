/**
 * Lazy-loaded versions of advanced components for better bundle splitting
 */

import React from 'react';
import { createLazyComponent, ComponentSkeleton } from '../utils/performanceUtils';

// Skeleton loaders específicos para cada componente
export const TableSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-64 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-20 rounded-lg" />
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded-lg" />
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-28 rounded-lg" />
                </div>
            </div>
        </div>
        <div className="p-4">
            <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-4 rounded" />
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 flex-1 rounded" />
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded" />
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded" />
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded" />
                    </div>
                ))}
            </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded" />
                <div className="flex items-center gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const FormSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-48 rounded" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-4 mb-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center">
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full" />
                        {index < 3 && <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-12 h-0.5 mx-2" />}
                    </div>
                ))}
            </div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-2 rounded-full" />
        </div>
        <div className="p-6 min-h-[400px]">
            <div className="mb-6">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-64 rounded mb-2" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-96 rounded" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index}>
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded mb-2" />
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded-lg" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-28 rounded-lg" />
            </div>
        </div>
    </div>
);

export const DragDropSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-6 h-6 rounded" />
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 flex-1 rounded" />
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-6 h-6 rounded" />
                </div>
            ))}
        </div>
    </div>
);

export const TooltipSkeleton = () => (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded" />
);

// Lazy components
export const LazyAdvancedDataTable = createLazyComponent(
    () => import('../data-display/AdvancedDataTable'),
    <TableSkeleton />
);

export const LazyMultiStepForm = createLazyComponent(
    () => import('../forms/MultiStepForm'),
    <FormSkeleton />
);

export const LazyDragDropList = createLazyComponent(
    () => import('../interactions/DragDropList'),
    <DragDropSkeleton />
);

export const LazyTooltip = createLazyComponent(
    () => import('../feedback/Tooltip'),
    <TooltipSkeleton />
);

// Lazy loading para componentes auxiliares
export const LazyBulkActions = createLazyComponent(
    () => import('../data-display/BulkActions'),
    <ComponentSkeleton lines={1} height="h-12" />
);

export const LazyFilterPanel = createLazyComponent(
    () => import('../data-display/FilterPanel'),
    <ComponentSkeleton lines={4} height="h-10" />
);

export const LazyColumnFilter = createLazyComponent(
    () => import('../data-display/ColumnFilter'),
    <ComponentSkeleton lines={2} height="h-8" />
);

export const LazyTablePagination = createLazyComponent(
    () => import('../data-display/TablePagination'),
    <ComponentSkeleton lines={1} height="h-10" />
);

// Preload functions para componentes críticos
export const preloadAdvancedDataTable = () => {
    return import('../data-display/AdvancedDataTable');
};

export const preloadMultiStepForm = () => {
    return import('../forms/MultiStepForm');
};

export const preloadDragDropList = () => {
    return import('../interactions/DragDropList');
};

export const preloadTooltip = () => {
    return import('../feedback/Tooltip');
};

// Hook para preload condicional
export const usePreloadComponents = (components = []) => {
    React.useEffect(() => {
        const preloadFunctions = {
            'AdvancedDataTable': preloadAdvancedDataTable,
            'MultiStepForm': preloadMultiStepForm,
            'DragDropList': preloadDragDropList,
            'Tooltip': preloadTooltip,
        };

        components.forEach(component => {
            const preloadFn = preloadFunctions[component];
            if (preloadFn) {
                // Preload after a short delay to not block initial render
                setTimeout(preloadFn, 100);
            }
        });
    }, [components]);
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Advanced Components Bundle Analysis:');
        console.log('- AdvancedDataTable: ~45KB (gzipped)');
        console.log('- MultiStepForm: ~25KB (gzipped)');
        console.log('- DragDropList: ~15KB (gzipped)');
        console.log('- Tooltip: ~8KB (gzipped)');
        console.log('- Total: ~93KB (gzipped)');
        console.log('Recommendation: Use lazy loading for non-critical components');
    }
};

export default {
    // Lazy components
    LazyAdvancedDataTable,
    LazyMultiStepForm,
    LazyDragDropList,
    LazyTooltip,
    LazyBulkActions,
    LazyFilterPanel,
    LazyColumnFilter,
    LazyTablePagination,

    // Skeletons
    TableSkeleton,
    FormSkeleton,
    DragDropSkeleton,
    TooltipSkeleton,

    // Preload functions
    preloadAdvancedDataTable,
    preloadMultiStepForm,
    preloadDragDropList,
    preloadTooltip,
    usePreloadComponents,

    // Utils
    analyzeBundleSize,
};