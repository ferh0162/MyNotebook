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


// MAIN APP COMPONENT
export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Noter'>
        <Stack.Screen name='Noter' component={Page1} />
        <Stack.Screen name='Beskrivelse' component={Page2} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// FIRST PAGE COMPONENT (for notes listing and adding notes)
const Page1 = ({ navigation, route }) => {

const [values, loading, error] = useCollection(collection(database, "notes"));
const data = values?.docs.map((doc) => ({...doc.data(), id: doc.id}))

console.log(data)

  const [text, setText] = useState('');
  const [id, setId] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editObj, setEditObj] = useState(null); // [text, setText
  const [imagePath, setImagePath] = useState(null)
 

  // SETTING UP HEADER BUTTON
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="+"
          onPress={() => setModalVisible(true)}
        />
      ),
    });
  }, [navigation]);

  // FUNCTION TO HANDLE ADDING A NOTE
  async function addButtonPressed() {
    try {
      await addDoc(collection(database, "notes"),{
        text: text,
        })
    } catch (error) {
      console.log("file i db " + error) 
    }
    setModalVisible(false);  // close the modal after adding
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

  async function downloadImage(id){
    getDownloadURL(ref(storage, id+'.jpg')).then((url) => {
      setImagePath(url)
    }).catch((error) => {
      alert(error)
    })
  }

  // FUNCTION TO HANDLE DELETING A NOTE
  async function deleteButtonPressed(id) {
    console.log(id)
    deleteDoc(doc(database, "notes", id));

  }
  function updateButtonPressed(item) {
setEditObj(item)
setText(item.text) //For at undgå at gemme med et tomt felt
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

  return (
    
    <View style={styles.container}>
      {/* ADD NOTE MODAL */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <TextInput
              placeholder='Ny Note'
              onChangeText={(txt) => setText(txt)}
              value={text}
              style={styles.textInput} // Add this style
            />
            <Button title='Tilføj' onPress={addButtonPressed} />
            <Button title='Luk' onPress={() => setModalVisible(false)} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>

{/* LIST OF NOTES */}

{ editObj &&
<View>
<TextInput defaultValue={editObj.text} onChangeText={(tekst) => setText(tekst)}></TextInput>
<Button title="Add image"onPress={launchImagePicker}/>
<Button title="Save"onPress={saveUpdate}/>
<Button title="Camera"onPress={launchCamera}/>
</View>}
<Image style= {{width:200, height:200}} source={{uri:imagePath}} />
        {/*<Image style= {{width:200, height:200}} source={{uri:imagePath}} />
        <Button title='Pick image' onPress={launchImagePicker} ></Button> 
        <Button title='Upload image' onPress={uploadImage} ></Button> 
        {/*<Button title='Download image' onPress={downloadImage} ></Button>*/}
<FlatList
      data={data}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Beskrivelse", { message: item.text, id: item.id, replyText: item.replyText})}
        >
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.text}</Text>
            <Button
        title="Delete"
        onPress={() => deleteButtonPressed(item.id)}
      />
      <Button
        title="Update"
        onPress={() => updateButtonPressed(item)}
      />
            <Button
        title="Se billede"
        onPress={() => downloadImage(item.id)}
      />
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
    </View>
  );
}

// SECOND PAGE COMPONENT (for note details)
const Page2 = ({ navigation, route }) => {
  const message = route.params?.message; // handling case when route is null
  const id = route.params?.id; // handling case when route is null
  const replyText = route.params?.replyText; // handling case when route is null
  const [reply, setReply] = useState(null);
  const [imagePath, setImagePath] = useState(null)
  downloadImage(id)

  async function downloadImage(id){
    getDownloadURL(ref(storage, id+'.jpg')).then((url) => {
      setImagePath(url)
    }).catch((error) => {
      alert(error)
    })
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
      
      <Image style= {{width:200, height:200}} source={{uri:imagePath}} />
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


// STYLING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: 'blue',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: 'red',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: 'blue',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
  },
});

