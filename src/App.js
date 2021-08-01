import React from 'react'
import { Container, Toolbar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'

import Header from './components/Header'
import PitchList from './components/PitchList'
import CreatePitch from './components/CreatePitch'

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
        <Switch>
          <Route exact path="/">
            <PitchList />
          </Route>
          <Route path="/create">
            <CreatePitch />
          </Route>
        </Switch>
      </Container>
    </div>
  )
}

export default App
