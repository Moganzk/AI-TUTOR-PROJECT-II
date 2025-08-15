import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit, Send, Clock } from 'lucide-react';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', priority: 'medium' });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [tplRes, schedRes] = await Promise.all([
        apiService.notificationTemplates.list(),
        apiService.notificationTemplates.scheduled()
      ]);
      setTemplates(tplRes.data.templates || tplRes.data || []);
      setScheduled(schedRes.data.notifications || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.notificationTemplates.update(editing.id, form);
        toast.success('Template updated');
      } else {
        await apiService.notificationTemplates.create(form);
        toast.success('Template created');
      }
      setEditing(null);
      setForm({ title: '', message: '', type: 'info', priority: 'medium' });
      loadAll();
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await apiService.notificationTemplates.remove(id);
      toast.success('Deleted');
      loadAll();
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleSend = async (id) => {
    try {
      await apiService.notificationTemplates.send(id, {});
      toast.success('Notification sent');
    } catch (e) { toast.error('Send failed'); }
  };

  if (loading) return <div className='p-6'>Loading templates...</div>;

  return (
    <div className='p-6 space-y-8'>
      <div>
        <h1 className='text-2xl font-semibold mb-4'>Notification Templates</h1>
        <form onSubmit={handleSubmit} className='space-y-4 max-w-xl'>
          <input className='w-full border rounded px-3 py-2' placeholder='Title' value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <textarea className='w-full border rounded px-3 py-2' placeholder='Message' value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
          <div className='flex gap-4'>
            <select className='border rounded px-2 py-2' value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value='info'>Info</option>
              <option value='success'>Success</option>
              <option value='warning'>Warning</option>
              <option value='error'>Error</option>
            </select>
            <select className='border rounded px-2 py-2' value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
            <button className='bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2'>
              <Plus size={16}/> {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className='text-xl font-semibold mb-2'>Templates</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {templates.map(t => (
            <div key={t.id || t.title} className='border rounded p-4 bg-white dark:bg-gray-800 flex flex-col gap-3'>
              <div className='flex justify-between items-center'>
                <h3 className='font-medium'>{t.title}</h3>
                <div className='flex gap-2'>
                  <button onClick={()=>{setEditing(t); setForm({title:t.title,message:t.message,type:t.type,priority:t.priority});}} className='text-blue-600'><Edit size={16}/></button>
                  <button onClick={()=>handleDelete(t.id)} className='text-red-600'><Trash2 size={16}/></button>
                  <button onClick={()=>handleSend(t.id)} className='text-green-600'><Send size={16}/></button>
                </div>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-3'>{t.message}</p>
              <div className='text-xs text-gray-500'>{t.type} • {t.priority}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className='text-xl font-semibold mb-2 flex items-center gap-2'><Clock size={18}/> Scheduled Notifications</h2>
        <div className='space-y-3'>
          {scheduled.map(s => (
            <div key={s.id} className='border rounded p-3 flex justify-between items-center bg-white dark:bg-gray-800'>
              <div>
                <div className='font-medium'>{s.title}</div>
                <div className='text-xs text-gray-500'>Scheduled: {s.scheduled_for || 'N/A'}</div>
              </div>
              <button onClick={()=>apiService.notificationTemplates.cancelScheduled(s.id).then(()=>{toast.success('Cancelled'); loadAll();})} className='text-red-600 text-sm'>Cancel</button>
            </div>
          ))}
          {scheduled.length === 0 && <div className='text-sm text-gray-500'>No scheduled notifications</div>}
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplates;
