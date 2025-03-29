import React, { useState, useEffect } from 'react'
import { Rnd } from 'react-rnd'
import mammoth from 'mammoth'
import { API_CONFIG } from '../config'
import Modal from './Modal'

const ReportUpload = ({ onResultsReceived, summaryData, criteriaData }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [filePreviewHtml, setFilePreviewHtml] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleFileUpload = async (file) => {
    if (!file) return

    if (!isMobile) {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      setFilePreviewHtml(result.value)
    }

    setFileName(file.name)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('summary', JSON.stringify(summaryData))
    formData.append('criteria', JSON.stringify(criteriaData))
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/loading-report`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке отчета')
      }

      const resultData = await response.json()
      const filteredResults =
        resultData.results
          ?.filter((item) => !item.criteria.includes('Итоговый балл'))
          .map((item) => ({
            ...item,
            score: Math.max(item.score, 0),
          })) || []

      onResultsReceived(filteredResults, resultData.author || 'Неизвестный автор')

      setIsSuccess(true)
      setModalMessage('Отчет успешно загружен и обработан!')
    } catch (error) {
      setIsSuccess(false)
      setModalMessage(error.message)
    } finally {
      setModalVisible(true)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleFileUpload(file)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileUpload(file)
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  const PreviewModal = () => (
    <Rnd
      default={{
        x: window.innerWidth / 2 - 200,
        y: 50,
        width: 400,
        height: 600,
      }}
      minWidth={200}
      minHeight={300}
      bounds="window"
      enableResizing={{
        bottomRight: true,
        bottomLeft: true,
        topRight: true,
        topLeft: true,
      }}
      className="preview-modal"
    >
      <div className="modal-content-docx">
        <div className="modal-header">
          <h4>{fileName}</h4>
          <button className="close-button" onClick={() => setPreviewVisible(false)}>
            ×
          </button>
        </div>

        <div className="preview-area" dangerouslySetInnerHTML={{ __html: filePreviewHtml }} />
      </div>
    </Rnd>
  )

  return (
    <div className="upload">
      <h2>Загрузите отчет</h2>

      <div
        className={`file-upload ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label htmlFor="report-file-input" style={{ cursor: 'pointer' }}>
          <span className="file-label">📂 Нажмите или перетащите файл</span>
          <br />
          {fileName && <span className="file-name">{fileName}</span>}
        </label>

        <input
          id="report-file-input"
          type="file"
          accept=".doc,.docx"
          onChange={handleFileChange}
          style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
        />
      </div>

      {fileName && !isMobile && (
        <button className="preview-button" onClick={() => setPreviewVisible(true)}>
          Посмотреть отчет
        </button>
      )}

      {previewVisible && <PreviewModal />}

      <Modal
        visible={modalVisible}
        message={modalMessage}
        success={isSuccess}
        onClose={closeModal}
      />
    </div>
  )
}

export default ReportUpload
