import React from 'react';
import { Form, Input, DatePicker, Button, Spin } from 'antd';

/**
 * GenericForm: Componente base para formularios con Ant Design.
 * Props:
 *  - fields: [{name, label, type, required, placeholder, initialValue, readOnly, options}]
 *  - onFinish: función de submit (valores del formulario)
 *  - loading: boolean
 *  - submitText: string
 *  - children: renderiza contenido adicional
 */
const { TextArea } = Input;

const fieldTypeToComponent = (field) => {
  if (field.type === 'date') {
    return <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />;
  }
  if (field.type === 'textarea') {
    return <TextArea rows={field.rows || 4} placeholder={field.placeholder} style={{ resize: 'none', maxHeight: 200 }} readOnly={field.readOnly} />;
  }
  if (field.type === 'select' && field.options) {
    return (
      <select name={field.name} defaultValue={field.initialValue} disabled={field.readOnly} style={{ width: '100%', padding: 8 }}>
        {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    );
  }
  return <Input type={field.type} placeholder={field.placeholder} readOnly={field.readOnly} />;
};

const GenericForm = ({ fields, onFinish, loading, submitText, children, initialValues }) => (
  <Spin spinning={loading} tip="Cargando...">
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      {fields.map(field => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={[{ required: field.required, message: `Campo obligatorio` }]}
        >
          {fieldTypeToComponent(field)}
        </Form.Item>
      ))}
      {children}
      <Form.Item>
        <Button type="primary" htmlType="submit" block>{submitText || 'Enviar'}</Button>
      </Form.Item>
    </Form>
  </Spin>
);

export default GenericForm;
