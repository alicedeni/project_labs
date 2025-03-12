import React, { useState } from 'react'
import { API_CONFIG } from '../config'
import Modal from './Modal'

const ReportUpload = ({ onResultsReceived }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/loading-report`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке отчета')
      }

      const resultData = await response.json()
      onResultsReceived(resultData)

      setIsSuccess(true)
      setModalMessage('Отчет успешно загружен и обработан!')
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
      <h2>Загрузите отчет</h2>

      <label className="file-upload">
        <input type="file" accept=".doc,.docx,.pdf" onChange={handleFileChange} />
        <span className="file-label">📂 Нажмите или перетащите файл</span>
        {fileName && <span className="file-name">{fileName}</span>}
      </label>

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
