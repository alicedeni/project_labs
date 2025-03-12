import React, { useState } from 'react'
import { FaTrashAlt, FaPlus } from 'react-icons/fa'
import { API_CONFIG } from '../config'
import Modal from './Modal'

const CriteriaTable = () => {
  const [criteriaList, setCriteriaList] = useState([{ criteria: '', score: 0 }])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalSuccess, setModalSuccess] = useState(false)

  const handleAddRow = () => {
    setCriteriaList([...criteriaList, { criteria: '', score: 0 }])
  }

  const handleChange = (index, field, value) => {
    const newCriteriaList = [...criteriaList]
    newCriteriaList[index][field] = value
    setCriteriaList(newCriteriaList)
  }

  const handleRemoveRow = (index) => {
    const newCriteriaList = criteriaList.filter((_, i) => i !== index)
    setCriteriaList(newCriteriaList)
  }

  const handleSubmit = async () => {
    const criteriaData = {
      criteria: criteriaList.map((item) => item.criteria),
      score: criteriaList.map((item) => Number(item.score) || 0),
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/criteria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteriaData),
      })

      if (response.ok) {
        setModalSuccess(true)
        setModalMessage('Критерии успешно отправлены!')
      } else {
        throw new Error('Ошибка при отправке критериев.')
      }
    } catch (error) {
      setModalSuccess(false)
      setModalMessage(error.message)
    } finally {
      setModalVisible(true)
    }
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  return (
    <div>
      <h2>Критерии оценивания</h2>
      <table>
        <thead>
          <tr>
            <th>Критерий</th>
            <th>Баллы</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {criteriaList.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={item.criteria}
                  onChange={(e) => handleChange(index, 'criteria', e.target.value)}
                  placeholder="Введите критерий"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.score}
                  onChange={(e) => handleChange(index, 'score', e.target.value)}
                  placeholder="Баллы"
                  min="0"
                />
              </td>
              <td>
                <button onClick={() => handleRemoveRow(index)}>
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>
        <FaPlus /> Добавить критерий
      </button>
      <button onClick={handleSubmit}>Сохранить критерии</button>

      <Modal
        visible={modalVisible}
        message={modalMessage}
        success={modalSuccess}
        onClose={closeModal}
      />
    </div>
  )
}

export default CriteriaTable
