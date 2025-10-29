import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * 
 * @param {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * // => 'px-4 py-2 bg-blue-500 text-white'
 * 
 * @example
 * cn('px-4', 'px-6') // tailwind-merge handles conflicts
 * // => 'px-6'
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
