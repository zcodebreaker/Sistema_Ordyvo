import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Fade } from '@/styles/materialUiCompat';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: theme.zIndex.modal + 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.24)',
    pointerEvents: 'none'
  },
  spinner: {
    color: theme.palette.common.white
  }
}));

const PageTransitionSpinner = () => {
  const classes = useStyles();
  const location = useLocation();
  const timerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    setLoading(true);

    timerRef.current = window.setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return (
    <Fade in={loading} timeout={150} unmountOnExit>
      <div className={classes.overlay}>
        <CircularProgress className={classes.spinner} size={44} thickness={4} />
      </div>
    </Fade>
  );
};

export default PageTransitionSpinner;
