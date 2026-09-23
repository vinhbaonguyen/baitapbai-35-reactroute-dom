import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './assets/styles/pages/main.scss'
import { createStore } from 'redux';
import allReducers from './reducers/index.js';
import { Provider } from 'react-redux';
import Modal from 'react-modal';
import 'animate.css'
// createStore tạo ra store chứa toàn bộ global state
// Truyền allReducers vào để store biết cách xử lý action
const store = createStore(
  allReducers,
  // Dòng này giúp Redux DevTools nhận diện được Store)
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
//React-Modal yêu cầu bạn chỉ định root để tránh lỗi accessibility.
Modal.setAppElement('#root');

// Render React vào #root
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
