import React, { useState } from 'react';
import './App.css';
import {
  FileOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import Charts from './Charts';
import Table from './Table';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Gráficos', 'graphs', <PieChartOutlined />),
  getItem('Tabela', 'table', <FileOutlined />),
];


function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['table']);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  function handleClick(info: { key: string, keyPath: string[] }): void {
    setSelectedKeys([info.key]);
  };

  const selectedPage = 'graphs' === selectedKeys[0] ? <Charts/> : <Table/>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme="dark" selectedKeys={selectedKeys} onClick={handleClick} defaultSelectedKeys={['graphs']} mode="inline" items={items} />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          {selectedPage}
        </Content>
        <Footer style={{ textAlign: 'center' }}>Budget</Footer>
      </Layout>
    </Layout>
  );
}

export default App;
