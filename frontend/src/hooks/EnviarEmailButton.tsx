import { useEnviarEmailPedido } from '../../hooks/useDocumentos';

interface Props {
  pedidoId: string;
  emailCliente?: string;
  className?: string;
}

export function EnviarEmailButton({ pedidoId, emailCliente, className }: Props) {
  const { mutate: enviarEmail, isPending } = useEnviarEmailPedido();

  const handleClick = () => {
    const emailDestino = window.prompt(
      "Para qual e-mail deseja enviar o documento?", 
      emailCliente || ""
    );

    if (emailDestino) {
      enviarEmail({ id: pedidoId, email: emailDestino });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors ${className}`}
      title="Enviar por E-mail"
    >
      {isPending ? (
        <span>Enviando...</span>
      ) : (
        <span>✉️ Enviar por Email</span>
      )}
    </button>
  );
}