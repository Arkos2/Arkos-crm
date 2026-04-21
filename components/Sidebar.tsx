'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  active?: string
}

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { key: 'leads', label: 'Leads', href: '/leads', icon: '👥' },
  { key: 'pipeline', label: 'Pipeline', href: '/pipeline', icon: '🔄' },
]

export default function Sidebar({ active }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-arkos-card border-r border-arkos-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-7 border-b border-arkos-border/50">
        <Link href="/dashboard" className="flex flex-col items-start">
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">
            ARKOS<span className="text-arkos-gold">.</span>
          </h1>
          <p className="text-[10px] text-arkos-gold/80 tracking-[0.2em] font-medium ml-1">
            OS
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = active === item.key || pathname === item.href

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth ${
                    isActive
                      ? 'bg-arkos-accent/10 text-arkos-gold border border-arkos-gold/30 glow-gold'
                      : 'text-arkos-muted hover:text-arkos-text hover:bg-arkos-bg/50 border border-transparent hover:border-arkos-border'
                  }`}
                >
                  <span className={`text-lg ${isActive ? 'text-arkos-gold' : 'text-arkos-muted'}`}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-arkos-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-arkos-accent flex items-center justify-center border border-arkos-gold/30">
            <span className="text-xs text-arkos-gold font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-arkos-text truncate">Usuário</p>
            <p className="text-[10px] text-arkos-muted">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
