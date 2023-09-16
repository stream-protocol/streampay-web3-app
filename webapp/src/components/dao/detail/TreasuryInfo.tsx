import { CopyOutlined, WalletOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Input, Modal, Row, Statistic, Table, message } from "antd";
import { useEffect, useState } from "react";
import { useAppSelector } from "src/controller/hooks";
import { addContributorAction, getContributorFunds } from "src/core";
import { useAddress } from "src/hooks/useAddress";

export const TreasuryInfo = () => {
  const { daoFromDB, daoOnchain, treasury } = useAppSelector(state => state.daoDetail);
  const { account } = useAppSelector(state => state.account);
  const { getShortAddress } = useAddress();
  const { addContributor } = useAppSelector(state => state.process);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContributor, setNewContributor] = useState("");

  const handleOk = async () => {
    try {
      await addContributorAction(newContributor);
      message.success("Contributor added successfully.");
      setIsModalOpen(false);
      setNewContributor("");
    } catch (error) {
      message.error("Failed to add contributor. Please check the address.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewContributor("");
  };

  const handleAddContributor = () => {
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (_, record) => (
        <Button type="primary" icon={<CopyOutlined />} onClick={() => navigator.clipboard.writeText(record.address)}>
          {getShortAddress(record.address)}
        </Button>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount (ETH)',
      dataIndex: 'amount',
      key: 'amount',
    },
  ];

  useEffect(() => {
    if (daoFromDB.address) {
      getContributorFunds(0);
    }
  }, [daoFromDB.address]);

  return (
    <>
      <Card title="Funding History" size="default" extra={
        <Button type="primary" loading={addContributor.processing} disabled={daoFromDB.owner !== account} onClick={() => handleAddContributor()}>
          Add contributor
        </Button>
      }>
        <Row gutter={8}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Total Funds"
                value={treasury.reduce((a, b) => a + b.amount, 0)}
                valueStyle={{ color: '#111827' }}
                precision={3}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Remaining Balance"
                value={daoOnchain.balance}
                valueStyle={{ color: '#111827' }}
                precision={3}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Whitelist Contributors"
                value={treasury.length}
                valueStyle={{ color: '#111827' }}
              />
            </Card>
          </Col>
        </Row>
        <Divider />
        <Table
          pagination={{
            pageSize: 6
          }}
          dataSource={
            treasury.map(({ address, amount }, i) => {
              return {
                key: `c-${i}`,
                address: address,
                type: "Contributor",
                amount: amount,
              }
            })
          } columns={columns} />
      </Card>

      <Modal title="Add Contributor" open={isModalOpen} onOk={handleOk} confirmLoading={addContributor.processing} onCancel={handleCancel}>
        <Input
          name="new_address"
          size="large"
          value={newContributor}
          onChange={(e) => setNewContributor(e.target.value)}
          addonBefore={<WalletOutlined />}
          placeholder="Enter contributor address"
        />
      </Modal>
    </>
  )
}
