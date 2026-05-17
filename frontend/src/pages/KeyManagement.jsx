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
  Copy
} from 'lucide-react'
import keyManagementApi from '../api/keyManagementApi'

export default function KeyManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab] = useState('split') // 'split' or 'restore'

  const [uploadedFileName, setUploadedFileName] = useState('')
  const [statusMessage, setStatusMessage] = useState(null)
  
  // Split state
  const [shares, setShares] = useState([])

  // Restore state
  const [restoreShares, setRestoreShares] = useState([{ x: '', y: '' }, { x: '', y: '' }])

  useEffect(() => {
    if (location.state && location.state.generatedKeyFile) {
      const file = location.state.generatedKeyFile;
      navigate(location.pathname, { replace: true, state: {} });
      setActiveTab('split');
      handleSplitUpload(file);
    }
  }, [location.state, navigate, location.pathname]);

  const handleSplitUpload = async (e) => {
    let file;
    if (e && e.target && e.target.files) {
      file = e.target.files[0]
    } else {
      file = e
    }
    if (!file) return

    setUploadedFileName(file.name)
    try {
      setActionLoading('split')
      setStatusMessage(null)
      const resShares = await keyManagementApi.splitUpload(file)
      setShares(resShares)
      
      setStatusMessage({
        type: 'success',
        text: 'Đã phân rã khóa thành công. Hãy lưu trữ các mảnh khóa này an toàn cho từng cổ đông.'
      })
      setUploadedFileName('')
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Phân rã khóa thất bại: ' + (error.response?.data || error.message)
      })
      setShares([])
    } finally {
      setActionLoading(null)
      if (e && e.target && e.target.value !== undefined) {
        e.target.value = ''
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const addShareInput = () => {
    setRestoreShares([...restoreShares, { x: '', y: '' }])
  }

  const removeShareInput = (index) => {
    const newShares = [...restoreShares]
    newShares.splice(index, 1)
    setRestoreShares(newShares)
  }

  const updateShareInput = (index, field, value) => {
    const newShares = [...restoreShares]
    newShares[index][field] = value
    setRestoreShares(newShares)
  }

  const handleRestore = async () => {
    const validShares = restoreShares.filter(s => s.x !== '' && s.y !== '')
    if (validShares.length < 2) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập ít nhất 2 mảnh khóa hợp lệ để khôi phục.'
      })
      return
    }

    try {
      setActionLoading('restore')
      setStatusMessage(null)
      
      const payload = validShares.map(s => ({ x: parseInt(s.x, 10), y: s.y }))
      const blob = await keyManagementApi.restore(payload)
      
      const file = new File([blob], 'restored_master_key.pem', { type: 'application/x-pem-file' })

      setStatusMessage({
        type: 'success',
        text: 'Khôi phục khóa thành công! Đang chuyển hướng để giải mã hóa đơn...'
      })
      
      setTimeout(() => {
        navigate('/invoices/security', { state: { restoredKeyFile: file } })
      }, 1000)
    } catch (error) {
      // Because we used responseType: 'blob', error.response.data is a blob. We need to read it.
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
    } finally {
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
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Tải lên file Master Key để phân rã</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Hệ thống sẽ đọc file .pem và chia khóa thành nhiều mảnh bí mật dựa trên thuật toán Shamir.
                  </p>
                  
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-2xl cursor-pointer bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {actionLoading === 'split' ? (
                        <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
                      ) : (
                        <FileUp className="text-indigo-400 dark:text-indigo-500 mb-2" size={24} />
                      )}
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {uploadedFileName ? uploadedFileName : 'Chọn file Master Key (.pem)'}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pem,.txt"
                      onChange={handleSplitUpload}
                      disabled={actionLoading !== null}
                      className="hidden"
                    />
                  </label>
                </div>

                {shares.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Kết quả phân rã ({shares.length} mảnh)</h4>
                    <div className="space-y-3">
                      {shares.map((share, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex-1 overflow-hidden w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-md">
                                ID (x) = {share.x}
                              </span>
                            </div>
                            <div className="text-sm font-mono text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              {share.y}
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(share.y)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                          >
                            <Copy size={14} /> Copy Value
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Restore View */}
            {activeTab === 'restore' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Khôi phục Master Key từ các mảnh (Shares)</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Nhập ID (x) và Giá trị (y) của các mảnh khóa. Cần nhập đủ số lượng mảnh tối thiểu để khôi phục thành công.
                  </p>
                </div>

                <div className="space-y-4">
                  {restoreShares.map((share, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-full sm:w-24">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ID (x)</label>
                        <input
                          type="number"
                          value={share.x}
                          onChange={(e) => updateShareInput(index, 'x', e.target.value)}
                          placeholder="VD: 1"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Giá trị (y)</label>
                        <input
                          type="text"
                          value={share.y}
                          onChange={(e) => updateShareInput(index, 'y', e.target.value)}
                          placeholder="Chuỗi hexa..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="pt-5 flex justify-end w-full sm:w-auto">
                        <button
                          onClick={() => removeShareInput(index)}
                          disabled={restoreShares.length <= 2}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                  <button
                    onClick={addShareInput}
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <Plus size={16} /> Thêm mảnh khóa
                  </button>

                  <button
                    onClick={handleRestore}
                    disabled={actionLoading === 'restore'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'restore' ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    Thực hiện khôi phục
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
