import React from 'react';

interface PreviewProps {
  content: string;
  mode?: 'preview' | 'code';
}

export const Preview: React.FC<PreviewProps> = ({ content, mode = 'preview' }) => {
  const getSrcDoc = () => {
    if (!content) return '';
    return content;
  };

  if (mode === 'code') {
    return (
        <div className="w-full h-full bg-[#1e1e1e] p-6 pt-16 overflow-auto text-left" dir="ltr">
            {content ? (
                <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-all">
                    <code>{content}</code>
                </pre>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    <p>אין קוד להצגה כרגע</p>
                </div>
            )}
        </div>
    );
  }

  // Preview Mode
  return (
    <div className="w-full h-full bg-white flex flex-col pt-14"> 
    {/* Added padding top (pt-14) to account for the floating header in Dashboard */}
      <div className="flex-1 relative bg-white">
        {content ? (
          <iframe
            title="Preview"
            srcDoc={getSrcDoc()}
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 flex-col gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-3xl opacity-50">✨</span>
            </div>
            <p className="font-medium text-lg text-gray-400">התצוגה המקדימה תופיע כאן</p>
          </div>
        )}
      </div>
    </div>
  );
};