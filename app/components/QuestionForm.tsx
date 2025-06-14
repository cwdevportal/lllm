'use client';

import { useState } from 'react';

export function QuestionForm() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, options }),
      });

      if (!res.ok) throw new Error('Failed to create question');

      alert('✅ Question created!');
      setQuestion('');
      setAnswer('');
      setOptions(['', '', '', '']);
    } catch (err) {
      console.error(err);
      alert('❌ Error submitting the question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <div>
        <label className="block font-medium mb-1">Question</label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Correct Answer</label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
      </div>

      {options.map((opt, index) => (
        <div key={index}>
          <label className="block font-medium mb-1">Option {index + 1}</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={opt}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
            required
          />
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Question'}
      </button>
    </form>
  );
}
