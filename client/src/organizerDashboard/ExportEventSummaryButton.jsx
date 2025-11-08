import './ExportEventSummaryButton.css'

function ExportEventSummaryButton() {
  const handleExport = () => {
    console.log('Exporting event summary...')
    // Add your export logic here
  }

  return (
    <div className="export-button-container">
      <button className="export-button" onClick={handleExport}>
        <span className="export-icon">📥</span>
        Export Event Summary (PDF)
      </button>
    </div>
  )
}

export default ExportEventSummaryButton

