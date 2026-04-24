export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-arkos-surface-2 border border-arkos-border flex items-center justify-center mb-6">
        <span className="text-2xl">👤</span>
      </div>
      <h1 className="text-xl font-bold text-text-primary mb-2">Configurações de Perfil</h1>
      <p className="text-text-muted max-w-md">
        Aba em desenvolvimento. As informações do seu perfil estão pré-configuradas para o acesso inicial.
      </p>
    </div>
  );
}
