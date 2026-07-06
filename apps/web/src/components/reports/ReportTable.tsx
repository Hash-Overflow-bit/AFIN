import React from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  format?: (value: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: ColumnDef[];
  data: any[];
  isLoading?: boolean;
}

export function ReportTable({ columns, data, isLoading }: ReportTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-sm w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6a5fc1]"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-sm w-full h-[400px] flex flex-col items-center justify-center">
        <p className="text-[#79628c] text-sm">No data available for this report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              {columns.map((col, idx) => (
                <th 
                  key={col.key}
                  className={`py-4 px-6 text-xs font-semibold text-[#79628c] uppercase tracking-wider whitespace-nowrap ${idx === 0 ? 'pl-8' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, colIdx) => {
                  const val = row[col.key];
                  const displayVal = col.format ? col.format(val) : val;
                  return (
                    <td 
                      key={col.key} 
                      className={`py-4 px-6 text-sm text-[#1f1633] whitespace-nowrap ${colIdx === 0 ? 'pl-8 font-medium' : ''}`}
                    >
                      {displayVal !== null && displayVal !== undefined ? displayVal : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
