import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './ProjectDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faBars, faUpload, faRedoAlt, faTrash } from '@fortawesome/free-solid-svg-icons';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const [filePreview, setFilePreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const savedName = localStorage.getItem(`importedFileName_${id}`);
    const savedDate = localStorage.getItem(`importedFileDate_${id}`);
    if (savedName && savedDate) {
      setFileName(savedName);
      setFileDetails(prev => ({ ...prev, importDate: savedDate }));
    }
  }, [id]);

  const handleBackClick = () => navigate('/profile');

  const handleImportClick = () => fileInputRef.current && fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const importDate = new Date().toLocaleString();
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');

    reader.onload = async (event) => {
      let previewData = [];
      if (isCSV) {
        Papa.parse(event.target.result, {
          header: true,
          complete: ({ data }) => {
            previewData = data.slice(0, 15);
            saveDatabase(file, file.name, importDate);
            setFilePreview(previewData);
          }
        });
      } else if (isExcel) {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        previewData = sheet.slice(0, 15);
        saveDatabase(file, file.name, importDate);
        setFilePreview(previewData);
      }

      setFileName(file.name);
      setFileDetails({
        type: file.type || 'Unknown',
        size: (file.size / 1024).toFixed(1) + ' KB',
        importDate
      });
      localStorage.setItem(`importedFileName_${id}`, file.name);
      localStorage.setItem(`importedFileDate_${id}`, importDate);
    };

    if (isCSV) reader.readAsText(file);
    else if (isExcel) reader.readAsBinaryString(file);
    else alert("Seuls les fichiers CSV ou Excel sont autorisés.");
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
        }
      });
      console.log('Fichier importé avec succès.');
    } catch (err) {
      console.error("Erreur lors de l'import :", err);
    }
  };

  const handleGoToMenuClick = () => navigate(`/importSucc/${id}`);

  const resetImport = () => {
    setFileName('');
    setFileDetails(null);
    setFilePreview([]);
    localStorage.removeItem(`importedFileName_${id}`);
    localStorage.removeItem(`importedFileDate_${id}`);
  };

  return (
    <div className="project-detail">
      <header className="header">
        <button className="back-button" onClick={handleBackClick}>
          <FontAwesomeIcon icon={faChevronLeft} /> Back
        </button>
        <div className="app-name1">
          <img src="/lg.png" alt="App Icon" className="app-icon" />
          <span>MedicalVision</span>
        </div>
      </header>

      <div className="project-info">
        <img src="/image/undraw_filing-system_e3yo.svg" alt="Project" className="project-image" />
        <div className="project-details">
          <h1>{decodeURIComponent(name)}</h1>
          {fileName && fileDetails ? (
            <>
              <p><strong>Nom du fichier :</strong> {fileName}</p>
              <p><strong>Type :</strong> {fileDetails.type}</p>
              <p><strong>Taille :</strong> {fileDetails.size}</p>
              <p><strong>Date d'import :</strong> {fileDetails.importDate}</p>
            </>
          ) : (
            <p>Aucun fichier importé.</p>
          )}
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div style={{ width: `${uploadProgress}%` }} className="progress" />
        </div>
      )}

      {fileName ? (
        <>
          <button className="import-button" onClick={handleGoToMenuClick}>
            <FontAwesomeIcon icon={faBars} /> Go to Menu
          </button>
          <button className="replace-button" onClick={handleImportClick}>
            <FontAwesomeIcon icon={faRedoAlt} /> Remplacer le fichier
          </button>
          <button className="cancel-button" onClick={resetImport}>
            <FontAwesomeIcon icon={faTrash} /> Réinitialiser
          </button>
        </>
      ) : (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv, .xls, .xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="import-button" onClick={handleImportClick}>
            <FontAwesomeIcon icon={faUpload} /> Importer votre fichier
          </button>
        </>
      )}

      {filePreview.length > 0 && (
        <div className="file-preview">
          <h3>Prévisualisation des premières lignes :</h3>
          <table>
            <tbody>
              {filePreview.map((row, idx) => (
                <tr key={idx}>
                  {(Array.isArray(row) ? row : Object.values(row)).map((cell, i) => (
                    <td key={i}>{cell || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
