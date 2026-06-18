import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and optimizes them with tailwind-merge
 */
export default function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 