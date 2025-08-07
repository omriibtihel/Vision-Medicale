import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FeatureImportanceChart = ({ importances }) => {
  if (!importances || Object.keys(importances).length === 0) {
    return <p className="text-gray-500 italic">Aucune importance extraite pour ce modèle.</p>;
  }

  const labels = Object.keys(importances);
  const values = Object.values(importances);

  const data = {
    labels,
    datasets: [
      {
        label: 'Importance',
        data: values,
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: 'rgba(56, 189, 248, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 0.1 },
      },
    },
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-2 text-sky-700">Feature Importances</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default FeatureImportanceChart;
