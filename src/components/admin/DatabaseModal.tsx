import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, ArrowRight, Download, RotateCcw, Copy, Check, RefreshCw, PowerOff, Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import { DatabaseStatus, Product, Order } from '../../types';
import { api } from '../../services/api';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DatabaseStatus | null;
  onConnectMongo: (uri: string) => Promise<{ success: boolean; message: string }>;
  onResetData: () => Promise<void>;
  products: Product[];
  orders: Order[];
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onConnectMongo,
  onResetData,
  products,
  orders
}) => {
  if (!isOpen) return null;

  const [mongoUri, setMongoUri] = useState('');
  const [connectMode, setConnectMode] = useState<'uri' | 'fields'>('uri');
  const [formUser, setFormUser] = useState('parimakde1234_db_user');
  const [formPass, setFormPass] = useState('');
  const [formCluster, setFormCluster] = useState('cluster0.2ora9ce.mongodb.net');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string; details?: string } | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    let uri = mongoUri.trim();

    if (connectMode === 'fields') {
      if (!formUser.trim() || !formPass.trim() || !formCluster.trim()) {
        setFeedback({
          type: 'warning',
          text: 'Kripya Username, Password aur Cluster Host teeno fields bharein!'
        });
        return;
      }
      const safeUser = encodeURIComponent(formUser.trim());
      const safePass = encodeURIComponent(formPass.trim());
      const safeCluster = formCluster.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      uri = `mongodb+srv://${safeUser}:${safePass}@${safeCluster}/auracommerce?retryWrites=true&w=majority`;
      setMongoUri(uri);
    } else {
      if (!uri) return;

      // Helpful check if user forgot to replace placeholders
      if (uri.includes('<password>') || uri.includes('<username>') || uri.includes('<db_password>')) {
        setFeedback({
          type: 'warning',
          text: 'Aapne connection string me "<password>" ya "<db_password>" replace nahi kiya hai. Kripya apna real database user password likhein!'
        });
        return;
      }
    }

    setIsConnecting(true);
    setFeedback(null);
    try {
      const res = await onConnectMongo(uri);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: 'MongoDB se safaltapoorvak connect ho gaya! Saare products ab cloud database se live synced hain.'
        });
      } else {
        setFeedback({
          type: 'error',
          text: res.message || 'Connection fail ho gaya.',
          details: res.message?.includes('bad auth') || res.message?.includes('Authentication')
            ? 'AUTH_FAIL'
            : res.message?.includes('SSL') || res.message?.includes('0.0.0.0/0')
            ? 'NETWORK_FAIL'
            : undefined
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Connection error' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncToMongo = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncToMongoDB();
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnectMongoDB();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      productsCount: products.length,
      ordersCount: orders.length,
      products,
      orders
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracommerce-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleUriTemplate = 'mongodb+srv://admin:MY_PASSWORD@cluster0.abcde.mongodb.net/auracommerce?retryWrites=true&w=majority';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                MongoDB Database Connection
              </h2>
              <p className="text-xs text-slate-600">
                Directly connect to your MongoDB Atlas cluster (Tarika 1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Current Status Box */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            dbStatus?.connected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="mt-0.5">
              {dbStatus?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {dbStatus?.connected ? '✅ Connected to MongoDB Database' : '⚠️ Local Storage Mode (Ready for MongoDB)'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  dbStatus?.connected ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {dbStatus?.connected ? 'Active / Cloud' : 'Local Fallback'}
                </span>
              </div>
              <p className="opacity-90">
                {dbStatus?.connected
                  ? 'Aapka application ab MongoDB cluster se live connected hai. Saare naye products aur orders cloud me store honge.'
                  : 'Abhi saara data local storage me chal raha hai. Neeche connection string paste karke 1-click me connect karein!'}
              </p>

              {dbStatus?.connected && (
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSyncToMongo}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync All Products to MongoDB'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PowerOff className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Connect MongoDB Form */}
          <form onSubmit={handleConnect} className="space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  MongoDB Cluster Se Connect Karein
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Apne database se live connect karne ke liye niche tareeka chunein:
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setConnectMode('uri')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    connectMode === 'uri'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full URL Paste
                </button>
                <button
                  type="button"
                  onClick={() => setConnectMode('fields')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    connectMode === 'fields'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Simple User &amp; Password
                </button>
              </div>
            </div>

            {connectMode === 'uri' ? (
              <div>
                <input
                  type="text"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://user:password@cluster0.abcde.mongodb.net/auracommerce?retryWrites=true&w=majority"
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Database User:
                  </label>
                  <input
                    type="text"
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                    placeholder="parimakde1234_db_user"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPass}
                      onChange={(e) => setFormPass(e.target.value)}
                      placeholder="Atlas User Password"
                      className="w-full pl-3 pr-8 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cluster Host:
                  </label>
                  <input
                    type="text"
                    value={formCluster}
                    onChange={(e) => setFormCluster(e.target.value)}
                    placeholder="cluster0.2ora9ce.mongodb.net"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Error or Success Feedback Banner */}
            {feedback && (
              <div className="space-y-2">
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : feedback.type === 'warning'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{feedback.text}</p>
                  </div>
                </div>

                {/* Specific Guided Solution for Bad Auth */}
                {feedback.details === 'AUTH_FAIL' && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Password Kaise Sahi Karein (Sirf 2 Steps):</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      <li>
                        <strong>MongoDB Atlas</strong> tab me jayein ➔ Left menu me <span className="font-semibold text-slate-900">Database Users</span> kholein.
                      </li>
                      <li>
                        Aapke user ke aage <strong className="bg-amber-100 px-1 rounded text-amber-900">EDIT</strong> button dabayein ➔ <strong>Edit Password</strong> par click karein.
                      </li>
                      <li>
                        Naya password set karein (jaise: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">pari12345</code>) aur <strong>Update User</strong> click karein.
                      </li>
                      <li>
                        Wahi password yahan enter karke dobara <strong>Connect</strong> dabayein!
                      </li>
                    </ol>
                  </div>
                )}

                {/* Specific Guided Solution for SSL / IP Block */}
                {feedback.details === 'NETWORK_FAIL' && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      <span>Google Cloud Server IP Allow Karein:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      <li>
                        <strong>MongoDB Atlas</strong> me ➔ Left menu me <span className="font-semibold text-slate-900">Network Access</span> par click karein.
                      </li>
                      <li>
                        <strong className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">+ ADD IP ADDRESS</strong> button dabayein.
                      </li>
                      <li>
                        <strong>"ALLOW ACCESS FROM ANYWHERE"</strong> button dabayein (<code className="bg-slate-200 px-1 rounded font-mono">0.0.0.0/0</code>) aur <strong>Confirm</strong> karein.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
              <div className="text-[11px] text-slate-600">
                {connectMode === 'uri' ? (
                  <span>Format: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">mongodb+srv://user:pass@cluster.mongodb.net/dbname</code></span>
                ) : (
                  <span>Database Name: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">auracommerce</code> (auto-applied)</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isConnecting || (connectMode === 'uri' && !mongoUri.trim()) || (connectMode === 'fields' && (!formUser.trim() || !formPass.trim()))}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{isConnecting ? 'Connecting to Cluster...' : 'Connect to MongoDB Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Step Guide */}
          <div className="text-xs space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>MongoDB Atlas se 4 Steps me Connection String Kaise Nikalein:</span>
              </h4>
              <a
                href="https://cloud.mongodb.com"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <span>MongoDB Atlas Website Kholein</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
              <li>
                <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer noopener" className="font-semibold text-emerald-700 underline">cloud.mongodb.com</a> par free account banakar login karein aur <strong className="text-slate-800">M0 Free Cluster</strong> select karein.
              </li>
              <li>
                Left side me <span className="font-semibold text-slate-800">Database Access</span> me jakar ek Database User banayein (jaise user: <code className="bg-slate-200 px-1 rounded font-mono">admin</code>, pass: apna password).
              </li>
              <li>
                <span className="font-semibold text-slate-800">Network Access</span> me jakar <strong className="text-slate-800">Add IP Address</strong> dabayein aur <code className="bg-slate-200 px-1 rounded text-slate-900 font-mono">0.0.0.0/0</code> (Allow from anywhere) select karein.
              </li>
              <li>
                Clusters page par <span className="font-semibold text-slate-800">"Connect" &gt; "Drivers" (Node.js)</span> par click karke connection string copy karein, usme password replace karein aur upar paste karke connect dabayein!
              </li>
            </ol>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-slate-600">
              <span className="truncate pr-2">{sampleUriTemplate}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMongoUri(sampleUriTemplate);
                  }}
                  className="px-2 py-0.5 text-[10px] font-sans font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  Use Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sampleUriTemplate);
                    setCopiedSample(true);
                    setTimeout(() => setCopiedSample(false), 2000);
                  }}
                  className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                  title="Copy sample format"
                >
                  {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Sample data actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Catalog Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Reset catalog to sample initial products?')) {
                  await onResetData();
                  onClose();
                }
              }}
              className="px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Products</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
