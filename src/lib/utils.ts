
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Check if we're running on the client side
export const isClient = typeof window !== 'undefined'

// Get window dimensions
export function getWindowDimensions() {
  if (!isClient) return { width: 0, height: 0 }
  
  const { innerWidth: width, innerHeight: height } = window
  return { width, height }
}
