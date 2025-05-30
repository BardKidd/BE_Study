import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

const MyFormStudy = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const boxStyle = {
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    background: '#f9fafb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
  };

  const textareaStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    minHeight: '60px',
  };

  const basicRowData = {
    username: '',
    age: '',
    email: '',
    remark: '',
  };

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: 'items' });

  const onSubmit = (data) => {
    console.log(data);
    console.log(errors);
  };

  return (
    <>
      <button type="button" onClick={() => appendItem(basicRowData)}>
        Add new row
      </button>

      <form onSubmit={handleSubmit(onSubmit)}>
        {itemFields.map((field, index) => (
          <div key={field.id} style={boxStyle}>
            <input
              style={inputStyle}
              placeholder="Username"
              {...register(`items.${index}.username`)}
            />
            <input
              style={inputStyle}
              placeholder="Age"
              {...register(`items.${index}.age`)}
            />
            <input
              style={inputStyle}
              placeholder="Email"
              {...register(`items.${index}.email`)}
            />
            <textarea
              style={textareaStyle}
              placeholder="Remark"
              {...register(`items.${index}.remark`)}
            />
            <button type="button" onClick={() => removeItem(index)}>
              Remove this row
            </button>
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default MyFormStudy;
