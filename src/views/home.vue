<template>
    <div class="home-container">
        <div class="welcome-section">
            <h1>Welcome to Core Admin</h1>
            <p>Dashboard overview and statistics</p>
        </div>

        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="el-icon-user"></i>
                </div>
                <div class="stat-info">
                    <h3>1,234</h3>
                    <p>Total Users</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="el-icon-data-line"></i>
                </div>
                <div class="stat-info">
                    <h3>5,678</h3>
                    <p>Total Orders</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="el-icon-money"></i>
                </div>
                <div class="stat-info">
                    <h3>$9,012</h3>
                    <p>Revenue</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="el-icon-shopping-cart"></i>
                </div>
                <div class="stat-info">
                    <h3>345</h3>
                    <p>New Orders</p>
                </div>
            </div>
        </div>

        <div class="recent-activity">
            <h2>Recent Activity</h2>
            <p>No recent activities to display</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// You can add your component logic here
import { apiController } from '@/api/index.ts'

setTimeout(() => {
    console.log('Is Authenticated:', apiController.logout())
}, 1000)
</script>

<style scoped>
.home-container {
    padding: 20px;
}

.welcome-section {
    margin-bottom: 30px;
}

.welcome-section h1 {
    font-size: 28px;
    margin-bottom: 8px;
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
}

.stat-icon {
    font-size: 24px;
    margin-right: 16px;
    color: #409eff;
}

.stat-info h3 {
    font-size: 24px;
    margin: 0 0 8px 0;
}

.stat-info p {
    margin: 0;
    color: #909399;
}

.recent-activity {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.recent-activity h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
}
</style>
