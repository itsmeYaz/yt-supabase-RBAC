import { toast } from '@/components/ui/use-toast'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL
export const service_role_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
