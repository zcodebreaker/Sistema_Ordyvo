import { useTheme } from '@mui/material/styles';
import { makeStyles as createMakeStyles } from 'tss-react/mui';

export { useTheme };

export const makeStyles = styleCreator => {
  const useTssStyles = createMakeStyles()((theme, params, classes) =>
    styleCreator(theme, params, classes)
  );

  return params => useTssStyles(params).classes;
};
