# Blue Diary Backend

Blue Diary 是一個潛水日誌管理系統的後端 API 服務，提供完整的用戶認證和潛水日誌管理功能。

## 目錄

- [Blue Diary Backend](#blue-diary-backend)
  - [目錄](#目錄)
  - [功能特點](#功能特點)
  - [技術架構](#技術架構)
  - [快速開始](#快速開始)
    - [環境需求](#環境需求)
    - [安裝步驟](#安裝步驟)
    - [運行專案](#運行專案)
  - [API 文檔](#api-文檔)
  - [開發指南](#開發指南)
    - [日誌系統](#日誌系統)
    - [錯誤處理](#錯誤處理)
  - [部署說明](#部署說明)
  - [貢獻指南](#貢獻指南)
  - [授權](#授權)

## 功能特點

✨ 用戶系統

- 完整的用戶認證流程
- JWT 令牌管理
- 安全的密碼處理

🏊‍♂️ 潛水日誌

- 創建和管理潛水記錄
- 自動計算 SAC (Surface Air Consumption)
- 支持圖片上傳

📊 數據管理

- 基於 Firebase Realtime Database
- 實時數據同步
- 安全的數據訪問控制

## 技術架構

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **數據庫**: Firebase Realtime Database
- **認證**: Firebase Auth + JWT
- **日誌**: Winston Logger

## 快速開始

### 環境需求

- Node.js 16.x 或更高版本
- Firebase 專案設置
- npm 或 yarn

### 安裝步驟

1. 克隆專案

```bash
git clone https://github.com/your-username/blue-diary-backend.git
cd blue-diary-backend
```

2. 安裝依賴

```bash
npm install
```

3. 環境配置

```env
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=7d
```

4. Firebase 配置

- 從 Firebase Console 下載服務帳號金鑰
- 複製 `serviceAccountKey.example.json` 為 `serviceAccountKey.json`
- 使用從 Firebase Console 下載的實際憑證替換示例值

### 運行專案

開發環境：

```bash
npm run dev
```

生產環境：

```bash
npm start
```

## API 文檔

詳細的 API 文檔請訪問：[API 文檔頁面](./docs/api.html)

基本使用：

- 所有 API 請求都需要在 header 中包含 token：
  ```
  Authorization: Bearer <access_token>
  ```
- API 基礎路徑：`/api`
- 支持的內容類型：`application/json`

## 開發指南

### 日誌系統

使用 Winston 進行日誌記錄：

- `logs/combined.log`: 所有級別的日誌
- `logs/error.log`: 僅錯誤日誌

### 錯誤處理

統一的錯誤響應格式：

```json
{
  "error": "錯誤訊息描述"
}
```

## 部署說明

1. 環境配置

   - 設置所有必要的環境變數
   - 確保 Firebase 配置正確

2. 建議部署方式

   - 使用 PM2 進行進程管理
   - 配置 NGINX 反向代理
   - 啟用 HTTPS

3. 安全考慮
   - 設置適當的防火牆規則
   - 定期更新依賴包
   - 監控系統資源使用

## 貢獻指南

1. Fork 專案
2. 創建特性分支
3. 提交變更
4. 發起 Pull Request

## 授權

[MIT License](LICENSE)
