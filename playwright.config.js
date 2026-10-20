import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',
 use:{baseURL:'http://127.0.0.1:5173',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']},headless:true},
 webServer:{command:'npm run dev -- --port 5173 --strictPort',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000},
 workers:1,reporter:'list'
});
