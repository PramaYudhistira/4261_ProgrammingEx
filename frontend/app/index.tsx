import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

type Task = {
  id: string;
  title: string;
  deadline: Date | null;
};

const API_BASE_URL = "http://127.0.0.1:5000/auth";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
  
      if (status === "granted") {
      } else if (status === "denied") {
        Alert.alert(
          "Permission Denied",
          "You chose to deny notifications. You can enable them later in your device settings."
        );
      } 
    };
    requestPermissions();
  }, []);
  

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsLoggedIn(!!token);
      setLoading(false);
    };
    checkLogin();
  }, []);
  const scheduleNotification = async (title: string, deadline: Date) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Reminder",
          body: `Don't forget to: ${title}`,
          sound: true,
        },
        trigger: {
          type:  Notifications.SchedulableTriggerInputTypes.DATE,
          date: deadline, 
        },
      });
      Alert.alert(
        "Notification Scheduled",
        `A reminder has been set for ${deadline.toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        })}.`
      );
    } catch (error) {
      Alert.alert("Please select a future time for the reminder.");
    }
  };
  




  const handleLogin = async () => {
    try {
      if (!emailRegex.test(email)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: email,
        password,
      });
      const { token } = response.data;
      await AsyncStorage.setItem("authToken", token);
      setIsLoggedIn(true);
      Alert.alert("Success", "Logged in successfully!");
    } catch (error) {
      Alert.alert("Error", "Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async () => {
    try {
      if (!emailRegex.test(email)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }
      await axios.post(`${API_BASE_URL}/register`, {
        username: email,
        password,
      });
      
      Alert.alert("Success", "Account created successfully! You can now log in.");
      setIsRegistering(false);
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
    }
  };

  // Logout functionality
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };


  

  // Add a task with a deadline
  const addTask = () => {
    if (!task.trim()) {
      Alert.alert("Error", "Please enter a task.");
      return;
    }
  
    if (!deadline) {
      Alert.alert("Error", "Please set a deadline.");
      return;
    }
  
    if (deadline && new Date(deadline) < new Date()) {
      Alert.alert("Error", "Deadline cannot be in the past.");
      return;
    }
  
    const newTask = { id: Date.now().toString(), title: task, deadline };
    setTasks([...tasks, newTask]);
    setTask("");
    setDeadline(null);
    setShowDateTimePicker(false);
  
    // Schedule a notification for the task
    scheduleNotification(newTask.title, newTask.deadline);
  };
  

  // Handle date picker
  const handleDateTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.headerText}>
          {isRegistering ? "Create Account" : "Login"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={isRegistering ? handleRegister : handleLogin}
        >
          <Text style={styles.buttonText}>
            {isRegistering ? "Register" : "Login"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => setIsRegistering(!isRegistering)}
        >
          <Text style={styles.buttonTextSecondary}>
            {isRegistering ? "Back to Login" : "Create Account"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Your To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add a task"
        value={task}
        onChangeText={setTask}
      />
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => setShowDateTimePicker(true)}
      >
        <Text style={styles.buttonText}>
          {deadline
            ? `Deadline: ${deadline.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}`
            : "Set Deadline"}
        </Text>
      </TouchableOpacity>

      {showDateTimePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="datetime"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateTimeChange}
          
        />
      )}
      <TouchableOpacity style={styles.buttonPrimary} onPress={addTask}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDeadline}>
              Deadline:{" "}
              {item.deadline
                ? new Date(item.deadline).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "No deadline"}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setTasks(tasks.filter((t) => t.id !== item.id))}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No tasks yet. Add a task to get started!</Text>
        )}
      />
      <TouchableOpacity
        style={styles.buttonDanger}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    width: "100%",
    maxWidth: 400,
  },
  buttonPrimary: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    maxWidth: 400,
  },
  buttonSecondary: {
    borderColor: "#007BFF",
    borderWidth: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  buttonDanger: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    maxWidth: 400,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
  taskItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  taskDeadline: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: "#FF4D4D",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});