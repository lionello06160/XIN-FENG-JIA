import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initIOSKeyboardFocusFix } from './lib/utils';

// 初始化 iOS PWA 鍵盤修復
initIOSKeyboardFocusFix();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
