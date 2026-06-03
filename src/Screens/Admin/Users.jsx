import { useState, useEffect } from 'react';
import { usersApi } from '../../api';
import { Search, Plus, UserCircle, Edit2, Trash2, Mail, Shield, Info, Calendar, FolderKanban, Video, FileText, MapPin } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoUser, setInfoUser] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Recruiter',
    status: 'Active'
  });
  
  const { confirm, ConfirmDialog } = useConfirm();
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.list();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Recruiter',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const openInfoModal = (user) => {
    setInfoUser(user);
    setIsInfoModalOpen(true);
  };

  const handleDelete = async (user) => {
    const isConfirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      confirmText: 'Delete User',
      type: 'danger'
    });
    
    if (isConfirmed) {
      try {
        await usersApi.delete(user.id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user');
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Admin panel for managing system users</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f111a] rounded-2xl border border-slate-200/80 dark:border-white/[0.04] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] text-slate-900 dark:text-white text-sm outline-none focus:border-prpl dark:focus:border-prpl" 
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner text="Loading users..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.04]">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-prpl/10 flex items-center justify-center text-prpl font-bold text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {user.role === 'Admin' ? <Shield className="w-4 h-4 text-amber-500" /> : <UserCircle className="w-4 h-4" />}
                        {user.role}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openInfoModal(user)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition" title="View Info">
                          <Info className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(user)} className="p-1.5 text-slate-400 hover:text-prpl hover:bg-prpl/10 rounded-lg transition" title="Edit User">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500 text-sm">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Edit User" : "Add New User"}>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.04] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-prpl" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.04] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-prpl" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.04] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-prpl" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
            </label>
            <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.04] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-prpl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.04] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-prpl">
                <option value="Recruiter">Recruiter</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.04] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-prpl">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/[0.02]">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] rounded-xl transition">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Info Modal */}
      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="User Information">
        {infoUser && (
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/[0.04] pb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-prpl to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-prpl/10">
                {infoUser.firstName[0]}{infoUser.lastName[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {infoUser.firstName} {infoUser.lastName}
                  {infoUser.LinkedInToken && (
                    <span className="bg-[#0077B5]/10 text-[#0077B5] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaLinkedin className="w-3 h-3" /> Linked
                    </span>
                  )}
                </h3>
                <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {infoUser.email}</span>
                  {infoUser.country && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {infoUser.country}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Basic Info */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Role</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{infoUser.role}</div>
              </div>
              
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Account Status</span>
                </div>
                <div className="mt-1">
                  <StatusBadge status={infoUser.status} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Joined Date</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {infoUser.joinDate ? new Date(infoUser.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-prpl/5 dark:bg-prpl/10 border border-prpl/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-prpl">Projects Owned</span>
                  <FolderKanban className="w-4 h-4 text-prpl" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {infoUser.Projects ? infoUser.Projects.length : 0}
                </div>
              </div>

              <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Interviews</span>
                  <Video className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {infoUser.Meetings ? infoUser.Meetings.length : 0}
                </div>
              </div>

              
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-white/[0.02]">
              <button type="button" onClick={() => setIsInfoModalOpen(false)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {ConfirmDialog}
    </>
  );
}
