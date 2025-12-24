// frontend/src/components/Layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';

// Componentes de navegação podem ser adicionados aqui (Header, Sidebar)

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (futuro) */}
            {/* <aside className="w-64 bg-white shadow-md">
                <nav>...</nav>
            </aside> */}
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (futuro) */}
                {/* <header className="bg-white shadow">
                    ...
                </header> */}
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet /> {/* O conteúdo da rota será renderizado aqui */}
                    </div>
                </main>
            </div>
        </div>
    );
}
