import React from 'react';

interface ExampleComponentProps {
  title: string;
  description?: string;
}

export default function ExampleComponent({ title, description }: ExampleComponentProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
    </div>
  );
} 