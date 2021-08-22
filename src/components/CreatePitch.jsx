import React, { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
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
import Autocomplete from '@material-ui/lab/Autocomplete'

import { Context as PitchContext } from '../contexts/PitchContext'

// API KEY - AIzaSyDaS2usw0H_q5oo1pxfnyeWRzNWoheWaXY
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes?q='

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
  const [bookInfo, setBookInfo] = useState('')
  const [rating, setRating] = useState(0)
  const [pitch, setPitch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [autocompleteBooks, setAutocompleteBooks] = useState([])

  useEffect(() => {
    // TODO: request debouncing
    if (inputValue) {
      axios.get(BASE_URL + inputValue).then(response => {
        setAutocompleteBooks(response.data.items.map(book => book.volumeInfo))
      })
    }
  }, [inputValue])

  // console.log(autocompleteBooks)

  const redirectToHomePage = () => {
    history.push('/')
  }

  const createPitch = () => {
    console.log(bookInfo)
    const newBook = {
      title: bookInfo.title,
      author: bookInfo.authors[0],
      description: bookInfo.description,
      rating,
      pitch,
      img_url: bookInfo.imageLinks?.thumbnail || '',
    }
    addPitch(newBook)
    redirectToHomePage()
  }

  console.log(bookInfo)

  return (
    <Paper className={classes.paper}>
      <div className={classes.titleContainer}>
        <Typography variant="h3">Create Pitch</Typography>
        <Button variant="text" color="primary" onClick={redirectToHomePage}>
          Back
        </Button>
      </div>
      {bookInfo && <img src={bookInfo.imageLinks?.thumbnail || 'https:example.com'} />}
      <FormGroup className={classes.formGroup}>
        <Autocomplete
          value={bookInfo}
          onChange={(e, value) => setBookInfo(value)}
          inputValue={inputValue}
          onInputChange={(e, value) => setInputValue(value)}
          freeSolo
          getOptionSelected={(option, value) => option.infoLink === value.infoLink}
          getOptionLabel={option => option?.title || ''}
          options={autocompleteBooks.map(book => book)}
          renderInput={params => (
            <TextField {...params} label="Book Title" margin="normal" variant="outlined" />
          )}
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
