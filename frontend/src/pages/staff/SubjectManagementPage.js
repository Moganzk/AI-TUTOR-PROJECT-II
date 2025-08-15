import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';

const SubjectManagementPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.subjects.list();
      setSubjects(data.subjects || data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiService.subjects.create(newSubject);
      if (data.success !== false) {
        setSubjects([data.subject || data, ...subjects]);
        setShowCreate(false);
        setNewSubject({ name: '', description: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSave = async () => {
    try {
      const { data } = await apiService.subjects.update(editingSubject.id, editingSubject);
      if (data.success !== false) {
        setSubjects(subjects.map(s => s.id === editingSubject.id ? data.subject || data : s));
        setEditingSubject(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete subject?')) return;
    try {
      await apiService.subjects.delete(id);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1>Subject Management</h1>
      {loading && <p>Loading...</p>}
      <button onClick={() => setShowCreate(true)}>Create Subject</button>
      {showCreate && (
        <form onSubmit={handleCreate}>
          <input
            type="text"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            placeholder="Subject Name"
            required
          />
          <textarea
            value={newSubject.description}
            onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
            placeholder="Subject Description"
            required
          />
          <button type="submit">Create</button>
          <button onClick={() => setShowCreate(false)}>Cancel</button>
        </form>
      )}
      <ul>
        {subjects.map(subject => (
          <li key={subject.id}>
            {subject.name} - {subject.description}
            <button onClick={() => setEditingSubject(subject)}>Edit</button>
            <button onClick={() => handleDelete(subject.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {editingSubject && (
        <div>
          <h2>Edit Subject</h2>
          <input
            type="text"
            value={editingSubject.name}
            onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
            placeholder="Subject Name"
            required
          />
          <textarea
            value={editingSubject.description}
            onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
            placeholder="Subject Description"
            required
          />
          <button onClick={handleEditSave}>Save</button>
          <button onClick={() => setEditingSubject(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default SubjectManagementPage;