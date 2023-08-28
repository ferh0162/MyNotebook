import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Modal, TouchableWithoutFeedback, Keyboard
, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';


export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName='Noter' >
    <Stack.Screen name='Noter' component={Page1} /> 
    <Stack.Screen name='Beskrivelse' component={Page2} /> 
    </Stack.Navigator> 
    </NavigationContainer>
    ); 
  }



  const Page1 = ({ navigation, route }) => {
    const [text, setText] = useState('');
    const [list, setList] = useState(["Note 1", "Note 2", "Note 3"]);
    const [isModalVisible, setModalVisible] = useState(false);

  
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
  
    function addButtonPressed() {
      setList([...list, text]);
      console.log(list);
      setModalVisible(false);  // close the modal after adding
    }
  
    return (
      <View style={styles.container}>
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
            />
            <Button title='Tilføj' onPress={addButtonPressed} />
            <Button title='Luk' onPress={() => setModalVisible(false)} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      <FlatList 
    data={list}
    renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate("Beskrivelse", { message: item })
      }>
            <View style={styles.note}>
                <Text>{item}</Text>
            </View>
        </TouchableOpacity>
    )}
    keyExtractor={(item, index) => index.toString()}
/>

    </View>
    );
  }

  const Page2 = ({navigation, route}) => {
    const message = route.params?.message // optional chaining to handle case when route is null
    const [reply, setReply] = useState('Empty');

    
    return (
    <View style={styles.container}> 
{ message && <Text>{message}</Text>}
<TextInput placeholder={reply} onChangeText={(tekst) => setReply(tekst)} />

    </View> )
    }


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
    backgroundColor: 'white', // This will give a semi-transparent background
    padding: 20,
  },
  note: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
