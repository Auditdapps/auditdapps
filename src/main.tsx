import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Markdown editor + preview styles
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element with id 'root' not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
   
       <App /> 
     
   
  </React.StrictMode>
);
