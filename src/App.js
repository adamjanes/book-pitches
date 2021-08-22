import React, { useEffect, useContext } from 'react'
import { Container, Toolbar } from '@material-ui/core'
import { makeStyles, Button } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
import firebase from 'firebase'

import Header from './components/Header'
import PitchList from './components/PitchList'
import CreatePitch from './components/CreatePitch'
import { Context as PitchContext } from './contexts/PitchContext'

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
  const { fetchBooks } = useContext(PitchContext)
  useEffect(() => {
    firebase.initializeApp({
      apiKey: 'AIzaSyAzBOrCvmPLvf-VvwYlaSWJcYv3_9aJqrc',
      authDomain: 'book-pitches.firebaseapp.com',
      databaseURL: 'https://book-pitches-default-rtdb.europe-west1.firebasedatabase.app',
      projectId: 'book-pitches',
      storageBucket: 'book-pitches.appspot.com',
      messagingSenderId: '763602875712',
      appId: '1:763602875712:web:2ff5a12cb5755504e2b6a5',
    })
    fetchBooks()
  }, [])

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
