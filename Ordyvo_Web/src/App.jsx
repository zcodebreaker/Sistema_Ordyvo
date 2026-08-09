import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/scss/index.scss';
import Routes from './Routes';
import { PageTransitionSpinner } from './components';

const App = () => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <PageTransitionSpinner />
      <Routes />
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
