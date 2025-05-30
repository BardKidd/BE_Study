import { useForm, useFieldArray } from 'react-hook-form';

interface FormData {
  items: {
    username: string;
    age: string;
    email: string;
    remark: string;
  }[];
}

const MyFormStudy = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();

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
  } = useFieldArray<FormData, 'items'>({ control, name: 'items' });

  const onSubmit = (data: FormData) => {
    console.log(data);
    console.log(errors);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="bg-gray-700/80 rounded-2xl shadow-2xl p-10 max-w-2xl w-full border border-gray-600">
        <h1 className="text-3xl font-bold text-cyan-300 mb-6 text-center drop-shadow">
          Dynamic Form
        </h1>
        <button
          type="button"
          onClick={() => appendItem(basicRowData)}
          className="mb-6 px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold shadow hover:bg-cyan-500 transition"
        >
          Add new row
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {itemFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 bg-gray-800/80 rounded-xl p-6 border border-gray-600 shadow"
            >
              <input
                className="px-4 py-2 rounded bg-gray-900 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Username"
                {...register(`items.${index}.username`)}
              />
              <input
                className="px-4 py-2 rounded bg-gray-900 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Age"
                {...register(`items.${index}.age`)}
              />
              <input
                className="px-4 py-2 rounded bg-gray-900 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Email"
                {...register(`items.${index}.email`)}
              />
              <textarea
                className="px-4 py-2 rounded bg-gray-900 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[60px]"
                placeholder="Remark"
                {...register(`items.${index}.remark`)}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="self-end mt-2 px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Remove this row
              </button>
            </div>
          ))}
          <button
            type="submit"
            className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyFormStudy;
