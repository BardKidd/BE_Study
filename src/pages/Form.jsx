import React from 'react';
import { useForm } from 'react-hook-form';

const MyFormStudy = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    console.log(errors);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Username:</label>
          <input
            {...register('username', {
              required: '必填',
              minLength: { value: 3, message: '至少輸入 3 個字元' },
            })}
          />
          {/* 錯誤訊息顯示 */}
          {errors.username && (
            <span style={{ color: 'red' }}>{errors.username.message}</span>
          )}
        </div>
        <input type="submit" />
      </form>
    </>
  );
};

export default MyFormStudy;
