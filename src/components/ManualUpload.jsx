import React, { useState } from 'react'
import { API_CONFIG } from '../config'
import Modal from './Modal'

const ManualUpload = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
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
      setIsSuccess(false)
      setModalMessage(error.message)
      setModalVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  const checkProcessingStatus = async (taskId) => {
    try {
      while (true) {
        const statusResponse = await fetch(`${API_CONFIG.BASE_URL}/status/${taskId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'completed') {
          setIsSuccess(true)
          setModalMessage('Файл успешно загружен и обработан')
          setSummary(statusData.summary || 'Суммаризация недоступна')
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

      <label className="file-upload">
        <input
          type="file"
          accept=".doc,.docx,.pdf"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <span className="file-label">📂 Нажмите или перетащите файл</span>
        {fileName && <span className="file-name">{fileName}</span>}
      </label>

      {isLoading && <p>⏳ Идет обработка файла...</p>}

      {summary && (
        <div className="summary">
          <h3>📜 Суммаризация:</h3>
          <pre>{summary}</pre>
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
