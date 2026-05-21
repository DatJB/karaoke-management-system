import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck,
  Key,
  FileUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  Loader2,
  Plus,
  Trash2,
  Copy,
  CheckCircle2 as CheckCircle2Icon,
  Send
} from 'lucide-react'
import keyManagementApi from '../api/keyManagementApi'
import { getAllEmployees } from '../api/employeeApi'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '../api/axios'

import { useAuth } from '../context/AuthContext'

export default function KeyManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab] = useState('split') // 'split' or 'restore'
  const [isInitializing, setIsInitializing] = useState(true)

  const [uploadedFileName, setUploadedFileName] = useState('')
  const [statusMessage, setStatusMessage] = useState(null)
  
  // Split state
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedManagers, setSelectedManagers] = useState(['', '', '', ''])

  // Claim state
  const [otpCode, setOtpCode] = useState('')

  // Restore state
  const [restoreFiles, setRestoreFiles] = useState([])
  const [recoveryCount, setRecoveryCount] = useState(0)

  const [managers, setManagers] = useState([])
  const [downloadStatuses, setDownloadStatuses] = useState({})
  const [stompClient, setStompClient] = useState(null)
  const [isSocketActive, setIsSocketActive] = useState(false)
  const [isRecoverySocketActive, setIsRecoverySocketActive] = useState(false)
  
  // Quick admin download state
  const [otps, setOtps] = useState({})
  const [downloadingUser, setDownloadingUser] = useState(null)

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await getAllEmployees({ page: 0, size: 100 })
        let employeeList = res;
        if (res.data) employeeList = res.data;
        if (res.content) employeeList = res.content; // Handle paginated object
        
        if (Array.isArray(employeeList)) {
            const m = employeeList.filter(e => e.role === 'ADMIN' || e.role === 'MANAGER')
            setManagers(m)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchManagers()
  }, [])

  const startStompClient = () => {
    if (stompClient) return
    const baseUrl = api.defaults.baseURL || 'http://localhost:8081/api/v1';
    let wsUrl = baseUrl.replace('/api/v1', '/ws').trim();
    wsUrl = wsUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/websocket';
      
    const client = new Client({
      brokerURL: wsUrl,
      onConnect: () => {
        client.subscribe('/topic/key-status', (msg) => {
          const data = JSON.parse(msg.body)
          if (data.status === 'DOWNLOADED') {
            setDownloadStatuses(prev => ({ ...prev, [data.username]: 'DOWNLOADED' }))
          }
        })
        client.subscribe('/topic/key-distribution', (msg) => {
          const data = JSON.parse(msg.body)
          if (data.status === 'READY') {
            setIsSocketActive(true)
            if (data.managers) setSelectedManagers(data.managers)
            setDownloadStatuses({})
            setStatusMessage({ type: 'success', text: 'Có khóa mới vừa được phân rã!' })
          } else if (data.status === 'ENDED') {
            setIsSocketActive(false)
            setDownloadStatuses({})
            setSelectedManagers(['', '', '', ''])
            setStatusMessage({ type: 'success', text: 'Tiến trình phân rã khóa đã kết thúc.' })
          } else if (data.status === 'RECOVERY_READY') {
            setIsRecoverySocketActive(true)
            setRestoreFiles([])
            setStatusMessage({ type: 'success', text: 'Phiên khôi phục khóa đã bắt đầu!' })
          } else if (data.status === 'RECOVERY_ENDED') {
            setIsRecoverySocketActive(false)
            setRestoreFiles([])
            setRecoveryCount(0)
            setStatusMessage({ type: 'success', text: 'Phiên khôi phục khóa đã kết thúc.' })
          } else if (data.status === 'RECOVERY_UPDATE') {
            setRecoveryCount(data.count)
          } else if (data.status === 'RECOVERY_SUCCESS') {
            setStatusMessage({ type: 'success', text: 'Khôi phục thành công! Đang tải Master Key và chuyển hướng...' })
            keyManagementApi.downloadRestoredKey()
              .then(blob => {
                 const file = new File([blob], 'restored_master_key.pem', { type: 'application/x-pem-file' })
                 setIsRecoverySocketActive(false)
                 setRestoreFiles([])
                 setRecoveryCount(0)
                 navigate('/invoices/security', { state: { restoredKeyFile: file } })
              })
              .catch(err => {
                 setStatusMessage({ type: 'error', text: 'Lỗi tải file khôi phục về trình duyệt.' })
              })
          }
        })
      }
    })
    client.activate()
    setStompClient(client)
  }

  useEffect(() => {
    const checkActiveDistribution = async () => {
      try {
        let currentActiveTab = 'split'
        const res = await keyManagementApi.getActiveDistribution()
        if (res && res.active) {
          setIsSocketActive(true)
          currentActiveTab = 'split'
          if (res.managers) setSelectedManagers(res.managers)
          const newDownloadStatuses = {}
          if (res.downloaded) {
             res.downloaded.forEach(user => {
               newDownloadStatuses[user] = 'DOWNLOADED'
             })
          }
          setDownloadStatuses(newDownloadStatuses)
        }
        const resRec = await keyManagementApi.getActiveRecovery()
        if (resRec && resRec.active) {
          setIsRecoverySocketActive(true)
          currentActiveTab = 'restore'
          if (resRec.count !== undefined) {
             setRecoveryCount(resRec.count)
          }
        }
        setActiveTab(currentActiveTab)
        startStompClient()
      } catch (err) {
         console.error(err)
         startStompClient()
      } finally {
         setIsInitializing(false)
      }
    }
    checkActiveDistribution()
    
    // Cleanup handled on unmount
    return () => {
      if (stompClient) stompClient.deactivate()
    }
  }, [])

  const handleManagerSelect = (idx, username) => {
    const newManagers = [...selectedManagers]
    newManagers[idx] = username
    setSelectedManagers(newManagers)
  }

  const handleSplitUploadAndAssign = async () => {
    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: 'Vui lòng chọn file Master Key.' })
      return
    }
    if (selectedManagers.some(m => !m)) {
      setStatusMessage({ type: 'error', text: 'Vui lòng chọn đủ 4 Quản lý để nhận 4 mảnh khóa.' })
      return
    }
    const uniqueManagers = new Set(selectedManagers)
    if (uniqueManagers.size !== 4) {
      setStatusMessage({ type: 'error', text: 'Vui lòng chọn 4 Quản lý khác nhau.' })
      return
    }

    try {
      setActionLoading('split')
      setStatusMessage(null)
      
      const resMsg = await keyManagementApi.splitUpload(selectedFile, selectedManagers)
      
      setStatusMessage({
        type: 'success',
        text: typeof resMsg === 'string' ? resMsg : 'Đã phân rã và gửi yêu cầu đến các Quản lý thành công!'
      })
      
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gửi thất bại: ' + (err.response?.data || err.message) })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEndSocket = async () => {
    try {
        await keyManagementApi.endDistribution()
    } catch(err) {
        console.error(err)
    }
    setIsSocketActive(false)
    setDownloadStatuses({})
    setOtps({})
    setSelectedFile(null)
    setUploadedFileName('')
    setSelectedManagers(['', '', '', ''])
  }

  useEffect(() => {
    if (location.state && location.state.generatedKeyFile) {
      const file = location.state.generatedKeyFile;
      navigate(location.pathname, { replace: true, state: {} });
      setActiveTab('split');
      handleFileSelect(file);
    }
  }, [location.state, navigate, location.pathname]);

  const handleFileSelect = (e) => {
    let file;
    if (e && e.target && e.target.files) {
      file = e.target.files[0]
    } else {
      file = e
    }
    if (!file) return
    setSelectedFile(file)
    setUploadedFileName(file.name)
    setSelectedManagers(['', '', '', ''])
    setStatusMessage(null)
  }



  const handleDownloadFromAdmin = async (username) => {
    const code = otps[username]
    if (!code || code.length < 6) return
    try {
      setDownloadingUser(username)
      setStatusMessage(null)
      const blob = await keyManagementApi.claimShare(code, username)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `share_${username}.pem`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      let errMsg = 'Có lỗi xảy ra.'
      if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text()
          errMsg = text
      } else {
          errMsg = error.response?.data || error.message
      }
      setStatusMessage({ type: 'error', text: `Tải mảnh của ${username} thất bại: ` + errMsg })
    } finally {
      setDownloadingUser(null)
    }
  }

  const handleRestoreFilesChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        setActionLoading('upload_share')
        const filesToUpload = Array.from(e.target.files)
        await keyManagementApi.uploadRecoveryShares(filesToUpload)
        setRestoreFiles(prev => [...prev, ...filesToUpload])
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Tải mảnh khóa thất bại: ' + (err.response?.data || err.message) })
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleStartRecovery = async () => {
    try {
        await keyManagementApi.startRecovery()
    } catch(err) {
        console.error(err)
        setStatusMessage({ type: 'error', text: 'Không thể bắt đầu phiên khôi phục.' })
    }
  }

  const handleEndRecovery = async () => {
    try {
        await keyManagementApi.endRecovery()
    } catch(err) {
        console.error(err)
    }
  }

  const handleRestore = async () => {
    if (recoveryCount < 3) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng tải lên ít nhất 3 file mảnh khóa (.pem) để khôi phục.'
      })
      return
    }

    try {
      setActionLoading('restore')
      setStatusMessage(null)
      
      await keyManagementApi.executeCollaborativeRecovery()
      
      setStatusMessage({
        type: 'success',
        text: 'Khôi phục khóa thành công! Đang đồng bộ và chuyển hướng tất cả tài khoản...'
      })
    } catch (error) {
      let errMsg = 'Có lỗi xảy ra.'
      if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text()
          errMsg = text
      } else {
          errMsg = error.response?.data || error.message
      }
      setStatusMessage({
        type: 'error',
        text: 'Khôi phục khóa thất bại: ' + errMsg
      })
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Key className="text-indigo-300" size={28} />
            <h1 className="text-2xl font-display font-bold">Quản Lý & Phân Rã Khóa (Shamir)</h1>
          </div>
          <p className="text-white/80 text-sm">
            Công nghệ Shamir's Secret Sharing (SSS) giúp chia nhỏ khóa Master thành nhiều mảnh. Cần đủ số mảnh để khôi phục khóa gốc.
          </p>
        </div>
        <div className="flex bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md items-center gap-3">
          <Lock size={20} className="text-indigo-300" />
          <div className="text-xs uppercase tracking-wider font-bold text-white/90">Bảo mật đa tầng</div>
        </div>
      </div>

      {/* Messages */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex gap-3 animate-in fade-in duration-300 ${statusMessage.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-400'
          }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="shrink-0 text-emerald-500" size={22} />
          ) : (
            <AlertTriangle className="shrink-0 text-red-500" size={22} />
          )}
          <div className="text-sm font-medium leading-relaxed">
            {statusMessage.text}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock size={18} className="text-indigo-500" /> Chức năng
            </h3>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActiveTab('split')}
                className={`w-full flex items-center gap-2 font-bold py-3 px-4 rounded-xl transition-all text-sm ${
                  activeTab === 'split' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                    : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                }`}
              >
                <Key size={16} /> Phân rã Master Key
              </button>
              

              <button
                onClick={() => setActiveTab('restore')}
                className={`w-full flex items-center gap-2 font-bold py-3 px-4 rounded-xl transition-all text-sm ${
                  activeTab === 'restore' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                    : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                }`}
              >
                <Unlock size={16} /> Khôi phục Master Key
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Work Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm min-h-[400px]">
            
            {/* Split View */}
            {activeTab === 'split' && (
              <div className="space-y-6 animate-in fade-in">
                {isInitializing ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                    </div>
                ) : (
                  <>
                    {!isSocketActive && (
                      user?.role === 'ADMIN' ? (
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Tải lên file Master Key để phân rã</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Hệ thống sẽ đọc file .pem và chia khóa thành nhiều mảnh bí mật. Cần phân công đủ 4 Quản lý để nhận.
                          </p>
                          
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-2xl cursor-pointer bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileUp className="text-indigo-400 dark:text-indigo-500 mb-2" size={24} />
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {uploadedFileName ? uploadedFileName : 'Chọn file Master Key (.pem)'}
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".pem,.txt"
                              onChange={handleFileSelect}
                              disabled={actionLoading !== null}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                          <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2">Chưa có phiên phân rã nào</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Vui lòng chờ Admin bắt đầu phiên phân rã khóa.</p>
                        </div>
                      )
                    )}

                {selectedFile && !isSocketActive && (
                  <div className="mt-8">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Phân công 4 mảnh khóa</h4>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((num, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex-1">
                              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold px-3 py-1 rounded-md">
                                Mảnh {num}
                              </span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-64">
                              <select 
                                value={selectedManagers[idx] || ''} 
                                onChange={(e) => handleManagerSelect(idx, e.target.value)}
                                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                              >
                                <option value="" disabled>Chọn Quản lý...</option>
                                {managers.map(m => (
                                    <option key={m.username} value={m.username} disabled={selectedManagers.includes(m.username) && selectedManagers[idx] !== m.username}>
                                        {m.name} - {m.role}
                                    </option>
                                ))}
                              </select>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSplitUploadAndAssign}
                            disabled={actionLoading === 'split' || selectedManagers.some(m => !m)}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md text-sm disabled:opacity-50"
                        >
                            {actionLoading === 'split' ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            Phân rã & Gửi đi
                        </button>
                    </div>
                  </div>
                )}

                {isSocketActive && (
                  <div className="mt-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Trạng thái phân phối khóa</h3>
                            <p className="text-sm text-slate-500 mt-1">Đang chờ các Quản lý tải mảnh ghép của họ</p>
                        </div>
                        {user?.role === 'ADMIN' && (
                            <button onClick={handleEndSocket} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto">
                                Kết thúc
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedManagers.map((username, idx) => {
                            const manager = managers.find(m => m.username === username);
                            const isDownloaded = downloadStatuses[username] === 'DOWNLOADED';
                            const isCurrentUser = user?.name === manager?.name || user?.username === username;
                            return (
                                <div key={idx} className={`p-4 rounded-2xl border ${isDownloaded ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex flex-col gap-3 transition-colors`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold mb-1">Mảnh {idx + 1}</div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{manager?.name ? `${manager.name} (${manager.role})` : username}</div>
                                        </div>
                                        <div>
                                            {isDownloaded ? (
                                                <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                                                    <CheckCircle2Icon size={14} /> Đã tải
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">
                                                    <Loader2 size={14} className="animate-spin"/> Chờ tải...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!isDownloaded && (
                                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-200/60 dark:border-slate-700">
                                            {(user?.role === 'ADMIN' || isCurrentUser) ? (
                                                <>
                                                    <input 
                                                        type="text" 
                                                        maxLength={6} 
                                                        placeholder="Mã 2FA..." 
                                                        value={otps[username] || ''}
                                                        onChange={e => setOtps(prev => ({...prev, [username]: e.target.value}))}
                                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center tracking-widest font-mono outline-none focus:border-indigo-500"
                                                    />
                                                    <button 
                                                        onClick={() => handleDownloadFromAdmin(username)}
                                                        disabled={downloadingUser === username || (otps[username] || '').length < 6}
                                                        className="shrink-0 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                                    >
                                                        {downloadingUser === username ? <Loader2 size={16} className="animate-spin"/> : 'Tải về'}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-xs text-slate-500 text-center w-full py-1.5">
                                                    Đang chờ Quản lý nhập 2FA
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            )}


            {/* Restore View */}
            {activeTab === 'restore' && (
              <div className="space-y-6 animate-in fade-in">
                {!isRecoverySocketActive ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                    <ShieldCheck className="text-indigo-400 mb-4" size={48} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2">{user?.role === 'ADMIN' ? 'Bắt đầu phiên khôi phục' : 'Chưa có phiên khôi phục nào'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
                      {user?.role === 'ADMIN' ? 'Mở phiên khôi phục để các Quản lý có thể chọn mảnh khóa. Cần ít nhất 3 mảnh để khôi phục Master Key thành công.' : 'Vui lòng chờ Admin mở phiên khôi phục.'}
                    </p>
                    {user?.role === 'ADMIN' && (
                        <button
                        onClick={handleStartRecovery}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                        >
                        <Unlock size={20} />
                        Bắt đầu khôi phục
                        </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Khôi phục Master Key từ các mảnh (Shares)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Tải lên ít nhất 3 file mảnh khóa (.pem) để khôi phục Master Key.
                            </p>
                        </div>
                        {user?.role === 'ADMIN' && (
                            <button onClick={handleEndRecovery} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto">
                                Kết thúc
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 p-4 rounded-2xl mb-2">
                        <div className="flex items-center gap-2">
                            <Key className="text-indigo-600 dark:text-indigo-400" size={20} />
                            <span className="font-bold text-indigo-900 dark:text-indigo-300">Số lượng file đã upload:</span>
                        </div>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {recoveryCount}/3
                        </div>
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-2xl cursor-pointer bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileUp className="text-indigo-400 dark:text-indigo-500 mb-2" size={24} />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Chọn hoặc kéo thả các file mảnh khóa (.pem) vào đây
                        </p>
                        </div>
                        <input
                        type="file"
                        accept=".pem,.txt"
                        multiple
                        onChange={handleRestoreFilesChange}
                        disabled={actionLoading !== null}
                        className="hidden"
                        />
                    </label>

                    {restoreFiles.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Các file bạn đã tải lên</div>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
                                {restoreFiles.map((f, i) => (
                                    <li key={i}>{f.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {user?.role === 'ADMIN' && (
                      <div className="flex justify-end pt-4">
                        <button
                            onClick={handleRestore}
                            disabled={actionLoading === 'restore' || recoveryCount < 3}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm"
                        >
                            {actionLoading === 'restore' ? (
                            <Loader2 className="animate-spin" size={16} />
                            ) : (
                            <Unlock size={16} />
                            )}
                            Thực hiện khôi phục
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
