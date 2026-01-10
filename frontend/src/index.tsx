import {createRoot} from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
);
