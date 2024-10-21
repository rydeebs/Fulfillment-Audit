import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import shipPlugLogo from './assets/shipplug-logo.png';

const generateLargeDataset = () => {
  const shippingTypes = ['standard', 'express', 'overnight', 'international'];
  const agreedPricing = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99,
    international: 35.99
  };

  const dataset = [];
  for (let i = 0; i < 10000; i++) {
    const type = shippingTypes[Math.floor(Math.random() * shippingTypes.length)];
    const agreedPrice = agreedPricing[type];
    const actualPrice = agreedPrice + (Math.random() * 5 - 1); // Random price difference between -$1 and $4
    const surcharge = Math.random() < 0.3 ? Math.random() * 2 : 0; // 30% chance of surcharge up to $2

    dataset.push({
      type,
      agreedPrice,
      actualPrice,
      surcharge
    });
  }
  return dataset;
};

const analyzeDataset = (dataset) => {
  const summary = dataset.reduce((acc, shipment) => {
    if (!acc[shipment.type]) {
      acc[shipment.type] = { count: 0, totalDifference: 0 };
    }
    const actualTotal = shipment.actualPrice + shipment.surcharge;
    const difference = actualTotal - shipment.agreedPrice;
    acc[shipment.type].count++;
    acc[shipment.type].totalDifference += difference;
    return acc;
  }, {});

  const totalDifference = Object.values(summary).reduce((sum, type) => sum + type.totalDifference, 0);

  return {
    byType: Object.entries(summary).map(([type, data]) => ({
      type,
      shipments: data.count,
      totalDifference: data.totalDifference,
      averageDifference: data.totalDifference / data.count
    })),
    totalShipments: dataset.length,
    totalDifference,
    potentialSavings: totalDifference > 0 ? totalDifference : 0
  };
};

const InputPage = ({ onAudit }) => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <img 
          src={shipPlugLogo}
          alt="ShipPlug Logo" 
          className="w-40 h-auto" 
        />
        <CardTitle className="text-2xl font-bold">Fulfillment Pricing Audit</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Upload your fulfillment pricing files here. Or click "Audit" to see a sample analysis.</p>
        <div className="space-y-4">
          <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <Button onClick={onAudit} className="w-full">Audit</Button>
        </div>
      </CardContent>
    </Card>
  );

const AnalysisPage = ({ summary }) => {
  const yAxisTicks = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Fulfillment Audit Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Summary Table</h3>
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Shipping Type</th>
              <th className="border border-gray-300 p-2">Number of Shipments</th>
              <th className="border border-gray-300 p-2">Total Difference ($)</th>
              <th className="border border-gray-300 p-2">Average Difference ($)</th>
            </tr>
          </thead>
          <tbody>
            {summary.byType.map((row) => (
              <tr key={row.type}>
                <td className="border border-gray-300 p-2 font-medium">{row.type}</td>
                <td className="border border-gray-300 p-2">{row.shipments}</td>
                <td className="border border-gray-300 p-2">{row.totalDifference.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{row.averageDifference.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Total Difference by Shipping Type</h3>
        <ResponsiveContainer width="100%" height={300} className="mb-6">
          <BarChart data={summary.byType}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis 
              ticks={yAxisTicks}
              domain={[0, 6000]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="totalDifference" fill="#126df3" name="Total Difference ($)" />
          </BarChart>
        </ResponsiveContainer>

        <h3 className="text-lg font-semibold mb-2">Overall Summary</h3>
        <p>Total Shipments: {summary.totalShipments}</p>
        <p>Total Difference: ${summary.totalDifference.toFixed(2)}</p>
        <p>Potential Savings: ${summary.potentialSavings.toFixed(2)}</p>
      </CardContent>
    </Card>
  );
};

const ExtendedFulfillmentAuditDemo = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleAudit = () => {
    const dataset = generateLargeDataset();
    const summaryData = analyzeDataset(dataset);
    setSummary(summaryData);
    setShowAnalysis(true);
  };

  return (
    <div>
      {!showAnalysis ? (
        <InputPage onAudit={handleAudit} />
      ) : summary ? (
        <AnalysisPage summary={summary} />
      ) : (
        <p>Loading analysis...</p>
      )}
    </div>
  );
};

export default ExtendedFulfillmentAuditDemo;