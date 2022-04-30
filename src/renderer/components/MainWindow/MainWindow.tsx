// import React from 'react'

import classes from './MainWindow.module.scss';

function MainWindow() {
  return (
    <div className={classes.mainWindow}>
      <div className={classes.navBar}>Navbar</div>
      <div className={classes.contentWindow}>Content</div>
    </div>
  )
}

export default MainWindow
