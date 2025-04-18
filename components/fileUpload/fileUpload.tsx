import React from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from 'remixicon-react/DeleteBinLineIcon';
import cls from './fileUpload.module.scss';

interface Props {
  files?: File[];
  setFiles: (files: File[]) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({ files = [], setFiles, accept = '*', label }: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDelete = (index: number) => {
    const updatedFiles = files.filter((_, idx) => idx !== index);
    setFiles(updatedFiles);
  };

  const getFileName = (file: File) => {
    if (file.name.length > 15) {
      return file.name.substring(0, 15) + '...';
    }
    return file.name;
  };

  return (
    <div className={cls.wrapper}>
      {label && <div className={cls.label}>{label}</div>}
      <input
        type="file"
        onChange={handleChange}
        accept={accept}
        id="file-upload"
        className={cls.input}
        multiple
      />
      <label htmlFor="file-upload" className={cls.uploadButton}>
        Choose files
      </label>
      <div className={cls.fileList}>
        {files?.map((file, idx) => {
          const fileName = getFileName(file);
          const fileUrl = file instanceof File ? URL.createObjectURL(file) : '';
          
          return (
            <div key={file.name + idx} className={cls.fileItem}>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Clean up object URL after use
                    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                  }}  
                >
                  {fileName}
                </a>
              )}
              <IconButton onClick={() => handleDelete(idx)}>
                <DeleteIcon />
              </IconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
