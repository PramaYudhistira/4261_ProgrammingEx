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

const API_BASE_URL = "https://four261-programmingex.onrender.com";

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


  const validateInputs = (email: string, password: string) => {
    const usernameRegex = /^[a-zA-Z0-9]{4,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // At least 6 chars, 1 letter, 1 number
  
    if (!email.trim()) {
      Alert.alert("Error", "Username cannot be empty. Must be above 4 characters.");
      return false;
    }
  
    if (!usernameRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid username");
      return false;
    }
  
    if (!password.trim()) {
      Alert.alert("Error", "Password cannot be empty.");
      return false;
    }
  
    if (!passwordRegex.test(password)) {
      Alert.alert("Error", "Password must be at least 6 characters and contain at least one letter and one number.");
      return false;
    }
  
    return true;
  };


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
    if (!validateInputs(email, password)) return; 
    console.log("Logging in with:", email, password);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: email,
        password: password,
      });
      const { token } = response.data;
      await AsyncStorage.setItem("authToken", String(token));
      const s = await AsyncStorage.getItem("authToken");
      console.log("Token from storage:", s);
      
  
      // Update state with fetched tasks
      
      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert("Login failed. Please check your credentials");
    }
  };

  const handleRegister = async () => {
    if (!validateInputs(email, password)) return; 
    try {
      await axios.post(`${API_BASE_URL}/register`, {
        username: email,
        password: password,
      });
      Alert.alert("Success", "Account created successfully! You can now log in.");
      setIsRegistering(false);
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
    }
  };

  // Logout functionality
  const handleLogout = async () => {
    setTasks([]);
    await AsyncStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };


  
  const handleDelete = (event: any, title: string) => {
    event.persist(); // Prevents the event from being nullified
    deleteTask(title);
  };

  const deleteTask = async (title: string) => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        console.log("Token:", token);
        console.log("Task to delete:", title);
        await axios.delete(`${API_BASE_URL}/delete_task`, {
          headers: { Authorization: `Bearer ${token}`},
          data: { title }
        });
        Alert.alert(`Task deleted: ${title}`);
        setTasks(tasks.filter((task) => task.title !== title));
        
      } catch (error) {
        Alert.alert("Error", "Failed to delete task. Please try again.");
      }
    };

  // Add a task with a deadline
  const addTask = async () => {
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
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token:", token);
      console.log("New Task:", newTask);
      
      const response = await axios.post(`${API_BASE_URL}/add_task`,
        { task: newTask },
        { headers: { Authorization: `Bearer ${token}`,
                      "Content-Type":"application/json" } }
      );
      console.log("Task added successfully:", response.data);
    } catch (error) {
      Alert.alert(`${error}`);
    }
    

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
          placeholder="Username"
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
              onPress={(event) => handleDelete(event, item.title)}
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