import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const FeatureImportanceChart = ({ featureImportances }) => {
  // Log to debug the type and content of featureImportances
  console.log('featureImportances:', featureImportances);

  // Convert featureImportances to an array if it's an object
  let dataArray;
  if (Array.isArray(featureImportances)) {
    dataArray = featureImportances;
  } else if (typeof featureImportances === 'object' && featureImportances !== null) {
    dataArray = Object.entries(featureImportances).map(([feature, importance]) => ({
      feature,
      importance,
    }));
  } else {
    return <p>Error: Invalid featureImportances data format</p>;
  }

  const labels = dataArray.map(item => item.feature);
  const data = dataArray.map(item => item.importance);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Feature Importances',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'x', // Horizontal bars
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Importance',
        },
      },
      y: {
        ticks: {
          autoSkip: false,
        },
        title: {
          display: true,
          text: 'Features',
        },
      },
    },
  };

  return (
    <div>
      
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FeatureImportanceChart;
