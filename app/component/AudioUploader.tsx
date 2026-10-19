'use client';

import { useState, useRef } from 'react';

export default function AudioUploader() {
  const [uploading, setUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ពិនិត្យប្រភេទឯកសារ
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload MP3, WAV, OGG, or AAC file');
      return;
    }

    // ពិនិត្យទំហំ (max 20MB សម្រាប់ Telegram)
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setAudioUrl(data.fileUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (audioUrl) {
      navigator.clipboard.writeText(audioUrl);
      alert('URL copied to clipboard!');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Audio to Telegram</h2>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Choose Audio File'}
      </button>

      {error && (
        <p className="mt-3 text-red-500 text-sm">{error}</p>
      )}

      {audioUrl && (
        <div className="mt-4">
          <p className="text-green-600 font-medium mb-2">✓ Upload successful!</p>
          
          {/* Audio Player */}
          <audio controls className="w-full mb-3">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          {/* URL Display */}
          <div className="bg-gray-100 p-2 rounded break-all text-sm">
            <p className="font-mono text-blue-600">{audioUrl}</p>
          </div>

          <button
            onClick={copyToClipboard}
            className="mt-2 py-1 px-3 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Copy URL
          </button>

          {/* Embed Code */}
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Embed Code:</p>
            <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
              {`<audio controls>\n  <source src="${audioUrl}" type="audio/mpeg">\n</audio>`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}