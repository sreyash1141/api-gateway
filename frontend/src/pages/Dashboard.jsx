import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState(null)
  const [rateLimit, setRateLimit] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileRes, statusRes] = await Promise.all([
        api.get('/users/me'),
        fetch('/api/status').then(r => r.json())
      ])
      setProfile(profileRes.data.data)
      setStatus(statusRes.data)

      const rlRes = await fetch('/api/status/rate-limit/0:0:0:0:0:0:0:1').then(r => r.json())
      setRateLimit(rlRes.data)
    } catch (err) {
      setError('Failed to load data')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">API Gateway</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Signed in as <span className="font-medium text-gray-900">{username}</span></span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Profile card */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium text-gray-900">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {profile.role}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm text-gray-600">{profile.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* System status + Rate limit side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {status && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {status.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Uptime</span>
                  <span className="text-sm font-medium text-gray-900">{status.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total users</span>
                  <span className="text-sm font-medium text-gray-900">{status.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">MongoDB</span>
                  <span className="text-sm font-medium text-gray-900">{status.mongoStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Memory</span>
                  <span className="text-sm font-medium text-gray-900">{status.freeMemoryMB}MB free / {status.totalMemoryMB}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Java</span>
                  <span className="text-sm font-medium text-gray-900">{status.javaVersion}</span>
                </div>
              </div>
            </div>
          )}

          {rateLimit && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate limit</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Remaining requests</span>
                    <span className="text-sm font-medium text-gray-900">
                      {rateLimit.remainingRequests} / {rateLimit.maxRequestsPerMinute}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(rateLimit.remainingRequests / rateLimit.maxRequestsPerMinute) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Window</span>
                  <span className="text-sm font-medium text-gray-900">{rateLimit.windowDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Your IP</span>
                  <span className="font-mono text-sm text-gray-600">{rateLimit.ip}</span>
                </div>
                <button
                  onClick={loadData}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard