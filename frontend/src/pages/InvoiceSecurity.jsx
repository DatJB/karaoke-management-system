import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Database,
  RefreshCw,
  FileUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  Loader2,
  ListFilter
} from 'lucide-react'
import invoiceSecurityApi from '../api/invoiceSecurityApi'
import { useAuth } from '../context/AuthContext'

export default function InvoiceSecurity() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null) // 'keys', 'migrate', 'verify', 'recover'
  const [activeTab, setActiveTab] = useState('verify') // 'verify' or 'recover'

  // Reports states
  const [verifyReport, setVerifyReport] = useState([])
  const [verifyPageInfo, setVerifyPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 })
  
  const [recoverReport, setRecoverReport] = useState([])
  const [recoverPageInfo, setRecoverPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 })
  const [privateKeyFile, setPrivateKeyFile] = useState(null)
  
  const [generateKeyOtp, setGenerateKeyOtp] = useState('')
  const [migrateOtp, setMigrateOtp] = useState('')

  const [uploadedFileName, setUploadedFileName] = useState('')
  const [statusMessage, setStatusMessage] = useState(null) // { type: 'success'|'error', text: '' }

  useEffect(() => {
    if (location.state && location.state.restoredKeyFile) {
      const file = location.state.restoredKeyFile;
      // Remove state so it doesn't trigger on reload
      navigate(location.pathname, { replace: true, state: {} });
      // Execute recover
      handleRecover(file);
    }
  }, [location.state, navigate, location.pathname]);

  // Generate RSA Keys
  const handleGenerateKeys = async () => {
    try {
      setActionLoading('keys')
      setStatusMessage(null)
      const blob = await invoiceSecurityApi.generateKeys()

      const file = new File([blob], 'private_key.pem', { type: 'application/x-pem-file' })

      setStatusMessage({
        type: 'success',
        text: 'Đã sinh cặp khóa RSA mới thành công! Khóa công khai đã được cài đặt trên Server, đang chuyển hướng sang trang Phân rã khóa...'
      })

      setTimeout(() => {
        navigate('/security/keys', { state: { generatedKeyFile: file } })
      }, 1000)
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Không thể sinh cặp khóa bảo mật mới: ' + error.message
      })
      setActionLoading(null)
    }
  }

  // Migrate Legacy Invoices
  const handleMigrate = async () => {
    try {
      setActionLoading('migrate')
      setStatusMessage(null)
      const res = await invoiceSecurityApi.migrateInvoices()
      setStatusMessage({
        type: 'success',
        text: res.message || 'Đã di trú bảo mật thành công cho toàn bộ hóa đơn cũ!'
      })
      // Automatically refresh verification chain if they are in verification view
      if (verifyReport.length > 0) {
        handleVerifyChain()
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Di trú hóa đơn thất bại: ' + error.message
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Verify Chain Integrity
  const handleVerifyChain = async (page = 0) => {
    try {
      setActionLoading('verify')
      setStatusMessage(null)
      const res = await invoiceSecurityApi.verifyChain(page)
      const report = res.content
      setVerifyReport(report)
      setVerifyPageInfo({ number: res.number, totalPages: res.totalPages, totalElements: res.totalElements })

      const isTampered = res.hasTampered
      if (isTampered) {
        setStatusMessage({
          type: 'error',
          text: 'Có dấu hiệu sửa đổi dữ liệu trái phép trong cơ sở dữ liệu. Vui lòng kiểm tra các hóa đơn bị báo đỏ.'
        })
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Đã kiểm tra chuỗi băm. Không phát hiện sai lệch.'
        })
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Kiểm tra toàn vẹn thất bại: ' + error.message
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Recover Amounts using Private Key
  const handleRecover = async (eOrFile, page = 0) => {
    let file = eOrFile;
    if (eOrFile && eOrFile.target && eOrFile.target.files) {
      file = eOrFile.target.files[0];
    } else if (!file && privateKeyFile) {
      file = privateKeyFile;
    }
    if (!file) return

    setPrivateKeyFile(file)
    setUploadedFileName(file.name)
    try {
      setActionLoading('recover')
      setStatusMessage(null)
      const res = await invoiceSecurityApi.recoverAmounts(file, page)
      const report = res.content
      setRecoverReport(report)
      setRecoverPageInfo({ number: res.number, totalPages: res.totalPages, totalElements: res.totalElements })
      setActiveTab('recover') // Switch tab to show recovery report

      const isMismatch = res.hasMismatch
      const isDecFailed = res.hasDecFailed

      if (isMismatch) {
        setStatusMessage({
          type: 'error',
          text: 'Phát hiện có sự SAI LỆCH SỐ TIỀN giữa Database và Bản gốc mã hóa!'
        })
      } else if (isDecFailed) {
        setStatusMessage({
          type: 'error',
          text: 'Giải mã thất bại: Khóa riêng tư bạn cung cấp không trùng khớp với khóa công khai trên hệ thống.'
        })
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Xác thực trùng khớp: 100% hóa đơn khớp hoàn toàn với số tiền thực tế được chủ quán bảo mật.'
        })
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Phục hồi số tiền thất bại: ' + error.message
      })
    } finally {
      setActionLoading(null)
      // Reset file input value to allow uploading same file again
      if (eOrFile && eOrFile.target && eOrFile.target.value !== undefined) {
        eOrFile.target.value = ''
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner Header with Sleek Emerald/Dark Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-emerald-300" size={28} />
            <h1 className="text-2xl font-display font-bold">Phân Tích & Bảo Mật Hóa Đơn</h1>
          </div>
          <p className="text-white/80 text-sm">
            Hệ thống an toàn thông tin áp dụng công nghệ Blockchain-style Chaining (SHA-256) và Mã hóa số tiền (RSA 2048-bit).
          </p>
        </div>
        <div className="flex bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md items-center gap-3">
          <Lock size={20} className="text-emerald-300" />
          <div className="text-xs uppercase tracking-wider font-bold text-white/90">Bảo vệ dữ liệu</div>
        </div>
      </div>

      {/* Notifications banner */}
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Controls (Sinh khóa, Di trú, Upload Key) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Card 1: Keypair Operations */}
          {user?.role === 'ADMIN' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Key size={18} className="text-emerald-500" /> Quản lý Khóa RSA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Để bảo vệ an toàn cho hệ thống hóa đơn, vui lòng nhập mã 2FA để tiến hành sinh khóa RSA mới.
            </p>
            
            <input 
              type="text" 
              maxLength={6} 
              placeholder="Nhập mã 2FA..." 
              value={generateKeyOtp}
              onChange={e => setGenerateKeyOtp(e.target.value)}
              className="w-full px-4 py-2.5 mb-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center tracking-widest outline-none focus:border-emerald-500"
            />

            {generateKeyOtp.length >= 6 && (
              <button
                onClick={handleGenerateKeys}
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 text-sm"
              >
                {actionLoading === 'keys' ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                Sinh cặp khóa RSA mới
              </button>
            )}
          </div>
          )}

          {/* Card 2: Legacy Migration */}
          {user?.role === 'ADMIN' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Database size={18} className="text-teal-500" /> Di trú Dữ liệu Hóa đơn cũ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Tính toán băm chuỗi Blockchain và mã hóa RSA cho toàn bộ hóa đơn lịch sử. Vui lòng nhập mã 2FA để tiếp tục.
            </p>
            
            <input 
              type="text" 
              maxLength={6} 
              placeholder="Nhập mã 2FA..." 
              value={migrateOtp}
              onChange={e => setMigrateOtp(e.target.value)}
              className="w-full px-4 py-2.5 mb-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center tracking-widest outline-none focus:border-teal-500"
            />
            
            {migrateOtp.length >= 6 && (
              <button
                onClick={handleMigrate}
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm border border-slate-200 dark:border-slate-700"
              >
                {actionLoading === 'migrate' ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
                Di trú & Bảo mật toàn bộ HĐ cũ
              </button>
            )}
          </div>
          )}

          {/* Card 3: Recover Upload private key */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Unlock size={18} className="text-indigo-500" /> Upload Khóa giải mã phục hồi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Tải file khóa riêng tư `.pem` của bạn lên RAM hệ thống để giải mã số tiền hóa đơn thật. Backend sẽ so khớp trực tiếp để phát hiện chênh lệch với DB (không lưu file xuống ổ cứng server).
            </p>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {actionLoading === 'recover' ? (
                  <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
                ) : (
                  <FileUp className="text-slate-400 dark:text-slate-500 mb-2" size={24} />
                )}
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {uploadedFileName ? uploadedFileName : 'Chọn file Private Key (.pem)'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ các file dạng PEM hoặc TXT</p>
              </div>
              <input
                type="file"
                accept=".pem,.txt"
                onChange={handleRecover}
                disabled={actionLoading !== null}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Right Column - Results Report (Tables with Verify Chain / Decrypting) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Tab Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('verify')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'verify'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                >
                  Kiểm tra chuỗi băm ({verifyPageInfo.totalElements})
                </button>
                <button
                  onClick={() => setActiveTab('recover')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'recover'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                >
                  Giải mã số tiền ({recoverPageInfo.totalElements})
                </button>
              </div>

              {activeTab === 'verify' && (
                <button
                  onClick={() => handleVerifyChain(0)}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-emerald-200/50 dark:border-emerald-500/20"
                >
                  {actionLoading === 'verify' ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  Bắt đầu Verify Chuỗi
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: VERIFY HASH CHAIN */}
            {activeTab === 'verify' && (
              <div className="space-y-4">
                {verifyReport.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShieldCheck size={48} className="text-slate-300 mb-4" />
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Chưa chạy xác thực chuỗi</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Nhấp nút "Bắt đầu Verify Chuỗi" để tính toán lại toàn bộ băm liên kết Blockchain SHA-256 và so sánh với cơ sở dữ liệu.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 pr-2">Hóa đơn ID</th>
                          <th className="pb-3 pr-2">Mã băm lưu trữ (DB)</th>
                          <th className="pb-3 pr-2">Mã băm tính toán</th>
                          <th className="pb-3 pr-2">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                        {verifyReport.map((item) => (
                          <tr key={item.invoiceId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-4 font-bold text-slate-800 dark:text-slate-200">#{item.invoiceId}</td>
                            <td className="py-4 font-mono text-slate-500 select-all" title={item.storedHash}>
                              {item.storedHash ? `${item.storedHash.substring(0, 10)}...` : 'NULL'}
                            </td>
                            <td className="py-4 font-mono text-slate-500 select-all" title={item.calculatedHash}>
                              {item.calculatedHash ? `${item.calculatedHash.substring(0, 10)}...` : 'NULL'}
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded-md ${item.status === 'OK'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 animate-pulse'
                                }`}>
                                {item.status === 'OK' ? (
                                  <>
                                    <CheckCircle2 size={12} /> OK
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert size={12} /> TAMPERED
                                  </>
                                )}
                              </span>
                              <div className={`mt-1 text-[10px] ${item.status === 'OK' ? 'text-slate-400' : 'text-red-500 font-bold'}`}>
                                {item.message}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {verifyPageInfo.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500">
                          Trang {verifyPageInfo.number + 1} / {verifyPageInfo.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={verifyPageInfo.number === 0}
                            onClick={() => handleVerifyChain(verifyPageInfo.number - 1)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            Trước
                          </button>
                          <button
                            disabled={verifyPageInfo.number === verifyPageInfo.totalPages - 1}
                            onClick={() => handleVerifyChain(verifyPageInfo.number + 1)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: RECOVERY AND DECRYPTION */}
            {activeTab === 'recover' && (
              <div className="space-y-4">
                {recoverReport.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Unlock size={48} className="text-slate-300 mb-4" />
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Chưa có dữ liệu giải mã số tiền</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Kéo thả hoặc tải lên file khóa riêng tư `.pem` ở thanh điều khiển bên trái để bắt đầu giải mã và phục hồi số tiền thực tế.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 pr-2">Hóa đơn ID</th>
                          <th className="pb-3 pr-2">Số tiền trong DB</th>
                          <th className="pb-3 pr-2">Số tiền gốc giải mã</th>
                          <th className="pb-3 pr-2">Kết quả đối khớp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                        {recoverReport.map((item) => (
                          <tr key={item.invoiceId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-4 font-bold text-slate-800 dark:text-slate-200">#{item.invoiceId}</td>
                            <td className="py-4 font-bold text-slate-700 dark:text-slate-300">
                              {item.dbAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.dbAmount) : '0đ'}
                            </td>
                            <td className="py-4 font-bold text-emerald-600 dark:text-emerald-400">
                              {item.decryptedAmount
                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.decryptedAmount)
                                : '—'}
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded-md ${item.status === 'MATCH'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : item.status === 'MISMATCH'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 animate-bounce'
                                  : 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                                }`}>
                                {item.status === 'MATCH' && (
                                  <>
                                    <CheckCircle2 size={12} /> Khớp 100%
                                  </>
                                )}
                                {item.status === 'MISMATCH' && (
                                  <>
                                    <ShieldAlert size={12} /> SAI LỆCH!
                                  </>
                                )}
                                {item.status === 'NOT_ENCRYPTED' && 'Chưa mã hóa'}
                                {item.status === 'DECRYPTION_FAILED' && 'Lỗi giải mã'}
                              </span>
                              <div className={`mt-1 text-[10px] ${item.status === 'MATCH' ? 'text-slate-400' :
                                item.status === 'MISMATCH' ? 'text-red-500 font-bold' :
                                  'text-slate-400'
                                }`}>
                                {item.message}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {recoverPageInfo.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500">
                          Trang {recoverPageInfo.number + 1} / {recoverPageInfo.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={recoverPageInfo.number === 0}
                            onClick={() => handleRecover(null, recoverPageInfo.number - 1)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            Trước
                          </button>
                          <button
                            disabled={recoverPageInfo.number === recoverPageInfo.totalPages - 1}
                            onClick={() => handleRecover(null, recoverPageInfo.number + 1)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}
