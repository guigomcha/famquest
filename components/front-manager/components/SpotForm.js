import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  Spin
} from 'antd';
import dayjs from 'dayjs';
import '../css/classes.css';
import { useTranslation } from 'react-i18next';
import { SpotFromForm, GlobalMessage } from '../functions/components_helper';

const { TextArea } = Input;
const { Option } = Select;

const SpotForm = ({ initialData, handledFinished }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectValue, setSelectValue] = useState(initialData?.discovered?.condition?.parameterType || 'location');

  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    console.info('Submitting form', values);
    const resp = await SpotFromForm(values, initialData);
    console.info('Response from form', resp);
    if (!resp) {
      GlobalMessage(t('internalError'), 'error');
    } else {
      GlobalMessage(t('actionCompleted'), 'info');
    }
    setIsLoading(false);
    handledFinished('done');
  };

  return (
    <>
      {isLoading && (
        <div className="spin-overlay">
          <Spin tip={t('loading')} />
        </div>
      )}

      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          id: initialData?.id,
          name: initialData?.name,
          condition: selectValue,
          show: initialData?.discovered?.show || false,
          date: initialData?.discovered?.condition?.thresholdTarget
            ? dayjs(initialData.discovered.condition.thresholdTarget)
            : dayjs(),
          description: initialData?.description
        }}
      >
        {initialData?.id && (
          <Form.Item label="ID" name="id">
            <Input readOnly />
          </Form.Item>
        )}

        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <Form.Item
              label={t('name')}
              name="name"
              rules={[{ required: true, message: t('formNotValid') }]}
            >
              <Input placeholder={t('editName')} />
            </Form.Item>
          </Col>

          <Col span={24} md={12}>
            <Form.Item label={t('editDiscoverOptionSelect')} name="condition">
              <Select onChange={(val) => setSelectValue(val)}>
                <Option value="location">{t('discoverLocation')}</Option>
                <Option value="date">{t('discoverDate')}</Option>
              </Select>
            </Form.Item>

            {selectValue === 'date' && (
              <Form.Item name="date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            )}

            <Form.Item
              name="show"
              label={t('editDiscoverOptionCheckbox')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t('description')}
          name="description"
          rules={[{ required: true, message: t('formNotValid') }]}
        >
          <TextArea
            rows={6}
            placeholder={t('editDescription')}
            style={{ resize: 'none', maxHeight: '200px', overflowY: 'auto' }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('submit')}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default SpotForm;