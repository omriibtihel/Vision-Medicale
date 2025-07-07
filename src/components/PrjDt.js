import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './ProjectDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faBars, 
  faUpload, 
  faRedoAlt, 
  faTrash,
  faFileImport,
  faDatabase,
  faCalendarAlt,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const [filePreview, setFilePreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

useEffect(() => {
  const savedFileInfo = localStorage.getItem(`importedFileInfo_${id}`);
  if (savedFileInfo) {
    try {
      const fileInfo = JSON.parse(savedFileInfo);
      setFileName(fileInfo.name);
      setFileDetails({
        type: fileInfo.type,
        size: fileInfo.size,
        importDate: fileInfo.importDate
      });
      setFilePreview(fileInfo.preview || []);
    } catch (error) {
      console.error("Error parsing saved file info:", error);
    }
  }
}, [id]);

  const handleBackClick = () => navigate('/profile');

  const handleImportClick = () => fileInputRef.current?.click();

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const getFormattedTimestamp = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const generateStandardFileName = (originalName) => {
    const extension = originalName.split('.').pop();
    return `MedicalVision_${name.replace(/\s+/g, '_')}_${new Date().getTime()}.${extension}`;
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const importDate = getFormattedTimestamp();
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
  const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');

  const standardFileName = generateStandardFileName(file.name);
  const fileType = isCSV ? 'CSV' : isExcel ? 'Excel' : file.type || 'Unknown';
  const fileSize = formatFileSize(file.size);

  reader.onload = async (event) => {
    let previewData = [];
    try {
      if (isCSV) {
        Papa.parse(event.target.result, {
          header: true,
          complete: ({ data }) => {
            previewData = data.slice(0, 15);
            saveDatabase(file, standardFileName, importDate);
            setFilePreview(previewData);
            
            // Stocker toutes les informations dans le localStorage
            const fileInfo = {
              name: standardFileName,
              type: fileType,
              size: fileSize,
              importDate,
              preview: previewData
            };
            localStorage.setItem(`importedFileInfo_${id}`, JSON.stringify(fileInfo));
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            alert("Erreur lors de la lecture du fichier CSV");
          }
        });
      } else if (isExcel) {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        previewData = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 15);
        saveDatabase(file, standardFileName, importDate);
        setFilePreview(previewData);
        
        // Stocker toutes les informations dans le localStorage
        const fileInfo = {
          name: standardFileName,
          type: fileType,
          size: fileSize,
          importDate,
          preview: previewData
        };
        localStorage.setItem(`importedFileInfo_${id}`, JSON.stringify(fileInfo));
      }

      setFileName(standardFileName);
      setFileDetails({
        type: fileType,
        size: fileSize,
        importDate
      });
    } catch (error) {
      console.error("File processing error:", error);
      alert("Une erreur est survenue lors du traitement du fichier");
    }
  };

  if (isCSV) reader.readAsText(file);
  else if (isExcel) reader.readAsBinaryString(file);
  else alert("Seuls les fichiers CSV (.csv) ou Excel (.xls, .xlsx) sont acceptés");
};

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]);
  };

  const saveDatabase = async (file, fileName, date) => {
    const formData = new FormData();
    formData.append('database', file);
    const token = localStorage.getItem('token');

    try {
      await axios.post(`http://localhost:5000/import-database/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          if (percent === 100) setTimeout(() => setUploadProgress(0), 2000);
        }
      });
    } catch (err) {
      console.error("Erreur lors de l'import :", err);
      alert("Erreur lors de l'import du fichier");
    }
  };

  const handleGoToMenuClick = () => navigate(`/importSucc/${id}`);

const resetImport = () => {
  if (window.confirm('Êtes-vous sûr de vouloir réinitialiser ce projet ?')) {
    setFileName('');
    setFileDetails(null);
    setFilePreview([]);
    localStorage.removeItem(`importedFileInfo_${id}`);
  }
};

  return (
    <div className="project-detail-modern">
      <header className="header-modern">
        <button className="back-button-modern" onClick={handleBackClick}>
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Retour</span>
        </button>
        <div className="app-name-modern">
          <img src="/lg.png" alt="MedicalVision" className="app-icon-modern" />
          <span>MedicalVision</span>
        </div>
      </header>

      <main className="project-content-modern">
        <div className="project-header-modern">
          <div className="project-hero-modern">
            <div className="project-image-container-modern">
              <img 
                src="/image/Data analysis-amico.svg"
                alt="Project Illustration" 
                className="project-image-modern" 
              />
            </div>
            <div className="project-info-modern">
              <h1 className="project-title-modern">{decodeURIComponent(name)}</h1>
              <p className="project-description-modern">Gestion des données médicales et analyses IA</p>
              
              {fileName && fileDetails ? (
                <div className="file-details-modern">
                  <div className="detail-item-modern">
                    <FontAwesomeIcon icon={faFileImport} className="detail-icon-modern" />
                    <div>
                      <span className="detail-label-modern">Fichier importé</span>
                      <span className="detail-value-modern">{fileName}</span>
                    </div>
                  </div>
                  <div className="detail-item-modern">
                    <FontAwesomeIcon icon={faDatabase} className="detail-icon-modern" />
                    <div>
                      <span className="detail-label-modern">Type</span>
                      <span className="detail-value-modern">{fileDetails.type}</span>
                    </div>
                  </div>
                  <div className="detail-item-modern">
                    <FontAwesomeIcon icon={faWeightHanging} className="detail-icon-modern" />
                    <div>
                      <span className="detail-label-modern">Taille</span>
                      <span className="detail-value-modern">{fileDetails.size}</span>
                    </div>
                  </div>
                  <div className="detail-item-modern">
                    <FontAwesomeIcon icon={faCalendarAlt} className="detail-icon-modern" />
                    <div>
                      <span className="detail-label-modern">Date d'import</span>
                      <span className="detail-value-modern">{fileDetails.importDate}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state-modern">
                  <p className="empty-message-modern">Aucun fichier n'a été importé pour ce projet</p>
                </div>
              )}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-container-modern">
              <div className="progress-bar-modern">
                <div 
                  className="progress-fill-modern" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text-modern">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="project-actions-modern">
          {fileName ? (
            <>
              <button 
                className="action-button-modern primary"
                onClick={handleGoToMenuClick}
              >
                <FontAwesomeIcon icon={faBars} />
                <span>Menu d'analyse</span>
              </button>

              <button 
                className="action-button-modern danger"
                onClick={resetImport}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Réinitialiser</span>
              </button>
            </>
          ) : (
            <div 
              className={`dropzone-modern ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleImportClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, .xls, .xlsx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="dropzone-content-modern">
                <FontAwesomeIcon icon={faUpload} className="upload-icon-modern" />
                <h3 className="dropzone-title-modern">Importer vos données médicales</h3>
                <p className="dropzone-text-modern">
                  Glissez-déposez un fichier CSV ou Excel ici, ou cliquez pour sélectionner
                </p>
                <div className="supported-formats-modern">
                  <span className="format-badge-modern">.CSV</span>
                  <span className="format-badge-modern">.XLS</span>
                  <span className="format-badge-modern">.XLSX</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {filePreview.length > 0 && (
          <div className="file-preview-modern">
            <div className="preview-header-modern">
              <h3 className="preview-title-modern">Aperçu des données</h3>
              <span className="preview-subtitle-modern">
                Affichage des 15 premières lignes
              </span>
            </div>
            <div className="table-container-modern">
              <table className="preview-table-modern">
                <thead>
                  <tr>
                    {Object.keys(filePreview[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filePreview.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((cell, i) => (
                        <td key={i}>{cell || <span className="empty-cell-modern">-</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;