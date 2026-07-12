'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Search, UserPlus, Edit2, ShieldAlert, UserCheck, 
  ChevronLeft, ChevronRight, X, Loader2 
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pages, setPages] = useState(1);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'BROKER',
  });

  const [editForm, setEditForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    status: '',
    companyName: '',
    licenseNumber: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const response = await api.get(`/admin/users?${query.toString()}`);
      setUsers(response.data.users);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to fetch users directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', createForm);
      toast.success('User account created successfully.');
      setIsCreateOpen(false);
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'BROKER',
      });
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.patch(`/admin/users/${selectedUser.id}`, editForm);
      toast.success('User account updated successfully.');
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const actionText = newStatus === 'SUSPENDED' ? 'suspend' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionText} ${user.firstName} ${user.lastName}?`)) return;

    try {
      await api.patch(`/admin/users/${user.id}`, { status: newStatus });
      toast.success(`User successfully ${newStatus.toLowerCase()}.`);
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status.');
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      companyName: user.companyName || '',
      licenseNumber: user.licenseNumber || '',
    });
    setIsEditOpen(true);
  };

  const handleViewDocument = async (docId: string) => {
    try {
      const response = await api.get(`/investors/documents/${docId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to view document', error);
      toast.error('Failed to load document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1633]">User Management Directory</h1>
          <p className="text-sm text-[#79628c] mt-1">Manage profile credentials, adjust roles, or deactivate platform access.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-hairline-cool shadow-sm flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by first name, last name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-hairline-cool rounded-lg outline-none text-sm font-medium text-ink focus:border-red-500 transition-colors"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#79628c]" />
        </form>

        <div className="flex space-x-3">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-hairline-cool px-3 py-2 rounded-lg outline-none text-sm font-medium text-ink bg-white focus:border-red-500 transition-colors"
          >
            <option value="">All Roles</option>
            <option value="INVESTOR">Investor</option>
            <option value="BROKER">Broker</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-hairline-cool px-3 py-2 rounded-lg outline-none text-sm font-medium text-ink bg-white focus:border-red-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-hairline-cool shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 text-[#79628c] space-y-2">
            <p className="text-lg font-semibold">No users found</p>
            <p className="text-sm">Try broadening your search keywords or adjustment parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-night/5 text-xs font-semibold text-[#79628c] border-b border-hairline-cool">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-cool text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-ink-deep">
                      <div>{user.firstName} {user.lastName}</div>
                      {user.role === 'BROKER' && user.companyName && (
                        <div className="text-[11px] text-[#79628c] font-normal mt-0.5">
                          {user.companyName} (Lic: {user.licenseNumber})
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[#79628c] font-medium">{user.email}</td>
                    <td className="p-4 text-[#79628c]">{user.phone || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'BROKER' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#79628c]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Tooltip 
                        position="left"
                        content="Edit user profile: modify name, phone, change system role permissions, or adjust account status."
                      >
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded transition-all inline-flex items-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Tooltip>

                      <Tooltip 
                        position="left"
                        content={user.status === 'SUSPENDED' ? "Reactivate user: grant full system access and log-in privileges immediately." : "Deactivate user: instantly lock the user out of the platform without deleting their data."}
                      >
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1 rounded transition-all inline-flex items-center ${
                            user.status === 'SUSPENDED' 
                              ? 'text-emerald-600 hover:bg-emerald-50' 
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          {user.status === 'SUSPENDED' ? <UserCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pages > 1 && (
          <div className="p-4 border-t border-hairline-cool flex items-center justify-between bg-slate-50">
            <span className="text-xs text-[#79628c]">
              Showing page {page} of {pages} ({total} entries total)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => prev - 1)}
                className="p-1 rounded border border-hairline-cool hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(prev => prev + 1)}
                className="p-1 rounded border border-hairline-cool hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-hairline-cool">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#1f1633] mb-4">Create System User</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <div className="flex items-center space-x-1.5 mb-1">
                  <label className="block text-xs font-semibold text-[#79628c] uppercase">Role</label>
                  <Tooltip 
                    position="top"
                    content="ADMIN has system configurations & directory power. BROKER reviews orders, KYC, & receipts. INVESTOR signs up to purchase bonds."
                  >
                    <span className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help font-bold font-mono">?</span>
                  </Tooltip>
                </div>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm bg-white focus:border-red-500 font-medium text-ink"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="BROKER">Broker</option>
                  <option value="INVESTOR">Investor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+258841112222"
                  className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-hairline-cool rounded-lg text-sm text-[#79628c] hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-hairline-cool">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#1f1633] mb-4">Edit User Account</h3>
            
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <label className="block text-xs font-semibold text-[#79628c] uppercase">Role</label>
                    <Tooltip 
                      position="top"
                      content="ADMIN: Full configurations & directory access. BROKER: Manages orders, KYC, and payments. INVESTOR: Subscribes to bonds."
                    >
                      <span className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help font-bold font-mono">?</span>
                    </Tooltip>
                  </div>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm bg-white focus:border-red-500 font-medium text-ink"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="BROKER">Broker</option>
                    <option value="INVESTOR">Investor</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <label className="block text-xs font-semibold text-[#79628c] uppercase">Status</label>
                    <Tooltip 
                      position="top"
                      content="ACTIVE: Can log in. PENDING: Under registration/review. SUSPENDED: Blocked from logging in."
                    >
                      <span className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help font-bold font-mono">?</span>
                    </Tooltip>
                  </div>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm bg-white focus:border-red-500 font-medium text-ink"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Conditional Broker-Specific Inputs */}
              {editForm.role === 'BROKER' && (
                <div className="grid grid-cols-2 gap-4 border-t border-hairline-cool pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#79628c] uppercase mb-1">License Number</label>
                    <input
                      type="text"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                      className="w-full border border-hairline-cool p-2.5 rounded-lg outline-none text-sm focus:border-red-500 font-medium text-ink"
                    />
                  </div>
                </div>
              )}

              {/* Uploaded Documents List */}
              {selectedUser.documents && selectedUser.documents.length > 0 && (
                <div className="border-t border-hairline-cool pt-4 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-[#79628c] font-bold">Verification Credentials</h4>
                  <div className="space-y-1.5">
                    {selectedUser.documents.map((doc: any) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleViewDocument(doc.id)}
                        className="flex items-center justify-between p-2.5 rounded bg-slate-50 hover:bg-red-50/20 border border-hairline-cool text-xs text-red-600 hover:text-red-700 font-medium hover:underline transition-all w-full text-left"
                      >
                        <span className="truncate max-w-[280px]">{doc.fileName}</span>
                        <span className="text-[9px] font-mono bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded uppercase ml-2 shrink-0">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-hairline-cool rounded-lg text-sm text-[#79628c] hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
