import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'

// Decode the (unverified) JWT payload only to find the user id; the backend verifies the token
const decodePayload = (token) => {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export default function OAuthCallback() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
    // Remove the token from the address bar / history
    window.history.replaceState(null, '', window.location.pathname)

    if (!token) {
      navigate('/login?error=oauth', { replace: true })
      return
    }

    const completeLogin = async () => {
      try {
        const { userId } = decodePayload(token)
        const response = await api.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = loginWithToken(token, response.data.data.user)
        navigate(user.role === 'VICTIM' ? '/my-cases' : '/dashboard', { replace: true })
      } catch {
        navigate('/login?error=oauth', { replace: true })
      }
    }

    completeLogin()
  }, [loginWithToken, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
