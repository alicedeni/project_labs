import React, { useState } from 'react'
import CriteriaTable from './components/CriteriaTable'
import ManualUpload from './components/ManualUpload'
import ReportUpload from './components/ReportUpload'
import ResultTable from './components/ResultTable'

function App() {
  const [results, setResults] = useState([])
  const [summaryData, setSummaryData] = useState(null)
  const [criteriaData, setCriteriaData] = useState(null)
  const [author, setAuthor] = useState('Неизвестный автор')

  const handleResultsReceived = (newResults, author) => {
    setResults(newResults)
    setAuthor(author)
  }

  const handleSummaryReceived = (data) => {
    setSummaryData(data)
  }

  const handleCriteriaSubmitted = (data) => {
    setCriteriaData(data)
  }

  return (
    <div className="main">
      <h1>Проверка лабораторных работ</h1>

      {/* Передача данных из ManualUpload */}
      <ManualUpload onSummaryReceived={handleSummaryReceived} />

      {/* Передача данных из CriteriaTable */}
      <CriteriaTable onCriteriaSubmitted={handleCriteriaSubmitted} />

      {/* Передача данных в ReportUpload */}
      <ReportUpload
        onResultsReceived={handleResultsReceived}
        summaryData={summaryData}
        criteriaData={criteriaData}
      />

      <ResultTable results={results} author={author} />
    </div>
  )
}

export default App
