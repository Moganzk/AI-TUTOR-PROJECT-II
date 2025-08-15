import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import NotificationManagement from './NotificationManagement';
import { Bell, Plus, Filter, Layers, Users, Clock, Trash2, Edit, BarChart3, Calendar, X, Check, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Unified Admin Notifications Hub (Stage 1)
const AdminNotificationsHub = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title:'', message:'', type:'info', priority:'medium', recipient_type:'all', recipient_ids:[], course_id:null, schedule_at:'' });
  const [templateForm, setTemplateForm] = useState({ name:'', title:'', message:'', type:'info', priority:'medium' });
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  useEffect(()=>{ if(isAdmin){ loadAll(); } },[isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadNotifications(), loadTemplates(), loadScheduled(), loadStats()]);
    } finally { setLoading(false); }
  };

  const loadNotifications = async () => { try { const { data } = await apiService.adminNotifications.list(); setNotifications(data.notifications||[]);} catch(e){ console.error(e); } };
  const loadTemplates = async () => { try { const { data } = await apiService.notificationTemplates.list(); setTemplates(data.templates||[]);} catch(e){ console.error(e);} };
  const loadScheduled = async () => { try { const { data } = await apiService.adminNotifications.scheduled?.(); setScheduled(data.scheduled||data.items||[]);} catch(e){ console.error(e);} };
  const loadStats = async () => { try { const { data } = await apiService.adminNotifications.stats?.(); setStats(data.stats||data||null);} catch(e){ console.error(e);} };

  const resetForm = () => { setFormData({ title:'', message:'', type:'info', priority:'medium', recipient_type:'all', recipient_ids:[], course_id:null, schedule_at:'' }); setEditing(null); };

  const submitNotification = async (e) => { e.preventDefault(); try { let data; if(editing){ ({data}=await apiService.adminNotifications.update(editing.id, formData)); } else { ({data}=await apiService.adminNotifications.create(formData)); } if(data.success!==false){ toast.success(editing?'Notification updated':'Notification sent'); setShowForm(false); resetForm(); loadNotifications(); if(formData.schedule_at) loadScheduled(); } else toast.error(data.error||'Save failed'); } catch(e){ console.error(e); toast.error('Save failed'); } };

  const deleteNotification = async (id) => { if(!window.confirm('Delete notification?')) return; try { const { data } = await apiService.adminNotifications.delete(id); if(data.success!==false){ toast.success('Deleted'); loadNotifications(); } else toast.error(data.error||'Delete failed'); } catch(e){ console.error(e); toast.error('Delete failed'); } };

  const submitTemplate = async (e) => { e.preventDefault(); try { let data; if(templateForm.id){ ({data}=await apiService.notificationTemplates.update(templateForm.id, templateForm)); } else { ({data}=await apiService.notificationTemplates.create(templateForm)); } if(data.success!==false){ toast.success(templateForm.id?'Template updated':'Template created'); setShowTemplateForm(false); setTemplateForm({ name:'', title:'', message:'', type:'info', priority:'medium' }); loadTemplates(); } else toast.error(data.error||'Template save failed'); } catch(e){ console.error(e); toast.error('Template save failed'); } };

  const editTemplate = (tpl) => { setTemplateForm(tpl); setShowTemplateForm(true); };
  const deleteTemplate = async (id) => { if(!window.confirm('Delete template?')) return; try { const { data } = await apiService.notificationTemplates.delete(id); if(data.success!==false){ toast.success('Template deleted'); loadTemplates(); } else toast.error(data.error||'Delete failed'); } catch(e){ console.error(e); toast.error('Delete failed'); } };

  const cancelScheduled = async (id) => { if(!window.confirm('Cancel scheduled notification?')) return; try { const { data } = await apiService.adminNotifications.cancel?.(id); if(data.success!==false){ toast.success('Cancelled'); loadScheduled(); } else toast.error(data.error||'Cancel failed'); } catch(e){ console.error(e); toast.error('Cancel failed'); } };

  if(!isAdmin){ return <div className='p-8 text-center'><Bell className='w-16 h-16 mx-auto text-red-500'/><h2 className='mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100'>Access Denied</h2></div>; }

  const tabs=[{id:'notifications',label:'Notifications',icon:Bell},{id:'templates',label:'Templates',icon:Layers},{id:'scheduled',label:'Scheduled',icon:Clock},{id:'stats',label:'Stats',icon:BarChart3}];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='flex items-center text-2xl font-bold text-gray-900 dark:text-white'><Bell className='w-8 h-8 mr-3'/>Admin Notifications Hub</h1>
        <div className='flex space-x-2'>
          <button onClick={loadAll} className='px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center'><RefreshCw className='w-4 h-4 mr-1'/>Refresh</button>
          {activeTab==='templates' && <button onClick={()=>{setTemplateForm({ name:'', title:'', message:'', type:'info', priority:'medium' }); setShowTemplateForm(true);}} className='px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center'><Plus className='w-4 h-4 mr-1'/>Template</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-2 border-b dark:border-gray-700'>
        {tabs.map(t=> <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center space-x-1 ${activeTab===t.id?'border-blue-600 text-blue-600 dark:text-blue-400':'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}><t.icon className='w-4 h-4'/><span>{t.label}</span></button>)}
      </div>

      {/* Notifications Management Tab */}
      {activeTab === 'notifications' && (
        <NotificationManagement />
      )}

      {/* Templates */}
      {activeTab==='templates' && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4'>
          {templates.length===0 && <div className='text-sm text-gray-500'>No templates</div>}
          {templates.map(tpl => (
            <div key={tpl.id} className='p-3 border border-gray-200 dark:border-gray-700 rounded flex justify-between'>
              <div>
                <div className='font-semibold text-sm text-gray-800 dark:text-gray-100'>{tpl.name}</div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{tpl.title}</div>
              </div>
              <div className='flex items-center space-x-2'>
                <button onClick={()=>editTemplate(tpl)} className='text-blue-600 hover:text-blue-700'><Edit className='w-4 h-4'/></button>
                <button onClick={()=>deleteTemplate(tpl.id)} className='text-red-600 hover:text-red-700'><Trash2 className='w-4 h-4'/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled */}
      {activeTab==='scheduled' && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4'>
          {scheduled.length===0 && <div className='text-sm text-gray-500'>No scheduled notifications</div>}
          {scheduled.map(s => (
            <div key={s.id} className='p-3 border border-gray-200 dark:border-gray-700 rounded flex justify-between'>
              <div>
                <div className='font-semibold text-sm text-gray-800 dark:text-gray-100'>{s.title}</div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>Scheduled: {s.schedule_at}</div>
              </div>
              <div className='flex items-center space-x-2'>
                <button onClick={()=>cancelScheduled(s.id)} className='text-red-600 hover:text-red-700'><X className='w-4 h-4'/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {activeTab==='stats' && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
          {!stats && <div className='text-sm text-gray-500'>No stats available</div>}
          {stats && (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {Object.entries(stats).map(([k,v]) => (
                <div key={k} className='p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40'>
                  <div className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>{k}</div>
                  <div className='text-lg font-semibold text-gray-800 dark:text-gray-100'>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notification Form Modal */}
      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg'>
            <h3 className='mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100'>{editing?'Edit Notification':'Create Notification'}</h3>
            <form onSubmit={submitNotification} className='space-y-4'>
              <input value={formData.title} onChange={e=>setFormData(prev=>({...prev,title:e.target.value}))} placeholder='Title' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded'/>
              <textarea value={formData.message} onChange={e=>setFormData(prev=>({...prev,message:e.target.value}))} rows='4' placeholder='Message' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded'/>
              <div className='grid grid-cols-2 gap-2'>
                <select value={formData.type} onChange={e=>setFormData(prev=>({...prev,type:e.target.value}))} className='px-2 py-2 border border-gray-300 dark:border-gray-600 rounded'>
                  <option value='info'>Info</option><option value='success'>Success</option><option value='warning'>Warning</option><option value='error'>Error</option>
                </select>
                <select value={formData.priority} onChange={e=>setFormData(prev=>({...prev,priority:e.target.value}))} className='px-2 py-2 border border-gray-300 dark:border-gray-600 rounded'>
                  <option value='low'>Low</option><option value='medium'>Medium</option><option value='high'>High</option>
                </select>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <select value={formData.recipient_type} onChange={e=>setFormData(prev=>({...prev,recipient_type:e.target.value}))} className='px-2 py-2 border border-gray-300 dark:border-gray-600 rounded'>
                  <option value='all'>All Users</option><option value='students'>Students</option><option value='staff'>Staff</option><option value='admins'>Admins</option>
                </select>
                <input type='datetime-local' value={formData.schedule_at} onChange={e=>setFormData(prev=>({...prev,schedule_at:e.target.value}))} className='px-2 py-2 border border-gray-300 dark:border-gray-600 rounded'/>
              </div>
              <div className='flex justify-end space-x-2'>
                <button type='button' onClick={()=>{setShowForm(false); resetForm();}} className='px-4 py-2 text-sm text-gray-600'>Cancel</button>
                <button type='submit' className='px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700'>{editing?'Update':'Send'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg'>
            <h3 className='mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100'>{templateForm.id?'Edit Template':'Create Template'}</h3>
            <form onSubmit={submitTemplate} className='space-y-4'>
              <input value={templateForm.name} onChange={e=>setTemplateForm(prev=>({...prev,name:e.target.value}))} placeholder='Name' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded'/>
              <input value={templateForm.title} onChange={e=>setTemplateForm(prev=>({...prev,title:e.target.value}))} placeholder='Title' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded'/>
              <textarea value={templateForm.message} onChange={e=>setTemplateForm(prev=>({...prev,message:e.target.value}))} rows='4' placeholder='Message' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded'/>
              <div className='grid grid-cols-2 gap-2'>
                <select value={templateForm.type} onChange={e=>setTemplateForm(prev=>({...prev,type:e.target.value}))} className='px-2 py-2 border border-gray-300 dark:border-gray-600 rounded'>
                  <option value='info'>Info</option><option value='success'>Success</option><option value='warning'>Warning</option><option value='error'>Error</option>
                </select>
                <select value={templateForm.priority} onChange={e=>setTemplateForm(prev=>({...prev,priority:e.target.value}))} className='px-2 py-2 border border-gray-300 dark:border-gray-600 rounded'>
                  <option value='low'>Low</option><option value='medium'>Medium</option><option value='high'>High</option>
                </select>
              </div>
              <div className='flex justify-end space-x-2'>
                <button type='button' onClick={()=>{setShowTemplateForm(false); setTemplateForm({ name:'', title:'', message:'', type:'info', priority:'medium' });}} className='px-4 py-2 text-sm text-gray-600'>Cancel</button>
                <button type='submit' className='px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700'>{templateForm.id?'Update':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsHub;
