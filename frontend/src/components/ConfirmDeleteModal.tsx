import { useState } from 'react'
import './ConfirmDeleteModal.css'

interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }: Props) {
    const [input, setInput] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const isValid = input.trim().toLowerCase() === 'apagar'

    const handleConfirm = async () => {
        if (!isValid) return
        setIsDeleting(true)
        try {
            await onConfirm()
        } finally {
            setIsDeleting(false)
            setInput('')
        }
    }

    const handleClose = () => {
        setInput('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon-danger">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="modal-title">Deletar Conta</h2>
                <p className="modal-description">
                    Esta ação é <strong>irreversível</strong>. Todos os seus links encurtados e dados serão apagados permanentemente.
                </p>

                <div className="modal-input-group">
                    <label className="modal-label">
                        Digite <strong>apagar</strong> para confirmar:
                    </label>
                    <input
                        type="text"
                        className="modal-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="apagar"
                        autoFocus
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={handleClose} disabled={isDeleting}>
                        Cancelar
                    </button>
                    <button
                        className="btn btn-danger-solid"
                        onClick={handleConfirm}
                        disabled={!isValid || isDeleting}
                    >
                        {isDeleting ? 'Apagando...' : 'Deletar Conta'}
                    </button>
                </div>
            </div>
        </div>
    )
}
