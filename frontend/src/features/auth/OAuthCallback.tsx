import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { TokenManager } from '@/lib/token-manager'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasProcessed = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate calls (React Strict Mode causes double render)
      if (hasProcessed.current) {
        return
      }
      hasProcessed.current = true

      // Following Vasty pattern: backend redirects here with tokens in URL params
      // Support both snake_case (legacy) and camelCase
      const vastyToken = searchParams.get('access_token') || searchParams.get('accessToken')
      const userId = searchParams.get('user_id') || searchParams.get('userId')
      const email = searchParams.get('email')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        navigate('/login?error=' + encodeURIComponent(error))
        return
      }

      if (!vastyToken) {
        console.error('No access token received from OAuth callback')
        navigate('/login?error=' + encodeURIComponent('Authentication failed'))
        return
      }

      try {
        // Exchange Vasty token for Vasty Shop token
        const response = await apiClient.post('/auth/oauth/exchange', {
          databaseToken: vastyToken,
          userId,
          email
        })

        const { accessToken } = response.data

        if (!accessToken) {
          throw new Error('No Vasty Shop token received')
        }

        // Store token using TokenManager for consistency
        TokenManager.setToken(accessToken)

        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth-token-stored'))

        // Navigate to home page
        navigate('/')
      } catch (error) {
        console.error('❌ Token exchange failed:', error)
        navigate('/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Completing sign in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please wait while we finish setting up your account
        </p>
      </div>
    </div>
  )
}
