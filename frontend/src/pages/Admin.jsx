import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'
import DashboardSkeleton from '../components/Skeleton'
import AnimatedNumber from '../components/AnimatedNumber'

function Admin() {
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersRes, logsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/logs'),
        api.get('/admin/stats')
      ])
      setUsers(usersRes.data.data)
      setLogs(logsRes.data.data)
      setStats(statsRes.data.data)
    } catch (err) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id, username) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError('Failed to delete user')
    }
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'POST': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'PUT': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'DELETE': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getStatusColor = (status) => {
    if (status < 300) return 'text-green-400'
    if (status < 400) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar active="admin" />

      <div className="relative ml-64 p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in mb-6">{error}</div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">Admin panel</h1>
              <p className="text-gray-400 mt-1">Manage users and monitor API activity</p>
            </div>

            {/* Stats row */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in stagger-1">
                <div className="card-hover glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total users</p>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center opacity-80">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white"><AnimatedNumber value={stats.totalUsers} /></p>
                </div>
                <div className="card-hover glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total requests</p>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center opacity-80">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white"><AnimatedNumber value={stats.totalLogs} /></p>
                </div>
                <div className="card-hover glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">GET requests</p>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center opacity-80">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white"><AnimatedNumber value={stats.getRequests} /></p>
                </div>
                <div className="card-hover glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">POST requests</p>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center opacity-80">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white"><AnimatedNumber value={stats.postRequests} /></p>
                </div>
              </div>
            )}

            {/* Tab buttons */}
            <div className="flex gap-2 animate-fade-in stagger-2">
              <button
                onClick={() => setTab('users')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'users' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setTab('logs')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'logs' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Audit log ({logs.length})
              </button>
            </div>

            {/* Users tab */}
            {tab === 'users' && (
              <div className="animate-fade-in space-y-4">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="glass rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">User</th>
                        <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Email</th>
                        <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Role</th>
                        <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{user.username}</p>
                                <p className="text-gray-500 text-xs font-mono">{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-500/20">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteUser(user.id, user.username)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/5"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-sm">No users found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit log tab */}
            {tab === 'logs' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Showing last {logs.length} requests</p>
                  <button
                    onClick={loadData}
                    className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                  </button>
                </div>

                <div className="glass rounded-2xl overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 glass-strong">
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-3">Time</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-3">Method</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-3">Path</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-3">Latency</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-3">User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, i) => (
                          <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-3 text-gray-400 text-xs font-mono">{formatTime(log.timestamp)}</td>
                            <td className="px-6 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getMethodColor(log.method)}`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-300 text-sm font-mono">{log.path}</td>
                            <td className={`px-6 py-3 text-sm font-medium ${getStatusColor(log.status)}`}>{log.status}</td>
                            <td className="px-6 py-3 text-gray-400 text-sm">{log.latencyMs}ms</td>
                            <td className="px-6 py-3 text-gray-300 text-sm">{log.username}</td>
                          </tr>
                        ))}
                        {logs.length === 0 && (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-sm">No audit logs yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin