
import React from 'react';
import DatasetExplorer from '@/components/DatasetExplorer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-lg font-semibold text-blue-800">Uncountable Dataset Visualization</h1>
      </header>
      <div className="flex-grow bg-gradient-to-b from-[#f8faff] to-[#edf2ff]">
        <DatasetExplorer />
      </div>
    </div>
  );
};

export default Index;
