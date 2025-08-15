import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Shield, FileText, RefreshCw, HardDrive, AlertTriangle, CheckCircle, Terminal, Clock, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Admin-only system tools dashboard (Stage 1)
const SystemAdminTools = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const [audit, setAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [refreshingAudit, setRefreshingAudit] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
      loadAudit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadLogs = async () => {
    try {
      setLogLoading(true);
      const { data } = await apiService.system.getLogs?.();
      setLogs(data.logs || data.items || data || []);
    } catch (e) {
      console.error('Error loading logs', e);
      toast.error('Failed to load logs');
      setLogs([]);
    } finally { setLogLoading(false); }
  };

  const triggerBackup = async () => {
    try {
      setBackupStatus('starting');
      const { data } = await apiService.system.triggerBackup?.();
      if (data.success !== false) {
        toast.success(data.message || 'Backup started');
        setBackupStatus('running');
      } else {
        toast.error(data.error || 'Backup failed to start');
        setBackupStatus('failed');
      }
    } catch (e) {
      console.error('Backup error', e);
      toast.error('Backup error');
      setBackupStatus('failed');
    }
  };

  const loadAudit = async () => {
    try {
      setAuditLoading(true);
      const { data } = await apiService.system.securityAudit?.();
      setAudit(data.audit || data || null);
    } catch (e) {
      console.error('Audit error', e);
      setAudit(null);
    } finally { setAuditLoading(false); }
  };

  const refreshAudit = async () => { setRefreshingAudit(true); await loadAudit(); setRefreshingAudit(false); };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Access Denied</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Administrator privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
          <Terminal className="w-8 h-8 mr-3" /> System Admin Tools
        </h1>
        <div className="flex space-x-2">
          <button onClick={loadLogs} className="px-4 py-2 text-sm bg-gray-100 rounded dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Reload Logs</button>
          <button onClick={refreshAudit} disabled={refreshingAudit} className="flex items-center px-4 py-2 space-x-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"><RefreshCw className="w-4 h-4" /><span>{refreshingAudit?'Refreshing':'Refresh Audit'}</span></button>
          <button onClick={triggerBackup} className="flex items-center px-4 py-2 space-x-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"><HardDrive className="w-4 h-4" /><span>Trigger Backup</span></button>
        </div>
      </div>

      {/* Logs */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100"><FileText className="w-5 h-5 mr-2" /> Recent Logs</h2>
        {logLoading ? <div className="text-sm text-gray-500">Loading logs...</div> : (
          <div className="space-y-1 overflow-y-auto font-mono text-xs max-h-80">
            {logs.length === 0 && <div className="text-gray-500">No logs found</div>}
            {logs.map((l,i)=>(<div key={i} className="px-2 py-1 border border-gray-200 rounded bg-gray-50 dark:bg-gray-900/40 dark:border-gray-700"><span className="mr-2 text-gray-500">{l.timestamp||l.time||''}</span>{l.level && <span className="uppercase mr-2 text-[10px] tracking-wide px-1 rounded bg-gray-200 dark:bg-gray-700">{l.level}</span>}<span>{l.message||l.msg||JSON.stringify(l)}</span></div>))}
          </div>
        )}
      </div>

      {/* Security Audit */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100"><Shield className="w-5 h-5 mr-2" /> Security Audit</h2>
        {auditLoading ? <div className="text-sm text-gray-500">Loading audit...</div> : audit ? (
          <div className="space-y-4">
            {audit.issues && audit.issues.length>0 ? (
              <div className="space-y-2">
                {audit.issues.map((iss,i)=>(<div key={i} className="p-3 text-sm border border-red-300 rounded dark:border-red-800 bg-red-50 dark:bg-red-900/20"><AlertTriangle className="inline w-4 h-4 mr-2 text-red-600" />{iss.description||iss}</div>))}
              </div>
            ) : (
              <div className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> No security issues detected</div>
            )}
            {audit.summary && <div className="p-3 text-xs whitespace-pre-wrap border border-gray-200 rounded bg-gray-50 dark:bg-gray-900/30 dark:border-gray-700">{audit.summary}</div>}
          </div>
        ) : <div className="text-sm text-gray-500">No audit data available</div>}
      </div>

      {/* Backup Status */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100"><HardDrive className="w-5 h-5 mr-2" /> Backups</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div>Status: {backupStatus || 'Idle'}</div>
          {backupStatus === 'running' && <div className="flex items-center text-blue-600"><Activity className="w-4 h-4 mr-1 animate-spin" /> In Progress...</div>}
        </div>
      </div>
    </div>
  );
};

export default SystemAdminTools;
