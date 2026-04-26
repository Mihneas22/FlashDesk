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
    
    const exactPublicPaths = ['/login', '/register', '/', '/public-decks']
    const isPublicPath = exactPublicPaths.includes(pathname) || pathname.startsWith('/deck/')

    if (!token) {
      if (isPublicPath) {
        setAuthorized(true)
      } else {
        setAuthorized(true)
        router.push('/login')
      }
    } else {
      try {
        const decoded: any = jwtDecode(token)
        const isExpired = decoded.exp && decoded.exp < Date.now() / 1000
        
        if (isExpired) {
          localStorage.removeItem("token")
          if (isPublicPath) {
            setAuthorized(true)
          } else {
            router.push('/login')
          }
        } else {
          setAuthorized(true)
        }
      } catch (error) {
        localStorage.removeItem("token")
        if (isPublicPath) {
          setAuthorized(true)
        } else {
          router.push('/login')
        }
      }
    }
  }, [pathname, router])

  const exactPublicPaths = ['/login', '/register', '/', '/public-decks']
  const isPublicPath = pathname.startsWith('/deck/') || exactPublicPaths.includes(pathname)

  if (!authorized && !isPublicPath) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse text-sm font-medium">Securing connection...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}