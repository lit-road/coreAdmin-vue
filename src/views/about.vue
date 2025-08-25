<template>
    <div class="about-container">
        <h1 class="about-title">About Core Admin</h1>

        <div class="about-card">
            <h2>Overview</h2>
            <p>
                Core Admin is a comprehensive administration panel built with Vue.js, designed to
                provide a seamless experience for managing your application's backend services.
            </p>
        </div>

        <div class="about-card">
            <h2>Features</h2>
            <ul>
                <li>Responsive dashboard</li>
                <li>User management</li>
                <li>Data visualization</li>
                <li>Customizable themes</li>
                <li>Advanced security controls</li>
            </ul>
        </div>

        <div class="about-card">
            <h2>Version Information</h2>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Last Updated:</strong> {{ new Date().toLocaleDateString() }}</p>
        </div>

        <div class="about-card">
            <h2>Contact</h2>
            <p>For support or inquiries, please contact:</p>
            <p>Email: support@coreadmin.com</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.about-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.about-title {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
}

.about-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.about-card h2 {
    margin-top: 0;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 10px;
    color: #409eff;
}

ul {
    padding-left: 20px;
}

li {
    line-height: 1.8;
}
</style>
