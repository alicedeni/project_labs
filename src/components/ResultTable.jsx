import React, { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  TextRun,
  HeadingLevel,
} from 'docx'
import { API_CONFIG } from '../config'
import { FaEdit, FaSave, FaFileAlt } from 'react-icons/fa'
import Modal from './Modal'

const defaultResults = [
  { criteria: 'Качество кода', score: 8, comment: 'Хороший стиль' },
  { criteria: 'Производительность', score: 7, comment: 'Можно улучшить' },
  { criteria: 'Функциональность', score: 9, comment: 'Все работает' },
]

const ResultTable = ({ results, author }) => {
  const [editableResults, setEditableResults] = useState(results?.length ? results : defaultResults)
  const [isEditing, setIsEditing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  useEffect(() => {
    setEditableResults(results)
  }, [results])

  const handleChange = (index, field, value) => {
    const newResults = [...editableResults]
    newResults[index][field] = field === 'score' ? Number(value) || 0 : value
    setEditableResults(newResults)
  }

  const generateWordReport = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Критерий',
                heading: HeadingLevel.HEADING_3,
                alignment: 'center',
                shading: { fill: '#a3c4f3' },
                run: {
                  font: 'Arial',
                  size: 14,
                  bold: true,
                  color: '000000',
                },
              }),
            ],
            width: { size: 3000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: 'Баллы',
                heading: HeadingLevel.HEADING_3,
                alignment: 'center',
                shading: { fill: '#a3c4f3' },
                run: {
                  font: 'Arial',
                  size: 14,
                  bold: true,
                  color: '000000',
                },
              }),
            ],
            width: { size: 1500, type: WidthType.DXA },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: 'Комментарий',
                heading: HeadingLevel.HEADING_3,
                alignment: 'center',
                shading: { fill: '#a3c4f3' },
                run: {
                  font: 'Arial',
                  size: 14,
                  bold: true,
                  color: '000000',
                },
              }),
            ],
            width: { size: 4000, type: WidthType.DXA },
          }),
        ],
      }),
      ...editableResults.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    text: item.criteria,
                    alignment: 'left',
                    spacing: { before: 100, after: 100 },
                    run: {
                      font: 'Arial',
                      size: 12,
                      color: '000000',
                    },
                  }),
                ],
                shading: { fill: '#f8f9fa' },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: String(item.score),
                    alignment: 'center',
                    spacing: { before: 100, after: 100 },
                    run: {
                      font: 'Arial',
                      size: 12,
                      color: '000000',
                    },
                  }),
                ],
                shading: { fill: '#f8f9fa' },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: item.comment,
                    alignment: 'left',
                    spacing: { before: 100, after: 100 },
                    run: {
                      font: 'Arial',
                      size: 12,
                      color: '000000',
                    },
                  }),
                ],
                shading: { fill: '#f8f9fa' },
              }),
            ],
          }),
      ),
    ]

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Заголовок
            new Paragraph({
              text: 'Отчёт по проверке',
              heading: HeadingLevel.HEADING_1,
              alignment: 'center',
              spacing: { before: 300, after: 100 },
              run: {
                font: 'Arial',
                size: 24,
                bold: true,
                color: '000000',
              },
            }),

            // Дата
            new Paragraph({
              text: `Дата: ${new Date().toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}`,
              alignment: 'right',
              spacing: { before: 100, after: 100 },
              run: {
                font: 'Arial',
                size: 14,
                color: '666666',
              },
            }),

            // Таблица
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: 'single', size: 2, color: '000000' },
                bottom: { style: 'single', size: 2, color: '000000' },
                left: { style: 'single', size: 1, color: 'cccccc' },
                right: { style: 'single', size: 1, color: 'cccccc' },
                insideH: { style: 'single', size: 1, color: 'cccccc' },
                insideV: { style: 'single', size: 1, color: 'cccccc' },
              },
            }),

            // Итоговый балл
            new Paragraph({
              text: `Итоговый балл: ${editableResults.reduce((sum, item) => sum + item.score, 0)}`,
              alignment: 'right',
              spacing: { before: 200, after: 200 },
              run: {
                font: 'Arial',
                size: 16,
                bold: true,
                color: '000000',
              },
            }),
          ],
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${author}_report.docx`)

    const safeFileName = encodeURIComponent(`${author}_report.docx`)

    const formData = new FormData()
    formData.append('file', blob, safeFileName)
    formData.append('data', JSON.stringify(editableResults))

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/send-report`, {
        method: 'POST',
        body: formData,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.reason || 'Неизвестная ошибка сервера')
      }

      setIsSuccess(true)
      setModalMessage('Отчет успешно сгенерирован и отправлен!')
    } catch (error) {
      setIsSuccess(false)
      setModalMessage(error.message)
    } finally {
      setModalVisible(true)
    }
  }

  return (
    <div>
      <h2>Результаты проверки</h2>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? <FaSave /> : <FaEdit />} {isEditing ? 'Сохранить' : 'Редактировать'}
      </button>
      <button onClick={generateWordReport}>
        <FaFileAlt /> Генерировать отчет (Word)
      </button>

      <table>
        <thead>
          <tr style={{ backgroundColor: '#E3F2FD' }}>
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
        onClose={() => setModalVisible(false)}
      />
    </div>
  )
}

export default ResultTable
