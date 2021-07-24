import React from 'react'
import Header from './components/Header'
import Main from './components/Main'
import { Container, Toolbar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 20,
  },
})

const App = () => {
  const classes = useStyles()
  
  return (
    <div className={classes.root}>
      <Header />
      <Toolbar />
      <Container fixed className={classes.container}>
        <Main />
      </Container>
    </div>
  )
}

export default App
