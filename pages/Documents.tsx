
import React, { useState } from 'react';
import { Button, Input, Select, TextArea, Card } from '../components/UI';
import {
    FileText, Download, Eye, UploadCloud, Globe, Lock, Search, FileDown,
    Trash2, Plus, ArrowLeft, Save, X, File, FileSpreadsheet, Image as ImageIcon,
    MoreVertical, Clock, User, Tag, CheckCircle, Edit2, ChevronRight
} from 'lucide-react';
import { Document } from '../types';
import { DocumentUploadRequestTab } from '../components/DocumentUploadRequestTab';

// --- MOCK DATA ---
const MOCK_DOCUMENTS: Document[] = [
    {
        id: '1', code: 'DOC-2023-001', name: 'Báo cáo Phát triển Bền vững 2022',
        type: 'PDF', size: '15.4 MB', uploadDate: '15/05/2023', uploadedBy: 'Nguyễn Văn A',
        tags: ['Annual Report', 'ESG'], isPublic: true, version: '1.0',
        description: 'Báo cáo thường niên về các hoạt động phát triển bền vững của Vietnam Airlines năm 2022, bao gồm các chỉ số môi trường, xã hội và quản trị.'
    },
    {
        id: '2', code: 'CERT-ISO-14001', name: 'Chứng chỉ ISO 14001:2015',
        type: 'PDF', size: '2.1 MB', uploadDate: '10/06/2023', uploadedBy: 'Trần Thị B',
        tags: ['Cert', 'Environment'], isPublic: false, version: '2.0',
        description: 'Chứng nhận hệ thống quản lý môi trường theo tiêu chuẩn quốc tế ISO 14001:2015.'
    },
    {
        id: '3', code: 'DATA-FUEL-H1', name: 'Dữ liệu nhiên liệu T1-T6/2023',
        type: 'Excel', size: '500 KB', uploadDate: '01/07/2023', uploadedBy: 'Lê Văn C',
        tags: ['Raw Data', 'Fuel'], isPublic: false, version: '1.0',
        description: 'Bảng dữ liệu gốc về tiêu thụ nhiên liệu máy bay trong 6 tháng đầu năm 2023.'
    },
];

export const DocumentsPage: React.FC = () => {
    // State
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'ADD' | 'EDIT'>('LIST');
    const [mainTab, setMainTab] = useState<'REPOSITORY' | 'REQUESTS'>('REPOSITORY');
    const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterScope, setFilterScope] = useState('');

    // Form States
    const [newDocForm, setNewDocForm] = useState<Partial<Document>>({
        code: '', name: '', type: 'PDF', isPublic: false, description: '', tags: []
    });

    // Edit Form State (Initialized when entering Edit mode)
    const [editDocForm, setEditDocForm] = useState<Document | null>(null);

    // --- HANDLERS ---

    const handleViewDetail = (doc: Document) => {
        setSelectedDoc(doc);
        setViewMode('DETAIL');
    };

    const handleAddNew = () => {
        setNewDocForm({
            code: `DOC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            name: '',
            type: 'PDF',
            isPublic: false,
            description: '',
            tags: []
        });
        setViewMode('ADD');
    };

    const handleSaveNew = () => {
        // Basic validation mockup
        if (!newDocForm.name || !newDocForm.code) return;

        const newDoc: Document = {
            id: `NEW_${Date.now()}`,
            code: newDocForm.code!,
            name: newDocForm.name!,
            type: (newDocForm.type as any) || 'Other',
            size: '1.2 MB', // Mock
            uploadDate: new Date().toLocaleDateString('vi-VN'),
            uploadedBy: 'Admin', // Mock user
            tags: ['New'],
            isPublic: newDocForm.isPublic || false,
            version: '1.0',
            description: newDocForm.description || '',
        };

        setDocuments([newDoc, ...documents]);
        setViewMode('LIST');
    };

    const handleEditClick = () => {
        if (selectedDoc) {
            setEditDocForm({ ...selectedDoc });
            setViewMode('EDIT');
        }
    };

    const handleSaveEdit = () => {
        if (editDocForm && selectedDoc) {
            const updatedDocs = documents.map(doc =>
                doc.id === editDocForm.id ? editDocForm : doc
            );
            setDocuments(updatedDocs);
            setSelectedDoc(editDocForm); // Update view detail
            setViewMode('DETAIL');
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            setDocuments(documents.filter(d => d.id !== id));
            if (viewMode === 'DETAIL') setViewMode('LIST');
        }
    };

    // --- HELPERS ---

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText className="text-red-500" size={24} />;
            case 'Excel': return <FileSpreadsheet className="text-green-600" size={24} />;
            case 'Image': return <ImageIcon className="text-blue-500" size={24} />;
            default: return <File className="text-black/45" size={24} />;
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchSearch = doc.name.toLowerCase().includes(searchText.toLowerCase()) || doc.code.toLowerCase().includes(searchText.toLowerCase());
        const matchType = !filterType || doc.type === filterType;
        const matchScope = !filterScope
            || (filterScope === 'public' && doc.isPublic)
            || (filterScope === 'internal' && !doc.isPublic);
        return matchSearch && matchType && matchScope;
    });

    // --- RENDERERS ---

    // 1. LIST VIEW
    const renderList = () => (
        <div className="flex-1 flex flex-col animate-in fade-in duration-300 text-left">
            <div className="flex justify-end items-center mb-4">
                <Button onClick={handleAddNew} className="shadow-md cursor-pointer font-bold flex items-center gap-1.5">
                    <Plus size={16} /> Thêm tài liệu
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 flex-1 shadow-xs bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3.5 px-4 font-semibold text-sm text-gray-700 w-14 text-center">STT</th>
                            <th className="py-3.5 px-4 font-semibold text-sm text-gray-700 min-w-[280px]">Thông tin Tài liệu</th>
                            <th className="py-3.5 px-4 font-semibold text-sm text-gray-700 w-44">Phạm vi</th>
                            <th className="py-3.5 px-4 font-semibold text-sm text-gray-700 w-52">Người đăng</th>
                            <th className="py-3.5 px-4 font-semibold text-sm text-gray-700 w-36">Ngày đăng</th>
                            <th className="py-3.5 px-4 font-semibold text-sm text-gray-700 w-24 text-center">Thao tác</th>
                        </tr>

                        {/* COLUMN FILTER ROW */}
                        <tr className="bg-blue-50/70 border-b border-gray-200">
                            {/* 1. STT Spacer */}
                            <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                            {/* 2. Filter Document Info */}
                            <th className="py-2 px-3 text-left">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        placeholder="Lọc tên, mã tài liệu..."
                                        className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2.5 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                                    />
                                    {searchText && (
                                        <button onClick={() => setSearchText('')} className="absolute right-2 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                                    )}
                                </div>
                            </th>

                            {/* 3. Filter Scope */}
                            <th className="py-2 px-3 text-left">
                                <select
                                    value={filterScope}
                                    onChange={(e) => setFilterScope(e.target.value)}
                                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                                >
                                    <option value="">Tất cả phạm vi</option>
                                    <option value="public">Công bố (Public)</option>
                                    <option value="internal">Nội bộ (Internal)</option>
                                </select>
                            </th>

                            {/* 4. Filter Uploader Spacer */}
                            <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                            {/* 5. Filter Date Spacer */}
                            <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                            {/* 6. Clear Filter Action */}
                            <th className="py-2 px-2 text-center">
                                {(searchText || filterScope) && (
                                    <button
                                        onClick={() => {
                                            setSearchText('');
                                            setFilterScope('');
                                        }}
                                        className="text-[11px] font-bold text-red-600 hover:text-red-800 underline cursor-pointer px-1 py-0.5 rounded hover:bg-red-50"
                                        title="Xóa tất cả bộ lọc"
                                    >
                                        Xóa lọc
                                    </button>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredDocuments.map((doc, idx) => (
                            <tr
                                key={doc.id}
                                className="hover:bg-blue-50 group transition-colors cursor-pointer"
                                onClick={() => handleViewDetail(doc)}
                            >
                                <td className="p-4 text-sm text-black/45 text-center">{idx + 1}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                                            {getFileIcon(doc.type)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-black/85 text-sm group-hover:text-vna-blue transition-colors">{doc.name}</div>
                                            <div className="text-xs text-black/45 flex items-center gap-2 mt-0.5">
                                                <span className="font-mono text-gray-400">{doc.code}</span>
                                                <span>•</span>
                                                <span>{doc.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {doc.isPublic ? (
                                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit border border-green-200 font-medium"><Globe size={12} /> Public</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200 font-medium"><Lock size={12} /> Internal</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {doc.uploadedBy.charAt(0)}
                                        </div>
                                        {doc.uploadedBy}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{doc.uploadDate}</td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); alert(`Downloading ${doc.name}...`); }}
                                            className="p-1.5 rounded text-gray-400 hover:bg-white hover:text-vna-blue hover:hover:shadow-md transition-shadow duration-300 transition-all border border-transparent hover:border-gray-100"
                                            title="Tải xuống"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-vna-blue transition-colors" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredDocuments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 italic">Không tìm thấy tài liệu phù hợp</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // 2. ADD VIEW
    const renderAdd = () => (
        <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <Button variant="ghost" onClick={() => setViewMode('LIST')} className="text-black/45 hover:text-vna-blue">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-vna-blue">Thêm tài liệu mới</h2>
                    <p className="text-sm text-black/45">Tải lên tài liệu và điền thông tin chi tiết</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Upload Area */}
                <div className="lg:col-span-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center h-[300px] hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50">
                        <div className="w-16 h-16 bg-blue-50 text-vna-blue rounded-full flex items-center justify-center mb-4">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="text-sm font-bold text-black/85 mb-1">Kéo thả file vào đây</h3>
                        <p className="text-xs text-black/45 mb-4">hoặc bấm để chọn từ máy tính</p>
                        <Button variant="outline" className="text-xs">Chọn File</Button>
                        <p className="text-[10px] text-gray-400 mt-4">Hỗ trợ: PDF, Excel, Word, Image (Max 20MB)</p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <Input
                            label="Mã tài liệu"
                            value={newDocForm.code}
                            onChange={(e) => setNewDocForm({ ...newDocForm, code: e.target.value })}
                            placeholder="VD: DOC-2025-001"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu</label>
                            <Select
                                options={[{ label: 'PDF', value: 'PDF' }, { label: 'Excel', value: 'Excel' }, { label: 'Word', value: 'Word' }]}
                                value={newDocForm.type}
                                onChange={(val) => setNewDocForm({ ...newDocForm, type: val })}
                            />
                        </div>
                    </div>

                    <Input
                        label="Tên tài liệu"
                        value={newDocForm.name}
                        onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                        placeholder="Nhập tên tài liệu đầy đủ..."
                    />

                    <TextArea
                        label="Mô tả chi tiết"
                        rows={4}
                        value={newDocForm.description}
                        onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
                        placeholder="Mô tả nội dung chính của tài liệu..."
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phạm vi công bố</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer flex-1 transition-all ${newDocForm.isPublic ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={newDocForm.isPublic}
                                    onChange={() => setNewDocForm({ ...newDocForm, isPublic: true })}
                                    className="text-vna-blue focus:ring-vna-blue"
                                />
                                <div>
                                    <div className="text-sm font-bold text-black/85 flex items-center gap-1"><Globe size={14} /> Public (Công bố)</div>
                                    <div className="text-xs text-black/45">Hiển thị trên Website và Báo cáo ngoài</div>
                                </div>
                            </label>
                            <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer flex-1 transition-all ${!newDocForm.isPublic ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={!newDocForm.isPublic}
                                    onChange={() => setNewDocForm({ ...newDocForm, isPublic: false })}
                                    className="text-vna-blue focus:ring-vna-blue"
                                />
                                <div>
                                    <div className="text-sm font-bold text-black/85 flex items-center gap-1"><Lock size={14} /> Internal (Nội bộ)</div>
                                    <div className="text-xs text-black/45">Chỉ lưu hành nội bộ hệ thống</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setViewMode('LIST')}>Hủy bỏ</Button>
                        <Button onClick={handleSaveNew}><Save size={16} /> Lưu tài liệu</Button>
                    </div>
                </div>
            </div>
        </div>
    );

    // 3. EDIT VIEW
    const renderEdit = () => {
        if (!editDocForm) return null;

        return (
            <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                    <Button variant="ghost" onClick={() => setViewMode('DETAIL')} className="text-black/45 hover:text-vna-blue">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-vna-blue">Chỉnh sửa tài liệu</h2>
                        <p className="text-sm text-black/45">Cập nhật thông tin chi tiết cho tài liệu</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Info */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 text-center h-[300px] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 hover:shadow-md transition-shadow duration-300">
                                {getFileIcon(editDocForm.type)}
                            </div>
                            <h3 className="text-sm font-bold text-black/85 mb-1">{editDocForm.name}</h3>
                            <p className="text-xs text-black/45 mb-4">{editDocForm.size}</p>
                            <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                Không thể thay đổi File gốc
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <Input
                                label="Mã tài liệu"
                                value={editDocForm.code}
                                onChange={(e) => setEditDocForm({ ...editDocForm, code: e.target.value })}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu</label>
                                <Select
                                    options={[{ label: 'PDF', value: 'PDF' }, { label: 'Excel', value: 'Excel' }, { label: 'Word', value: 'Word' }]}
                                    value={editDocForm.type}
                                    onChange={(val) => setEditDocForm({ ...editDocForm, type: val })}
                                />
                            </div>
                        </div>

                        <Input
                            label="Tên tài liệu"
                            value={editDocForm.name}
                            onChange={(e) => setEditDocForm({ ...editDocForm, name: e.target.value })}
                        />

                        <TextArea
                            label="Mô tả chi tiết"
                            rows={4}
                            value={editDocForm.description}
                            onChange={(e) => setEditDocForm({ ...editDocForm, description: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phạm vi công bố</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer flex-1 transition-all ${editDocForm.isPublic ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="scope_edit"
                                        checked={editDocForm.isPublic}
                                        onChange={() => setEditDocForm({ ...editDocForm, isPublic: true })}
                                        className="text-vna-blue focus:ring-vna-blue"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-black/85 flex items-center gap-1"><Globe size={14} /> Public (Công bố)</div>
                                        <div className="text-xs text-black/45">Hiển thị trên Website và Báo cáo ngoài</div>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer flex-1 transition-all ${!editDocForm.isPublic ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="scope_edit"
                                        checked={!editDocForm.isPublic}
                                        onChange={() => setEditDocForm({ ...editDocForm, isPublic: false })}
                                        className="text-vna-blue focus:ring-vna-blue"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-black/85 flex items-center gap-1"><Lock size={14} /> Internal (Nội bộ)</div>
                                        <div className="text-xs text-black/45">Chỉ lưu hành nội bộ hệ thống</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setViewMode('DETAIL')}>Hủy bỏ</Button>
                            <Button onClick={handleSaveEdit}><Save size={16} /> Lưu thay đổi</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. DETAIL VIEW
    const renderDetail = () => {
        if (!selectedDoc) return null;

        return (
            <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setViewMode('LIST')} className="p-2 border border-gray-200 hover:bg-gray-100 bg-white text-black/45 hover:text-vna-blue">
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-vna-blue">{selectedDoc.name}</h1>
                                {selectedDoc.isPublic ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200 flex items-center gap-1">
                                        <Globe size={12} /> Public
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold border border-gray-200 flex items-center gap-1">
                                        <Lock size={12} /> Internal
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={handleEditClick}><Edit2 size={16} /> Chỉnh sửa</Button>
                        <Button variant="outline" className="text-gray-600"><Download size={16} /> Tải xuống</Button>
                        <Button variant="danger" onClick={() => handleDelete(selectedDoc.id)}><Trash2 size={16} /> Xóa</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-1">
                    {/* Preview Area */}
                    <div className="lg:col-span-2 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center min-h-[500px] relative">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 hover:shadow-md transition-shadow duration-300">
                                {getFileIcon(selectedDoc.type)}
                            </div>
                            <p className="text-black/45 font-medium">Bản xem trước tài liệu</p>
                            <p className="text-sm text-gray-400 mt-1">{selectedDoc.name}</p>
                        </div>
                        {/* Mock Pagination for PDF viewer */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full hover:shadow-md transition-shadow duration-300 text-sm font-medium text-gray-600 border border-gray-200">
                            Trang 1 / 15
                        </div>
                    </div>

                    {/* Metadata Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card title="Thông tin chi tiết">
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-black/45 flex items-center gap-2"><Tag size={14} /> Mã tài liệu</span>
                                    <span className="text-sm font-mono font-medium text-black/85">{selectedDoc.code}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-black/45 flex items-center gap-2"><CheckCircle size={14} /> Phiên bản</span>
                                    <span className="text-sm font-medium text-black/85">v{selectedDoc.version}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-black/45 flex items-center gap-2"><File size={14} /> Định dạng</span>
                                    <span className="text-sm font-medium text-black/85">{selectedDoc.type}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-black/45 flex items-center gap-2"><Download size={14} /> Dung lượng</span>
                                    <span className="text-sm font-medium text-black/85">{selectedDoc.size}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-black/45 flex items-center gap-2"><User size={14} /> Người đăng</span>
                                    <span className="text-sm font-medium text-black/85">{selectedDoc.uploadedBy}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-black/45 flex items-center gap-2"><Clock size={14} /> Ngày đăng</span>
                                    <span className="text-sm font-medium text-black/85">{selectedDoc.uploadDate}</span>
                                </div>
                            </div>
                        </Card>


                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col animate-in fade-in duration-300">


            {mainTab === 'REPOSITORY' && (
                <>
                    {viewMode === 'LIST' && renderList()}
                    {viewMode === 'ADD' && renderAdd()}
                    {viewMode === 'EDIT' && renderEdit()}
                    {viewMode === 'DETAIL' && renderDetail()}
                </>
            )}

            {mainTab === 'REQUESTS' && (
                <DocumentUploadRequestTab departmentName="Phòng ban" />
            )}
        </div>
    );
};
