import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  makeStyles,
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
  cardContainer: {},
  card: {
    height: '375px',
  },
  cardImage: {
    width: '100%',
    height: '250px',
    backgroundSize: 'cover',
  },
  cardTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

const PitchList = () => {
  const classes = useStyles()
  const history = useHistory()
  const {
    state: { books },
  } = useContext(PitchContext)

  const redirectToCreatePitch = () => {
    history.push('/create')
  }

  const cards = books.map(book => (
    <Grid item xs={12} md={4}>
      <Card className={classes.card} key={book.title}>
        <CardActionArea>
          <CardMedia className={classes.cardImage} image={book.img_url} title={book.title} />
          <CardContent>
            <div className={classes.cardTitle}>
              <Typography gutterBottom variant="h5">
                {book.title}
              </Typography>
              <Typography gutterBottom variant="body1">
                {book.rating}
              </Typography>
            </div>
            <Typography variant="body2" color="textSecondary" component="p">
              {book.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  ))

  return (
    <Paper className={classes.paper}>
      <div className={classes.titleContainer}>
        <Typography variant="h3">My Pitches</Typography>
        <Button variant="contained" color="primary" onClick={redirectToCreatePitch}>
          Create a pitch
        </Button>
      </div>
      <Grid container className={classes.cardContainer} spacing={2}>
        {cards}
      </Grid>
    </Paper>
  )
}

export default PitchList
