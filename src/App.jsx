import React, { useState } from 'react'
import CriteriaTable from './components/CriteriaTable'
import ManualUpload from './components/ManualUpload'
import ReportUpload from './components/ReportUpload'
import ResultTable from './components/ResultTable'

function App() {
  const [results, setResults] = useState([])

  const handleResultsReceived = (newResults) => {
    setResults(newResults)
  }

  return (
    <div className="main">
      <h1>Проверка лабораторных работ</h1>
      <ManualUpload />
      <CriteriaTable />
      <ReportUpload onResultsReceived={handleResultsReceived} />
      <ResultTable results={results} />
    </div>
  )
}

export default App
