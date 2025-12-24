import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';

interface DataPoint {
    mes: string;
    total: number;
}

interface Props {
    data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded">
                <p className="font-bold text-gray-700">{label}</p>
                <p className="text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}
                </p>
            </div>
        );
    }
    return null;
};

export function GraficoReceita({ data }: Props) {
    return (
        <div className="h-[400px] w-full bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Evolução de Vendas (Últimos 6 meses)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}