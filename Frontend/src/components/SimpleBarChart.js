import React from 'react';
import { Card } from 'react-bootstrap';

const SimpleBarChart = ({ title, data = [] }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h6 className="mb-3">📊 {title}</h6>
        {data.map((item) => {
          const width = Math.round((item.value / maxValue) * 100);
          return (
            <div key={item.label} className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="simple-bar-wrap">
                <div
                  className="simple-bar"
                  style={{ width: `${width}%`, backgroundColor: item.color || '#5B8DEE' }}
                />
              </div>
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};

export default SimpleBarChart;
