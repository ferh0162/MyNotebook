// Page2.js
import { app, database, storage } from './firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  StyleSheet, Text, View, TextInput, Button, FlatList,
  Modal, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image
} from 'react-native';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export default function Page2({ navigation, route }) {
  const message = route.params?.message; // handling case when route is null
  const id = route.params?.id; // handling case when route is null
  const replyText = route.params?.replyText; // handling case when route is null
  const [reply, setReply] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [editObj, setEditObj] = useState(null); // [text, setText


  useEffect(() => {
    downloadImage(id);
  }, [id]);

  async function downloadImage(id) {
    try {
      const url = await getDownloadURL(ref(storage, `${id}.jpg`));
      setImagePath(url);
    } catch (error) {
      alert(error);
    }
  }
  async function launchCamera(){
    const result = await ImagePicker.requestCameraPermissionsAsync() //spørger om lov
    if (result.granted === false) {
      alert('Du skal give adgang til kameraet for at kunne tage et billede')
      return
    }else{
      ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })
      .then((result) => {
        if (!result.cancelled) {
          setImagePath(result.uri)
        }
      })
      .catch((error) => {
        alert(error)
      })
    }
  }

  async function launchImagePicker(){
    let result = await ImagePicker.launchImageLibraryAsync({
         allowsEditing: true
     })
     if (!result.canceled) {
         setImagePath(result.assets[0].uri)
       
     }
   }

  async function uploadImage(){
    const res = await fetch(imagePath)
    const blob = await res.blob()
    const storageRef = ref(storage, editObj.id+'.jpg')
    uploadBytes(storageRef, blob).then((snapshot) => {
      alert('Uploaded a blob or image!');
    })
  }

  async function saveUpdate(){
    await updateDoc(doc(database, "notes", editObj.id), {
       text: text
   })
   if (imagePath) {
     uploadImage()
     
   }
   setText('')
   setEditObj(null)
   }

  // Function to handle saving the reply to the database
  const saveReply = async () => {
    // Check if there's a valid reply to save
    if (reply) {
      try {
        // Update the document with the given id
        const docRef = doc(database, "notes", id);
        await updateDoc(docRef, {
          replyText: reply
          // any other fields you want to update can go here
        });
        // Optionally, you can navigate back to Page1 or perform any other action here
        // navigation.navigate("Noter");
      } catch (error) {
        console.log("Error saving reply: " + error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image style={{ width: 200, height: 200 }} source={{ uri: imagePath }} />
      <Button title="Add image"onPress={launchImagePicker}/>
    <Button title="Save"onPress={saveUpdate}/>
    <Button title="Camera"onPress={launchCamera}/>
      {/* DISPLAY NOTE MESSAGE */}
      <TextInput
        placeholder={"Reply to this note"}
        onChangeText={(text) => setReply(text)}
        defaultValue={replyText}
        value={reply}
        style={styles.textInput}
      />
      <Button title="Save Reply" onPress={saveReply} />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
};
