const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'pages');

const filesToUpdate = [
  'TechOps.tsx',
  'OpsFlight.tsx',
  'OpsATCL.tsx',
  'OpsService.tsx',
  'OpsTTBSV.tsx',
  'OpsHR.tsx',
  'OpsDigital.tsx',
  'OpsComm.tsx',
  'OpsPlanning.tsx'
];

filesToUpdate.forEach(fileName => {
  const filePath = path.join(PAGES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // LƯU Ý: Mỗi ban có cấu trúc record.id, record.year, record.creator, record.editor, record.editTime, record.status
  // Để đồng nhất giao diện và dọn sạch các cột nghiệp vụ thừa:
  // Ta sẽ viết lại chính xác phần <table> của list view chính trong từng file.
  // Hãy bóc tách thẻ <table>...</table> bằng Regex
  const tableRegex = /<table className="w-full text-left border-collapse">([\s\S]*?)<\/table>/;
  
  if (!tableRegex.test(content)) {
    // Thử regex khác (nếu không có class name chính xác)
    console.log(`Table tag not matched with default class in ${fileName}`);
    return;
  }

  // Để an toàn, mỗi ban có cấu trúc button action và state khác nhau (item hoặc record).
  // Ta sẽ phát hiện xem file sử dụng biến map là "item" hay "record".
  const mapVariable = content.includes('records.map((item') || content.includes('records.map(item') ? 'item' : 'record';

  // Định nghĩa block table mới đồng nhất, chỉ giữ lại các cột: Mã kỳ báo cáo, Năm báo cáo, Người lập, Người chỉnh sửa, Thời gian chỉnh sửa, Thao tác.
  const newTable = `<table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Mã kỳ báo cáo</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Năm báo cáo</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Người lập</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Người chỉnh sửa</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Thời gian chỉnh sửa</th>
                <th className="py-3 px-4 font-semibold text-gray-700 w-40 text-center rounded-tr-lg">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {records.map((${mapVariable}, index) => (
                <tr key={${mapVariable}.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => handleEdit(${mapVariable})}>
                  <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                  <td className="py-3 px-4 text-sm text-vna-blue font-mono font-bold">{${mapVariable}.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{${mapVariable}.year || ${mapVariable}.effectivePeriod?.split('/').pop() || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{${mapVariable}.creator || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{${mapVariable}.editor || '—'}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">{${mapVariable}.editTime || '—'}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center items-center gap-2">
                      <Button variant="outline" className="px-2.5 py-1.5 h-8 text-xs font-semibold whitespace-nowrap" onClick={() => handleEdit(${mapVariable})}>
                        <Edit2 size={14} className="mr-1" /> Chi tiết
                      </Button>
                      <QuickApprovalActions
                        status={${mapVariable}.status}
                        recordId={${mapVariable}.id}
                        onApprove={openApprove}
                        onReject={openReject}
                        onSubmit={submitForApproval}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Chưa ghi nhận kỳ nhập liệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>`;

  content = content.replace(tableRegex, newTable);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated table in ${fileName}`);
});
