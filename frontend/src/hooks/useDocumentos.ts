import { useMutation } from '@tanstack/react-query';
import { documentoService } from '../services/documento.service';

export function useDownloadPedidoPdf() {
  return useMutation({
    mutationFn: ({ id, numero }: { id: string; numero: string }) => 
      documentoService.downloadPedidoPdf(id, numero),
    onError: (error) => {
      console.error('Erro ao baixar PDF:', error);
      // Aqui você poderia adicionar um toast de erro
      alert('Erro ao gerar o PDF. Tente novamente.');
    },
  });
}

export function useEnviarEmailPedido() {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => 
      documentoService.enviarEmailPedido(id, email),
    onError: (error) => {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar o e-mail. Verifique o console.');
    },
    onSuccess: () => {
      alert('Solicitação de envio de e-mail recebida com sucesso!');
    }
  });
}