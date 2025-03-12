import React, { useState } from 'react'
import { API_CONFIG } from '../config'
import { FaEdit, FaSave, FaFileAlt } from 'react-icons/fa'
import Modal from './Modal'

const defaultResults = [
  { criteria: 'Качество кода', score: 8, comment: 'Хороший стиль' },
  { criteria: 'Производительность', score: 7, comment: 'Можно улучшить' },
  { criteria: 'Функциональность', score: 9, comment: 'Все работает' },
]

const ResultTable = ({ results }) => {
  const [editableResults, setEditableResults] = useState(results?.length ? results : defaultResults)
  const [isEditing, setIsEditing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (index, field, value) => {
    const newResults = [...editableResults]
    newResults[index][field] = value
    setEditableResults(newResults)
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/change-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableResults),
      })

      if (!response.ok) throw new Error('Ошибка при сохранении изменений')

      setIsSuccess(true)
      setModalMessage('Результаты сохранены успешно!')
    } catch (error) {
      setIsSuccess(false)
      setModalMessage(error.message)
    } finally {
      setModalVisible(true)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableResults),
      })

      if (!response.ok) throw new Error('Ошибка при генерации отчета')

      setIsSuccess(true)
      setModalMessage('Отчет успешно сгенерирован!')
    } catch (error) {
      setIsSuccess(false)
      setModalMessage(error.message)
    } finally {
      setModalVisible(true)
    }
  }

  const closeModal = () => setModalVisible(false)

  return (
    <div>
      <h2>Результаты проверки</h2>
      <button onClick={toggleEdit}>
        {isEditing ? <FaSave /> : <FaEdit />} {isEditing ? 'Сохранить' : 'Редактировать'}
      </button>
      <button onClick={handleGenerateReport}>
        <FaFileAlt /> Генерировать отчет
      </button>

      <table>
        <thead>
          <tr>
            <th>Критерий</th>
            <th>Баллы</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {editableResults.map((item, index) => (
            <tr key={index}>
              <td>{item.criteria}</td>
              <td>
                {isEditing ? (
                  <input
                    type="number"
                    value={item.score}
                    onChange={(e) => handleChange(index, 'score', e.target.value)}
                    min="0"
                  />
                ) : (
                  item.score
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={item.comment}
                    onChange={(e) => handleChange(index, 'comment', e.target.value)}
                    placeholder="Комментарий"
                  />
                ) : (
                  item.comment
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        visible={modalVisible}
        message={modalMessage}
        success={isSuccess}
        onClose={closeModal}
      />
    </div>
  )
}

export default ResultTable
