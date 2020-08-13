import React from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native';

import {
  Button,
  FAB,
  Surface,
  IconButton,
  Checkbox,
  TextInput
} from 'react-native-paper'

import { NavigationContainer } from '@react-navigation/native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import DateTimePicker from '@react-native-community/datetimepicker';

var PushNotification = require('react-native-push-notification');

import * as Animatable from 'react-native-animatable';

import AsyncStorage from '@react-native-community/async-storage';

const ReminderCard = ({ i, date, enabled, note, changeDate, changeEnabled, changeNote, deleteReminder }) => {
  console.log("Reminder Card render")

  const [pickerShow, setPickerShow] = React.useState(0);
  var cardRef = React.useRef();
  return (
    <Animatable.View ref={cardRef}>
      <Surface style={{ elevation: 5, margin: 10, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput style={{ backgroundColor: 'transparent', flex: 1 }} label="Reminder Note" value={note} onChangeText={(text) => changeNote(i, text)} />
          <View style={{ position: 'absolute', right: -30, top: -30 }}>
            <IconButton size={40} animated={true} color={enabled ? 'green' : 'orange'}
              icon={enabled ? 'checkbox-marked' : 'checkbox-blank-outline'}
              onPress={() => changeEnabled(i, !enabled)} />
          </View>
          <View style={{ position: 'absolute', left: -30, top: -30 }}>
            <IconButton size={30} color="red" icon="minus-circle"
              onPress={() => {
                cardRef.current.bounceOut(1000).then(() => deleteReminder(i))
              }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }} >
            <IconButton size={30} icon="calendar" onPress={() => setPickerShow(1)} />
            <Text onPress={() => setPickerShow(1)}>{("0" + date.getDate()).slice(-2) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear()}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setPickerShow(2)}>
            <IconButton onPress={() => setPickerShow(2)} size={30} icon="clock" />
            <Text onPress={() => setPickerShow(2)}>{("0" + (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + " " + (date.getHours() >= 12 ? 'PM' : 'AM')}</Text>
          </View>
        </View>

      </Surface>
      {(pickerShow) ?
        <DateTimePicker
          value={date}
          mode={pickerShow == 1 ? 'date' : 'time'}
          onChange={(event, date) => { setPickerShow(0); if (date) { changeDate(i, date); } }}
        />
        : <></>
      }
    </Animatable.View>
  )
}

const ReminderScreen = () => {
  console.log('ReminderScreen render');
  var newRemAdd = React.useRef(false);
  var curChange = React.useRef(-1);
  var cardMapRef = React.useRef(0);

  const [remainderData, setRemainderData] = React.useState([
    { date: new Date(new Date(Date.now() + 180 * 1000).setSeconds(0, 0)), enabled: false, note: "", rem_key: "1" },
    { date: new Date(new Date(Date.now() + 60 * 1000).setSeconds(0, 0)), enabled: false, note: "", rem_key: "2" },
    { date: new Date(new Date(Date.now() + 120 * 1000).setSeconds(0, 0)), enabled: false, note: "", rem_key: "3" }]);
  const scrollRef = React.useRef()

  React.useEffect(() => {
    if (newRemAdd.current) {
      scrollRef.current.scrollToEnd();
      newRemAdd.current = false;
    }
    if (curChange.current > -1) {
      if (remainderData[curChange.current].enabled && remainderData[curChange.current].date) {
        PushNotification.localNotificationSchedule({
          message: "Reminder",
          title: remainderData[curChange.current].note,
          date: remainderData[curChange.current].date,
          id: remainderData[curChange.current].rem_key,
        })
        curChange.current = -1;
      }
      else {
        PushNotification.cancelLocalNotifications({ id: remainderData[curChange.current].rem_key });
        curChange.current = -1;
      }
    }

  }, [remainderData])

  const changeDate = (i, date) => {
    if (date.getTime() > new Date().getTime()) {
      var temp = remainderData.slice(0);
      temp[i].date = date;
      curChange.current = i;
      setRemainderData(temp);
    }
  }

  const changeEnabled = (i, enabled) => {
    if (remainderData[i].date.getTime() > new Date().getTime()) {
      var temp = remainderData.slice(0);
      temp[i].enabled = enabled;
      curChange.current = i;
      setRemainderData(temp);
    }
  }

  const changeNote = (i, note) => {

    var temp = remainderData.slice(0);
    temp[i].note = note;
    curChange.current = i;
    setRemainderData(temp);

  }

  const deleteReminder = (i) => {
    console.log(remainderData)
    var temp = remainderData.slice(0);
    temp.splice(i, 1)
    console.log(temp)
    cardMapRef.current++;
    setRemainderData(temp);
  }

  return (
    <>
      <ScrollView ref={scrollRef} style={{ marginBottom: 50 }}>
        {
          remainderData.map((e, i) => (
            <ReminderCard key={"rem_card" + cardMapRef.current + i} i={i} date={e.date} enabled={e.enabled} note={e.note} changeDate={changeDate} changeEnabled={changeEnabled}
              changeNote={changeNote} deleteReminder={deleteReminder} />
          ))

        }
      </ScrollView>
      <FAB style={{ position: 'absolute', right: 0, bottom: 0, margin: 40 }} icon="plus"
        onPress={() => {
          var temp = remainderData.slice(0);
          temp.push({ date: new Date(new Date(Date.now() + 60 * 1000).setSeconds(0, 0)), enabled: false, note: "" });
          newRemAdd.current = true;
          setRemainderData(temp);

        }} />
    </>
  )
}


const SchedulerScreen = () => {
  console.log("Scheduler Screen render")
  return (
    <Button>asd</Button>
  )
}

const Tab = createMaterialTopTabNavigator();

const App = () => {
  console.log("App render")
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Reminder" component={ReminderScreen} />
        <Tab.Screen name="Scheduler" component={SchedulerScreen} />
      </Tab.Navigator>
    </NavigationContainer>


  );
};
export default App;
