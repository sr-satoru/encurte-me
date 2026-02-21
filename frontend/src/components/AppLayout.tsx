import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

interface AppLayoutProps {
    children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-content">
                {children}
            </div>
        </div>
    )
}
