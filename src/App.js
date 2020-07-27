import React, { useState, useEffect } from 'react';
import { ReactComponent as AddPhotoIcon } from './icons/addphotos.svg';
import './App.css';
import firebase from './Config';

function App() {
  let [uploadPhoto, setUploadPhoto] = useState({
    image: null,
    url: '',
  })

  const [showImage, setShowImage] = useState([]);

  useEffect(() => {
    const ref = firebase.firestore().collection('fruits')
    const mydata = ref.onSnapshot(onCollectData)

  }, ['data'])

  const onCollectData = (queryData) => {
    const items = []
    queryData.forEach((doc) => {
      const { url } = doc.data();
      items.push({
        url,
        key: doc.id,
      })
    })

    setShowImage(items)
  }

  const handleChange = event => {
    setUploadPhoto({
      image: event.target.files[0]
    })
  }

  const uploadImage = () => {
    console.log('...uploading')
    const { image } = uploadPhoto;
    if (!image) return;
    const uploadFile = firebase.storage().ref(`fruitimage/${image.name}`).put(image);
    uploadFile.on('state_changed', (snapshot) => { console.log('snapshot') },
      (error) => { console.log(error) },
      () => {
        firebase.storage().ref('fruitimage').child(image.name).getDownloadURL().then(url => {
          setUploadPhoto({
            url
          })
        })
      })

  }

  const savePhoto = () => {
    const myRef = firebase.firestore().collection('fruits')
    const { url } = uploadPhoto;
    if (!url) return;
    myRef.add({
      url
    }).then(() => {
      setUploadPhoto({
        image: null,
        url: '',
      })
      console.log('..saving')
    }).catch(error => console.log(error))

  }
  //delete photo from firebase
  const deleteImage = event => {
    const id = event.target.id;
    const url = event.target.value;
    const delRef = firebase.storage().refFromURL(url);
    firebase.firestore().collection('fruits').doc(id).delete().then(() => {
      console.log('file deleted')
    }).catch(error => {
      console.log(error)
    });
    delRef.delete().then(() => {
      console.log('file delete')
    }).catch(error => console.log(error))

  }

  return (
    <div>
      <div>
        <h3>Upload multiple photos</h3>
        <div className='img-container'>{showImage.map(item =>
          <div key={item.key}
            className='item-image'
          >
            <button
              className='btn-del'
              onClick={deleteImage}
              id={item.key}
              value={item.url}
            >x</button>
            <img src={item.url} alt="me" style={{ width: '5rem', height: '5rem' }} />
          </div>)}</div>
      </div>
      <div className='form-group'>
        <label htmlFor="input-image"><AddPhotoIcon />Add Photos</label>
        <input
          type="file" id='input-image'
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <div>
          <button onClick={uploadImage}>Upload photo</button>
          <button onClick={savePhoto}>Save photo</button>
        </div>
      </div>

    </div>
  )
}

export default App;
