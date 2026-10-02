/* © 2026 Bang Ajiib. All rights reserved. */

import {createRoot} from 'react-dom/client';
import { Chart as ChartJS, registerables } from 'chart.js';
import App from './App.tsx';
import './index.css';

ChartJS.register(...registerables);

createRoot(document.getElementById('root')!).render(<App />);
