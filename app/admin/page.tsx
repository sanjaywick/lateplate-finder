"use client"

import type React from "react"
import { Layout, Card } from "antd"
import { useRouter } from "next/router"

const { Content } = Layout

const AdminPage: React.FC = () => {
  const router = useRouter()

  const handleExploreClick = () => {
    router.push("/admin/explore")
  }

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#141414", color: "#fff" }}>
      <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
        <div style={{ padding: 24, background: "#141414", minHeight: 360 }}>
          <h1>Welcome to the Admin Dashboard</h1>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Card title="Total Restaurants in System" style={{ width: 200 }}>
              <p>150</p>
            </Card>
            <Card title="Total Recipes in Database" style={{ width: 200 }}>
              <p>300</p>
            </Card>
            <Card title="Total User Reviews" style={{ width: 200 }}>
              <p>2000</p>
            </Card>
            <Card title="System Health" style={{ width: 200 }}>
              <p>Healthy</p>
            </Card>
          </div>
          {/* <Button type="primary" onClick={handleExploreClick}>Explore Your Journey</Button> */}
        </div>
      </Content>
    </Layout>
  )
}

export default AdminPage
