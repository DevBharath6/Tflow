import { useEffect, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  function show(message, variant = 'danger') {
    setToast({ id: Date.now(), message, variant })
    setTimeout(() => setToast(null), 3000)
  }
  return { toast, show }
}

export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
      <div className={`toast show text-bg-${toast.variant}`}>
        <div className="toast-body">{toast.message}</div>
      </div>
    </div>
  )
}


