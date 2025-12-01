'use client'

import React from 'react';
import { generateHoneypotFields, generateHoneypotStyles } from '@/lib/honeypot';

interface HoneypotFieldsProps {
  count?: number;
}

export default function HoneypotFields({ count = 2 }: HoneypotFieldsProps) {
  const fields = React.useMemo(() => generateHoneypotFields(count), [count]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateHoneypotStyles() }} />
      {fields.map((field) => (
        <div key={field.name} className="honeypot-field" aria-hidden="true">
          <label htmlFor={field.name}>
            {field.name.replace(/_/g, ' ')}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={field.value}
            autoComplete={field.autocomplete}
            tabIndex={field.tabIndex}
            onChange={() => {}}
          />
        </div>
      ))}
    </>
  );
}
