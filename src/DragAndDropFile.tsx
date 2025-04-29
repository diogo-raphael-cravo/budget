import React, { useCallback, useState } from 'react';

export default function DragAndDropFile({
  onDroppedFile
}: { onDroppedFile: (contents: string) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if ('string' === typeof e?.target?.result) {
              onDroppedFile(e.target.result);
            }
        };
        reader.readAsText(files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        border: '2px dashed #ccc',
        padding: '40px',
        textAlign: 'center',
        background: dragging ? '#f0f8ff' : '#fafafa',
        color: '#555',
        borderRadius: '10px',
        width: '300px',
        margin: '50px auto',
        transition: 'background 0.2s',
      }}
    >
      {fileName ? (
        <p>Dropped: <strong>{fileName}</strong></p>
      ) : (
        <p>Arraste arquivo de metas aqui</p>
      )}
    </div>
  );
}
