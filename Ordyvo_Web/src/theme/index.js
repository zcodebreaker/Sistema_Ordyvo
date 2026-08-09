import { createTheme } from '@mui/material/styles';

import palette from './palette';
import typography from './typography';
import overrides from './overrides';

const components = Object.entries(overrides).reduce(
  (result, [componentName, styleOverrides]) => ({
    ...result,
    [componentName]: { styleOverrides }
  }),
  {}
);

const theme = createTheme({
  palette,
  typography,
  components,
  zIndex: {
    appBar: 1200,
    drawer: 1100
  }
});

export default theme;
