import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import  '../style/CSVFileUploader.css'

type FileType = 'input' | 'output';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const CsvFileUploader = () => {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [dragOverType, setDragOverType] = useState<FileType | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('Upload input and output CSV files');
  const [apiUrl] = useState('http://localhost:5000'); // Update with your API URL
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement> | File, type: FileType) => {
    let file: File | null = null;
    
    if (e instanceof File) {
      file = e;
    } else if (e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    }

    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        setUploadStatus('error');
        setMessage('Please upload a valid CSV file');
        return;
      }
      
      if (type === 'input') {
        setInputFile(file);
      } else {
        setOutputFile(file);
      }
      
      setUploadStatus('idle');
      setMessage(`${type === 'input' ? 'Input' : 'Output'} file selected`);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, type: FileType) => {
    e.preventDefault();
    setDragOverType(type);
  };

  const handleDragLeave = () => {
    setDragOverType(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: FileType) => {
    e.preventDefault();
    setDragOverType(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0], type);
    }
  };

  const handleClick = (type: FileType) => {
    type === 'input' 
      ? inputRef.current?.click() 
      : outputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent, type: FileType) => {
    e.stopPropagation();
    if (type === 'input') {
      setInputFile(null);
    } else {
      setOutputFile(null);
    }
    setUploadStatus('idle');
    setMessage('File removed');
    setDownloadUrl(null);
  };

  const handleProcess = async () => {
    if (!inputFile || !outputFile) {
      setUploadStatus('error');
      setMessage('Please select both input and output files');
      return;
    }

    setUploadStatus('uploading');
    setMessage('Uploading files to server...');
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('input', inputFile);
      formData.append('output', outputFile);

      const response = await fetch(`${apiUrl}/api/upload-files`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('success');
        setMessage(result.message || 'Files uploaded and processed successfully!');
        
        const downloadEndpoint = `${apiUrl}/api/download-output`;
        setDownloadUrl(downloadEndpoint);
      } else {
        const error = await response.json();
        setUploadStatus('error');
        setMessage(error.error || 'File upload failed');
      }
    } catch (err) {
      setUploadStatus('error');
      setMessage('Network error. Please check your connection.');
      console.error('Upload error:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const renderDropZone = (type: FileType) => {
    const file = type === 'input' ? inputFile : outputFile;
    const ref = type === 'input' ? inputRef : outputRef;
    const isDragOver = dragOverType === type;
    
    return (
      <div 
        className={`csv-uploader-dropzone 
          ${file ? 'csv-uploader-hasfile' : ''} 
          ${isDragOver ? 'csv-uploader-dragover' : ''}`}
        onClick={() => handleClick(type)}
        onDragOver={(e) => handleDragOver(e, type)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, type)}
      >
        <input 
          type="file" 
          ref={ref}
          className="csv-uploader-input"
          accept=".csv"
          onChange={(e) => handleFileChange(e, type)}
          hidden
        />
        
        {file ? (
          <div className="csv-uploader-file-info">
            <div className="csv-uploader-file-icon">📄</div>
            <div className="csv-uploader-file-details">
              <div className="csv-uploader-filename">{file.name}</div>
              <div className="csv-uploader-filesize">{formatFileSize(file.size)}</div>
            </div>
            <button 
              className="csv-uploader-remove-btn" 
              onClick={(e) => handleRemove(e, type)}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="csv-uploader-placeholder">
            <div className="csv-uploader-placeholder-text">
              <div className="csv-uploader-main-text">
                {type === 'input' ? 'Input CSV' : 'Output CSV'}
              </div>
              <div className="csv-uploader-sub-text">
                {isDragOver ? 'Drop file here' : 'Click or drag to upload'}
              </div>
              <div className="csv-uploader-limit-text">CSV files only</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="csv-uploader-container">
      <div className="csv-uploader-header">
        <h1 className="csv-uploader-title">CSV Processor</h1>
        <p className="csv-uploader-description">
          Upload input and output CSV files for classification
        </p>
      </div>

      <div className={`csv-uploader-status csv-uploader-status-${uploadStatus}`}>
        {uploadStatus === 'uploading' && (
          <div className="csv-uploader-loading">
            <div className="csv-uploader-spinner"></div>
          </div>
        )}
        <div className="csv-uploader-status-text">{message}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Input CSV</h3>
        {renderDropZone('input')}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Output CSV</h3>
        {renderDropZone('output')}
      </div>

      <div className="csv-uploader-actions">
        <button
          className={`csv-uploader-btn csv-uploader-btn-primary ${
            !inputFile || !outputFile || uploadStatus === 'uploading' 
              ? 'csv-uploader-btn-disabled' : ''
          }`}
          onClick={handleProcess}
          disabled={!inputFile || !outputFile || uploadStatus === 'uploading'}
        >
          {uploadStatus === 'uploading' ? (
            <div className="csv-uploader-loading">
              <div className="csv-uploader-spinner"></div>
              Processing...
            </div>
          ) : 'Process Files'}
        </button>
        
        {downloadUrl && (
          <a
            href={downloadUrl}
            download="output.csv"
            className="csv-uploader-btn csv-uploader-btn-secondary"
          >
            Download Output
          </a>
        )}
      </div>

      <div className="csv-uploader-api-info">
        <div className="csv-uploader-api-title">API Information</div>
        <div className="csv-uploader-api-endpoint">POST {apiUrl}/api/upload-files</div>
        <div className="csv-uploader-api-note">
          Files will be processed by the backend and stored temporarily
        </div>
      </div>
    </div>
  );
};

export default CsvFileUploader;