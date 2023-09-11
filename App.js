import { app, database } from './firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  StyleSheet, Text, View, TextInput, Button, FlatList,
  Modal, TouchableWithoutFeedback, Keyboard, TouchableOpacity
} from 'react-native';
import React, { useEffect } from 'react';

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
  const [isModalVisible, setModalVisible] = useState(false);
  const [editObj, setEditObj] = useState(null); // [text, setText

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
        text: text
        })
    } catch (error) {
      console.log("file i db " + error) 
    }
    setModalVisible(false);  // close the modal after adding
  }

  // FUNCTION TO HANDLE DELETING A NOTE
  async function deleteButtonPressed(id) {
    console.log(id)
    deleteDoc(doc(database, "notes", id));

  }
  function updateButtonPressed(item) {
setEditObj(item)

  }

  async function saveUpdate(){
   await updateDoc(doc(database, "notes", editObj.id), {
      text: text
  })
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
<Text onPress={saveUpdate}>Save</Text>
</View>}

<FlatList
      data={data}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Beskrivelse", { message: item.text })}
        >
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.text}</Text>
            <TouchableOpacity
              onPress={() => deleteButtonPressed(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateButtonPressed(item)}
              style={styles.deleteButton}
            >
              <Text >Update</Text>
            </TouchableOpacity>
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
  const message = route.params?.message // handling case when route is null
  const [reply, setReply] = useState('Empty');

  return (
    <View style={styles.container}>
      {/* DISPLAY NOTE MESSAGE */}
      {message && <Text>{message}</Text>}
      <TextInput placeholder={reply} onChangeText={(tekst) => setReply(tekst)} />
    </View>)
}

// STYLING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  textInput: {
    height: 50, // Adjust the height as needed
    borderWidth: 1, // Add a border for better visibility (optional)
    borderColor: 'gray', // Customize border color (optional)
    padding: 10, // Add some padding to the text input (optional)
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
