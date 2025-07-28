import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const WeeklyProjectsChart = ({ data }) => {
  return (
    <div className="chart-wrapper-modern">
      <h4 className="chart-title-modern">Projets créés par semaine</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semaine" fontSize={12} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="projets" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyProjectsChart;
