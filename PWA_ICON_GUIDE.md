# PWA Icon 生成指南

## 快速生成 Icon 的工具

您可以使用以下任一工具快速生成 PWA 所需的 icon 檔案：

### 1. **PWA Asset Generator** (推薦)
- 網址：https://github.com/onderceylan/pwa-asset-generator
- 使用方式：
  ```bash
  npx pwa-asset-generator public/icon.svg public --icon-background "#ffffff" --icon-maskable
  ```
- 這會自動生成所有需要的 icon 尺寸

### 2. **RealFaviconGenerator**
- 網址：https://realfavicongenerator.net/
- 上傳您的 icon.svg 或設計圖
- 自動生成所有平台所需的 icon

### 3. **Favicon.io**
- 網址：https://favicon.io/
- 可以從文字、圖片或 emoji 生成 icon
- 簡單易用

### 4. **PWA Builder Image Generator**
- 網址：https://www.pwabuilder.com/imageGenerator
- 專門為 PWA 設計的工具

## 需要的 Icon 檔案

根據 `vite.config.js` 的設定，您需要在 `public` 資料夾中放置以下檔案：

- `pwa-192x192.png` (192x192 像素)
- `pwa-512x512.png` (512x512 像素)
- `apple-touch-icon.png` (180x180 像素，用於 iOS)

## 使用現有的 icon.svg

我已經在 `public/icon.svg` 創建了一個基礎的 SVG icon。您可以：

1. 使用上述工具將 SVG 轉換為 PNG
2. 或者使用在線工具如 CloudConvert (https://cloudconvert.com/svg-to-png) 轉換

## 快速命令（使用 pwa-asset-generator）

```bash
npx pwa-asset-generator public/icon.svg public --icon-background "#ffffff" --icon-maskable --manifest public/manifest.json
```

這會自動生成所有需要的 icon 並更新 manifest.json。
