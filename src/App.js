import React from 'react';
import { ReactComponent as AddPhotoIcon } from './icons/addphotos.svg';
import './App.css';
import firebase from './Config';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.ref = firebase.firestore().collection('fruits');
    this.unsubscribe = null;
    this.state = {
      image: null,
      url: '',
      items: [],
      key: '',
    }

    this.handleChange = this.handleChange.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectData);
  }
  onCollectData = (queryItems) => {
    const items = [];
    queryItems.forEach(item => {
      const { url } = item.data();
      items.push({
        key: item.id,
        url
      })
    })
    this.setState({ items })
  }

  uploadImage = () => {
    const { image } = this.state;
    const uploadPhoto = firebase.storage().ref(`fruitimage/${image.name}`).put(image);
    uploadPhoto.on('state_changed', (snapshot) => { console.log('snapshot') }, (error) => { console.log(error) },
      () => {
        firebase.storage().ref('fruitimage').child(image.name).getDownloadURL().then(url => {
          this.setState({ url });

        })
      }
    )
  }

  handleChange = event => {
    this.setState({
      image: event.target.files[0],
    });

  }

  saveDate = () => {
    const { url } = this.state;
    this.ref.add({
      url
    }).then(() => {
      this.setState({
        image: null,
        url: ''
      });
    }).catch(error => {
      console.log(error)
    })
  }

  deleteItem = (event) => {
    const id = event.target.id;
    const url = event.target.value;

    const deleteRef = firebase.storage().refFromURL(url);
    firebase.firestore().collection('fruits').doc(id).delete().then(() => {
      console.log('file deleted');
    }).catch(error => { console.log(error) });

    deleteRef.delete().then(() => {
      console.log("file deleted")
    }).catch(error => { console.log(error) })
  }

  render() {
    return (
      <div className="App">
        <h3>Upload image to firebase</h3>
        <div className='item-image'>
          {this.state.items.map((item) =>
            <div key={item.key}
              className='item-photo'
            >
              <button
                id={item.key} value={item.url}
                onClick={this.deleteItem}
                className='btn-del'
              >x</button>
              <img src={item.url} alt="photoi"
                style={{ width: '5rem', height: '5rem', }}
                className='card-img'
              />
            </div>)}
        </div>
        <div className='form-group'>

          <label htmlFor="image-item"><AddPhotoIcon /> Add Photos</label>
          <input
            id='image-item'
            style={{ display: 'none' }}
            type="file"
            name='image-item'
            onChange={this.handleChange}
          />
        </div>
        <div className='btn-container'>
          <button onClick={this.uploadImage}
            className=' mx-auto'
          >Upload photo</button>
          <button onClick={this.saveDate}>Save</button></div>
      </div>
    );
  }
}
export default App;
