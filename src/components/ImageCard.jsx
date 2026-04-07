const styles = {
  card: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#1C1C21',
    border: '1px solid #2E2E36',
    aspectRatio: '1/1',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    padding: '12px',
    opacity: 0,
    transition: 'opacity 0.2s',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  downloadBtn: {
    background: '#E8820C',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}

export default function ImageCard({ url, index }) {
  const handleDownload = (e) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = url
    link.download = `generated-image-${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.querySelector('.image-overlay').style.opacity = 1
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.querySelector('.image-overlay').style.opacity = 0
      }}
      onClick={() => window.open(url, '_blank')}
    >
      <img src={url} alt={`Generated ${index}`} style={styles.image} />
      <div className="image-overlay" style={styles.overlay}>
        <button style={styles.downloadBtn} onClick={handleDownload}>
          Download
        </button>
      </div>
    </div>
  )
}
