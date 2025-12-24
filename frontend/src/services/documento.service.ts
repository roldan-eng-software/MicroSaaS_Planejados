import api from './api';

export const documentoService = {
  async downloadPedidoPdf(pedidoId: string, numeroPedido: string): Promise<void> {
    const response = await api.get(`/documentos/pedidos/${pedidoId}/pdf`, {
      responseType: 'blob', // Importante para arquivos binários
    });

    // Cria um link temporário para forçar o download no navegador
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedido_${numeroPedido}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Limpeza
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async enviarEmailPedido(pedidoId: string, email: string): Promise<void> {
    await api.post(`/documentos/pedidos/${pedidoId}/email`, { email });
  },
};