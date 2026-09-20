import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'
import DashboardSkeleton from '../components/Skeleton'
import AnimatedNumber from '../components/AnimatedNumber'

function StatCard({ label, value, icon, color, delay }) {
  const colorMap = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500'
  }

  return (
    <div className={`animate-fade-in stagger-${delay} card-hover glass rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center opacity-80`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </p>
    </div>
  )
}

function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState(null)
  const [rateLimit, setRateLimit] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setRefreshing(true)
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
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const rlPercent = rateLimit ? (rateLimit.remainingRequests / rateLimit.maxRequestsPerMinute) * 100 : 0
  const rlColor = rlPercent > 50 ? 'from-green-500 to-emerald-500' : rlPercent > 20 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar active="dashboard" />

      <div className="relative ml-64 p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in mb-6">{error}</div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Greeting header */}
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">{getGreeting()}, {profile?.username}</h1>
              <p className="text-gray-400 mt-1">Here's what's happening with your gateway</p>
            </div>

            {/* Profile */}
            {profile && (
              <div className="animate-fade-in stagger-1 card-hover glass rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-scale-in">
                    <span className="text-xl text-white font-bold">{profile.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">{profile.username}</h2>
                    <p className="text-gray-400 text-sm">{profile.email}</p>
                  </div>
                  <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-500/20">
                    {profile.role}
                  </span>
                </div>
                <div className="mt-4 glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="font-mono text-sm text-gray-400">{profile.id}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(profile.id)}
                    className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Stats grid */}
            {status && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Status" value={status.status} color="green" delay="2"
                  icon={<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                />
                <StatCard
                  label="Uptime" value={status.uptime} color="blue" delay="3"
                  icon={<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                  label="Users" value={status.totalUsers} color="purple" delay="4"
                  icon={<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
                <StatCard
                  label="Database" value={status.mongoStatus} color="emerald" delay="5"
                  icon={<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>}
                />
              </div>
            )}

            {/* System + Rate limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {status && (
                <div className="animate-fade-in stagger-3 card-hover glass rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    System details
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-sm text-gray-400">Memory</span>
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-white/5 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full animate-bar-grow" style={{ width: `${((status.totalMemoryMB - status.freeMemoryMB) / status.totalMemoryMB) * 100}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-300 min-w-[80px] text-right"><AnimatedNumber value={status.freeMemoryMB} />MB free</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-sm text-gray-400">Processors</span>
                      <span className="text-sm font-medium text-gray-300"><AnimatedNumber value={status.availableProcessors} /> cores</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-gray-400">Java version</span>
                      <span className="text-sm font-mono text-gray-300">{status.javaVersion}</span>
                    </div>
                  </div>
                </div>
              )}

              {rateLimit && (
                <div className="animate-fade-in stagger-4 card-hover glass rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    Rate limit
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Remaining requests</span>
                        <span className="text-sm font-semibold text-white">
                          <AnimatedNumber value={rateLimit.remainingRequests} /> / {rateLimit.maxRequestsPerMinute}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${rlColor} h-4 rounded-full animate-bar-grow transition-all duration-700`}
                          style={{ width: `${rlPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-sm text-gray-400">Window</span>
                      <span className="text-sm font-medium text-gray-300">{rateLimit.windowDuration}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-sm text-gray-400">Your IP</span>
                      <span className="font-mono text-sm text-gray-400">{rateLimit.ip}</span>
                    </div>
                    <button
                      onClick={loadData}
                      disabled={refreshing}
                      className="w-full bg-white/5 text-gray-300 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm font-medium border border-white/5 hover:border-white/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {refreshing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Refreshing...
                        </>
                      ) : 'Refresh'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard