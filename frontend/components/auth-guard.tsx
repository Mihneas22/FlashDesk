'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const publicPaths = ['/login', '/register']

    if (!token) {
      if (!publicPaths.includes(pathname)) {
        router.push('/login')
      } else {
        setAuthorized(true)
      }
    } else {
      try {
        const decoded: any = jwtDecode(token)
        const isExpired = decoded.exp && decoded.exp < Date.now() / 1000
        
        if (isExpired) {
          localStorage.removeItem("token")
          router.push('/login')
        } else {
          setAuthorized(true)
        }
      } catch {
        router.push('/login')
      }
    }
  }, [pathname, router])

  if (!authorized && !['/login'].includes(pathname)) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  return <>{children}</>
}