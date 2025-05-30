# React Hook Form 教學筆記

## 1. 什麼是 React Hook Form?

> React Hook Form(RHF) 是一個用於 React 的輕量、高效能的表單管理套件。

**核心設計理念**：

- 使用 hook(主要是 `useForm`) 來驅動表單狀態管理
- 極致效能(只渲染受影響的欄位)
- 易於驗證與錯誤顯示

**適用場景**：需要管理中大型、多欄位、複雜驗證、高效能的 React 表單。

---

## 2. 安裝與快速開始

```bash
npm install react-hook-form
```

基本範例：

```jsx
import { useForm } from 'react-hook-form';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('example')} />
      <input type="submit" />
    </form>
  );
}
```

- register: 註冊表單欄位
- handleSubmit: 封裝送出流程
- formState.errors: 存放驗證錯誤

## 3. useForm API 核心用法

useForm 是所有功能的起點，會回傳多種工具與狀態。  
常見屬性有：

- register: 欄位註冊用，連接 input 控制權。
- handleSubmit: 處理 submit，包裝 onSubmit callback。
- watch: 監看欄位值(即時取得變化)。
- reset: 重置整個表單或特定欄位。
- setValue: 手動設定欄位值。
- getValues: 取得所有欄位目前值。
- trigger: 手動觸發驗證。
- control: 進階，給 Controller 元件用。
- formState: 表單的各種狀態(如 isDirty、isValid)

> `getValues` 與 `watch` 使用在 render 時的效果會看起來差不多。  
> 因為當畫面更新時以 `getValues` 取得的值會因為 re-render 而再次觸發取得最新值。

## 4. 欄位註冊 register 用法

```jsx
<input {...register('username')} />
```

加上驗證條件：

```jsx
<input
  {...register('username', {
    required: '必填',
    minLength: { value: 3, message: '至少輸入 3 個字元' },
  })}
/>
```

## 5. 錯誤訊息與驗證

所有錯誤都會集中在 formState.errors，以欄位名稱為 key。

```jsx
{
  errors.username && <span>{errors.username.message}</span>;
}
```

內建驗證規則

- required: 必填
- min/max: 數值範圍
- minLength/maxLength: 字串長度
- pattern: 正則驗證
- validate: 客製化驗證(callback)

## 6. 表單送出處理

一律用 handleSubmit(onSubmit) 包裝事件

```jsx
<form onSubmit={handleSubmit(onSubmit)}>{/** ... */}</form>
```

`onSubmit` 的參數及為所有欄位資料。

## 7. 進階功能

### 7.1 watch
