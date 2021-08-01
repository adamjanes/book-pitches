import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Paper,
  Typography,
  Button,
  Grid,
  makeStyles,
  TextField,
  Slider,
  FormGroup,
} from '@material-ui/core'

import { Context as PitchContext } from '../contexts/PitchContext'

const useStyles = makeStyles({
  paper: {
    flex: 1,
    padding: '20px 40px',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '20px',
  },
  formGroup: {
    paddingBottom: 20,
    maxWidth: '600px',
  },
})

const CreateForm = () => {
  const classes = useStyles()
  const history = useHistory()
  const { addPitch } = useContext(PitchContext)
  const [title, setTitle] = useState('')
  const [rating, setRating] = useState(0)
  const [pitch, setPitch] = useState('')

  const redirectToHomePage = () => {
    history.push('/')
  }

  const createPitch = () => {
    const newBook = {
      title,
      author: 'JK Rowling',
      rating,
      description: "A young orphan finds out he's a wizard",
      pitch,
      img_url:
        'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1474154022l/3._SY475_.jpg',
    }
    addPitch(newBook)
    redirectToHomePage()
  }

  return (
    <Paper className={classes.paper}>
      <div className={classes.titleContainer}>
        <Typography variant="h3">Create Pitch</Typography>
        <Button variant="text" color="primary" onClick={redirectToHomePage}>
          Back
        </Button>
      </div>
      <FormGroup className={classes.formGroup}>
        <TextField
          label="Book Title"
          type="text"
          variant="outlined"
          fullWidth
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </FormGroup>
      <FormGroup className={classes.formGroup}>
        <Typography id="discrete-slider" gutterBottom>
          Rating
        </Typography>
        <Slider
          valueLabelDisplay="auto"
          value={rating}
          step={1}
          marks
          min={0}
          max={10}
          onChange={(event, value) => setRating(value)}
        />
      </FormGroup>
      <FormGroup className={classes.formGroup}>
        <TextField
          label="Your Pitch!"
          type="text"
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          value={pitch}
          onChange={event => setPitch(event.target.value)}
        />
      </FormGroup>
      <FormGroup className={classes.formGroup}>
        <Button variant="outlined" size="large" color="primary" onClick={createPitch}>
          Sumbit
        </Button>
      </FormGroup>
    </Paper>
  )
}

export default CreateForm
