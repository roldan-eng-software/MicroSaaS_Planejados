import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { compromissoService } from '../services/compromisso.service';
import { CompromissoCreate, CompromissoUpdate } from '../types/compromisso';

export function useCompromissos(filters?: any) {
  return useQuery({
    queryKey: ['compromissos', filters],
    queryFn: () => compromissoService.listar(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCompromissosPorPeriodo(data_inicio: string, data_fim: string) {
  return useQuery({
    queryKey: ['compromissos', 'periodo', data_inicio, data_fim],
    queryFn: () => compromissoService.listarPorPeriodo(data_inicio, data_fim),
    enabled: !!data_inicio && !!data_fim,
  });
}

export function useCompromisso(id: string) {
  return useQuery({
    queryKey: ['compromissos', id],
    queryFn: () => compromissoService.obterPorId(id),
    enabled: !!id,
  });
}

export function useCriarCompromisso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompromissoCreate) => compromissoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compromissos'] });
    },
  });
}

export function useAtualizarCompromisso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompromissoUpdate }) =>
      compromissoService.atualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compromissos'] });
      queryClient.invalidateQueries({ queryKey: ['compromissos', data.id] });
    },
  });
}

export function useDeletarCompromisso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => compromissoService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compromissos'] });
    },
  });
}