import React, { useState, useCallback } from 'react'
import { API_CONFIG } from '../config'
import Modal from './Modal'

const ManualUpload = ({ onSummaryReceived }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [requirements, setRequirements] = useState('')

  const handleFile = useCallback(async (file) => {
    if (!file) return

    setFileName(file.name)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsLoading(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/manual`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла')
      }

      const { taskId } = await response.json()
      checkProcessingStatus(taskId)
    } catch (error) {
      console.error(error)
      setIsSuccess(false)
      setModalMessage(error.message)
      setModalVisible(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
    e.target.value = null
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
    handleFile(file)
  }

  const checkProcessingStatus = async (taskId) => {
    try {
      while (true) {
        const statusResponse = await fetch(`${API_CONFIG.BASE_URL}/status/${taskId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'completed') {
          setIsSuccess(true)
          setSummary(statusData.summary?.summary || [])
          setRequirements(statusData.summary?.requirements || [])
          setModalMessage('Файл успешно загружен и обработан')
          onSummaryReceived(statusData.summary)
          setSummary(statusData.summary || { requirements: [], summary: [] })
          break
        } else if (statusData.status === 'failed') {
          throw new Error('Ошибка обработки файла')
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } catch (error) {
      setIsSuccess(false)
      setModalMessage(error.message)
    } finally {
      setModalVisible(true)
    }
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  return (
    <div className="upload">
      <h2>Загрузите методичку</h2>

      <div
        className={`file-upload ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
          <span className="file-label">📂 Нажмите или перетащите файл</span>
          <br />
          {fileName && <span className="file-name">{fileName}</span>}
        </label>

        <input
          id="file-input"
          type="file"
          accept=".doc,.docx,.pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
        />
      </div>

      {isLoading && <p>⏳ Идет обработка файла...</p>}

      {summary && (
        <div className="summary">
          <h3>📜 Суммаризация:</h3>
          <h4>Требования:</h4>
          <div className="summary-requirements">
            {summary.requirements &&
              summary.requirements.map((req, index) => (
                <p key={index} className="requirement-item">
                  {req}
                </p>
              ))}
          </div>
          <h4>Краткая сводка:</h4>
          <div className="summary-points">
            {summary.summary &&
              summary.summary.map((point, index) => (
                <p key={index} className="summary-item">
                  {point}
                </p>
              ))}
          </div>
        </div>
      )}

      <Modal
        visible={modalVisible}
        message={modalMessage}
        success={isSuccess}
        onClose={closeModal}
      />
    </div>
  )
}

export default ManualUpload
