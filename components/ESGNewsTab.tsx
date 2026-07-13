import React, { useState } from 'react';
import { Card, Button, Input, Badge, Table } from './UI';
import { Plus, Edit, Trash2, Eye, Upload, FileText, Send, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface ESGNewsTabProps {
  departmentName: string;
}

interface NewsPost {
  id: string;
  title: string;
  date: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
}

const MOCK_POSTS: NewsPost[] = [
  {
    id: 'POST-001',
    title: 'Báo cáo sáng kiến giảm phát thải định kỳ',
    date: '02/06/2026',
    status: 'Pending'
  },
  {
    id: 'POST-002',
    title: 'Tổng kết phong trào phân loại rác thải tại cơ sở',
    date: '15/05/2026',
    status: 'Approved'
  },
  {
    id: 'POST-003',
    title: 'Dự thảo tiêu chuẩn vật tư thân thiện môi trường',
    date: '10/05/2026',
    status: 'Draft'
  }
];

export const ESGNewsTab: React.FC<ESGNewsTabProps> = ({ departmentName }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [posts, setPosts] = useState<NewsPost[]>(MOCK_POSTS);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const renderStatus = (status: NewsPost['status']) => {
    switch (status) {
      case 'Draft': return <Badge variant="secondary">Nháp</Badge>;
      case 'Pending': return <Badge variant="warning">Chờ duyệt</Badge>;
      case 'Approved': return <Badge variant="success">Đã duyệt</Badge>;
      case 'Rejected': return <Badge variant="error">Từ chối</Badge>;
      default: return null;
    }
  };

  const handleSubmit = (action: 'Draft' | 'Pending') => {
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    const newPost: NewsPost = {
      id: `POST-${Date.now()}`,
      title: formTitle,
      date: new Date().toLocaleDateString('vi-VN'),
      status: action
    };
    setPosts([newPost, ...posts]);
    setView('LIST');
    setFormTitle('');
    setFormContent('');
    alert(action === 'Draft' ? 'Đã lưu nháp bài viết!' : 'Đã gửi bài viết chờ lãnh đạo phê duyệt!');
  };

  if (view === 'CREATE') {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <Button variant="ghost" onClick={() => setView('LIST')} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-vna-blue">Đăng tin ESG mới</h2>
            <p className="text-sm text-black/45">Soạn thảo và gửi bài viết của {departmentName} để phê duyệt</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="Nhập tiêu đề tin bài..." 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung chi tiết</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] min-h-[300px]"
                    placeholder="Soạn thảo nội dung chi tiết ở đây..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 border-gray-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-black/85 mb-4 border-b pb-2">Media & Đính kèm</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện (Thumbnail)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-black/45 hover:bg-gray-50 hover:border-vna-blue transition-colors cursor-pointer">
                    <ImageIcon size={32} className="mb-2 text-gray-400" />
                    <span className="text-sm">Click để tải ảnh lên</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG (Tối đa 5MB)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tệp đính kèm (Tùy chọn)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-black/45 hover:bg-gray-50 hover:border-vna-blue transition-colors cursor-pointer">
                    <FileText size={32} className="mb-2 text-gray-400" />
                    <span className="text-sm">Tải lên báo cáo đính kèm</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 justify-center gap-2" onClick={() => handleSubmit('Draft')}>
                <Save size={16} /> Lưu nháp
              </Button>
              <Button variant="primary" className="flex-1 justify-center gap-2 bg-[#005f6e] hover:bg-[#004e5a]" onClick={() => handleSubmit('Pending')}>
                <Send size={16} /> Gửi duyệt
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-black/85">Quản lý Tin bài ESG</h2>
          <p className="text-sm text-black/45">Danh sách các bài viết do {departmentName} thực hiện</p>
        </div>
        <Button className="gap-2" onClick={() => setView('CREATE')}>
          <Plus size={16} /> Đăng bài mới
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-gray-200">
        <Table>
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-12 text-center">STT</th>
              <th className="px-4 py-3">Tiêu đề bài viết</th>
              <th className="px-4 py-3 w-32">Ngày cập nhật</th>
              <th className="px-4 py-3 w-32">Trạng thái</th>
              <th className="px-4 py-3 w-28 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post, idx) => (
              <tr key={post.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-center text-sm text-black/45">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-black/85">{post.title}</td>
                <td className="px-4 py-3 text-sm text-black/45">{post.date}</td>
                <td className="px-4 py-3">{renderStatus(post.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="sm" className="px-2" title="Xem chi tiết"><Eye size={16} className="text-gray-400 hover:text-vna-blue" /></Button>
                    {(post.status === 'Draft' || post.status === 'Rejected') && (
                      <Button variant="ghost" size="sm" className="px-2" title="Sửa bài"><Edit size={16} className="text-gray-400 hover:text-vna-blue" /></Button>
                    )}
                    {(post.status === 'Draft' || post.status === 'Rejected') && (
                      <Button variant="ghost" size="sm" className="px-2" title="Xóa"><Trash2 size={16} className="text-gray-400 hover:text-red-500" /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-black/45">Chưa có bài viết nào.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
