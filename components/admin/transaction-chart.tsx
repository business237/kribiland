"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TransactionChartProps {
  data: Array<{ month: string; amount: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-navy-700">
        <p className="font-semibold text-sun-300 mb-1">{label}</p>
        <p className="font-bold text-base text-white">
          {Number(payload[0].value).toLocaleString('fr-FR')} FCFA
        </p>
      </div>
    );
  }
  return null;
};

export function TransactionChart({ data }: TransactionChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#0D9488"
            strokeWidth={3}
            dot={{ r: 4, fill: '#1E293B', stroke: '#0D9488', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
