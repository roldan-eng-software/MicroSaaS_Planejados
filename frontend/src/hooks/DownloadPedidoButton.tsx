import { useDownloadPedidoPdf } from '../../hooks/useDocumentos';

interface Props {
  pedidoId: string;
  numeroPedido: string;
  className?: string;
}

export function DownloadPedidoButton({ pedidoId, numeroPedido, className }: Props) {
  const { mutate: downloadPdf, isPending } = useDownloadPedidoPdf();

  return (
    <button
      onClick={() => downloadPdf({ id: pedidoId, numero: numeroPedido })}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors ${className}`}
      title="Baixar PDF"
    >
      {isPending ? (
        <span>Gerando PDF...</span>
      ) : (
        <span>📄 Baixar PDF</span>
      )}
    </button>
  );
}